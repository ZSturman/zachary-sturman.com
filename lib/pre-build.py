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
import errno

IMAGE_EXTS = {".png", ".jpg", ".jpeg", ".gif", ".webp", ".bmp", ".tiff"}
DOMAINS = {"Technology", "Creative", "Expository"}

# Extended extension maps for normalizing collection item types
IMAGE_EXTS_FULL = IMAGE_EXTS | {".svg", ".heic", ".avif"}
VIDEO_EXTS = {".mov", ".mp4", ".webm", ".mkv", ".avi", ".flv", ".ogv", ".wmv", ".mpg", ".mpeg"}
AUDIO_EXTS = {".mp3", ".wav", ".aac", ".ogg", ".m4a", ".flac", ".opus"}
MODEL_EXTS = {".glb", ".gltf", ".obj", ".fbx", ".stl", ".dae", ".3ds", ".ply"}
GAME_EXTS = {".html", ".htm", ".unityweb", ".wasm"}
TEXT_EXTS = {".md", ".markdown", ".txt", ".tex", ".csv", ".json", ".pdf"}


def determine_collection_item_type(raw_type: Optional[str], path_val: Optional[str]) -> str:
    """Map a raw type string or path/filename to one of the canonical types:
    "image", "video", "3d-model", "game", "text", "audio", "url-link".
    Defaults to "image" when unsure (safe fallback for thumbnails/previews).
    """
    if raw_type and isinstance(raw_type, str):
        t = raw_type.strip().lower()
        # If it's already one of the canonical names, return it
        if t in {"image", "video", "3d-model", "3d", "game", "text", "audio", "url-link", "url"}:
            if t == "3d":
                return "3d-model"
            if t == "url":
                return "url-link"
            return t if t != "3d-model" else "3d-model"
        # Sometimes the type field contains an extension or short form like "mov", "glb", "png"
        if t.startswith('.'):
            t = t[1:]
        # extension-like
        if t in {ext.lstrip('.') for ext in IMAGE_EXTS_FULL}:
            return "image"
        if t in {ext.lstrip('.') for ext in VIDEO_EXTS}:
            return "video"
        if t in {ext.lstrip('.') for ext in AUDIO_EXTS}:
            return "audio"
        if t in {ext.lstrip('.') for ext in MODEL_EXTS}:
            return "3d-model"
        if t in {ext.lstrip('.') for ext in GAME_EXTS}:
            return "game"
        if t in {ext.lstrip('.') for ext in TEXT_EXTS}:
            return "text"

    # Inspect the path if provided
    if path_val and isinstance(path_val, str):
        # Check if it's a URL first
        if path_val.strip().startswith(('http://', 'https://', 'ftp://')):
            return "url-link"
        try:
            p = Path(unquote(str(path_val)))
            ext = p.suffix.lower()
            if ext in IMAGE_EXTS_FULL:
                return "image"
            if ext in VIDEO_EXTS:
                return "video"
            if ext in AUDIO_EXTS:
                return "audio"
            if ext in MODEL_EXTS:
                return "3d-model"
            if ext in GAME_EXTS:
                return "game"
            if ext in TEXT_EXTS:
                return "text"
        except Exception:
            pass

    # As a last-resort fallback, attempt to glean an extension from the string
    if path_val and isinstance(path_val, str):
        lower = path_val.lower()
        for extset, canon in (
            (IMAGE_EXTS_FULL, "image"),
            (VIDEO_EXTS, "video"),
            (AUDIO_EXTS, "audio"),
            (MODEL_EXTS, "3d-model"),
            (GAME_EXTS, "game"),
            (TEXT_EXTS, "text"),
        ):
            for ext in extset:
                if ext.lstrip('.') in lower or ext in lower:
                    return canon

    # Default fallback
    return "image"


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
        # Support a "local-link" resource type which should point to an
        # internal site path. It can be expressed either as:
        #   { type: "local-link", url: "/projects/proj-1" }
        # or encoded in the type itself:
        #   { type: "local-link:/projects/proj-1" }
        # Normalize and set `res["url"]` to a site-relative path (leading '/').
        rtype = res.get("type") or ""
        if isinstance(rtype, str) and rtype.lower().startswith("local-link"):
            # If the type contains a colon, the part after it is the path
            path_from_type = None
            if ":" in rtype:
                try:
                    _, after = rtype.split(":", 1)
                    if after:
                        path_from_type = unquote(after)
                except Exception:
                    path_from_type = None

            url_val = res.get("url")
            if path_from_type:
                p = str(path_from_type)
                if not p.startswith("/"):
                    p = "/" + p
                res["url"] = p
            elif url_val:
                try:
                    u = unquote(str(url_val))
                    if not u.startswith("/"):
                        u = "/" + u
                    res["url"] = u
                except Exception:
                    # leave as-is on error
                    pass
            # nothing to copy for local-link, continue to next resource
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
        # Normalize and set the item's type to one of the canonical values
        # Prefer the declared type but fall back to inferring from path or thumbnail
        raw_type = item.get("type")
        inferred = determine_collection_item_type(raw_type, item.get("path") or item.get("thumbnail") or item.get("label"))
        item["type"] = inferred

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
        # Thumbnails can be images OR videos (for autoplay preview)
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
            # Allow both images AND videos as thumbnails
            THUMBNAIL_EXTS = IMAGE_EXTS | VIDEO_EXTS
            for p in proj_dir.rglob("*"):
                if not p.is_file():
                    continue
                if candidate_name and p.name == candidate_name and p.suffix.lower() in THUMBNAIL_EXTS:
                    tfound = p
                    break
            if not tfound and thumb_val:
                tstem = Path(unquote(str(thumb_val))).stem.lower()
                for p in proj_dir.rglob("*"):
                    if p.is_file() and p.stem.lower() == tstem and p.suffix.lower() in THUMBNAIL_EXTS:
                        tfound = p
                        break

        if not tfound:
            # as a last resort look for a file named <item_id>_thumbnail or thumbnail
            THUMBNAIL_EXTS = IMAGE_EXTS | VIDEO_EXTS
            for p in proj_dir.rglob("*"):
                if not p.is_file():
                    continue
                if p.suffix.lower() in THUMBNAIL_EXTS and p.stem.lower() in {f"{item_id}_thumbnail", "thumbnail", item_id}:
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


def extract_external_image_hostnames(projects: list[dict]) -> set[str]:
    """Extract all external image hostnames from project data.
    
    Scans through projects looking for:
    - thumbnail URLs
    - collection item paths (images, videos, etc.)
    - hero image URLs
    - any other image fields that might contain external URLs
    
    Returns a set of hostnames (e.g., 'example.com', 'cdn.example.org')
    """
    hostnames = set()
    
    def extract_hostname(url_str: str) -> Optional[str]:
        """Extract hostname from a URL string if it's an external URL."""
        if not url_str or not isinstance(url_str, str):
            return None
        
        url_str = url_str.strip()
        
        # Skip local paths (starting with / or not containing ://)
        if url_str.startswith('/') or '://' not in url_str:
            return None
        
        try:
            parsed = urlparse(url_str)
            if parsed.hostname:
                return parsed.hostname
        except Exception:
            pass
        
        return None
    
    def scan_dict(obj: dict):
        """Recursively scan a dictionary for URL strings."""
        if not isinstance(obj, dict):
            return
        
        for key, value in obj.items():
            # Check string values for URLs
            if isinstance(value, str):
                hostname = extract_hostname(value)
                if hostname:
                    hostnames.add(hostname)
            # Recurse into nested dicts
            elif isinstance(value, dict):
                scan_dict(value)
            # Recurse into lists
            elif isinstance(value, list):
                for item in value:
                    if isinstance(item, dict):
                        scan_dict(item)
                    elif isinstance(item, str):
                        hostname = extract_hostname(item)
                        if hostname:
                            hostnames.add(hostname)
    
    # Scan all projects
    for project in projects:
        if isinstance(project, dict):
            scan_dict(project)
    
    return hostnames


def main():
    parser = argparse.ArgumentParser(description="Copy thumbnails for projects into public/projects/<id>/")
    parser.add_argument("root", nargs="?", default="Projects", help="Root directory containing project domains.")
    parser.add_argument("--repair", action="store_true", help="When set, attempt to repair stray 'projects 2'/'projects 3' folders by renaming the newest one to 'projects' and exit.")
    args = parser.parse_args()

    root = Path(args.root)
    if not root.exists() or not root.is_dir():
        raise SystemExit(f"Root directory not found: {root.resolve()}")

    # Build into a temporary directory inside public/ so the existing
    # `public/projects` remains available until the pre-build completes
    public_root = Path(__file__).parent.parent / "public"
    public_root.mkdir(parents=True, exist_ok=True)
    target_public_projects = public_root / "projects"

    # Simple exclusive lock to avoid concurrent pre-build runs which can
    # produce unexpected directory name collisions (e.g. Finder creating
    # "projects 2"). We create a lockfile in `public` using O_EXCL so that
    # other processes will fail fast if a build is already running.
    lockfile = public_root / "projects_build.lock"
    lock_acquired = False
    lock_fd = None

    def acquire_lock():
        nonlocal lock_acquired, lock_fd
        try:
            # os.O_CREAT | os.O_EXCL ensures this fails if the file already exists
            lock_fd = os.open(str(lockfile), os.O_CREAT | os.O_EXCL | os.O_WRONLY)
            os.write(lock_fd, f"pid={os.getpid()} time={int(time.time())}\n".encode("utf-8"))
            lock_acquired = True
        except OSError as e:
            if e.errno == errno.EEXIST:
                raise SystemExit(f"Another pre-build appears to be running (lockfile exists at {lockfile}). Exiting to avoid race conditions.")
            raise

    def release_lock():
        nonlocal lock_acquired, lock_fd
        try:
            if lock_fd is not None:
                os.close(lock_fd)
            if lock_acquired and lockfile.exists():
                lockfile.unlink()
        except Exception:
            # best-effort cleanup; don't fail the build just because lock removal failed
            pass

    def repair_projects_dir():
        """If there is no `projects` directory but there are siblings like
        `projects 2`, `projects 3`, pick the most recently-modified one and
        rename it to `projects`. This is a manual/explicit repair action and
        will only run when --repair is passed.
        """
        # collect candidates whose name starts with 'projects'
        candidates = []
        for p in public_root.iterdir():
            if not p.is_dir():
                continue
            name = p.name
            # match 'projects' optionally followed by space+digits
            if name == "projects" or (name.startswith("projects ") and name[len("projects "):].strip().isdigit()):
                candidates.append(p)

        # If the canonical folder exists, nothing to repair
        canonical = public_root / "projects"
        if canonical.exists():
            print(f"Canonical folder exists at {canonical}; nothing to repair.")
            return

        if not candidates:
            print("No 'projects' or 'projects N' folders found to repair.")
            return

        # pick the newest candidate by modification time
        chosen = max(candidates, key=lambda p: p.stat().st_mtime)
        backup = public_root / f"projects_backup_before_repair_{int(time.time())}"
        try:
            # rename chosen to canonical name; if canonical exists this will fail
            chosen.rename(canonical)
            print(f"Renamed {chosen} -> {canonical}")
        except Exception as e:
            # if rename fails, attempt a safer move: first try to rename canonical to backup
            try:
                if canonical.exists():
                    canonical.rename(backup)
                chosen.rename(canonical)
                print(f"Renamed {chosen} -> {canonical} (backup of previous placed at {backup})")
            except Exception as e2:
                raise SystemExit(f"Failed to repair projects folder: {e} then {e2}")

    def delete_old_backups():
        """Remove leftover backup directories created by previous runs.

        Only removes directories whose names start with 'projects_backup' or
        'projects_backup_before_repair_' inside the `public` directory. This
        helps avoid accumulating many backups over time. This is best-effort
        and will log warnings to `pre-build.log` on failures.
        """
        try:
            for p in public_root.iterdir():
                if not p.is_dir():
                    continue
                name = p.name
                if name.startswith("projects_backup") or name.startswith("projects_backup_before_repair_"):
                    # Don't attempt to remove the canonical live folder
                    if name == "projects":
                        continue
                    try:
                        shutil.rmtree(p)
                        append_log(f"CLEANUP: removed old backup {p}")
                        print(f"Removed old backup {p}")
                    except Exception as e:
                        append_log(f"WARNING: failed to remove old backup {p}: {e}")
                        print(f"Warning: failed to remove old backup {p}: {e}")
        except Exception:
            # best-effort only; don't raise
            pass

    # If user asked for repair only, run repair and exit
    if args.repair:
        repair_projects_dir()
        return

    # Acquire build lock before mutating public/projects
    acquire_lock()

    # If a canonical projects folder exists, rename it to a backup immediately
    # so we can build the new folder without interfering with the live one.
    # We record `backup_path` so we can restore it on failure or delete it
    # after a successful build.
    try:
        if target_public_projects.exists():
            # unique backup name with timestamp and pid to avoid collisions
            backup_path = public_root / f"projects_backup_{int(time.time())}_{os.getpid()}"
            try:
                target_public_projects.rename(backup_path)
                print(f"Renamed existing {target_public_projects} -> {backup_path} before building new projects")
            except Exception as e:
                # If rename fails, try to remove the existing folder as a last resort.
                try:
                    shutil.rmtree(target_public_projects)
                    print(f"Failed to rename but removed existing {target_public_projects} as fallback: {e}")
                    backup_path = None
                except Exception as e2:
                    # If we cannot safely move or remove the existing folder, abort and release lock.
                    try:
                        release_lock()
                    except Exception:
                        pass
                    raise SystemExit(f"Failed to prepare existing projects folder for rebuild: rename_error={e} remove_error={e2}")
    except Exception as e:
        # Unexpected error preparing backup; release lock and exit.
        try:
            release_lock()
        except Exception:
            pass
        raise

    # Create a temp directory sibling to `projects`, e.g. public/projects_tmp_xxx
    tmp_dir_path = Path(tempfile.mkdtemp(prefix="projects_tmp_", dir=str(public_root)))
    temp_public_projects_root = tmp_dir_path

    copied = []
    skipped = []
    all_projects: list[dict] = []
    missing_thumbnail_projects: list[str] = []
    missing_summary_projects: list[str] = []
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
                                # record missing thumbnail by project id (or title as fallback)
                                missing_thumbnail_projects.append(str(obj.get("id") or obj.get("title") or json_path))
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
                    # Record summary-missing projects (summary missing or blank after strip)
                    try:
                        summary_val = obj.get("summary")
                        if not (isinstance(summary_val, str) and summary_val.strip()):
                            missing_summary_projects.append(str(obj.get("id") or obj.get("title") or json_path))
                    except Exception:
                        # ignore and continue
                        pass
                    acted_any = True
                if not acted_any:
                    skipped.append((str(json_path), "no valid project objects found"))
            except Exception as e:
                skipped.append((str(json_path), f"error:{e}"))

    # Extract all external image hostnames from projects
    external_hostnames = extract_external_image_hostnames(all_projects)
    
    # Write external hostnames config for Next.js
    hostnames_config_path = public_root / "image-hostnames.json"
    try:
        hostnames_config_path.write_text(
            json.dumps({"hostnames": sorted(list(external_hostnames))}, ensure_ascii=False, indent=2) + "\n",
            encoding="utf-8"
        )
        print(f"Wrote {len(external_hostnames)} external image hostnames to {hostnames_config_path}")
        if external_hostnames:
            print("External image hostnames found:")
            for hostname in sorted(external_hostnames):
                print(f"  - {hostname}")
    except Exception as e:
        print(f"Warning: Failed to write image hostnames config: {e}")
    
    # Write aggregated projects.json into the temp dir
    output_path = temp_public_projects_root / "projects.json"

    try:
        output_path.write_text(json.dumps(all_projects, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
        print(f"Wrote {len(all_projects)} projects to {output_path}")

        # prepare a simple log file in public to record build outcome/errors
        log_file = public_root / "pre-build.log"
        def append_log(line: str):
            try:
                with open(str(log_file), "a", encoding="utf-8") as fh:
                    fh.write(f"{int(time.time())}: {line}\n")
            except Exception:
                pass

        # Successfully finished building into temp dir. Now atomically replace
        # the existing `public/projects` directory. We remove the old one first
        # to ensure a clean rename.
        try:
            # Try to remove the existing `public/projects` directory first to avoid
            # accumulating duplicate files. If removal fails (permissions, locked
            # files, etc.) fall back to renaming the folder to a backup name so we
            # can still roll back on failure.
            backup_path = None
            if target_public_projects.exists():
                try:
                    shutil.rmtree(target_public_projects)
                    print(f"Removed existing {target_public_projects} to avoid duplicates.")
                except Exception as e_rm:
                    # Removal failed; fall back to renaming to a backup so we can
                    # restore if the subsequent rename fails.
                    backup_path = public_root / f"projects_backup_{int(time.time())}"
                    try:
                        target_public_projects.rename(backup_path)
                        print(f"Renamed existing {target_public_projects} to backup {backup_path}")
                    except Exception as e_rename:
                        # If both removal and rename fail, raise to trigger the
                        # outer exception handling and avoid leaving the temp dir in an
                        # inconsistent state.
                        raise RuntimeError(f"Failed to remove or rename existing projects dir: remove_error={e_rm}, rename_error={e_rename}")

            # Move temp into place
            try:
                # Move temp into place. Prefer rename for atomicity when possible.
                try:
                    temp_public_projects_root.rename(target_public_projects)
                except Exception:
                    # Fallback to os.replace which may succeed when rename fails.
                    os.replace(str(temp_public_projects_root), str(target_public_projects))

                print(f"Replaced {target_public_projects} with {temp_public_projects_root}")
                append_log(f"SUCCESS: replaced projects with new build; wrote {len(all_projects)} projects")

                # If we created a backup earlier, attempt to remove it now that the
                # new folder is in place.
                if backup_path and backup_path.exists():
                    try:
                        shutil.rmtree(backup_path)
                        print(f"Removed backup at {backup_path}")
                    except Exception:
                        append_log(f"WARNING: failed to remove backup at {backup_path}; left in place")
                        print(f"Warning: failed to remove backup at {backup_path}; leaving it in place.")
                # Remove any older backup directories left from previous runs
                try:
                    delete_old_backups()
                except Exception:
                    # best-effort only
                    pass
            except Exception as replace_exc:
                err_msg = f"Failed to replace {target_public_projects} with temp build: {replace_exc}"
                print(err_msg)
                append_log(f"ERROR: {err_msg}")
                # Attempt to roll back: if we created a backup and the target doesn't exist,
                # try restoring the backup back to the original target path.
                try:
                    if backup_path and backup_path.exists() and not target_public_projects.exists():
                        backup_path.rename(target_public_projects)
                        append_log(f"RESTORE: restored original projects folder from {backup_path}")
                        print(f"Restored original projects folder from backup: {backup_path} -> {target_public_projects}")
                except Exception as e2:
                    append_log(f"ERROR: failed to restore original projects folder from backup: {e2}")
                    print(f"Failed to restore original projects folder from backup: {e2}")

                # Cleanup temp dir if it still exists (partial build)
                try:
                    if temp_public_projects_root.exists():
                        shutil.rmtree(temp_public_projects_root)
                        append_log(f"CLEANUP: removed partial temp build at {temp_public_projects_root}")
                except Exception:
                    pass
                # Reraise to allow outer handlers to proceed to finally block
                raise
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

    finally:
        # Always release the build lock if we acquired it
        try:
            release_lock()
        except Exception:
            pass

    # Also print readable lists for convenience
    if missing_thumbnail_projects:
        print("Projects added to projects.json missing a thumbnail:")
        for p in missing_thumbnail_projects:
            print(f" - {p}")
    else:
        print("All included projects have thumbnails. \n")
    if missing_summary_projects:
        print("\nProjects added to projects.json missing a summary:")
        for p in missing_summary_projects:
            print(f" - {p}")
    else:
        print("All included projects have summaries.\n\n")


if __name__ == "__main__":
    main()
