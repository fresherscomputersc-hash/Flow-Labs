import os
import re

print("=== VERIFYING PHASE D (CLIENT PORTAL) ===")
errors = []

# 1. File existence
portal_files = ['client/index.html', 'client/client.css', 'client/client.js', 'supabase/migrations/0004_client_portal.sql']
for f in portal_files:
    if not os.path.exists(f):
        errors.append(f"Missing file: {f}")
    else:
        print(f"PASSED: File exists: {f}")

# 2. Check DOM Elements in client/index.html
with open('client/index.html', 'r', encoding='utf-8') as f:
    client_html = f.read()

required_client_elements = [
    'id="cpAuthView"',
    'id="cpAuthForm"',
    'id="cpEmail"',
    'id="cpPassword"',
    'id="cpSignInBtn"',
    'id="cpAuthError"',
    'id="cpUserNav"',
    'id="cpProjectSelect"',
    'id="cpUserName"',
    'id="cpUserRole"',
    'id="cpSignOutBtn"',
    'id="cpPortalView"',
    'id="cpAdminBanner"',
    'id="cpProjectKey"',
    'id="cpProjectStatus"',
    'id="cpProjectTitle"',
    'id="cpProjectDesc"',
    'id="cpProjectTarget"',
    'id="cpProgressPercent"',
    'id="cpProgressBarFill"',
    'id="cpModulesList"',
    'id="cpFilesList"',
    'id="cpUpdatesList"'
]

for el in required_client_elements:
    if el not in client_html:
        errors.append(f"Missing element in client/index.html: {el}")

if not any(f"Missing element in client/index.html" in e for e in errors):
    print("PASSED: All required DOM elements present in client/index.html")

# 3. Check Flow HQ integration
with open('flow-hq/index.html', 'r', encoding='utf-8') as f:
    hq_html = f.read()

required_hq_elements = [
    'data-subtab="updates"',
    'id="subpanel-updates"',
    'id="newClientUpdateBtn"',
    'id="clientUpdateForm"',
    'id="projectUpdatesList"',
    'id="projectClientsList"',
    'id="clientLinkForm"'
]

for el in required_hq_elements:
    if el not in hq_html:
        errors.append(f"Missing element in flow-hq/index.html: {el}")

if not any("Missing element in flow-hq/index.html" in e for e in errors):
    print("PASSED: All required client management & updates elements present in flow-hq/index.html")

# 4. Check admin.js logic
with open('flow-hq/admin.js', 'r', encoding='utf-8') as f:
    admin_js = f.read()

required_admin_js = [
    "window.location.href = '/client/'",
    "loadProjectUpdates",
    "renderProjectClients",
    "state.projectSubTab === 'updates'",
    "client_updates",
    "project_clients"
]

for kw in required_admin_js:
    if kw not in admin_js:
        errors.append(f"Missing logic in flow-hq/admin.js: {kw}")

if not any("Missing logic in flow-hq/admin.js" in e for e in errors):
    print("PASSED: Client redirection and management handlers present in flow-hq/admin.js")

# 5. Client Isolation Security Guard
with open('client/client.js', 'r', encoding='utf-8') as f:
    client_js = f.read()

forbidden_tables = ['tasks', 'task_comments', 'activity', 'daily_reports', 'audit_log']
for table in forbidden_tables:
    # check for from('table') or from("table")
    if f".from('{table}')" in client_js or f'.from("{table}")' in client_js:
        errors.append(f"SECURITY VIOLATION: client/client.js queries forbidden table: {table}")

if not any("SECURITY VIOLATION" in e for e in errors):
    print("PASSED: Client isolation verified — zero queries to internal engineering tables")

# Summary
if errors:
    print(f"\nFAILED with {len(errors)} error(s):")
    for err in errors:
        print(f" - {err}")
    exit(1)
else:
    print("\nOVERALL RESULT: ALL PHASE D CHECKS PASSED")
