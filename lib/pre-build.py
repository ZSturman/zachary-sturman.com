#!/usr/bin/env python3
"""
Simplified pre-build script.

This script walks the Projects/<Domain> folders, reads existing project JSON files
(prefer `_project.json`), and if a project object contains an `id` and a
`thumbnail` filename, it copies that thumbnail from the project folder into
`public/projects/<id>/` (creating the folder if needed).

This script no longer creates or edits any JSON files and does not write logs.
"""

import json
import re
import shutil
import tempfile
import os
import sys
import time
from pathlib import Path
from typing import Optional
import argparse
from urllib.parse import urlparse, unquote

IMAGE_EXTS = {".png", ".jpg", ".jpeg", ".gif", ".webp", ".bmp", ".tiff"}
DOMAINS = {"Technology", "Creative", "Expository"}


def slugify(name: str) -> str:
    s = (name or "").strip().lower()
    s = re.sub(r"[^\w\s-]", "", s)
    s = re.sub(r"[\s-]+", "_", s).strip("_")
    return s or "untitled"


def find_project_json(proj_dir: Path) -> Optional[Path]:
    # Prefer exact filename then fall back to any .json file in the folder
    candidates = [proj_dir / "_project.json", proj_dir / "_project_auto.json"]
    for p in candidates:
        if p.exists():
            return p

    for p in proj_dir.iterdir():
        if p.is_file() and p.suffix.lower() == ".json":
            return p
    return None


def copy_thumbnail_for_project(proj_dir: Path, project_obj: dict, public_projects_root: Path) -> Optional[Path]:
    """If project_obj has id and thumbnail, copy thumbnail into public/projects/<id>/ and return dest path."""
    if not isinstance(project_obj, dict):
        return None
    project_id = project_obj.get("id")
    thumb_name = project_obj.get("thumbnail")
    if not project_id or not thumb_name:
        return None

    src = proj_dir / thumb_name
    if not src.exists() or not src.is_file():
        # If thumbnail value isn't present as-is, check for a 'thumbnail.*' file
        for p in proj_dir.iterdir():
            if p.is_file() and p.stem.lower() == "thumbnail" and p.suffix.lower() in IMAGE_EXTS:
                src = p
                break
        else:
            return None

    dest_dir = public_projects_root / project_id
    dest_dir.mkdir(parents=True, exist_ok=True)
    dest = dest_dir / src.name
    shutil.copy2(src, dest)
    return dest


def copy_images_for_project(proj_dir: Path, project_obj: dict, public_projects_root: Path) -> list[str]:
    """Copy all images listed in `project_obj['images']` into public/projects/<id>/.
    Uses `images.directory` (relative to proj_dir) if present to locate files.
    Returns list of destination paths copied (strings).
    """
    out: list[str] = []
    if not isinstance(project_obj, dict):
        return out
    images = project_obj.get("images")
    project_id = project_obj.get("id")
    if not images or not isinstance(images, dict) or not project_id:
        return out

    # Determine where image files live. If images.directory is present, prefer that
    # directory (relative to the project folder). Otherwise, use the project folder.
    images_dir = proj_dir
    dir_param = images.get("directory")
    if isinstance(dir_param, str) and dir_param.strip():
        candidate = proj_dir / dir_param
        if candidate.exists() and candidate.is_dir():
            images_dir = candidate

    dest_dir = public_projects_root / project_id
    dest_dir.mkdir(parents=True, exist_ok=True)

    for key, val in list(images.items()):
        # skip the directory key itself
        if key == "directory":
            continue
        if not val:
            continue
        # val is expected to be a filename (possibly with subpath)
        src = images_dir / str(val)
        found = None
        if src.exists() and src.is_file():
            found = src
        else:
            # try finding a file in images_dir or proj_dir with the same stem
            stem = Path(str(val)).stem.lower()
            for p in images_dir.iterdir():
                if p.is_file() and p.stem.lower() == stem and p.suffix.lower() in IMAGE_EXTS:
                    found = p
                    break
            if not found:
                for p in proj_dir.iterdir():
                    if p.is_file() and p.stem.lower() == stem and p.suffix.lower() in IMAGE_EXTS:
                        found = p
                        break

        if not found:
            # nothing to copy for this key
            continue

        dest = dest_dir / found.name
        try:
            shutil.copy2(found, dest)
            # normalize the project object to reference the filename only
            project_obj.setdefault("images", {})[key] = found.name
            out.append(str(dest))
        except Exception:
            # skip failures but continue
            continue

    return out


def copy_resources_for_project(proj_dir: Path, project_obj: dict, public_projects_root: Path) -> list[str]:
    """Copy files for resources with type 'local-download' into public/projects/<id>/.
    Updates each resource's 'url' to point to the public path ("/projects/<id>/<filename>").
    Returns list of destination paths copied (strings).
    """
    out: list[str] = []
    if not isinstance(project_obj, dict):
        return out
    resources = project_obj.get("resources")
    project_id = project_obj.get("id")
    if not resources or not isinstance(resources, list) or not project_id:
        return out

    dest_dir = public_projects_root / project_id
    dest_dir.mkdir(parents=True, exist_ok=True)

    for res in resources:
        if not isinstance(res, dict):
            continue
        if res.get("type") != "local-download":
            continue
        url_val = res.get("url")
        if not url_val:
            continue

        # First, try to handle absolute file:// URIs and percent-encoded paths.
        found = None
        try:
            if isinstance(url_val, str) and url_val.startswith("file://"):
                # file:///absolute/path or file://localhost/absolute/path
                parsed = urlparse(url_val)
                candidate = Path(unquote(parsed.path))
                if candidate.exists() and candidate.is_file():
                    found = candidate
            else:
                # If url_val is an absolute path (possibly percent-encoded), use it directly
                if isinstance(url_val, str):
                    maybe = Path(unquote(url_val))
                    if maybe.is_absolute() and maybe.exists() and maybe.is_file():
                        found = maybe
        except Exception:
            # fall back to existing heuristics on any error
            found = None

        # If not found yet, try to resolve the source file relative to the project directory
        if not found:
            src = proj_dir / str(unquote(str(url_val)))
            if src.exists() and src.is_file():
                found = src
            else:
                # try finding a file with the same stem in the project dir
                stem = Path(unquote(str(url_val))).stem.lower()
                for p in proj_dir.iterdir():
                    if p.is_file() and p.stem.lower() == stem:
                        found = p
                        break
                # also walk subdirectories as a last resort
                if not found:
                    for root, dirs, files in os.walk(proj_dir):
                        for f in files:
                            p = Path(root) / f
                            if p.stem.lower() == stem:
                                found = p
                                break
                        if found:
                            break

        if not found:
            # nothing to copy for this resource
            continue

        dest = dest_dir / found.name
        try:
            shutil.copy2(found, dest)
            # update the project object to reference the public path
            res["url"] = f"/projects/{project_id}/{dest.name}"
            out.append(str(dest))
        except Exception:
            # skip failures but continue
            continue

    return out


def copy_collection_for_project(proj_dir: Path, project_obj: dict, public_projects_root: Path) -> list[str]:
    """Copy collection items into public/projects/<collection_id>/<item_id>/.
    Updates each item's `path` and `thumbnail` (when copied) to the public path
    "/projects/<collection_id>/<item_id>/<filename>".
    Returns list of destination paths copied (strings).
    """
    out: list[str] = []
    if not isinstance(project_obj, dict):
        return out
    collection = project_obj.get("collection")
    project_id = project_obj.get("id")
    if not collection or not isinstance(collection, dict) or not project_id:
        return out

    items = collection.get("items")
    if not items or not isinstance(items, list):
        return out

    dest_root = public_projects_root / project_id
    dest_root.mkdir(parents=True, exist_ok=True)

    for item in items:
        if not isinstance(item, dict):
            continue

        # Ensure item has an id
        item_id = item.get("id") or slugify(item.get("label") or item.get("path") or "")
        item["id"] = item_id

        item_dir = dest_root / item_id
        item_dir.mkdir(parents=True, exist_ok=True)

        # Copy main file referenced by `path` if present
        path_val = item.get("path")
        found = None
        if path_val:
            try:
                src = proj_dir / unquote(str(path_val))
                if src.exists() and src.is_file():
                    found = src
            except Exception:
                found = None

        if not found and path_val:
            # search for matching stem in project directory and subdirs
            stem = Path(unquote(str(path_val))).stem.lower()
            for root, dirs, files in os.walk(proj_dir):
                for f in files:
                    p = Path(root) / f
                    if p.stem.lower() == stem:
                        found = p
                        break
                if found:
                    break

        if found:
            try:
                dest = item_dir / found.name
                shutil.copy2(found, dest)
                out.append(str(dest))
                # update path to public URL
                item["path"] = f"/projects/{project_id}/{item_id}/{dest.name}"
            except Exception:
                pass

        # Copy thumbnail if present, else attempt to find one
        thumb_val = item.get("thumbnail")
        tfound = None
        if thumb_val:
            try:
                tsrc = proj_dir / unquote(str(thumb_val))
                if tsrc.exists() and tsrc.is_file():
                    tfound = tsrc
            except Exception:
                tfound = None

        if not tfound:
            # prefer _collection_thumbnails or any file matching stem
            candidate_name = None
            if thumb_val:
                candidate_name = Path(unquote(str(thumb_val))).name
            # search for exact filename first, then by stem
            for p in proj_dir.rglob("*"):
                if not p.is_file():
                    continue
                if candidate_name and p.name == candidate_name and p.suffix.lower() in IMAGE_EXTS:
                    tfound = p
                    break
            if not tfound and thumb_val:
                tstem = Path(unquote(str(thumb_val))).stem.lower()
                for p in proj_dir.rglob("*"):
                    if p.is_file() and p.stem.lower() == tstem and p.suffix.lower() in IMAGE_EXTS:
                        tfound = p
                        break

        if not tfound:
            # as a last resort look for a file named <item_id>_thumbnail or thumbnail
            for p in proj_dir.rglob("*"):
                if not p.is_file():
                    continue
                if p.suffix.lower() in IMAGE_EXTS and p.stem.lower() in {f"{item_id}_thumbnail", "thumbnail", item_id}:
                    tfound = p
                    break

        if tfound:
            try:
                tdest = item_dir / tfound.name
                shutil.copy2(tfound, tdest)
                out.append(str(tdest))
                # update thumbnail to public URL
                item["thumbnail"] = f"/projects/{project_id}/{item_id}/{tdest.name}"
            except Exception:
                pass

    return out


def main():
    parser = argparse.ArgumentParser(description="Copy thumbnails for projects into public/projects/<id>/")
    parser.add_argument("root", nargs="?", default="Projects", help="Root directory containing project domains.")
    args = parser.parse_args()

    root = Path(args.root)
    if not root.exists() or not root.is_dir():
        raise SystemExit(f"Root directory not found: {root.resolve()}")

    # Build into a temporary directory inside public/ so the existing
    # `public/projects` remains available until the pre-build completes
    public_root = Path(__file__).parent.parent / "public"
    public_root.mkdir(parents=True, exist_ok=True)
    target_public_projects = public_root / "projects"

    # Create a temp directory sibling to `projects`, e.g. public/projects_tmp_xxx
    tmp_dir_path = Path(tempfile.mkdtemp(prefix="projects_tmp_", dir=str(public_root)))
    temp_public_projects_root = tmp_dir_path

    copied = []
    skipped = []
    all_projects: list[dict] = []
    backup_path = None

    for domain_dir in sorted(root.iterdir()):
        if not domain_dir.is_dir() or domain_dir.name not in DOMAINS:
            continue

        def collect_project_dirs(d: Path):
            # Recursively find project JSON files and yield their containing folder.
            # We look for both `_project.json` and `_project_auto.json` and yield the
            # parent directory for each match. Results are deduplicated and yielded in
            # sorted order by path to provide deterministic behavior.

            # Directories to ignore while scanning. These are common large or
            # irrelevant folders that shouldn't be walked.
            IGNORE_DIRS = {
                "node_modules",
                ".git",
                "__pycache__",
                "venv",
                "env",
                "dist",
                "build",
                ".next",
                "public",
            }

            def is_in_ignored_path(p: Path) -> bool:
                # return True if any ancestor directory (or the path itself) should be ignored
                for ancestor in [p, *p.parents]:
                    name = ancestor.name
                    if not name:
                        continue
                    if name.startswith("."):
                        return True
                    if name in IGNORE_DIRS:
                        return True
                return False

            seen = set()
            matches = []
            for pattern in ("_project.json", "_project_auto.json"):
                for p in d.rglob(pattern):
                    if not p.is_file():
                        continue
                    # skip matches that live under ignored dirs
                    if is_in_ignored_path(p.parent):
                        continue
                    matches.append(p)

            # sort by parent path string to keep order deterministic
            for p in sorted(matches, key=lambda x: str(x.parent)):
                parent = p.parent
                if parent in seen:
                    continue
                seen.add(parent)
                yield parent

        for proj_dir in collect_project_dirs(domain_dir):
            json_path = find_project_json(proj_dir)
            if not json_path:
                skipped.append((str(proj_dir), "no json"))
                continue
            try:
                raw = json_path.read_text(encoding="utf-8")
                parsed = json.loads(raw)
                # If file contains an array, try to find first object with id
                objs = parsed if isinstance(parsed, list) else [parsed]
                acted_any = False
                for obj in objs:
                    if not isinstance(obj, dict):
                        continue
                    # Inclusion rules: skip if reviewed === False (or string "false")
                    if "reviewed" in obj and (obj.get("reviewed") is False or obj.get("reviewed") == "false"):
                        skipped.append((str(json_path), f"skipped id={obj.get('id') or obj.get('title')} reviewed_false"))
                        continue
                    # Skip if visibility exists and is not public
                    if "visibility" in obj and obj.get("visibility") != "public":
                        skipped.append((str(json_path), f"skipped id={obj.get('id') or obj.get('title')} visibility_{obj.get('visibility')}") )
                        continue

                    # Ensure id exists
                    if not obj.get("id"):
                        obj["id"] = slugify(obj.get("title") or proj_dir.name)

                    # Ensure thumbnail is present by checking filesystem; attempt to find thumbnail.* if missing
                    thumb = obj.get("thumbnail")
                    if thumb:
                        src = proj_dir / str(thumb)
                        if not src.exists() or not src.is_file():
                            # try find thumbnail.* in folder
                            found = None
                            for p in proj_dir.iterdir():
                                if p.is_file() and p.stem.lower() == "thumbnail" and p.suffix.lower() in IMAGE_EXTS:
                                    found = p
                                    break
                            if found:
                                obj["thumbnail"] = found.name
                                dest = copy_thumbnail_for_project(proj_dir, obj, temp_public_projects_root)
                                if dest:
                                    copied.append(str(dest))
                                # attempt to copy other images declared in images/
                                img_copied = copy_images_for_project(proj_dir, obj, temp_public_projects_root)
                                if img_copied:
                                    copied.extend(img_copied)
                                # copy local-download resources and update their urls
                                res_copied = copy_resources_for_project(proj_dir, obj, temp_public_projects_root)
                                if res_copied:
                                    copied.extend(res_copied)
                                # copy collection items if this project contains a collection
                                col_copied = copy_collection_for_project(proj_dir, obj, temp_public_projects_root)
                                if col_copied:
                                    copied.extend(col_copied)
                            else:
                                # no thumbnail file present
                                # still attempt to copy any other images, then include the project
                                img_copied = copy_images_for_project(proj_dir, obj, temp_public_projects_root)
                                if img_copied:
                                    copied.extend(img_copied)
                                # copy local-download resources and update their urls
                                res_copied = copy_resources_for_project(proj_dir, obj, temp_public_projects_root)
                                if res_copied:
                                    copied.extend(res_copied)
                                # still attempt to copy any collection items even if thumbnail missing
                                col_copied = copy_collection_for_project(proj_dir, obj, temp_public_projects_root)
                                if col_copied:
                                    copied.extend(col_copied)
                                skipped.append((str(json_path), f"no thumbnail for id={obj.get('id') or obj.get('title')}"))
                                # still include the project without copying a thumbnail
                                all_projects.append(obj)
                                acted_any = True
                                continue
                        else:
                            dest = copy_thumbnail_for_project(proj_dir, obj, temp_public_projects_root)
                            if dest:
                                copied.append(str(dest))
                            # copy other images when thumbnail exists
                            img_copied = copy_images_for_project(proj_dir, obj, temp_public_projects_root)
                            if img_copied:
                                copied.extend(img_copied)
                            # copy local-download resources and update their urls
                            res_copied = copy_resources_for_project(proj_dir, obj, temp_public_projects_root)
                            if res_copied:
                                copied.extend(res_copied)

                    else:
                        # try find thumbnail.* in folder
                        found = None
                        for p in proj_dir.iterdir():
                            if p.is_file() and p.stem.lower() == "thumbnail" and p.suffix.lower() in IMAGE_EXTS:
                                found = p
                                break
                        if found:
                            obj["thumbnail"] = found.name
                            dest = copy_thumbnail_for_project(proj_dir, obj, temp_public_projects_root)
                            if dest:
                                copied.append(str(dest))
                            # also copy any other images declared
                            img_copied = copy_images_for_project(proj_dir, obj, temp_public_projects_root)
                            if img_copied:
                                copied.extend(img_copied)
                            # copy local-download resources and update their urls
                            res_copied = copy_resources_for_project(proj_dir, obj, temp_public_projects_root)
                            if res_copied:
                                copied.extend(res_copied)

                    # If this object contains a collection, copy the collection items
                    col_copied = copy_collection_for_project(proj_dir, obj, temp_public_projects_root)
                    if col_copied:
                        copied.extend(col_copied)

                    # Finally, include the project object in the aggregated list
                    all_projects.append(obj)
                    acted_any = True
                if not acted_any:
                    skipped.append((str(json_path), "no valid project objects found"))
            except Exception as e:
                skipped.append((str(json_path), f"error:{e}"))

    # Write aggregated projects.json into the temp dir
    output_path = temp_public_projects_root / "projects.json"

    try:
        output_path.write_text(json.dumps(all_projects, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
        print(f"Wrote {len(all_projects)} projects to {output_path}")

        # Successfully finished building into temp dir. Now atomically replace
        # the existing `public/projects` directory. We remove the old one first
        # to ensure a clean rename.
        try:
            backup_path = None
            # If the existing target exists, move it aside to a backup name so we can
            # restore it if the next rename fails. This preserves the old folder until
            # the new one is successfully in place.
            if target_public_projects.exists():
                backup_path = public_root / f"projects_backup_{int(time.time())}"
                target_public_projects.rename(backup_path)

            # Move temp into place
            temp_public_projects_root.rename(target_public_projects)
            print(f"Replaced {target_public_projects} with {temp_public_projects_root}")

            # Remove backup if present
            if backup_path and backup_path.exists():
                try:
                    shutil.rmtree(backup_path)
                except Exception:
                    print(f"Warning: failed to remove backup at {backup_path}; leaving it in place.")
        except Exception as e:
            print(f"Failed to replace {target_public_projects} with temp build: {e}")
            # Attempt to roll back: if we created a backup and the target doesn't exist,
            # try restoring the backup back to the original target path.
            try:
                if 'backup_path' in locals() and backup_path and backup_path.exists() and not target_public_projects.exists():
                    backup_path.rename(target_public_projects)
                    print(f"Restored original projects folder from backup: {backup_path} -> {target_public_projects}")
            except Exception as e2:
                print(f"Failed to restore original projects folder from backup: {e2}")
            print(f"Temp build left at: {temp_public_projects_root}")

    except Exception as e:
        print(f"Failed to write projects.json into temp dir: {e}")
        # Clean up temp dir to avoid clutter, but preserve original target
        try:
            if temp_public_projects_root.exists():
                shutil.rmtree(temp_public_projects_root)
        except Exception:
            pass

    # Summary
    print(json.dumps({"copied": copied, "skipped": skipped, "written": str(output_path)}, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
