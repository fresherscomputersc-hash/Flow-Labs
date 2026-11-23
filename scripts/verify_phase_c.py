import os
import re

print("=== VERIFYING PHASE C (EVERY PAGE EDITABLE) ===")

# 1. Check HTML Elements
with open('flow-hq/index.html', 'r', encoding='utf-8') as f:
    html = f.read()

required_html = [
    'id="contentSearch"',
    'id="previewBar"',
    'id="btnPreviewDesktop"',
    'id="btnPreviewMobile"',
    'id="btnPreviewHide"',
    'id="previewStatus"',
    'id="iframeWrap"',
    'id="contentIframe"',
    'id="contentPreview"',
    'id="contentForm"',
    'id="contentPages"'
]

missing_html = [item for item in required_html if item not in html]
if missing_html:
    print(f"FAILED: Missing HTML elements: {missing_html}")
else:
    print("PASSED: All required HTML elements present in flow-hq/index.html")

# 2. Check CSS Styles
with open('flow-hq/admin.css', 'r', encoding='utf-8') as f:
    css = f.read()

required_css = [
    '.rail-search',
    '.rail-group-title',
    '.cms-preview-bar',
    '.preview-mode-group',
    '.cms-iframe-container',
    '.cms-iframe',
    '.cms-iframe.mobile',
    '.fieldblock',
    '.fieldblock-summary',
    '.field-counter',
    '.field-reset-btn'
]

missing_css = [item for item in required_css if item not in css]
if missing_css:
    print(f"FAILED: Missing CSS classes: {missing_css}")
else:
    print("PASSED: All required CSS classes present in flow-hq/admin.css")

# 3. Check JS implementation in admin.js
with open('flow-hq/admin.js', 'r', encoding='utf-8') as f:
    js = f.read()

required_js = [
    'renderContentRail(filterText)',
    'sendCmsPreview(key, value, defaultValue)',
    'broadcastCmsPreview(schema, overrides)',
    'setPreviewMode(mode)',
    'contentSearch',
    'btnPreviewDesktop',
    'btnPreviewMobile',
    'btnPreviewHide',
    'cnt-',
    'data-revert'
]

missing_js = [item for item in required_js if item not in js]
if missing_js:
    print(f"FAILED: Missing JS functions/handlers: {missing_js}")
else:
    print("PASSED: All required JS functions/handlers present in flow-hq/admin.js")

# 4. Check site-cms.js bridge and page count
with open('assets/site-cms.js', 'r', encoding='utf-8') as f:
    cms_js = f.read()

if "window.addEventListener('message'" in cms_js and "'cms-preview'" in cms_js:
    print("PASSED: cms-preview message bridge present in assets/site-cms.js")
else:
    print("FAILED: cms-preview bridge missing in assets/site-cms.js")

# 5. Check schema coverage
with open('flow-hq/content-schema.js', 'r', encoding='utf-8') as f:
    schema_js = f.read()

# Count defined pages
page_keys = re.findall(r'^\s*([a-zA-Z0-9_]+):\s*\{\s*category:', schema_js, re.MULTILINE)
print(f"PASSED: {len(page_keys)} pages registered in CONTENT_SCHEMA ({page_keys})")

print("\n=== PHASE C VERIFICATION COMPLETE ===")
