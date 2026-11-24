#!/usr/bin/env python3
"""
Verification Script for Phase 6: ThreeUI Spatial Lab Report & Bhubaneswar Regional Studio
Tests markup, asset links, CMS hooks, scanner elements, and HTTP 200 status.
"""
import os
import sys
import urllib.request

PHASE6_PAGES = [
    {
        "path": "lab-report/index.html",
        "url": "http://127.0.0.1:8321/lab-report/",
        "required_cms": [
            "lab-hero-label",
            "lab-hero-title",
            "lab-hero-subtitle"
        ],
        "required_elements": [
            "id=\"labForm\"",
            "id=\"labUrl\"",
            "id=\"labReport\"",
            "id=\"labError\""
        ]
    },
    {
        "path": "bhubaneswar/index.html",
        "url": "http://127.0.0.1:8321/bhubaneswar/",
        "required_cms": [
            "bhubaneswar-hero-label",
            "bhubaneswar-hero-title",
            "bhubaneswar-hero-subtitle"
        ],
        "required_elements": [
            "Bhubaneswar"
        ]
    }
]

def run_checks():
    total_checks = 0
    passed_checks = 0
    errors = []

    print("=== STARTING PHASE 6 LAB REPORT & REGIONAL VERIFICATION ===")

    for page in PHASE6_PAGES:
        rel_path = page["path"]
        print(f"\nChecking [{rel_path}]...")

        total_checks += 1
        if not os.path.exists(rel_path):
            errors.append(f"Missing file: {rel_path}")
            continue
        passed_checks += 1

        with open(rel_path, "r", encoding="utf-8") as f:
            content = f.read()

        # ThreeUI CSS & JS
        total_checks += 1
        if "assets/threeui.css" in content and "assets/threeui.js" in content:
            passed_checks += 1
        else:
            errors.append(f"{rel_path}: Missing threeui.css or threeui.js")

        # Canvas element
        total_checks += 1
        if 'id="threeuiCanvas"' in content:
            passed_checks += 1
        else:
            errors.append(f"{rel_path}: Missing #threeuiCanvas")

        # Dock container
        total_checks += 1
        if 'class="three-dock"' in content:
            passed_checks += 1
        else:
            errors.append(f"{rel_path}: Missing .three-dock navigation")

        # CMS hooks
        for hook in page["required_cms"]:
            total_checks += 1
            if f'data-cms="{hook}"' in content:
                passed_checks += 1
            else:
                errors.append(f"{rel_path}: Missing data-cms='{hook}'")

        # Elements
        for elem in page["required_elements"]:
            total_checks += 1
            if elem in content:
                passed_checks += 1
            else:
                errors.append(f"{rel_path}: Missing required element '{elem}'")

        # HTTP 200 delivery from dev server
        total_checks += 1
        url = page["url"]
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
    print(f"Phase 6 Verification Results: {passed_checks}/{total_checks} checks passed.")
    if errors:
        print("FAILURES:")
        for err in errors:
            print(f"  - {err}")
        sys.exit(1)
    else:
        print("ALL PHASE 6 CHECKS PASSED PERFECTLY!")
        sys.exit(0)

if __name__ == "__main__":
    run_checks()
