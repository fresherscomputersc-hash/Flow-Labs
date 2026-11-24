#!/usr/bin/env python3
"""
Verification Script for Phase 7: ThreeUI Spatial Blog Hub, Articles & System Pages
Tests markup, asset links, CMS hooks, and HTTP 200 delivery.
"""
import os
import sys
import urllib.request

PHASE7_PAGES = [
    {
        "path": "blog/index.html",
        "url": "http://127.0.0.1:8321/blog/",
        "required_cms": ["blog-hero-label", "blog-hero-title", "blog-hero-subtitle"]
    },
    {
        "path": "blog/ai-automation-for-small-businesses/index.html",
        "url": "http://127.0.0.1:8321/blog/ai-automation-for-small-businesses/",
        "required_cms": []
    },
    {
        "path": "blog/custom-software-vs-ready-made-software/index.html",
        "url": "http://127.0.0.1:8321/blog/custom-software-vs-ready-made-software/",
        "required_cms": []
    },
    {
        "path": "blog/how-to-plan-a-website-for-a-new-startup/index.html",
        "url": "http://127.0.0.1:8321/blog/how-to-plan-a-website-for-a-new-startup/",
        "required_cms": []
    },
    {
        "path": "404.html",
        "url": "http://127.0.0.1:8321/404.html",
        "required_cms": []
    },
    {
        "path": "privacy-policy/index.html",
        "url": "http://127.0.0.1:8321/privacy-policy/",
        "required_cms": ["privacy-hero-title", "privacy-hero-subtitle"]
    },
    {
        "path": "terms/index.html",
        "url": "http://127.0.0.1:8321/terms/",
        "required_cms": ["terms-hero-title", "terms-hero-subtitle"]
    }
]

def run_checks():
    total_checks = 0
    passed_checks = 0
    errors = []

    print("=== STARTING PHASE 7 BLOG & SYSTEM PAGES VERIFICATION ===")

    for page in PHASE7_PAGES:
        rel_path = page["path"]
        print(f"\nChecking [{rel_path}]...")

        # 1. Existence
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

        # 3. Canvas
        total_checks += 1
        if 'id="threeuiCanvas"' in content:
            passed_checks += 1
        else:
            errors.append(f"{rel_path}: Missing #threeuiCanvas")

        # 4. Dock
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

        # 6. HTTP 200 delivery
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
    print(f"Phase 7 Verification Results: {passed_checks}/{total_checks} checks passed.")
    if errors:
        print("FAILURES:")
        for err in errors:
            print(f"  - {err}")
        sys.exit(1)
    else:
        print("ALL PHASE 7 CHECKS PASSED PERFECTLY!")
        sys.exit(0)

if __name__ == "__main__":
    run_checks()
