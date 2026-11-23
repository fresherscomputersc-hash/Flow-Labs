#!/usr/bin/env python3
"""
Phase 1 Verification Script: Global Foundation & Navigation (Bright Theme & Dome Tokens)
Tests:
1. index.html contains data-theme="bright" on body
2. index.html contains meta theme-color #FFFFFF
3. assets/site.css defines V4 ThreeUI Bright / Dome tokens (bg, text, accent, radii, shadows)
4. assets/site.css defines bright navigation (frosted glass, scrolled state, dome pill .nav-cta, mobile drawer)
5. assets/site.css defines dome buttons and pill badges
6. WCAG AA contrast ratio verification for all bright theme text pairs
7. Live HTTP check against dev server at http://localhost:8321/
"""

import sys
import re
import urllib.request
import math

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

    print("=== 1. Checking index.html Markup ===")
    with open("index.html", "r", encoding="utf-8") as f:
        html = f.read()

    check("Theme attribute on body", 'data-theme="bright"' in html)
    check("Meta theme-color is #FFFFFF", '<meta name="theme-color" content="#FFFFFF"' in html)
    check("Site CSS cache-busted v12", 'site.css?v=12' in html)
    check("Navigation structure present", 'header class="nav"' in html or '<header class="nav"' in html)
    check("Nav logo present", 'class="nav-logo"' in html)
    check("Nav links container present", 'id="nav-links"' in html)
    check("Nav CTA button present", 'class="nav-cta"' in html)
    check("Nav toggle button present", 'id="nav-toggle"' in html)
    check("Hero CMS attributes preserved", 'data-cms="hero-title"' in html and 'data-cms="hero-subtitle"' in html)

    print("\n=== 2. Checking assets/site.css Tokens & Rules ===")
    with open("assets/site.css", "r", encoding="utf-8") as f:
        css = f.read()

    check("Bright theme selector in CSS", 'body[data-theme="bright"]' in css)
    check("Token --bg: #FFFFFF", '--bg: #FFFFFF;' in css)
    check("Token --text: #0F172A", '--text: #0F172A;' in css)
    check("Token --text-secondary: #475569", '--text-secondary: #475569;' in css)
    check("Token --accent: #2563EB", '--accent: #2563EB;' in css)
    check("Token --radius-pill: 999px", '--radius-pill: 999px;' in css)
    check("Token --radius-card: 20px", '--radius-card: 20px;' in css)
    check("Subtle grain opacity 0.012", 'opacity: 0.012;' in css)
    check("Nav frosted glass background", 'rgba(255, 255, 255, 0.84)' in css or 'rgba(255, 255, 255, 0.88)' in css or 'backdrop-filter: blur(16px)' in css)
    check("Nav scrolled state styled", 'body[data-theme="bright"] .nav.scrolled' in css)
    check("Nav CTA dome pill styled", 'body[data-theme="bright"] .nav-links a.nav-cta' in css or 'body[data-theme="bright"] .nav-cta' in css)
    check("Nav CTA hover royal blue", '#2563EB' in css and 'body[data-theme="bright"] .nav-links a.nav-cta:hover' in css)
    check("Mobile nav drawer styled", '@media (max-width: 768px)' in css and 'body[data-theme="bright"] .nav-links' in css)
    check("Dome pill badge styled", 'body[data-theme="bright"] .pill' in css)
    check("Dome primary button styled", 'body[data-theme="bright"] .btn-primary' in css)
    check("Accessible focus rings present", 'body[data-theme="bright"] a:focus-visible' in css)

    print("\n=== 3. WCAG AA Contrast Checks ===")
    pairs = [
        ("Primary Text (#0F172A on #FFFFFF)", "#0F172A", "#FFFFFF", 4.5),
        ("Secondary Text (#475569 on #FFFFFF)", "#475569", "#FFFFFF", 4.5),
        ("Muted Meta Text (#64748B on #FFFFFF)", "#64748B", "#FFFFFF", 4.5),
        ("Nav CTA Text (#FFFFFF on #0F172A)", "#FFFFFF", "#0F172A", 4.5),
        ("Nav CTA Hover Text (#FFFFFF on #2563EB)", "#FFFFFF", "#2563EB", 4.5),
    ]

    for label, c1, c2, min_ratio in pairs:
        ratio = contrast_ratio(c1, c2)
        check(f"{label} => {ratio:.2f}:1 (min {min_ratio}:1)", ratio >= min_ratio)

    print("\n=== 4. Live Dev Server HTTP Check (http://localhost:8321/) ===")
    try:
        req = urllib.request.urlopen("http://localhost:8321/", timeout=4)
        status = req.status
        content = req.read().decode('utf-8')
        check("Dev server HTTP 200", status == 200)
        check("Dev server serves data-theme='bright'", 'data-theme="bright"' in content)
        check("Dev server serves site.css?v=12", 'site.css?v=12' in content)
        
        css_req = urllib.request.urlopen("http://localhost:8321/assets/site.css?v=12", timeout=4)
        css_content = css_req.read().decode('utf-8')
        check("Dev server serves updated site.css", 'V4 THREEUI BRIGHT / DOME DESIGN SYSTEM' in css_content)
    except Exception as e:
        check("Dev server reachable", False, f"Error: {e}")

    print(f"\nPhase 1 Results: {passed} passed, {failed} failed.")
    return 0 if failed == 0 else 1

if __name__ == "__main__":
    sys.exit(run_checks())
