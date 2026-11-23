#!/usr/bin/env python3
"""
Phase F Verification Script: Notifications, Realtime & Reports
"""
import os
import sys
import urllib.request
import re

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

def check(condition, message):
    if not condition:
        print(f"  [FAIL] {message}")
        return False
    print(f"  [PASS] {message}")
    return True

def main():
    print("=== Verifying Phase F: Notifications, Realtime & Reports ===")
    all_ok = True

    # 1. Migration 0006
    print("\n1. Migration 0006 (Notifications & Realtime Triggers):")
    mig_path = os.path.join(ROOT, "supabase", "migrations", "0006_notifications_triggers.sql")
    all_ok &= check(os.path.exists(mig_path), "0006_notifications_triggers.sql exists")
    if os.path.exists(mig_path):
        with open(mig_path, "r", encoding="utf-8") as f:
            mig_content = f.read()
        all_ok &= check("notify_on_task_event" in mig_content, "Trigger function notify_on_task_event defined")
        all_ok &= check("notify_on_comment" in mig_content, "Trigger function notify_on_comment defined")
        all_ok &= check("create_notification" in mig_content, "RPC create_notification defined")
        all_ok &= check("mark_all_notifications_read" in mig_content, "RPC mark_all_notifications_read defined")
        all_ok &= check("supabase_realtime" in mig_content, "supabase_realtime publication verified")

    # 2. Flow HQ index.html
    print("\n2. Flow HQ Markup (flow-hq/index.html):")
    html_path = os.path.join(ROOT, "flow-hq", "index.html")
    all_ok &= check(os.path.exists(html_path), "flow-hq/index.html exists")
    if os.path.exists(html_path):
        with open(html_path, "r", encoding="utf-8") as f:
            html = f.read()
        all_ok &= check('id="realtimeBadge"' in html, "Realtime status badge present")
        all_ok &= check('id="notifBellBtn"' in html, "Notification bell button present")
        all_ok &= check('id="notifBadge"' in html, "Notification unread badge present")
        all_ok &= check('id="notifDropdown"' in html, "Notification dropdown present")
        all_ok &= check('data-tab="reports"' in html, "Reports nav tab present")
        all_ok &= check('id="view-reports"' in html, "Reports view section present")
        all_ok &= check('id="reportsSubTabs"' in html, "Reports subtabs present")
        all_ok &= check('id="dailyReportForm"' in html, "Daily standup report form present")
        all_ok &= check('id="toastContainer"' in html, "Toast container present")

    # 3. Flow HQ admin.css
    print("\n3. Flow HQ Styling (flow-hq/admin.css):")
    css_path = os.path.join(ROOT, "flow-hq", "admin.css")
    all_ok &= check(os.path.exists(css_path), "flow-hq/admin.css exists")
    if os.path.exists(css_path):
        with open(css_path, "r", encoding="utf-8") as f:
            css = f.read()
        all_ok &= check(".admin-realtime-badge" in css, "Realtime badge styles present")
        all_ok &= check(".notif-bell" in css, "Notification bell styles present")
        all_ok &= check(".notif-dropdown" in css, "Notification dropdown styles present")
        all_ok &= check(".toast-item" in css, "Toast item styles present")
        all_ok &= check(".standup-card" in css, "Daily standup card styles present")

    # 4. Flow HQ admin.js
    print("\n4. Flow HQ Logic (flow-hq/admin.js):")
    js_path = os.path.join(ROOT, "flow-hq", "admin.js")
    all_ok &= check(os.path.exists(js_path), "flow-hq/admin.js exists")
    if os.path.exists(js_path):
        with open(js_path, "r", encoding="utf-8") as f:
            js = f.read()
        all_ok &= check("reports:" in js or "'reports'" in js, "Reports added to TAB_META and TAB_ACCESS")
        all_ok &= check("setupRealtime" in js, "setupRealtime() defined")
        all_ok &= check("postgres_changes" in js, "Postgres changes listener implemented")
        all_ok &= check("loadNotifications" in js, "loadNotifications() implemented")
        all_ok &= check("markAllNotificationsRead" in js, "markAllNotificationsRead() implemented")
        all_ok &= check("loadReports" in js, "loadReports() implemented")
        all_ok &= check("renderProjectsRollup" in js, "renderProjectsRollup() implemented")
        all_ok &= check("renderMembersRollup" in js, "renderMembersRollup() implemented")
        all_ok &= check("renderStandupFeed" in js, "renderStandupFeed() implemented")

    # 5. API Platform Endpoints
    print("\n5. API Platform Endpoints (api/platform/[...path].js):")
    api_path = os.path.join(ROOT, "api", "platform", "[...path].js")
    all_ok &= check(os.path.exists(api_path), "api/platform/[...path].js exists")
    if os.path.exists(api_path):
        with open(api_path, "r", encoding="utf-8") as f:
            api = f.read()
        all_ok &= check("route === 'notify'" in api, "POST /notify endpoint implemented")
        all_ok &= check("route === 'digest'" in api, "POST /digest endpoint implemented")
        all_ok &= check("nodemailer" in api, "nodemailer integrated for email alerts")

    # 6. Live Server Check
    print("\n6. Live HTTP Server Check:")
    try:
        req = urllib.request.urlopen("http://localhost:8321/flow-hq/", timeout=3)
        html_live = req.read().decode("utf-8")
        all_ok &= check(req.status == 200, "Local server responds with HTTP 200")
        all_ok &= check("notifBellBtn" in html_live, "Live page contains notifBellBtn")
        all_ok &= check("view-reports" in html_live, "Live page contains view-reports")
    except Exception as e:
        all_ok &= check(False, f"Live server test failed: {e}")

    if all_ok:
        print("\n>>> ALL PHASE F CHECKS PASSED SUCCESSFULLY! <<<")
        sys.exit(0)
    else:
        print("\n>>> SOME PHASE F CHECKS FAILED <<<")
        sys.exit(1)

if __name__ == "__main__":
    main()
