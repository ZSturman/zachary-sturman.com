# undo_pre_build.py
"""
This script undoes the actions performed by pre-build.py by reading the log file of created/edited files and deleting or reverting them.
"""
import os
import json
from pathlib import Path

LOG_PATH = Path(__file__).parent / "pre_build_log.json"

if not LOG_PATH.exists():
    print(f"No log file found at {LOG_PATH}. Nothing to undo.")
    exit(0)

with LOG_PATH.open("r", encoding="utf-8") as f:
    log = json.load(f)


# Remove created files
for created in log.get("created", []):
    p = Path(created)
    if p.exists():
        try:
            p.unlink()
            print(f"Deleted created file: {p}")
        except Exception as e:
            print(f"Failed to delete {p}: {e}")

# Remove created project thumbnails
for thumb in log.get("created_project_thumbnails", []):
    p = Path(thumb)
    if p.exists():
        try:
            p.unlink()
            print(f"Deleted created thumbnail: {p}")
        except Exception as e:
            print(f"Failed to delete thumbnail {p}: {e}")

# Remove created project folders (if empty)
for folder in log.get("created_project_folders", []):
    p = Path(folder)
    if p.exists() and p.is_dir():
        try:
            # Only remove if empty
            if not any(p.iterdir()):
                p.rmdir()
                print(f"Deleted created project folder: {p}")
            else:
                print(f"Project folder not empty, not deleted: {p}")
        except Exception as e:
            print(f"Failed to delete project folder {p}: {e}")

# Revert edited files
for edited in log.get("edited", []):
    path = Path(edited["path"])
    backup = Path(edited["backup"])
    if path.exists() and backup.exists():
        try:
            path.write_bytes(backup.read_bytes())
            backup.unlink()
            print(f"Reverted file: {path}")
        except Exception as e:
            print(f"Failed to revert {path}: {e}")

# Remove the log file itself
try:
    LOG_PATH.unlink()
    print(f"Removed log file: {LOG_PATH}")
except Exception as e:
    print(f"Failed to remove log file: {e}")
