#!/usr/bin/env python3
"""
sync-content.py — copies data/site-content.json into the inline
<script type="application/json" id="site-content-data"> block in
index.html.

Why this exists: the site reads its content from JSON embedded directly
in index.html (not from a separate fetch()) so that it works correctly
when opened straight from disk via file:// — browsers block fetch() of
local files for security reasons, which otherwise breaks the page with a
CORS error. data/site-content.json is kept alongside as the readable,
diff-friendly source of truth for editing; run this script after editing
it to push those changes into index.html.

Usage:
    python3 scripts/sync-content.py

Run from anywhere — paths are resolved relative to this script's location.
"""
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
JSON_PATH = ROOT / "data" / "site-content.json"
HTML_PATH = ROOT / "index.html"

PATTERN = re.compile(
    r'(<script type="application/json" id="site-content-data">\n).*?(\n\s*</script>)',
    re.DOTALL,
)


def main() -> int:
    if not JSON_PATH.exists():
        print(f"error: {JSON_PATH} not found", file=sys.stderr)
        return 1
    if not HTML_PATH.exists():
        print(f"error: {HTML_PATH} not found", file=sys.stderr)
        return 1

    raw = JSON_PATH.read_text(encoding="utf-8")
    try:
        json.loads(raw)
    except json.JSONDecodeError as e:
        print(f"error: data/site-content.json is not valid JSON: {e}", file=sys.stderr)
        return 1

    html = HTML_PATH.read_text(encoding="utf-8")
    safe_json = raw.replace("</script>", "<\\/script>")

    new_html, count = PATTERN.subn(lambda m: m.group(1) + safe_json + m.group(2), html)
    if count == 0:
        print(
            "error: could not find the inline <script id=\"site-content-data\"> "
            "block in index.html — has it been renamed or removed?",
            file=sys.stderr,
        )
        return 1

    HTML_PATH.write_text(new_html, encoding="utf-8")
    print(f"Synced {JSON_PATH.name} -> {HTML_PATH.name} ({len(raw)} bytes)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
