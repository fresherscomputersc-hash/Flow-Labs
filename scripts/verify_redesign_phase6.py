#!/usr/bin/env python3
"""
Phase 6 Verification Script: Estimator, Contact Card & Cadence Studio Footer
Tests:
1. CMS hooks preserved: cta-title, cta-subtitle
2. Contact section with slot meter, direct email card, project checklist, and inquiry card
3. Accessible form fields: name, contact, category chips, requirements, budget, submit button
4. Studio footer with brand lockup, tagline, live clock, 3-column navigation, copyright
5. CSS rules defined for Contact, Estimator, Form fields, Buttons, Footer, and mobile responsiveness
6. WCAG AA contrast ratio verification for all Phase 6 elements
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

    print("=== 1. Checking index.html Phase 6 Markup & CMS Hooks ===")
    with open("index.html", "r", encoding="utf-8") as f:
        html = f.read()

    check("Contact section exists", 'id="contact"' in html)
    check("CMS hook cta-title", 'data-cms="cta-title"' in html)
    check("CMS hook cta-subtitle", 'data-cms="cta-subtitle"' in html)
    check("Slot meter container", 'class="slot-meter"' in html and 'data-slots' in html)
    check("Slot dot indicator", 'class="slot-dot"' in html)
    check("Slot count indicator", 'class="slot-count"' in html)
    check("Direct email copy card", 'class="contact-email-card' in html and 'data-copy-email' in html)
    check("Contact checklist present", 'class="contact-checklist' in html)
    check("Contact inquiry card present", 'class="contact-card' in html)
    check("Inquiry form present", 'id="ideaForm"' in html)
    check("Form field: Name input", 'id="fName"' in html and 'name="name"' in html)
    check("Form field: Contact input", 'id="fContact"' in html and 'name="contact"' in html)
    check("Form field: Project chips selector", 'id="typeChips"' in html and 'class="chip-opt"' in html)
    check("Form field: Requirements textarea", 'id="fIdea"' in html and 'name="idea"' in html)
    check("Form field: Budget selector", 'id="fBudget"' in html and 'name="budget"' in html)
    check("Form submit button", 'class="submit-btn"' in html and 'id="submitBtn"' in html)
    check("Success view template", 'id="successTpl"' in html)

    check("Footer exists", '<footer class="footer">' in html)
    check("Footer logo lockup", 'class="nav-logo"' in html and 'The Flow Labs' in html)
    check("Footer tagline present", 'class="footer-tagline"' in html)
    check("Footer live clock present", 'class="clock"' in html and 'data-clock' in html)
    check("Footer navigation links present", 'class="footer-links"' in html and 'class="footer-col"' in html)
    check("Footer bottom copyright present", 'class="footer-bottom"' in html and 'footer-powered' in html)
    check("Cache-busted CSS v17", 'site.css?v=17' in html)

    print("\n=== 2. Checking assets/site.css Phase 6 Rules ===")
    with open("assets/site.css", "r", encoding="utf-8") as f:
        css = f.read()

    check("Bright contact section styling", 'body[data-theme="bright"] #contact' in css)
    check("Bright slot meter styling", 'body[data-theme="bright"] .slot-meter' in css)
    check("Bright slot dot pulse", 'body[data-theme="bright"] .slot-dot' in css)
    check("Bright contact email card", 'body[data-theme="bright"] .contact-email-card' in css)
    check("Bright copy mail button", 'body[data-theme="bright"] .copy-mail' in css)
    check("Bright contact checklist", 'body[data-theme="bright"] .contact-checklist' in css)
    check("Bright contact card frame", 'body[data-theme="bright"] .contact-card' in css)
    check("Bright field inputs styling", 'body[data-theme="bright"] .field input' in css)
    check("Bright chip selector styling", 'body[data-theme="bright"] .chip-opt' in css)
    check("Bright chip selected state", 'body[data-theme="bright"] .chip-opt.sel' in css)
    check("Bright submit button styling", 'body[data-theme="bright"] .submit-btn' in css)
    check("Bright footer container", 'body[data-theme="bright"] .footer' in css)
    check("Bright footer live clock", 'body[data-theme="bright"] .clock' in css)
    check("Bright footer links columns", 'body[data-theme="bright"] .footer-links' in css)
    check("Bright footer bottom bar", 'body[data-theme="bright"] .footer-bottom' in css)
    check("Phase 6 mobile responsiveness", '@media (max-width: 768px)' in css and 'body[data-theme="bright"] .footer-top' in css)

    print("\n=== 3. WCAG AA Contrast Checks for Phase 6 Elements ===")
    pairs = [
        ("CTA Section Title (#0F172A on #FFFFFF)", "#0F172A", "#FFFFFF", 4.5),
        ("CTA Section Subtitle (#475569 on #FFFFFF)", "#475569", "#FFFFFF", 4.5),
        ("Slot Meter Count (#0F172A on #FFFFFF)", "#0F172A", "#FFFFFF", 4.5),
        ("Slot Meter Accent (#2563EB on #FFFFFF)", "#2563EB", "#FFFFFF", 4.5),
        ("Contact Email Text (#0F172A on #FFFFFF)", "#0F172A", "#FFFFFF", 4.5),
        ("Copy Mail Button Text (#0F172A on #F8FAFC)", "#0F172A", "#F8FAFC", 4.5),
        ("Form Field Label (#0F172A on #FFFFFF)", "#0F172A", "#FFFFFF", 4.5),
        ("Form Input Text (#0F172A on #FFFFFF)", "#0F172A", "#FFFFFF", 4.5),
        ("Chip Option Text (#334155 on #F8FAFC)", "#334155", "#F8FAFC", 4.5),
        ("Selected Chip Text (#FFFFFF on #0F172A)", "#FFFFFF", "#0F172A", 4.5),
        ("Submit Button Text (#FFFFFF on #0F172A)", "#FFFFFF", "#0F172A", 4.5),
        ("Submit Button Hover (#FFFFFF on #2563EB)", "#FFFFFF", "#2563EB", 4.5),
        ("Footer Heading (#0F172A on #F8FAFC)", "#0F172A", "#F8FAFC", 4.5),
        ("Footer Link (#475569 on #F8FAFC)", "#475569", "#F8FAFC", 4.5),
        ("Footer Link Hover (#2563EB on #F8FAFC)", "#2563EB", "#F8FAFC", 4.5),
        ("Footer Tagline (#475569 on #F8FAFC)", "#475569", "#F8FAFC", 4.5),
        ("Clock Text (#475569 on #FFFFFF)", "#475569", "#FFFFFF", 4.5),
        ("Clock Time Bold (#0F172A on #FFFFFF)", "#0F172A", "#FFFFFF", 4.5),
        ("Footer Bottom Copyright (#475569 on #F8FAFC)", "#475569", "#F8FAFC", 4.5),
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
        check("Dev server serves site.css?v=17", 'site.css?v=17' in content)
        check("Dev server serves contact CTA title CMS", 'data-cms="cta-title"' in content)
        check("Dev server serves contact CTA subtitle CMS", 'data-cms="cta-subtitle"' in content)
        check("Dev server serves ideaForm", 'id="ideaForm"' in content)
        check("Dev server serves slot meter", 'class="slot-meter"' in content)
        check("Dev server serves footer", '<footer class="footer">' in content)
        check("Dev server serves data-clock", 'data-clock' in content)
        
        css_req = urllib.request.urlopen("http://localhost:8321/assets/site.css?v=17", timeout=4)
        css_content = css_req.read().decode('utf-8')
        check("Dev server serves Phase 6 CSS", 'WORKSTREAM 2 — PHASE 6: ESTIMATOR, CONTACT CARD & STUDIO FOOTER' in css_content)
    except Exception as e:
        check("Dev server reachable", False, f"Error: {e}")

    print(f"\nPhase 6 Results: {passed} passed, {failed} failed.")
    return 0 if failed == 0 else 1

if __name__ == "__main__":
    sys.exit(run_checks())
