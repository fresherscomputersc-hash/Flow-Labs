#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Check that every data-cms key in the built HTML exists in the admin schema,
and that every data-section key on the homepage has a matching setting.

Run after `python tools/site/build.py`:
    python tools/site/check_cms_keys.py
Exit code 0 = clean, 1 = missing or orphaned keys.
"""
from __future__ import annotations

import io
import os
import re
import sys

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
SCHEMA = os.path.join(ROOT, "flow-hq", "content-schema.js")

PAGE_BLOCK = re.compile(r"^\s{2}([a-z0-9-]+):\s*\{\s*$", re.M)
FIELD_KEY = re.compile(r"\{\s*key:\s*'([a-z0-9-]+)'")
SECTION_KEY = re.compile(r"section_home_([a-z0-9-]+):\s*'")
DATA_CMS = re.compile(r'data-cms="([a-z0-9-]+)"')
DATA_SECTION = re.compile(r'data-section="([a-z0-9-]+)"')
DATA_PAGE = re.compile(r'<body[^>]*data-page="([a-z0-9-]*)"')


def read(path):
    with io.open(path, encoding="utf-8") as handle:
        return handle.read()


def parse_schema(text):
    """Return {page: set(keys)} and the settings section keys."""
    blocks = {}
    matches = list(PAGE_BLOCK.finditer(text))
    for index, match in enumerate(matches):
        start = match.end()
        end = matches[index + 1].start() if index + 1 < len(matches) else len(text)
        keys = set(FIELD_KEY.findall(text[start:end]))
        if keys:
            blocks[match.group(1)] = keys
    sections = set(SECTION_KEY.findall(text))
    return blocks, sections


def pages():
    skip = {"flow-hq", "assets", "api", "tools", "node_modules", "research", "content", "leads", "_palettes", "_redesign_temp"}
    yield os.path.join(ROOT, "index.html")
    for current, dirs, files in os.walk(ROOT):
        dirs[:] = sorted(d for d in dirs if not d.startswith(".") and d not in skip)
        if os.path.abspath(current) == ROOT:
            continue
        if "index.html" in files:
            yield os.path.join(current, "index.html")


def main():
    schema_text = read(SCHEMA)
    blocks, sections = parse_schema(schema_text)
    problems = []
    checked = 0

    for path in pages():
        html = read(path)
        rel = os.path.relpath(path, ROOT).replace("\\", "/")
        page_match = DATA_PAGE.search(html)
        page = page_match.group(1) if page_match else ""

        keys = set(DATA_CMS.findall(html))
        if keys:
            checked += len(keys)
            if page not in blocks:
                problems.append(f"{rel}: has data-cms keys but page '{page}' is not in the schema")
            else:
                for key in sorted(keys - blocks[page]):
                    problems.append(f"{rel}: data-cms=\"{key}\" is missing from schema page '{page}'")
                for key in sorted(blocks[page] - keys):
                    problems.append(f"{rel}: schema field '{key}' has no data-cms target on the page")

        for name in sorted(set(DATA_SECTION.findall(html))):
            if name not in sections:
                problems.append(f"{rel}: data-section=\"{name}\" has no section_home_{name} setting")

        if page and page in blocks and not keys:
            problems.append(f"{rel}: page '{page}' is in the schema but the HTML has no data-cms attributes")

    # Orphaned schema pages (no HTML) are worth knowing about.
    found_pages = set()
    for path in pages():
        match = DATA_PAGE.search(read(path))
        if match and match.group(1):
            found_pages.add(match.group(1))
    for page in sorted(set(blocks) - found_pages):
        problems.append(f"schema page '{page}' has no built HTML page")

    print(f"checked {checked} CMS bindings across {len(list(pages()))} pages")

    if problems:
        print("\nproblems:")
        for problem in problems:
            print("  - " + problem)
        return 1

    print("all CMS and section keys resolve")
    return 0


if __name__ == "__main__":
    sys.exit(main())
