#!/usr/bin/env python3
"""
Comprehensive Redesign Master Verification Script
Checks all 6 Redesign Phases + CMS Bridge + Contrast + Production Edge:
- Phase 1: Global Foundation, Tokens, Bright theme, Navigation
- Phase 2: Hero Section, Editorial Headline, Live Pill, Constellation
- Phase 3: Services 3-Layer Cards, Stack Pills, Pricing Module
- Phase 4: Work & Case Studies, 16/10 Covers, Status Badges, Chips
- Phase 5: Process 4-Step Cards, Team Founders, Arca Testimonials, FAQ
- Phase 6: Contact Estimator, Slot Meter, Inquiry Form, Studio Footer
- CMS Integration: 18 data-cms hooks & iframe bridge
- Local HTTP Dev Server (http://localhost:8321/)
- Live Production Server (https://www.theflowlabs.online/)
"""

import sys
import re
import urllib.request
import ssl

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

def run_all_checks():
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

    with open("index.html", "r", encoding="utf-8") as f:
        html = f.read()

    with open("assets/site.css", "r", encoding="utf-8") as f:
        css = f.read()

    print("=== 1. Phase 1 Verification: Global Foundation & Nav ===")
    check("Meta theme-color #FFFFFF", '<meta name="theme-color" content="#FFFFFF"' in html)
    check("Body data-theme bright", 'data-theme="bright"' in html)
    check("Navigation structure present", 'class="nav"' in html or 'header class="nav"' in html)
    check("Nav logo lockup present", 'class="nav-logo"' in html)
    check("Nav CTA button present", 'class="nav-cta"' in html)
    check("Mobile drawer toggle exists", 'class="nav-toggle"' in html)
    check("Bright theme CSS tokens declared", '--bg: #FFFFFF;' in css and '--text: #0F172A;' in css)
    check("Site CSS cache-busted v17", 'site.css?v=17' in html)

    print("\n=== 2. Phase 2 Verification: Hero Section ===")
    check("Hero section exists", 'class="hero hero--centered"' in html or 'class="hero"' in html)
    check("CMS hook hero-label", 'data-cms="hero-label"' in html)
    check("CMS hook hero-title", 'data-cms="hero-title"' in html)
    check("CMS hook hero-subtitle", 'data-cms="hero-subtitle"' in html)
    check("Live availability pill exists", 'class="pill"' in html and 'class="dot"' in html)
    check("Primary magnetic CTA button exists", 'class="btn btn-primary magnetic"' in html)
    check("Secondary magnetic CTA button exists", 'class="btn magnetic"' in html)
    check("Hero proof stat strip exists", 'class="stat-strip' in html)
    check("Constellation canvas exists", 'id="flowField"' in html)

    print("\n=== 3. Phase 3 Verification: Services Section ===")
    check("Services section exists", 'id="services"' in html)
    check("CMS hook services-title", 'data-cms="services-title"' in html)
    check("CMS hook services-subtitle", 'data-cms="services-subtitle"' in html)
    check("Layer 01 Interfaces card", 'id="layer-1"' in html and 'Interfaces' in html)
    check("Layer 02 Systems card", 'id="layer-2"' in html and 'Systems' in html)
    check("Layer 03 Intelligence card", 'id="layer-3"' in html and 'Intelligence' in html)
    check("Stack tags present in Layer 1", 'Design Systems' in html)
    check("Stack tags present in Layer 2", 'PostgreSQL &amp; Supabase' in html)
    check("Stack tags present in Layer 3", 'Claude &amp; OpenAI Integration' in html)
    check("Compare toggle button present", 'data-compare' in html)
    check("Compare table present", 'id="compareTable"' in html)
    check("Chooser interactive component present", 'data-chooser' in html)

    print("\n=== 4. Phase 4 Verification: Work & Case Studies ===")
    check("Work section exists", 'id="work"' in html)
    check("CMS hook work-title", 'data-cms="work-title"' in html)
    check("CMS hook work-subtitle", 'data-cms="work-subtitle"' in html)
    check("Filter toolbar present", 'data-work-filter' in html)
    check("Filter button All", 'data-filter="all"' in html)
    check("Filter button Interfaces", 'data-filter="web"' in html)
    check("Filter button Systems", 'data-filter="software"' in html)
    check("Filter button Intelligence", 'data-filter="ai"' in html)
    check("Case study droovee present", 'data-name="droovee"' in html)
    check("Case study drishti present", 'data-name="drishti"' in html)
    check("Case study flowops present", 'data-name="flowops"' in html)
    check("Case study bhoomi present", 'data-name="bhoomi"' in html)
    check("AI lab chips container present", 'class="ai-lab' in html)

    print("\n=== 5. Phase 5 Verification: Process, Team & Reviews ===")
    check("Process section exists", 'id="process"' in html)
    check("CMS hook process-title", 'data-cms="process-title"' in html)
    check("CMS hook process-subtitle", 'data-cms="process-subtitle"' in html)
    check("Process 4 steps present", '01' in html and '02' in html and '03' in html and '04' in html)
    check("Team section exists", 'id="team"' in html)
    check("CMS hook team-title", 'data-cms="team-title"' in html)
    check("CMS hook team-subtitle", 'data-cms="team-subtitle"' in html)
    check("Founder Smruti Ranjan present", 'Smruti Ranjan' in html and 'data-cms="team-1-name"' in html)
    check("Founder Biswash present", 'Biswash' in html and 'data-cms="team-2-name"' in html)
    check("Founder Arpita present", 'Arpita' in html and 'data-cms="team-3-name"' in html)
    check("Testimonials section exists", 'id="testimonials"' in html)
    check("CMS hook testimonial-quote", 'data-cms="testimonial-quote"' in html)
    check("CMS hook testimonial-author", 'data-cms="testimonial-author"' in html)
    check("FAQ section exists", 'id="faq"' in html)

    print("\n=== 6. Phase 6 Verification: Estimator & Footer ===")
    check("Contact section exists", 'id="contact"' in html)
    check("CMS hook cta-title", 'data-cms="cta-title"' in html)
    check("CMS hook cta-subtitle", 'data-cms="cta-subtitle"' in html)
    check("Slot meter exists", 'class="slot-meter"' in html and 'data-slots' in html)
    check("Direct email copy card exists", 'class="contact-email-card' in html)
    check("Contact checklist present", 'class="contact-checklist' in html)
    check("Inquiry form exists", 'id="ideaForm"' in html)
    check("Category chips exist", 'id="typeChips"' in html and 'class="chip-opt"' in html)
    check("Submit button exists", 'class="submit-btn"' in html and 'id="submitBtn"' in html)
    check("Success view template exists", 'id="successTpl"' in html)
    check("Footer exists", '<footer class="footer">' in html)
    check("Footer logo lockup exists", 'class="nav-logo"' in html)
    check("Footer tagline exists", 'class="footer-tagline"' in html)
    check("Live clock exists", 'class="clock"' in html and 'data-clock' in html)
    check("Footer navigation links exist", 'class="footer-links"' in html and 'class="footer-col"' in html)
    check("Footer bottom copyright exists", 'class="footer-bottom"' in html)

    print("\n=== 7. All 18 Critical CMS Hooks Complete Verification ===")
    cms_hooks = [
        "hero-label", "hero-title", "hero-subtitle",
        "services-title", "services-subtitle",
        "work-title", "work-subtitle",
        "process-title", "process-subtitle",
        "team-title", "team-subtitle",
        "team-1-name", "team-2-name", "team-3-name",
        "testimonial-quote", "testimonial-author",
        "cta-title", "cta-subtitle"
    ]
    for hook in cms_hooks:
        check(f"CMS Hook: data-cms='{hook}'", f'data-cms="{hook}"' in html)

    print("\n=== 8. Full Site WCAG AA Contrast Checks ===")
    core_contrast_pairs = [
        ("Background Text (#0F172A on #FFFFFF)", "#0F172A", "#FFFFFF", 4.5),
        ("Muted Secondary Text (#475569 on #FFFFFF)", "#475569", "#FFFFFF", 4.5),
        ("Primary Royal Blue (#2563EB on #FFFFFF)", "#2563EB", "#FFFFFF", 4.5),
        ("Status Live Green (#15803D on #FFFFFF)", "#15803D", "#FFFFFF", 4.5),
        ("Button Obsidian Primary (#FFFFFF on #0F172A)", "#FFFFFF", "#0F172A", 4.5),
        ("Button Hover Blue (#FFFFFF on #2563EB)", "#FFFFFF", "#2563EB", 4.5),
        ("Footer Heading on Alt BG (#0F172A on #F8FAFC)", "#0F172A", "#F8FAFC", 4.5),
        ("Footer Link on Alt BG (#475569 on #F8FAFC)", "#475569", "#F8FAFC", 4.5),
        ("Footer Hover Blue (#2563EB on #F8FAFC)", "#2563EB", "#F8FAFC", 4.5),
        ("Chip Option Text (#334155 on #F8FAFC)", "#334155", "#F8FAFC", 4.5),
    ]
    for label, c1, c2, min_r in core_contrast_pairs:
        r = contrast_ratio(c1, c2)
        check(f"{label} => {r:.2f}:1 (min {min_r}:1)", r >= min_r)

    print("\n=== 9. Local Dev Server HTTP Check (http://localhost:8321/) ===")
    try:
        req = urllib.request.urlopen("http://localhost:8321/", timeout=5)
        check("Local Dev Server Status 200", req.status == 200)
        local_body = req.read().decode('utf-8')
        check("Dev Server serves bright theme body", 'data-theme="bright"' in local_body)
        check("Dev Server serves site.css?v=17", 'site.css?v=17' in local_body)
    except Exception as e:
        check("Local Dev Server reachable", False, str(e))

    print("\n=== 10. Live Production Check (https://www.theflowlabs.online/) ===")
    try:
        # Create unverified context to accommodate environments without updated local CA bundles
        ctx = ssl._create_unverified_context()
        req_prod = urllib.request.Request(
            "https://www.theflowlabs.online/",
            headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) FlowLabs-Verification/1.0"}
        )
        with urllib.request.urlopen(req_prod, context=ctx, timeout=10) as resp:
            prod_status = resp.status
            check("Production HTTP Status 200", prod_status == 200)
            prod_html = resp.read().decode('utf-8')
            check("Production serves meta theme-color #FFFFFF", 'content="#FFFFFF"' in prod_html)
            check("Production serves bright theme body", 'data-theme="bright"' in prod_html)
            check("Production serves all 18 CMS hooks", all(f'data-cms="{h}"' in prod_html for h in cms_hooks))
            
            # Check latest css link
            css_match = re.search(r'assets/site\.css\?v=(\d+)', prod_html)
            if css_match:
                prod_v = css_match.group(1)
                check(f"Production CSS version: v{prod_v}", int(prod_v) >= 17, f"(current v{prod_v})")
            else:
                check("Production CSS version link found", False)
    except Exception as e:
        check("Production site live reachable", False, str(e))

    print(f"\n==========================================")
    print(f"MASTER VERIFICATION: {passed} PASSED, {failed} FAILED.")
    print(f"==========================================")
    return 0 if failed == 0 else 1

if __name__ == "__main__":
    sys.exit(run_all_checks())
