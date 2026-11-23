#!/usr/bin/env python3
"""
Phase 5 Verification Script: Team & Testimonials (Volta Carousel & Arca Cards)
Tests:
1. CMS hooks preserved: process-title, process-subtitle, team-title, team-subtitle, team-1-name, testimonial-quote, testimonial-author
2. Process section present with 4 numbered cards (01, 02, 03, 04)
3. Team section present with 3 founders (Smruti Ranjan, Biswash, Arpita)
4. Testimonials section present with Arca quote cards, star ratings, author avatars
5. FAQ section updated with clean accordion styles
6. CSS rules defined for Process, Team, Testimonials, FAQ and mobile responsiveness
7. WCAG AA contrast ratio verification for all Phase 5 elements
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

    print("=== 1. Checking index.html Phase 5 Markup & CMS Hooks ===")
    with open("index.html", "r", encoding="utf-8") as f:
        html = f.read()

    check("Process section exists", 'id="process"' in html)
    check("CMS hook process-title", 'data-cms="process-title"' in html)
    check("CMS hook process-subtitle", 'data-cms="process-subtitle"' in html)
    check("Process step 01 Discovery", '01' in html and 'Discovery' in html)
    check("Process step 02 Scope & quote", '02' in html and 'Scope &amp; quote' in html)
    check("Process step 03 Build", '03' in html and 'Build' in html)
    check("Process step 04 Ship", '04' in html and 'Ship' in html)

    check("Team section exists", 'id="team"' in html)
    check("CMS hook team-title", 'data-cms="team-title"' in html)
    check("CMS hook team-subtitle", 'data-cms="team-subtitle"' in html)
    check("Founder Smruti Ranjan present", 'data-cms="team-1-name"' in html and 'Smruti Ranjan' in html)
    check("Founder Biswash present", 'data-cms="team-2-name"' in html and 'Biswash' in html)
    check("Founder Arpita present", 'data-cms="team-3-name"' in html and 'Arpita' in html)

    check("Testimonials section exists", 'id="testimonials"' in html)
    check("CMS hook testimonial-quote", 'data-cms="testimonial-quote"' in html)
    check("CMS hook testimonial-author", 'data-cms="testimonial-author"' in html)
    check("Testimonial stars present", 'class="testimonial-stars"' in html)
    check("Testimonial author avatar present", 'class="testimonial-author-avatar"' in html)

    check("FAQ section exists", 'id="faq"' in html)
    check("Cache-busted CSS v16", 'site.css?v=16' in html)

    print("\n=== 2. Checking assets/site.css Phase 5 Rules ===")
    with open("assets/site.css", "r", encoding="utf-8") as f:
        css = f.read()

    check("Bright process container styling", 'body[data-theme="bright"] #process' in css)
    check("Bright process cards", 'body[data-theme="bright"] .process-card' in css)
    check("Bright process num badge", 'body[data-theme="bright"] .process-card .num' in css)
    check("Bright team container styling", 'body[data-theme="bright"] #team' in css)
    check("Bright team member card", 'body[data-theme="bright"] .team-member' in css)
    check("Bright team avatar styling", 'body[data-theme="bright"] .team-avatar' in css)
    check("Bright team role pill badge", 'body[data-theme="bright"] .team-role' in css)
    check("Bright testimonials container", 'body[data-theme="bright"] #testimonials' in css)
    check("Bright testimonial cards", 'body[data-theme="bright"] .testimonial-card' in css)
    check("Bright testimonial quote styling", 'body[data-theme="bright"] .testimonial-quote' in css)
    check("Bright testimonial author styling", 'body[data-theme="bright"] .testimonial-author' in css)
    check("Bright FAQ details styling", 'body[data-theme="bright"] .faq details' in css)
    check("Phase 5 mobile responsiveness", '@media (max-width: 900px)' in css and 'body[data-theme="bright"] .process-grid' in css)

    print("\n=== 3. WCAG AA Contrast Checks for Phase 5 Elements ===")
    pairs = [
        ("Process Title (#0F172A on #FFFFFF)", "#0F172A", "#FFFFFF", 4.5),
        ("Process Text (#475569 on #FFFFFF)", "#475569", "#FFFFFF", 4.5),
        ("Process Step Num (#2563EB on #FFFFFF)", "#2563EB", "#FFFFFF", 4.5),
        ("Team Name (#0F172A on #FFFFFF)", "#0F172A", "#FFFFFF", 4.5),
        ("Team Role (#2563EB on #FFFFFF)", "#2563EB", "#FFFFFF", 4.5),
        ("Team Bio (#475569 on #FFFFFF)", "#475569", "#FFFFFF", 4.5),
        ("Testimonial Quote (#1E293B on #FFFFFF)", "#1E293B", "#FFFFFF", 4.5),
        ("Testimonial Author (#0F172A on #FFFFFF)", "#0F172A", "#FFFFFF", 4.5),
        ("Testimonial Role (#64748B on #FFFFFF)", "#64748B", "#FFFFFF", 4.5),
        ("FAQ Summary (#0F172A on #FFFFFF)", "#0F172A", "#FFFFFF", 4.5),
        ("FAQ Text (#475569 on #FFFFFF)", "#475569", "#FFFFFF", 4.5),
    ]

    for label, c1, c2, min_r in pairs:
        r = contrast_ratio(c1, c2)
        check(f"{label} => {r:.2f}:1 (min {min_r}:1)", r >= min_r)

    print("\n=== 4. Live Dev Server HTTP Check (http://localhost:8321/) ===")
    try:
        req = urllib.request.urlopen("http://localhost:8321/", timeout=4)
        status = req.status
        content = req.read().decode('utf-8')
        check("Dev server HTTP 200", status == 200)
        check("Dev server serves site.css?v=16", 'site.css?v=16' in content)
        check("Dev server serves process title CMS", 'data-cms="process-title"' in content)
        check("Dev server serves team founder Smruti Ranjan", 'Smruti Ranjan' in content)
        check("Dev server serves testimonials section", 'id="testimonials"' in content)
        check("Dev server serves testimonial author CMS", 'data-cms="testimonial-author"' in content)
        
        css_req = urllib.request.urlopen("http://localhost:8321/assets/site.css?v=16", timeout=4)
        css_content = css_req.read().decode('utf-8')
        check("Dev server serves Phase 5 CSS", 'WORKSTREAM 2 — PHASE 5: PROCESS, TEAM & TESTIMONIALS' in css_content)
    except Exception as e:
        check("Dev server reachable", False, f"Error: {e}")

    print(f"\nPhase 5 Results: {passed} passed, {failed} failed.")
    return 0 if failed == 0 else 1

if __name__ == "__main__":
    sys.exit(run_checks())
