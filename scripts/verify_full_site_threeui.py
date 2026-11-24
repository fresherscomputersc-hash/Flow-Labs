#!/usr/bin/env python3
"""
Master Full-Site Verification Script for Flow Labs ThreeUI Redesign
Tests all 25 production pages across markup, assets, Three.js canvas, dock nav, CMS hooks, and live HTTP 200 responses.
"""
import os
import sys
import urllib.request
import re

ALL_PAGES = [
    {
        "name": "Homepage",
        "path": "index.html",
        "url": "http://127.0.0.1:8321/",
        "hooks": [
            "hero-label", "hero-title", "hero-subtitle",
            "services-title", "services-subtitle",
            "work-title", "work-subtitle",
            "team-title", "team-subtitle",
            "team-1-name", "team-2-name", "team-3-name",
            "cta-title", "cta-subtitle"
        ]
    },
    {
        "name": "Services Hub",
        "path": "services/index.html",
        "url": "http://127.0.0.1:8321/services/",
        "hooks": ["services-hero-label", "services-hero-title", "services-hero-subtitle"]
    },
    {
        "name": "Service: Web Dev",
        "path": "services/web-development/index.html",
        "url": "http://127.0.0.1:8321/services/web-development/",
        "hooks": ["webdev-hero-pill", "webdev-hero-h1", "webdev-hero-sub"]
    },
    {
        "name": "Service: Custom Software",
        "path": "services/custom-software-development/index.html",
        "url": "http://127.0.0.1:8321/services/custom-software-development/",
        "hooks": ["customsoft-hero-pill", "customsoft-hero-h1", "customsoft-hero-sub"]
    },
    {
        "name": "Service: AI Automation",
        "path": "services/ai-automation/index.html",
        "url": "http://127.0.0.1:8321/services/ai-automation/",
        "hooks": ["aiauto-hero-pill", "aiauto-hero-h1", "aiauto-hero-sub"]
    },
    {
        "name": "Service: AI Chatbots",
        "path": "services/ai-chatbot-development/index.html",
        "url": "http://127.0.0.1:8321/services/ai-chatbot-development/",
        "hooks": ["aichat-hero-pill", "aichat-hero-h1", "aichat-hero-sub"]
    },
    {
        "name": "Work Showroom",
        "path": "work/index.html",
        "url": "http://127.0.0.1:8321/work/",
        "hooks": ["work-hero-label", "work-hero-title", "work-hero-subtitle"]
    },
    {
        "name": "Work: Droovee",
        "path": "work/droovee/index.html",
        "url": "http://127.0.0.1:8321/work/droovee/",
        "hooks": ["droovee-hero-pill", "droovee-hero-h1", "droovee-hero-sub"]
    },
    {
        "name": "Work: Drishti",
        "path": "work/drishti/index.html",
        "url": "http://127.0.0.1:8321/work/drishti/",
        "hooks": ["drishti-hero-pill", "drishti-hero-h1", "drishti-hero-sub"]
    },
    {
        "name": "Work: FlowOps",
        "path": "work/flowops/index.html",
        "url": "http://127.0.0.1:8321/work/flowops/",
        "hooks": ["flowops-hero-pill", "flowops-hero-h1", "flowops-hero-sub"]
    },
    {
        "name": "Work: BhuVerify",
        "path": "work/bhuverify/index.html",
        "url": "http://127.0.0.1:8321/work/bhuverify/",
        "hooks": ["bhuverify-hero-pill", "bhuverify-hero-h1", "bhuverify-hero-sub"]
    },
    {
        "name": "Work: Carbon Coach",
        "path": "work/carbon-coach/index.html",
        "url": "http://127.0.0.1:8321/work/carbon-coach/",
        "hooks": ["carbon-hero-pill", "carbon-hero-h1", "carbon-hero-sub"]
    },
    {
        "name": "Work: Interview Copilot",
        "path": "work/interview-copilot/index.html",
        "url": "http://127.0.0.1:8321/work/interview-copilot/",
        "hooks": ["copilot-hero-pill", "copilot-hero-h1", "copilot-hero-sub"]
    },
    {
        "name": "Work: QR Platform",
        "path": "work/qr-platform/index.html",
        "url": "http://127.0.0.1:8321/work/qr-platform/",
        "hooks": ["qr-hero-pill", "qr-hero-h1", "qr-hero-sub"]
    },
    {
        "name": "About Studio",
        "path": "about/index.html",
        "url": "http://127.0.0.1:8321/about/",
        "hooks": ["about-hero-label", "about-hero-title", "about-hero-subtitle", "about-body-1", "about-body-2", "about-body-3"]
    },
    {
        "name": "Contact Studio",
        "path": "contact/index.html",
        "url": "http://127.0.0.1:8321/contact/",
        "hooks": ["contact-hero-label", "contact-hero-title", "contact-hero-subtitle", "contact-email"]
    },
    {
        "name": "Lab Report",
        "path": "lab-report/index.html",
        "url": "http://127.0.0.1:8321/lab-report/",
        "hooks": ["lab-hero-label", "lab-hero-title", "lab-hero-subtitle"]
    },
    {
        "name": "Bhubaneswar Studio",
        "path": "bhubaneswar/index.html",
        "url": "http://127.0.0.1:8321/bhubaneswar/",
        "hooks": ["bhubaneswar-hero-label", "bhubaneswar-hero-title", "bhubaneswar-hero-subtitle"]
    },
    {
        "name": "Blog Hub",
        "path": "blog/index.html",
        "url": "http://127.0.0.1:8321/blog/",
        "hooks": ["blog-hero-label", "blog-hero-title", "blog-hero-subtitle"]
    },
    {
        "name": "Blog Article 1",
        "path": "blog/ai-automation-for-small-businesses/index.html",
        "url": "http://127.0.0.1:8321/blog/ai-automation-for-small-businesses/",
        "hooks": []
    },
    {
        "name": "Blog Article 2",
        "path": "blog/custom-software-vs-ready-made-software/index.html",
        "url": "http://127.0.0.1:8321/blog/custom-software-vs-ready-made-software/",
        "hooks": []
    },
    {
        "name": "Blog Article 3",
        "path": "blog/how-to-plan-a-website-for-a-new-startup/index.html",
        "url": "http://127.0.0.1:8321/blog/how-to-plan-a-website-for-a-new-startup/",
        "hooks": []
    },
    {
        "name": "404 Page",
        "path": "404.html",
        "url": "http://127.0.0.1:8321/404.html",
        "hooks": []
    },
    {
        "name": "Privacy Policy",
        "path": "privacy-policy/index.html",
        "url": "http://127.0.0.1:8321/privacy-policy/",
        "hooks": ["privacy-hero-title", "privacy-hero-subtitle"]
    },
    {
        "name": "Terms of Service",
        "path": "terms/index.html",
        "url": "http://127.0.0.1:8321/terms/",
        "hooks": ["terms-hero-title", "terms-hero-subtitle"]
    }
]

def run_master_verification():
    print("=================================================================")
    print("   MASTER FULL-SITE VERIFICATION: THE FLOW LABS THREEUI ENGINE   ")
    print("=================================================================")

    total_checks = 0
    passed_checks = 0
    failures = []

    for p in ALL_PAGES:
        rel_path = p["path"]
        name = p["name"]
        print(f"\n[+] Auditing {name} ({rel_path})...")

        # 1. File exists
        total_checks += 1
        if not os.path.exists(rel_path):
            failures.append(f"{name}: File {rel_path} does not exist!")
            continue
        passed_checks += 1

        with open(rel_path, "r", encoding="utf-8") as f:
            content = f.read()

        # 2. ThreeUI CSS & JS
        total_checks += 1
        if "assets/threeui.css" in content and "assets/threeui.js" in content:
            passed_checks += 1
        else:
            failures.append(f"{name}: Missing threeui.css or threeui.js link")

        # 3. Canvas element
        total_checks += 1
        if 'id="threeuiCanvas"' in content:
            passed_checks += 1
        else:
            failures.append(f"{name}: Missing #threeuiCanvas")

        # 4. Dock container
        total_checks += 1
        if 'class="three-dock"' in content:
            passed_checks += 1
        else:
            failures.append(f"{name}: Missing .three-dock navigation")

        # 5. CMS Hooks
        for hook in p["hooks"]:
            total_checks += 1
            if f'data-cms="{hook}"' in content:
                passed_checks += 1
            else:
                failures.append(f"{name}: Missing data-cms='{hook}'")

        # 6. Live HTTP 200 Response
        total_checks += 1
        url = p["url"]
        try:
            req = urllib.request.Request(url, headers={"User-Agent": "FlowLabsVerifier/2.0"})
            with urllib.request.urlopen(req, timeout=5) as resp:
                if resp.status == 200:
                    passed_checks += 1
                else:
                    failures.append(f"{name}: HTTP returned {resp.status} on {url}")
        except Exception as e:
            failures.append(f"{name}: HTTP request failed on {url}: {e}")

    print("\n=================================================================")
    print(f"MASTER AUDIT COMPLETE: {passed_checks}/{total_checks} checks passed.")
    print("=================================================================")

    if failures:
        print("\nAUDIT FAILED WITH ERRORS:")
        for fail in failures:
            print(f"  - {fail}")
        sys.exit(1)
    else:
        print("\nCONGRATULATIONS: ALL 25 PAGES PASS 100% OF CHECKS!")
        print("Flow Labs is fully standardized on the ThreeUI Cyber-Spatial design system.")
        sys.exit(0)

if __name__ == "__main__":
    run_master_verification()
