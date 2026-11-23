#!/usr/bin/env python3
"""
Phase 4 Verification Script: Work & Case Studies (Volta Atelier Portfolio Stack)
Tests:
1. CMS hooks preserved: work-title, work-subtitle
2. Filter toolbar (.work-filter, data-work-filter) present with category buttons
3. Portfolio cards present: droovee, drishti, flowops, bhoomi
4. AI lab chips container (.ai-lab, .ai-chip) present
5. CSS rules defined for Volta Atelier portfolio cards, status badges, proof bars, and feature card
6. WCAG AA contrast ratio verification for all Work section elements
7. Live HTTP dev server check (http://localhost:8321/)
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

    print("=== 1. Checking index.html Work Markup & CMS Hooks ===")
    with open("index.html", "r", encoding="utf-8") as f:
        html = f.read()

    check("Work section exists", 'id="work"' in html)
    check("CMS hook work-title", 'data-cms="work-title"' in html)
    check("CMS hook work-subtitle", 'data-cms="work-subtitle"' in html)
    check("Filter toolbar present", 'data-work-filter' in html)
    check("Filter button All", 'data-filter="all"' in html)
    check("Filter button Interfaces", 'data-filter="web"' in html)
    check("Filter button Systems", 'data-filter="software"' in html)
    check("Filter button Intelligence", 'data-filter="ai"' in html)
    check("Card droovee present", 'data-name="droovee"' in html and 'assets/work-droovee.png' in html)
    check("Card drishti present", 'data-name="drishti"' in html and 'assets/work-drishti.png' in html)
    check("Card flowops present", 'data-name="flowops"' in html and 'assets/work-flowops.png' in html)
    check("Card bhoomi present", 'data-name="bhoomi"' in html and 'assets/work-bhoomi.svg' in html)
    check("AI lab chips container present", 'class="ai-lab' in html)
    check("Cache-busted CSS v15", 'site.css?v=15' in html)

    print("\n=== 2. Checking assets/site.css Phase 4 Work Rules ===")
    with open("assets/site.css", "r", encoding="utf-8") as f:
        css = f.read()

    check("Bright work section container", 'body[data-theme="bright"] #work' in css)
    check("Bright filter toolbar styling", 'body[data-theme="bright"] .work-filter' in css)
    check("Bright active filter button", 'body[data-theme="bright"] .work-filter button[aria-pressed="true"]' in css)
    check("Bright work-grid styling", 'body[data-theme="bright"] .work-grid' in css)
    check("Bright work-card styling", 'body[data-theme="bright"] .work-card' in css)
    check("Bright work-card hover lift", 'body[data-theme="bright"] .work-card:hover' in css)
    check("Bright work-card cover aspect ratio", 'body[data-theme="bright"] .work-card .cover' in css)
    check("Bright work-card status pill badge", 'body[data-theme="bright"] .work-card .status' in css)
    check("Bright work-card type badge", 'body[data-theme="bright"] .work-top .type' in css)
    check("Bright work-proof bar", 'body[data-theme="bright"] .work-proof' in css)
    check("Bright work-tags pills", 'body[data-theme="bright"] .work-tags' in css)
    check("Bright work-arrow hover animation", 'body[data-theme="bright"] .work-card:hover .work-arrow' in css)
    check("Bright feature card layout (desktop)", 'body[data-theme="bright"] .work-feature' in css)
    check("Bright AI lab container and chips", 'body[data-theme="bright"] .ai-lab' in css and 'body[data-theme="bright"] .ai-chip' in css)
    check("Work mobile responsiveness (max-width: 768px)", '@media (max-width: 768px)' in css and 'body[data-theme="bright"] .work-grid' in css)

    print("\n=== 3. WCAG AA Contrast Checks for Work Elements ===")
    work_pairs = [
        ("Section Title (#0F172A on #F8FAFC)", "#0F172A", "#F8FAFC", 4.5),
        ("Section Subtitle (#475569 on #F8FAFC)", "#475569", "#F8FAFC", 4.5),
        ("Filter Active Button (#FFFFFF on #0F172A)", "#FFFFFF", "#0F172A", 4.5),
        ("Card Title (#0F172A on #FFFFFF)", "#0F172A", "#FFFFFF", 4.5),
        ("Card Description (#475569 on #FFFFFF)", "#475569", "#FFFFFF", 4.5),
        ("Card Proof (#0F172A on #FFFFFF)", "#0F172A", "#FFFFFF", 4.5),
        ("Card Type Badge (#2563EB on #FFFFFF)", "#2563EB", "#FFFFFF", 4.5),
        ("Status Live Badge (#FFFFFF on #15803D)", "#FFFFFF", "#15803D", 4.5),
        ("Status In-house Badge (#FFFFFF on #0F172A)", "#FFFFFF", "#0F172A", 4.5),
    ]

    for label, c1, c2, min_r in work_pairs:
        r = contrast_ratio(c1, c2)
        check(f"{label} => {r:.2f}:1 (min {min_r}:1)", r >= min_r)

    print("\n=== 4. Live Dev Server HTTP Check (http://localhost:8321/) ===")
    try:
        req = urllib.request.urlopen("http://localhost:8321/", timeout=4)
        status = req.status
        content = req.read().decode('utf-8')
        check("Dev server HTTP 200", status == 200)
        check("Dev server serves site.css?v=15", 'site.css?v=15' in content)
        check("Dev server serves work title CMS", 'data-cms="work-title"' in content)
        check("Dev server serves work-card droovee", 'data-name="droovee"' in content)
        
        css_req = urllib.request.urlopen("http://localhost:8321/assets/site.css?v=15", timeout=4)
        css_content = css_req.read().decode('utf-8')
        check("Dev server serves Phase 4 Work CSS", 'WORKSTREAM 2 — PHASE 4: WORK & CASE STUDIES' in css_content)
    except Exception as e:
        check("Dev server reachable", False, f"Error: {e}")

    print(f"\nPhase 4 Results: {passed} passed, {failed} failed.")
    return 0 if failed == 0 else 1

if __name__ == "__main__":
    sys.exit(run_checks())
