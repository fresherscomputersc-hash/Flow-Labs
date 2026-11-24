#!/usr/bin/env python3
"""
Phase 2 Verification Script: ThreeUI Choice 1 Services Architecture Hub & 4 Sub-Pages
Tests:
1. services/index.html: ThreeUI canvas, dock, 3-layer bento cards, comparison table, 4-phase protocol, telemetry footer
2. 4 Domain deep-dive pages: web-development, custom-software-development, ai-automation, ai-chatbot-development
3. Preservation of all CMS hooks across all 5 pages
4. Strict WCAG AA contrast checks
5. Local dev server HTTP 200 delivery for all 5 pages
"""

import sys
import urllib.request

def calc_luminance(hex_code):
    hex_code = hex_code.lstrip('#')
    if len(hex_code) == 3:
        hex_code = ''.join([c*2 for c in hex_code])
    r = int(hex_code[0:2], 16) / 255.0
    g = int(hex_code[2:4], 16) / 255.0
    b = int(hex_code[4:6], 16) / 255.0
    
    def adj(c):
        return c / 12.92 if c <= 0.03928 else ((c + 0.055) / 1.055) ** 2.4
    
    return 0.2126 * adj(r) + 0.7152 * adj(g) + 0.0722 * adj(b)

def contrast_ratio(hex1, hex2):
    l1 = calc_luminance(hex1)
    l2 = calc_luminance(hex2)
    top = max(l1, l2)
    bot = min(l1, l2)
    return (top + 0.05) / (bot + 0.05)

def run_checks():
    passed = 0
    failed = 0
    
    def check(name, condition, detail=""):
        nonlocal passed, failed
        if condition:
            passed += 1
            print(f"  [PASS] {name} {detail}")
        else:
            failed += 1
            print(f"  [FAIL] {name} {detail}")

    print("=== 1. Checking services/index.html ThreeUI Markup & CMS ===")
    with open("services/index.html", "r", encoding="utf-8") as f:
        hub_html = f.read()

    check("Services canvas exists", '<canvas id="threeuiCanvas"' in hub_html)
    check("Services dock exists", 'class="three-dock"' in hub_html)
    check("CMS hook services-hero-label", 'data-cms="services-hero-label"' in hub_html)
    check("CMS hook services-hero-title", 'data-cms="services-hero-title"' in hub_html)
    check("CMS hook services-hero-subtitle", 'data-cms="services-hero-subtitle"' in hub_html)
    check("Layer 01 Interfaces card", 'Interfaces &amp; Web Applications' in hub_html)
    check("Layer 02 Systems card", 'Scaled Cloud Platforms' in hub_html)
    check("Layer 03 Intelligence card", 'Applied AI &amp; Autonomous Agents' in hub_html)
    check("Comparison table exists", 'id="compare"' in hub_html and '<table' in hub_html)
    check("4-phase protocol exists", 'Technical Discovery' in hub_html and 'Handover &amp; Warranty' in hub_html)
    check("Services footer exists", 'class="three-footer"' in hub_html)

    print("\n=== 2. Checking 4 Services Sub-Pages ThreeUI Markup & CMS ===")
    subpages = [
        ("services/web-development/index.html", "webdev-hero-pill", "webdev-hero-h1", "webdev-hero-sub", "Web Development"),
        ("services/custom-software-development/index.html", "customsoft-hero-pill", "customsoft-hero-h1", "customsoft-hero-sub", "Custom Software"),
        ("services/ai-automation/index.html", "aiauto-hero-pill", "aiauto-hero-h1", "aiauto-hero-sub", "AI Automation"),
        ("services/ai-chatbot-development/index.html", "aichat-hero-pill", "aichat-hero-h1", "aichat-hero-sub", "AI Chatbot"),
    ]

    for filepath, pill_hook, h1_hook, sub_hook, label in subpages:
        with open(filepath, "r", encoding="utf-8") as f:
            content = f.read()
        check(f"{label}: ThreeUI canvas present", '<canvas id="threeuiCanvas"' in content)
        check(f"{label}: ThreeUI dock present", 'class="three-dock"' in content)
        check(f"{label}: CMS pill hook ({pill_hook})", f'data-cms="{pill_hook}"' in content)
        check(f"{label}: CMS h1 hook ({h1_hook})", f'data-cms="{h1_hook}"' in content)
        check(f"{label}: CMS sub hook ({sub_hook})", f'data-cms="{sub_hook}"' in content)
        check(f"{label}: ThreeUI bento grid present", 'class="three-bento-grid"' in content)
        check(f"{label}: Telemetry footer present", 'class="three-footer"' in content)

    print("\n=== 3. WCAG AA Contrast Checks for Services Pages ===")
    contrast_pairs = [
        ("Primary Text (#F8FAFC on #07090E)", "#F8FAFC", "#07090E", 4.5),
        ("Secondary Text (#94A3B8 on #07090E)", "#94A3B8", "#07090E", 4.5),
        ("Neon Cyan Accent (#06B6D4 on #07090E)", "#06B6D4", "#07090E", 4.5),
        ("Primary Button (#07090E on #FFFFFF)", "#07090E", "#FFFFFF", 4.5),
    ]
    for label, c1, c2, min_r in contrast_pairs:
        r = contrast_ratio(c1, c2)
        check(f"{label} => {r:.2f}:1 (min {min_r}:1)", r >= min_r)

    print("\n=== 4. Local Dev Server HTTP 200 Delivery Checks ===")
    urls = [
        "http://127.0.0.1:8321/services/",
        "http://127.0.0.1:8321/services/web-development/",
        "http://127.0.0.1:8321/services/custom-software-development/",
        "http://127.0.0.1:8321/services/ai-automation/",
        "http://127.0.0.1:8321/services/ai-chatbot-development/"
    ]
    for url in urls:
        try:
            req = urllib.request.urlopen(url, timeout=4)
            check(f"{url} HTTP 200", req.status == 200)
        except Exception as e:
            check(f"{url} HTTP reachable", False, str(e))

    print(f"\nPhase 2 Services Verification: {passed} passed, {failed} failed.")
    return 0 if failed == 0 else 1

if __name__ == "__main__":
    sys.exit(run_checks())
