#!/usr/bin/env python3
"""
Verification Script for Phase 4: ThreeUI Spatial About Studio Page
Tests markup, asset links, CMS hooks, and HTTP 200 status for /about/.
"""
import os
import sys
import urllib.request

ABOUT_PAGE = {
    "path": "about/index.html",
    "url": "http://127.0.0.1:8321/about/",
    "required_cms": [
        "about-hero-label",
        "about-hero-title",
        "about-hero-subtitle",
        "about-body-1",
        "about-body-2",
        "about-body-3"
    ]
}

def run_checks():
    total_checks = 0
    passed_checks = 0
    errors = []

    print("=== STARTING PHASE 4 ABOUT PAGE VERIFICATION ===")

    rel_path = ABOUT_PAGE["path"]
    total_checks += 1
    if not os.path.exists(rel_path):
        errors.append(f"Missing file: {rel_path}")
        print(f"FAIL: {rel_path} does not exist.")
        sys.exit(1)
    passed_checks += 1

    with open(rel_path, "r", encoding="utf-8") as f:
        content = f.read()

    # ThreeUI CSS & JS
    total_checks += 1
    if "assets/threeui.css" in content and "assets/threeui.js" in content:
        passed_checks += 1
    else:
        errors.append("Missing threeui.css or threeui.js")

    # Canvas element
    total_checks += 1
    if 'id="threeuiCanvas"' in content:
        passed_checks += 1
    else:
        errors.append("Missing #threeuiCanvas")

    # Dock container
    total_checks += 1
    if 'class="three-dock"' in content:
        passed_checks += 1
    else:
        errors.append("Missing .three-dock navigation")

    # CMS hooks
    for hook in ABOUT_PAGE["required_cms"]:
        total_checks += 1
        if f'data-cms="{hook}"' in content:
            passed_checks += 1
        else:
            errors.append(f"Missing CMS hook: data-cms='{hook}'")

    # HTTP 200 delivery from dev server
    total_checks += 1
    url = ABOUT_PAGE["url"]
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
        with urllib.request.urlopen(req, timeout=5) as resp:
            if resp.status == 200:
                passed_checks += 1
            else:
                errors.append(f"{url} returned status {resp.status}")
    except Exception as e:
        errors.append(f"HTTP request failed for {url}: {e}")

    print("\n==============================================")
    print(f"Phase 4 Verification Results: {passed_checks}/{total_checks} checks passed.")
    if errors:
        print("FAILURES:")
        for err in errors:
            print(f"  - {err}")
        sys.exit(1)
    else:
        print("ALL PHASE 4 CHECKS PASSED PERFECTLY!")
        sys.exit(0)

if __name__ == "__main__":
    run_checks()
