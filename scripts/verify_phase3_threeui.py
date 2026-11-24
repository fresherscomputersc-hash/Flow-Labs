#!/usr/bin/env python3
"""
Verification Script for Phase 3: ThreeUI Spatial Work Showroom & 7 Case Studies
Tests markup, asset links, CMS hooks, and HTTP 200 status across all 8 pages.
"""
import os
import sys
import urllib.request
import re

WORK_PAGES = [
    {
        "path": "work/index.html",
        "url": "http://127.0.0.1:8321/work/",
        "required_cms": ["work-hero-label", "work-hero-title", "work-hero-subtitle"]
    },
    {
        "path": "work/droovee/index.html",
        "url": "http://127.0.0.1:8321/work/droovee/",
        "required_cms": ["droovee-hero-pill", "droovee-hero-h1", "droovee-hero-sub"]
    },
    {
        "path": "work/drishti/index.html",
        "url": "http://127.0.0.1:8321/work/drishti/",
        "required_cms": ["drishti-hero-pill", "drishti-hero-h1", "drishti-hero-sub"]
    },
    {
        "path": "work/flowops/index.html",
        "url": "http://127.0.0.1:8321/work/flowops/",
        "required_cms": ["flowops-hero-pill", "flowops-hero-h1", "flowops-hero-sub"]
    },
    {
        "path": "work/bhuverify/index.html",
        "url": "http://127.0.0.1:8321/work/bhuverify/",
        "required_cms": ["bhuverify-hero-pill", "bhuverify-hero-h1", "bhuverify-hero-sub"]
    },
    {
        "path": "work/carbon-coach/index.html",
        "url": "http://127.0.0.1:8321/work/carbon-coach/",
        "required_cms": ["carbon-hero-pill", "carbon-hero-h1", "carbon-hero-sub"]
    },
    {
        "path": "work/interview-copilot/index.html",
        "url": "http://127.0.0.1:8321/work/interview-copilot/",
        "required_cms": ["copilot-hero-pill", "copilot-hero-h1", "copilot-hero-sub"]
    },
    {
        "path": "work/qr-platform/index.html",
        "url": "http://127.0.0.1:8321/work/qr-platform/",
        "required_cms": ["qr-hero-pill", "qr-hero-h1", "qr-hero-sub"]
    }
]

def run_checks():
    total_checks = 0
    passed_checks = 0
    errors = []

    print("=== STARTING PHASE 3 THREEUI VERIFICATION ===")

    for page in WORK_PAGES:
        rel_path = page["path"]
        print(f"\nChecking [{rel_path}]...")

        # 1. File existence
        total_checks += 1
        if not os.path.exists(rel_path):
            errors.append(f"Missing file: {rel_path}")
            continue
        passed_checks += 1

        with open(rel_path, "r", encoding="utf-8") as f:
            content = f.read()

        # 2. ThreeUI CSS & JS
        total_checks += 1
        if "assets/threeui.css" in content and "assets/threeui.js" in content:
            passed_checks += 1
        else:
            errors.append(f"{rel_path}: Missing threeui.css or threeui.js")

        # 3. Canvas element
        total_checks += 1
        if 'id="threeuiCanvas"' in content:
            passed_checks += 1
        else:
            errors.append(f"{rel_path}: Missing #threeuiCanvas")

        # 4. Dock container
        total_checks += 1
        if 'class="three-dock"' in content:
            passed_checks += 1
        else:
            errors.append(f"{rel_path}: Missing .three-dock navigation")

        # 5. CMS hooks
        for hook in page["required_cms"]:
            total_checks += 1
            if f'data-cms="{hook}"' in content:
                passed_checks += 1
            else:
                errors.append(f"{rel_path}: Missing data-cms='{hook}'")

        # 6. HTTP 200 delivery from dev server
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
    print(f"Phase 3 Verification Results: {passed_checks}/{total_checks} checks passed.")
    if errors:
        print("FAILURES:")
        for err in errors:
            print(f"  - {err}")
        sys.exit(1)
    else:
        print("ALL PHASE 3 CHECKS PASSED PERFECTLY!")
        sys.exit(0)

if __name__ == "__main__":
    run_checks()
