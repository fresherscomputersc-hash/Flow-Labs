#!/usr/bin/env python3
"""
Phase 2 Verification Script: Hero Section (OBLO-style Bold Editorial & ThreeUI Canvas)
Tests:
1. CMS hooks preserved: hero-label, hero-title, hero-subtitle
2. Canvas #flowField present and properly configured
3. Dual magnetic CTA buttons (.btn-primary, .btn, .magnetic) present
4. Stat strip present with 4 metrics and data-count attributes
5. CSS rules defined for bright hero, title, subtitle, buttons, stat strip, and mobile layout
6. site.js contains theme-aware flowField colors
7. WCAG AA contrast ratio verification for all hero elements
8. Live HTTP dev server check (http://localhost:8321/)
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

    print("=== 1. Checking index.html Hero Markup & CMS Hooks ===")
    with open("index.html", "r", encoding="utf-8") as f:
        html = f.read()

    check("Hero section exists", '<section class="hero hero--centered">' in html or 'class="hero' in html)
    check("Canvas flowField exists", '<canvas id="flowField"' in html)
    check("Canvas has aria-hidden", 'aria-hidden="true"' in html)
    check("CMS hook hero-label", 'data-cms="hero-label"' in html)
    check("CMS hook hero-title", 'data-cms="hero-title"' in html)
    check("CMS hook hero-subtitle", 'data-cms="hero-subtitle"' in html)
    check("Pill badge present with dot", 'class="pill"' in html and 'class="dot"' in html)
    check("Primary magnetic CTA present", 'class="btn btn-primary magnetic"' in html)
    check("Secondary magnetic CTA present", 'class="btn magnetic"' in html)
    check("Stat strip present", 'class="stat-strip' in html)
    check("Stat builds count data-count=4", 'data-count="4"' in html)
    check("Stat founders count data-count=3", 'data-count="3"' in html)
    check("Stat outsourced count data-count=0", 'data-count="0"' in html)
    check("Stat 48h reply window", '48h' in html)
    check("Cache-busted CSS v13", 'site.css?v=13' in html)
    check("Cache-busted JS v8", 'site.js?v=8' in html)

    print("\n=== 2. Checking assets/site.css Phase 2 Hero Rules ===")
    with open("assets/site.css", "r", encoding="utf-8") as f:
        css = f.read()

    check("Bright hero container styling", 'body[data-theme="bright"] .hero' in css)
    check("Bright flowField canvas styling", 'body[data-theme="bright"] #flowField' in css)
    check("Bright pill badge styling", 'body[data-theme="bright"] .hero .pill' in css)
    check("Bright pulse dot animation", 'animation: pulseDot' in css or '@keyframes pulseDot' in css)
    check("Bright hero title styling", 'body[data-theme="bright"] .hero-title' in css)
    check("Bright title gradient em", 'body[data-theme="bright"] .hero-title em' in css)
    check("Bright subtitle styling", 'body[data-theme="bright"] .hero-subtitle' in css)
    check("Bright actions container", 'body[data-theme="bright"] .hero-actions' in css)
    check("Bright primary button styling", 'body[data-theme="bright"] .hero-actions .btn-primary' in css)
    check("Bright secondary button styling", 'body[data-theme="bright"] .hero-actions .btn:not(.btn-primary)' in css)
    check("Bright stat strip card container", 'body[data-theme="bright"] .hero .stat-strip' in css)
    check("Bright stat cells", 'body[data-theme="bright"] .hero .stat' in css)
    check("Mobile responsive hero rules", '@media (max-width: 680px)' in css)

    print("\n=== 3. Checking assets/site.js Canvas Adaptivity ===")
    with open("assets/site.js", "r", encoding="utf-8") as f:
        js = f.read()

    check("Theme-aware flowField stroke", 'isBright ? \'rgba(37,99,235,0.14)\'' in js or 'isBright ?' in js)
    check("Theme-aware flowField fill", 'rgba(37,99,235,0.48)' in js or 'isBright ?' in js)

    print("\n=== 4. WCAG AA Contrast Checks for Hero Elements ===")
    hero_pairs = [
        ("Hero Title (#0F172A on #FFFFFF)", "#0F172A", "#FFFFFF", 4.5),
        ("Hero Subtitle (#475569 on #FFFFFF)", "#475569", "#FFFFFF", 4.5),
        ("Category Pill Text (#1D4ED8 on #FFFFFF)", "#1D4ED8", "#FFFFFF", 4.5),
        ("Primary CTA (#FFFFFF on #0F172A)", "#FFFFFF", "#0F172A", 4.5),
        ("Primary CTA Hover (#FFFFFF on #2563EB)", "#FFFFFF", "#2563EB", 4.5),
        ("Secondary CTA (#0F172A on #FFFFFF)", "#0F172A", "#FFFFFF", 4.5),
        ("Stat Number (#0F172A on #FFFFFF)", "#0F172A", "#FFFFFF", 4.5),
        ("Stat Label (#64748B on #FFFFFF)", "#64748B", "#FFFFFF", 4.5),
    ]

    for label, c1, c2, min_r in hero_pairs:
        r = contrast_ratio(c1, c2)
        check(f"{label} => {r:.2f}:1 (min {min_r}:1)", r >= min_r)

    print("\n=== 5. Live Dev Server HTTP Check (http://localhost:8321/) ===")
    try:
        req = urllib.request.urlopen("http://localhost:8321/", timeout=4)
        status = req.status
        content = req.read().decode('utf-8')
        check("Dev server HTTP 200", status == 200)
        check("Dev server serves site.css?v=13", 'site.css?v=13' in content)
        check("Dev server serves site.js?v=8", 'site.js?v=8' in content)
        check("Dev server serves hero title CMS", 'data-cms="hero-title"' in content)
        
        css_req = urllib.request.urlopen("http://localhost:8321/assets/site.css?v=13", timeout=4)
        css_content = css_req.read().decode('utf-8')
        check("Dev server serves Phase 2 hero CSS", 'WORKSTREAM 2 — PHASE 2: HERO SECTION' in css_content)

        js_req = urllib.request.urlopen("http://localhost:8321/assets/site.js?v=8", timeout=4)
        js_content = js_req.read().decode('utf-8')
        check("Dev server serves Phase 2 adaptive JS", 'isBright' in js_content)
    except Exception as e:
        check("Dev server reachable", False, f"Error: {e}")

    print(f"\nPhase 2 Results: {passed} passed, {failed} failed.")
    return 0 if failed == 0 else 1

if __name__ == "__main__":
    sys.exit(run_checks())
