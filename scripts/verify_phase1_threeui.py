#!/usr/bin/env python3
"""
Phase 1 Verification Script: ThreeUI Choice 1 Flagship on Homepage (index.html)
Tests:
1. ThreeUI markup: canvas #threeuiCanvas, dock, hero, hud, capabilities bento, work cards, founders, scoping terminal, footer
2. CMS hooks preservation: hero-label, hero-title, hero-subtitle, services-title, services-subtitle, work-title, work-subtitle, team-title, team-subtitle, team-1/2/3-name, cta-title, cta-subtitle
3. ThreeUI CSS & JS assets loaded and validated
4. Strict WCAG AA contrast checks
5. Local dev server HTTP 200 delivery for root / and assets
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

    print("=== 1. Checking index.html ThreeUI Flagship Markup ===")
    with open("index.html", "r", encoding="utf-8") as f:
        html = f.read()

    check("Three.js canvas exists", '<canvas id="threeuiCanvas"' in html)
    check("Spatial dock navigation exists", 'class="three-dock"' in html)
    check("Hero section exists", 'id="hero"' in html)
    check("Radar status pill exists", 'class="three-pill-tag"' in html and 'three-pill-dot' in html)
    check("Primary magnetic button exists", 'class="three-btn primary"' in html and 'data-magnetic' in html)
    check("Studio telemetry HUD exists", 'class="three-hud"' in html)
    check("Bento capabilities grid exists", 'class="three-bento-grid"' in html)
    check("Card 3D tilt attribute present", 'data-three-tilt' in html)
    check("Droovee featured card exists", 'Droovee' in html and 'LIVE IN PRODUCTION' in html)
    check("Drishti card exists", 'Drishti AI' in html)
    check("FlowOps card exists", 'FlowOps Orchestrator' in html)
    check("Founder cockpit card exists", 'Smruti Ranjan' in html and 'Biswash' in html and 'Arpita' in html)
    check("Interactive scoping terminal exists", 'class="scoping-terminal"' in html and 'id="scopeWeeks"' in html)
    check("Direct inquiry form exists", 'id="inquiryForm"' in html and 'id="inqName"' in html)
    check("Telemetry footer exists", 'class="three-footer"' in html and 'data-clock' in html)
    check("Stylesheet threeui.css linked", 'threeui.css?v=1' in html)
    check("Script threeui.js linked", 'threeui.js?v=1' in html)

    print("\n=== 2. Checking CMS Attributes on Homepage ===")
    cms_hooks = [
        "hero-label", "hero-title", "hero-subtitle",
        "services-title", "services-subtitle",
        "work-title", "work-subtitle",
        "team-title", "team-subtitle",
        "team-1-name", "team-2-name", "team-3-name",
        "cta-title", "cta-subtitle"
    ]
    for hook in cms_hooks:
        check(f"CMS Hook: data-cms='{hook}'", f'data-cms="{hook}"' in html)

    print("\n=== 3. Checking assets/threeui.css & assets/threeui.js ===")
    with open("assets/threeui.css", "r", encoding="utf-8") as f:
        css = f.read()

    check("Spatial color variables defined", '--bg-deep: #07090E;' in css and '--neon-blue:' in css)
    check("Glassmorphism bento card styles defined", '.three-card' in css and 'backdrop-filter: blur' in css)
    check("Specular perimeter light beam defined", '--mouse-x' in css and 'radial-gradient' in css)
    check("Terminal form row responsive styles defined", '.terminal-form-row' in css)

    with open("assets/threeui.js", "r", encoding="utf-8") as f:
        js = f.read()

    check("Three.js WebGL procedural engine", 'THREE.ShaderMaterial' in js and 'THREE.Points' in js)
    check("3D card tilt physics handler", 'rotateX' in js and 'rotateY' in js)
    check("Magnetic button physics handler", 'data-magnetic' in js)
    check("Scoping terminal calculator", 'baseRate' in js and 'scopeWeeks' in js)
    check("Inquiry form submission handler", 'inquiryForm' in js and 'fetch' in js)
    check("IST studio clock updater", 'data-clock' in js)

    print("\n=== 4. WCAG AA Contrast Checks for ThreeUI Elements ===")
    contrast_pairs = [
        ("Primary Text (#F8FAFC on #07090E)", "#F8FAFC", "#07090E", 4.5),
        ("Secondary Text (#94A3B8 on #07090E)", "#94A3B8", "#07090E", 4.5),
        ("Neon Cyan Accent (#06B6D4 on #07090E)", "#06B6D4", "#07090E", 4.5),
        ("Primary White Button Text (#07090E on #FFFFFF)", "#07090E", "#FFFFFF", 4.5),
        ("Dock CTA Button Text (#FFFFFF on #2563EB)", "#FFFFFF", "#2563EB", 4.5),
    ]
    for label, c1, c2, min_r in contrast_pairs:
        r = contrast_ratio(c1, c2)
        check(f"{label} => {r:.2f}:1 (min {min_r}:1)", r >= min_r)

    print("\n=== 5. Local Dev Server HTTP Checks (http://127.0.0.1:8321/) ===")
    try:
        req = urllib.request.urlopen("http://127.0.0.1:8321/", timeout=4)
        check("Homepage index.html HTTP 200", req.status == 200)

        css_req = urllib.request.urlopen("http://127.0.0.1:8321/assets/threeui.css", timeout=4)
        check("assets/threeui.css HTTP 200", css_req.status == 200)

        js_req = urllib.request.urlopen("http://127.0.0.1:8321/assets/threeui.js", timeout=4)
        check("assets/threeui.js HTTP 200", js_req.status == 200)
    except Exception as e:
        check("Dev Server reachable", False, str(e))

    print(f"\nPhase 1 Homepage Verification: {passed} passed, {failed} failed.")
    return 0 if failed == 0 else 1

if __name__ == "__main__":
    sys.exit(run_checks())
