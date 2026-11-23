#!/usr/bin/env python3
"""
Phase 3 Verification Script: Services Section (Volta Atelier / RenderLab Layer Cards)
Tests:
1. CMS hooks preserved: services-title, services-subtitle
2. 3 layers present with proper IDs: layer-1 (Interfaces), layer-2 (Systems), layer-3 (Intelligence)
3. Tech deliverable tags (.stack-tags, .stack-tag) present in all 3 layers
4. Comparison table and chooser interactive markup intact
5. CSS rules defined for Volta Atelier layer cards, tag pills, pricing cards, and responsive rules
6. WCAG AA contrast ratio verification for all Services section elements
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

    print("=== 1. Checking index.html Services Markup & CMS Hooks ===")
    with open("index.html", "r", encoding="utf-8") as f:
        html = f.read()

    check("Services section exists", 'id="services"' in html)
    check("CMS hook services-title", 'data-cms="services-title"' in html)
    check("CMS hook services-subtitle", 'data-cms="services-subtitle"' in html)
    check("Layer 1 present (Interfaces)", 'id="layer-1"' in html and 'Interfaces' in html)
    check("Layer 2 present (Systems)", 'id="layer-2"' in html and 'Systems' in html)
    check("Layer 3 present (Intelligence)", 'id="layer-3"' in html and 'Intelligence' in html)
    check("Stack tags present in Layer 1", 'Design Systems' in html and 'Customer Portals' in html)
    check("Stack tags present in Layer 2", 'PostgreSQL &amp; Supabase' in html and 'Data Pipelines' in html)
    check("Stack tags present in Layer 3", 'Claude &amp; OpenAI Integration' in html and 'Workflow Automation' in html)
    check("Compare toggle button present", 'data-compare' in html and 'compareTable' in html)
    check("Compare table present", 'id="compareTable"' in html)
    check("Chooser interactive component present", 'data-chooser' in html and 'data-chooser-result' in html)
    check("Cache-busted CSS v14", 'site.css?v=14' in html)

    print("\n=== 2. Checking assets/site.css Phase 3 Services Rules ===")
    with open("assets/site.css", "r", encoding="utf-8") as f:
        css = f.read()

    check("Bright services section container", 'body[data-theme="bright"] #services' in css)
    check("Bright section-index styling", 'body[data-theme="bright"] #services .section-index' in css)
    check("Bright section-title styling", 'body[data-theme="bright"] #services .section-title' in css)
    check("Bright stack layer cards", 'body[data-theme="bright"] .stack-item' in css)
    check("Bright stack layer card open state", 'body[data-theme="bright"] .stack-item.open' in css)
    check("Bright stack-num badge", 'body[data-theme="bright"] .stack-num' in css)
    check("Bright stack-name open color #2563EB", 'body[data-theme="bright"] .stack-item.open .stack-name' in css and '#2563EB' in css)
    check("Bright stack-plus pill button", 'body[data-theme="bright"] .stack-plus' in css)
    check("Bright stack-tags container", 'body[data-theme="bright"] .stack-tags' in css)
    check("Bright stack-tag badge", 'body[data-theme="bright"] .stack-tag' in css)
    check("Bright stack-grid 3-column layout", 'body[data-theme="bright"] .stack-grid' in css)
    check("Bright pricing card inside layer", 'body[data-theme="bright"] .stack-grid > div:last-child' in css)
    check("Bright layer CTA button", 'body[data-theme="bright"] .stack-links a' in css)
    check("Bright compare table styling", 'body[data-theme="bright"] .compare-table' in css)
    check("Bright chooser styling", 'body[data-theme="bright"] .chooser' in css)
    check("Services mobile responsiveness (max-width: 900px)", '@media (max-width: 900px)' in css and 'body[data-theme="bright"] .stack-head' in css)

    print("\n=== 3. WCAG AA Contrast Checks for Services Elements ===")
    services_pairs = [
        ("Section Title (#0F172A on #FFFFFF)", "#0F172A", "#FFFFFF", 4.5),
        ("Section Subtitle (#475569 on #FFFFFF)", "#475569", "#FFFFFF", 4.5),
        ("Layer Title (#0F172A on #FFFFFF)", "#0F172A", "#FFFFFF", 4.5),
        ("Layer Active Title (#2563EB on #FFFFFF)", "#2563EB", "#FFFFFF", 4.5),
        ("Layer Promise (#475569 on #FFFFFF)", "#475569", "#FFFFFF", 4.5),
        ("Tech Stack Tag (#334155 on #FFFFFF)", "#334155", "#FFFFFF", 4.5),
        ("Pricing Text (#0F172A on #F8FAFC)", "#0F172A", "#F8FAFC", 4.5),
        ("Layer CTA (#FFFFFF on #0F172A)", "#FFFFFF", "#0F172A", 4.5),
        ("Compare Table Header (#0F172A on #F8FAFC)", "#0F172A", "#F8FAFC", 4.5),
    ]

    for label, c1, c2, min_r in services_pairs:
        r = contrast_ratio(c1, c2)
        check(f"{label} => {r:.2f}:1 (min {min_r}:1)", r >= min_r)

    print("\n=== 4. Live Dev Server HTTP Check (http://localhost:8321/) ===")
    try:
        req = urllib.request.urlopen("http://localhost:8321/", timeout=4)
        status = req.status
        content = req.read().decode('utf-8')
        check("Dev server HTTP 200", status == 200)
        check("Dev server serves site.css?v=14", 'site.css?v=14' in content)
        check("Dev server serves services title CMS", 'data-cms="services-title"' in content)
        check("Dev server serves layer-1 with stack-tag", 'id="layer-1"' in content and 'stack-tag' in content)
        
        css_req = urllib.request.urlopen("http://localhost:8321/assets/site.css?v=14", timeout=4)
        css_content = css_req.read().decode('utf-8')
        check("Dev server serves Phase 3 Services CSS", 'WORKSTREAM 2 — PHASE 3: SERVICES SECTION' in css_content)
    except Exception as e:
        check("Dev server reachable", False, f"Error: {e}")

    print(f"\nPhase 3 Results: {passed} passed, {failed} failed.")
    return 0 if failed == 0 else 1

if __name__ == "__main__":
    sys.exit(run_checks())
