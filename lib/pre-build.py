#!/usr/bin/env python3
import os
import re
import json
from pathlib import Path
from datetime import datetime
from typing import Optional

# --- Logging for undo ---
LOG_PATH = Path(__file__).parent / "pre_build_log.json"
log_data = {"created": [], "edited": []}

# --- Config ---

import types
import sys
import argparse

parser = argparse.ArgumentParser(description="Pre-build project JSON generator.")
parser.add_argument("root", nargs="?", default="Projects", help="Root directory containing project domains.")
args = parser.parse_args()

ROOT = Path(args.root)
DOMAINS = {"Technology", "Creative", "Expository"}
IMAGE_EXTS = {".png", ".jpg", ".jpeg", ".gif", ".webp", ".bmp", ".tiff"}

# --- Helpers ---
def slugify(name: str) -> str:
    s = name.strip().lower()
    s = re.sub(r"[^\w\s-]", "", s)
    s = re.sub(r"[\s-]+", "_", s).strip("_")
    return s or "untitled"

def iso(ts: float) -> str:
    return datetime.fromtimestamp(ts).astimezone().isoformat()

def detect_thumbnail(dirpath: Path) -> Optional[str]:
    # Only accept explicit "thumbnail.*" image
    for p in sorted(dirpath.iterdir()):
        if p.is_file() and p.stem.lower() == "thumbnail" and p.suffix.lower() in IMAGE_EXTS:
            return str(p.name)
    return None

def read_summary_from_overview(md_path: Path) -> str:
    try:
        for line in md_path.read_text(encoding="utf-8").splitlines():
            line = line.strip()
            if line and not line.startswith("# "):
                return line
        return ""
    except FileNotFoundError:
        return ""

from typing import Any

def default_project_obj(domain: str, title: str, summary: str, thumbnail: Optional[str], is_idea: bool, stat: Any, project_id: str) -> dict:
    base = {
        "id": project_id,
        "domain": domain,
        "title": title,
        "summary": summary or "",
        "visibility": "private",
        "tags": [],
        "resources": [],
        "createdAt": iso(stat.st_ctime),
        "updatedAt": iso(stat.st_mtime),
        "reviewed": False,
    }
    if thumbnail:
        base["thumbnail"] = thumbnail

    if is_idea:
        # Use the cross-domain IdeaProject shape
        base.update({"status": "idea"})
        return base

    # Outside IDEAS: choose minimal valid per-domain structures
    if domain == "Technology":
        # Choose the most generic tech shape with empty mediums
        base.update({"status": "in_progress", "category": "Software", "mediums": []})
    elif domain == "Creative":
        # Pick CreativeOther to avoid extra required fields
        base.update({"status": "in_progress", "category": "Other"})
    elif domain == "Expository":
        base.update({"status": "in_progress", "category": "Article"})
    else:
        # Fallback to IdeaProject if somehow unknown
        base.update({"status": "idea"})
    return base

def is_project_dir(d: Path) -> bool:
    if not d.is_dir():
        return False
    # A project dir is any leaf dir under a domain, either directly or inside IDEAS
    return True

# --- New helpers for recursive timestamps ---
def get_recursive_timestamps(dirpath: Path) -> tuple[float, float]:
    """
    Returns (oldest_ctime, newest_mtime) for all files in dirpath and subdirs.
    """
    oldest_ctime = float('inf')
    newest_mtime = 0.0
    for root, dirs, files in os.walk(dirpath):
        for fname in files:
            fpath = Path(root) / fname
            try:
                stat = fpath.stat()
                if stat.st_ctime < oldest_ctime:
                    oldest_ctime = stat.st_ctime
                if stat.st_mtime > newest_mtime:
                    newest_mtime = stat.st_mtime
            except Exception:
                continue
    # Fallback to dir itself if no files
    if oldest_ctime == float('inf'):
        stat = dirpath.stat()
        oldest_ctime = stat.st_ctime
        newest_mtime = stat.st_mtime
    return oldest_ctime, newest_mtime

# --- Main walk ---
all_projects: list[dict] = []
created_json_files: list[str] = []

if not ROOT.exists():
    raise SystemExit(f"Root directory not found: {ROOT.resolve()}")

for domain_dir in ROOT.iterdir():
    if not domain_dir.is_dir() or domain_dir.name not in DOMAINS:
        continue
    domain = domain_dir.name

    # Collect candidate project folders:
    candidate_dirs: list[tuple[Path, bool]] = []  # (path, is_idea_folder)

    for child in domain_dir.iterdir():
        if not child.is_dir():
            continue
        if child.name == "_IDEAS_":
            # Only operate on subfolders inside _IDEAS_, not _IDEAS_ itself
            for proj in child.iterdir():
                if proj.is_dir():
                    candidate_dirs.append((proj, True))
            # Do NOT create .json or overview.md directly in _IDEAS_
        elif child.name in {"_INSPIRATION_", "_REFERENCES_"}:
            # Skip these directories entirely
            continue
        else:
            candidate_dirs.append((child, False))

    for proj_dir, is_idea in candidate_dirs:
        if not is_project_dir(proj_dir):
            continue

        title = proj_dir.name
        project_id = slugify(title)
        # Always use '_project.json' as the filename
        json_path = proj_dir / "_project.json"
        overview_path = proj_dir / "overview.md"

        # Create overview.md if missing
        if not overview_path.exists():
            overview_content = f"# {title}\n\nBrief overview.\n"
            overview_path.write_text(overview_content, encoding="utf-8")
            log_data["created"].append(str(overview_path.resolve()))

        # Determine summary
        summary = read_summary_from_overview(overview_path)

        # Detect thumbnail filename relative to project dir (only if named 'thumbnail.*')
        thumb_name = detect_thumbnail(proj_dir)

        # Get recursive timestamps for createdAt/updatedAt
        oldest_ctime, newest_mtime = get_recursive_timestamps(proj_dir)

        # If json exists, read it; else create a new object
        project_obj = None
        if json_path.exists():
            try:
                # Backup before edit
                backup_path = json_path.with_suffix(json_path.suffix + ".bak_prebuild")
                if not backup_path.exists():
                    backup_bytes = json_path.read_bytes()
                    backup_path.write_bytes(backup_bytes)
                    log_data["edited"].append({"path": str(json_path.resolve()), "backup": str(backup_path.resolve())})
                project_obj = json.loads(json_path.read_text(encoding="utf-8"))
            except Exception:
                # If unreadable, do not overwrite; create sidecar with suffix
                json_path = proj_dir / "_project_auto.json"
                project_obj = None

        # If creating for the first time, set createdAt to oldest file ctime
        if project_obj is None and not json_path.exists():
            # Use a local class to mimic os.stat_result for default_project_obj
            class StatStub:
                def __init__(self, st_ctime, st_mtime):
                    self.st_ctime = st_ctime
                    self.st_mtime = st_mtime
            stat = StatStub(oldest_ctime, newest_mtime)
            # Only set thumbnail if there is a valid thumbnail image
            thumbnail_to_set = thumb_name if thumb_name else None
            project_obj = default_project_obj(
                domain=domain,
                title=title,
                summary=summary,
                thumbnail=thumbnail_to_set,
                is_idea=is_idea,
                stat=stat,
                project_id=project_id,
            )
            # Ensure reviewed is always present and False
            project_obj["reviewed"] = False
            json_path.write_text(json.dumps(project_obj, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
            created_json_files.append(str(json_path.relative_to(ROOT)))
            log_data["created"].append(str(json_path.resolve()))

            # If there is a thumbnail, copy it to public/projects/{id}/
            if thumbnail_to_set:
                src_thumb = proj_dir / thumbnail_to_set
                dest_dir = Path(__file__).parent.parent / "public" / "projects" / project_id
                dest_dir.mkdir(parents=True, exist_ok=True)
                dest_thumb = dest_dir / src_thumb.name
                import shutil
                shutil.copy2(src_thumb, dest_thumb)
                # Log the created folder and file for undo
                log_data.setdefault("created_project_folders", []).append(str(dest_dir.resolve()))
                log_data.setdefault("created_project_thumbnails", []).append(str(dest_thumb.resolve()))

        # Ensure we add whatever exists now
        try:
            obj = json.loads(json_path.read_text(encoding="utf-8"))
        except Exception:
            # Skip if still unreadable
            obj = None

        if isinstance(obj, dict):
            # Always update updatedAt to newest_mtime
            obj = dict(obj)
            obj["updatedAt"] = iso(newest_mtime)
            # Only set thumbnail if there is a valid thumbnail image and it is not already set
            if "thumbnail" not in obj and thumb_name:
                obj["thumbnail"] = thumb_name
            # Ensure reviewed is always present and False in the output
            obj["reviewed"] = False
            # Ensure id is present and correct
            obj["id"] = slugify(obj.get("title", title))
            all_projects.append(obj)

# --- Output ---
output_dir = Path(__file__).parent.parent / "public" / "projects"
output_dir.mkdir(parents=True, exist_ok=True)
output_path = output_dir / "projects.json"
output_path.write_text(json.dumps(all_projects, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

# Write log file for undo
with LOG_PATH.open("w", encoding="utf-8") as f:
    json.dump(log_data, f, indent=2, ensure_ascii=False)

print(json.dumps(all_projects, ensure_ascii=False))
if created_json_files:
    print("\nCREATED JSON FILES:")
    for p in created_json_files:
        print(p)
