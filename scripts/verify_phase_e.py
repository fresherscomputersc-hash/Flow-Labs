import os
import urllib.request

print("=== VERIFYING PHASE E (PUBLISHING & MEDIA STORAGE) ===")
errors = []

# 1. Migration file
migration_path = 'supabase/migrations/0005_storage.sql'
if not os.path.exists(migration_path):
    errors.append(f"Missing migration file: {migration_path}")
else:
    with open(migration_path, 'r', encoding='utf-8') as f:
        mig_sql = f.read()
    if "'media'" not in mig_sql or "'attachments'" not in mig_sql:
        errors.append("Migration 0005_storage.sql does not define 'media' and 'attachments' buckets")
    else:
        print("PASSED: Migration 0005_storage.sql defines storage buckets and policies")

# 2. Blog feed script
feed_path = 'assets/blog-feed.js'
if not os.path.exists(feed_path):
    errors.append(f"Missing blog feed script: {feed_path}")
else:
    with open(feed_path, 'r', encoding='utf-8') as f:
        feed_js = f.read()
    if 'site_blog_posts' not in feed_js or 'renderDraftPreview' not in feed_js or 'loadLiveBlogFeed' not in feed_js:
        errors.append("assets/blog-feed.js missing required live feed or draft preview logic")
    else:
        print("PASSED: assets/blog-feed.js contains live publishing and draft preview logic")

# 3. Blog index HTML inclusion
with open('blog/index.html', 'r', encoding='utf-8') as f:
    blog_html = f.read()

if 'blog-feed.js' not in blog_html or 'supabase.min.js' not in blog_html:
    errors.append("blog/index.html does not include blog-feed.js or supabase.min.js")
else:
    print("PASSED: blog/index.html includes blog-feed.js and Supabase SDK")

# 4. Flow HQ HTML upload elements
with open('flow-hq/index.html', 'r', encoding='utf-8') as f:
    hq_html = f.read()

required_hq_elements = [
    'id="blogUploadMediaBtn"',
    'id="blogMediaInput"',
    'id="blogPreviewDraft"',
    'id="btnUploadProjectFile"',
    'id="projectFileInput"'
]

for el in required_hq_elements:
    if el not in hq_html:
        errors.append(f"Missing element in flow-hq/index.html: {el}")

if not any("Missing element in flow-hq/index.html" in e for e in errors):
    print("PASSED: All upload and preview controls present in flow-hq/index.html")

# 5. Flow HQ Admin JS handlers
with open('flow-hq/admin.js', 'r', encoding='utf-8') as f:
    admin_js = f.read()

required_admin_js = [
    'scheduleDebouncedRebuild',
    'blogUploadMediaBtn',
    'blogPreviewDraft',
    'btnUploadProjectFile',
    "db.storage.from('media')",
    "db.storage.from('attachments')"
]

for kw in required_admin_js:
    if kw not in admin_js:
        errors.append(f"Missing logic in flow-hq/admin.js: {kw}")

if not any("Missing logic in flow-hq/admin.js" in e for e in errors):
    print("PASSED: Media storage uploads and debounced rebuild logic present in flow-hq/admin.js")

# 6. Local Server check
try:
    with urllib.request.urlopen('http://localhost:8321/blog/', timeout=3) as resp:
        if resp.status == 200:
            print("PASSED: http://localhost:8321/blog/ returned HTTP 200 OK")
        else:
            errors.append(f"Local server returned status {resp.status} for /blog/")
except Exception as e:
    errors.append(f"Local server check failed: {e}")

# Summary
if errors:
    print(f"\nFAILED with {len(errors)} error(s):")
    for err in errors:
        print(f" - {err}")
    exit(1)
else:
    print("\nOVERALL RESULT: ALL PHASE E CHECKS PASSED")
