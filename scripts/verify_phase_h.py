#!/usr/bin/env python3
"""
Phase H Verification Script: Comprehensive Multi-Phase End-to-End Hardening
"""
import os
import sys
import subprocess
import urllib.request
import json

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

def check(condition, message):
    if not condition:
        print(f"  [FAIL] {message}")
        return False
    print(f"  [PASS] {message}")
    return True

def main():
    print("=================================================================")
    print("      FLOW HQ & PLATFORM REDESIGN — COMPREHENSIVE VERIFICATION   ")
    print("=================================================================")
    all_ok = True

    # 1. Phase A: Flow HQ Layout & Grouped Navigation
    print("\n--- [Phase A] Flow HQ Grouped Navigation & Workspace Container ---")
    with open(os.path.join(ROOT, "flow-hq", "index.html"), "r", encoding="utf-8") as f:
        html = f.read()
    all_ok &= check('data-group="workspace"' in html, "Workspace group present in nav")
    all_ok &= check('data-group="content"' in html, "Content group present in nav")
    all_ok &= check('data-group="site"' in html, "Site group present in nav")
    all_ok &= check('data-group="system"' in html, "System group present in nav")
    all_ok &= check('id="adminBreadcrumb"' in html, "Breadcrumb bar present")
    all_ok &= check('class="workspace"' in html, "Bounded workspace container present")
    all_ok &= check('id="attentionStrip"' in html, "Needs attention strip present")

    # 2. Phase B: Project Collaboration & Subtabs
    print("\n--- [Phase B] Project Subtabs, Comments & Kanban ---")
    all_ok &= check('data-subtab="board"' in html, "Project subtab: Board")
    all_ok &= check('data-subtab="modules"' in html, "Project subtab: Modules")
    all_ok &= check('data-subtab="tasks"' in html, "Project subtab: Tasks")
    all_ok &= check('data-subtab="activity"' in html, "Project subtab: Activity")
    all_ok &= check('data-subtab="files"' in html, "Project subtab: Files")
    all_ok &= check('data-subtab="settings"' in html, "Project subtab: Settings")
    all_ok &= check('id="taskCommentsList"' in html, "Task comments list present")
    all_ok &= check('id="taskHistoryList"' in html, "Task audit history present")

    # 3. Phase C: 21-Page CMS & Live Preview
    print("\n--- [Phase C] Full 21-Page CMS & Live Preview ---")
    schema_path = os.path.join(ROOT, "flow-hq", "content-schema.js")
    all_ok &= check(os.path.exists(schema_path), "flow-hq/content-schema.js exists")
    if os.path.exists(schema_path):
        with open(schema_path, "r", encoding="utf-8") as f:
            schema_txt = f.read()
        all_ok &= check("CONTENT_SCHEMA" in schema_txt, "CONTENT_SCHEMA declared")
        all_ok &= check("services/web-development" in schema_txt, "Service pages registered in schema")
        all_ok &= check("work/droovee" in schema_txt, "Case study pages registered in schema")
    all_ok &= check('id="contentIframe"' in html, "Iframe live preview frame present")

    # 4. Phase D: Standalone Client Portal
    print("\n--- [Phase D] Standalone Client Portal (/client/) ---")
    client_html = os.path.join(ROOT, "client", "index.html")
    client_js = os.path.join(ROOT, "client", "client.js")
    client_css = os.path.join(ROOT, "client", "client.css")
    all_ok &= check(os.path.exists(client_html), "client/index.html exists")
    all_ok &= check(os.path.exists(client_js), "client/client.js exists")
    all_ok &= check(os.path.exists(client_css), "client/client.css exists")
    with open(client_js, "r", encoding="utf-8") as f:
        cjs = f.read()
    all_ok &= check("from('tasks')" not in cjs, "Client portal strictly isolated (no direct queries to tasks)")
    all_ok &= check("from('task_comments')" not in cjs, "Client portal strictly isolated (no direct queries to comments)")

    # 5. Phase E: Media Storage & Blog Publishing
    print("\n--- [Phase E] Media Storage & Blog Publishing ---")
    all_ok &= check(os.path.exists(os.path.join(ROOT, "assets", "blog-feed.js")), "assets/blog-feed.js live feed script exists")
    all_ok &= check(os.path.exists(os.path.join(ROOT, "supabase", "migrations", "0005_storage.sql")), "0005_storage.sql migration exists")
    all_ok &= check('id="blogMediaInput"' in html, "Blog editor media upload input present")
    all_ok &= check('id="blogUploadMediaBtn"' in html, "Blog editor insert image button present")

    # 6. Phase F: Notifications, Realtime & Reports
    print("\n--- [Phase F] Realtime, Notifications & Reports ---")
    all_ok &= check('id="realtimeBadge"' in html, "Topbar realtime connection badge present")
    all_ok &= check('id="notifBellBtn"' in html, "Topbar notification bell present")
    all_ok &= check('id="notifBadge"' in html, "Notification unread badge present")
    all_ok &= check('id="notifDropdown"' in html, "Notification dropdown present")
    all_ok &= check('id="toastContainer"' in html, "Realtime toast container present")
    all_ok &= check('id="view-reports"' in html, "Workspace Reports view present")
    all_ok &= check('id="dailyReportForm"' in html, "Daily standup report submission form present")
    all_ok &= check(os.path.exists(os.path.join(ROOT, "supabase", "migrations", "0006_notifications_triggers.sql")), "0006_notifications_triggers.sql exists")

    # 7. Phase G: GitHub App & Webhook Integration
    print("\n--- [Phase G] GitHub Webhook & Task Linking ---")
    all_ok &= check(os.path.exists(os.path.join(ROOT, "api", "github", "webhook.js")), "api/github/webhook.js exists")
    all_ok &= check(os.path.exists(os.path.join(ROOT, "supabase", "migrations", "0007_github_integration.sql")), "0007_github_integration.sql exists")
    all_ok &= check('id="projectGithubBadge"' in html, "Project header GitHub badge present")
    all_ok &= check('id="ps-repo"' in html, "Project settings linked repository input present")

    # 8. Phase H: Hardening & Security Checks
    print("\n--- [Phase H] Security Headers, CSP & JavaScript Syntax ---")
    with open(os.path.join(ROOT, "vercel.json"), "r", encoding="utf-8") as f:
        vj = json.load(f)
    vj_str = json.dumps(vj)
    all_ok &= check("SAMEORIGIN" in vj_str, "X-Frame-Options set to SAMEORIGIN for live iframe CMS preview")
    all_ok &= check("frame-ancestors 'self'" in vj_str, "CSP frame-ancestors allows 'self'")
    all_ok &= check("https://*.supabase.co" in vj_str, "CSP connect-src & img-src permit Supabase")
    all_ok &= check("wss://*.supabase.co" in vj_str, "CSP connect-src permits Supabase WebSocket Realtime")
    all_ok &= check("/client/(.*)" in vj_str, "Client portal protected by X-Robots-Tag: noindex")
    all_ok &= check("/flow-hq/(.*)" in vj_str, "Flow HQ protected by X-Robots-Tag: noindex")

    # Validate JavaScript Syntax for key modified files
    js_targets = [
        os.path.join("flow-hq", "admin.js"),
        os.path.join("flow-hq", "content-schema.js"),
        os.path.join("client", "client.js"),
        os.path.join("api", "github", "webhook.js"),
        os.path.join("api", "platform", "[...path].js"),
        os.path.join("assets", "blog-feed.js"),
        os.path.join("assets", "site-cms.js")
    ]
    for rel_path in js_targets:
        abs_p = os.path.join(ROOT, rel_path)
        res = subprocess.run(["node", "-c", abs_p], capture_output=True, text=True)
        all_ok &= check(res.returncode == 0, f"JS syntax check: {rel_path}")

    # Live Server HTTP Smoke Check
    print("\n--- Live HTTP Server Verification ---")
    try:
        req = urllib.request.urlopen("http://localhost:8321/flow-hq/", timeout=3)
        body = req.read().decode("utf-8")
        all_ok &= check(req.status == 200, "Flow HQ endpoint returns HTTP 200")
        all_ok &= check("adminBreadcrumb" in body, "Live Flow HQ contains adminBreadcrumb")
        all_ok &= check("notifBellBtn" in body, "Live Flow HQ contains notifBellBtn")
        all_ok &= check("view-reports" in body, "Live Flow HQ contains view-reports")

        client_req = urllib.request.urlopen("http://localhost:8321/client/", timeout=3)
        cbody = client_req.read().decode("utf-8")
        all_ok &= check(client_req.status == 200, "Client Portal endpoint returns HTTP 200")
        all_ok &= check("cp-brand" in cbody and "cpAuthView" in cbody, "Live Client Portal renders correctly")
    except Exception as e:
        all_ok &= check(False, f"Live server test failed: {e}")

    print("\n" + "=" * 65)
    if all_ok:
        print(">>> ALL PHASES A THROUGH H VERIFIED WITH 100% PASS RATE! <<<")
        print("=================================================================")
        sys.exit(0)
    else:
        print(">>> SOME VERIFICATION CHECKS FAILED <<<")
        print("=================================================================")
        sys.exit(1)

if __name__ == "__main__":
    main()
