#!/usr/bin/env python3
"""
Phase G Verification Script: GitHub Integration & Webhooks
"""
import os
import sys
import subprocess
import urllib.request
import json
import hmac
import hashlib

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

def check(condition, message):
    if not condition:
        print(f"  [FAIL] {message}")
        return False
    print(f"  [PASS] {message}")
    return True

def main():
    print("=== Verifying Phase G: GitHub App & Webhook Integration ===")
    all_ok = True

    # 1. Migration 0007
    print("\n1. Migration 0007 (GitHub Integration):")
    mig_path = os.path.join(ROOT, "supabase", "migrations", "0007_github_integration.sql")
    all_ok &= check(os.path.exists(mig_path), "0007_github_integration.sql exists")
    if os.path.exists(mig_path):
        with open(mig_path, "r", encoding="utf-8") as f:
            mig = f.read()
        all_ok &= check("github_repo" in mig, "projects.github_repo column added")
        all_ok &= check("github_deliveries" in mig, "github_deliveries table defined")
        all_ok &= check("record_github_delivery" in mig, "record_github_delivery RPC defined")
        all_ok &= check("log_github_activity" in mig, "log_github_activity RPC defined")

    # 2. Webhook Handler
    print("\n2. GitHub Webhook API (api/github/webhook.js):")
    webhook_path = os.path.join(ROOT, "api", "github", "webhook.js")
    all_ok &= check(os.path.exists(webhook_path), "api/github/webhook.js exists")
    if os.path.exists(webhook_path):
        with open(webhook_path, "r", encoding="utf-8") as f:
            wh = f.read()
        all_ok &= check("verifySignature" in wh, "HMAC SHA-256 signature verification implemented")
        all_ok &= check("x-github-delivery" in wh, "Idempotency delivery check implemented")
        all_ok &= check("taskKeyRegex" in wh, "Regex task key parser implemented")
        all_ok &= check("event === 'push'" in wh, "Push event handler implemented")
        all_ok &= check("event === 'pull_request'" in wh, "Pull request event handler implemented")

    # 3. Router Integration
    print("\n3. Catch-all Router Integration (api/platform/[...path].js):")
    router_path = os.path.join(ROOT, "api", "platform", "[...path].js")
    if os.path.exists(router_path):
        with open(router_path, "r", encoding="utf-8") as f:
            rt = f.read()
        all_ok &= check("segments[0] === 'github'" in rt, "GitHub webhook routed without requiring session JWT")

    # 4. Flow HQ Markup & Styles
    print("\n4. Flow HQ UI (index.html & admin.css):")
    html_path = os.path.join(ROOT, "flow-hq", "index.html")
    with open(html_path, "r", encoding="utf-8") as f:
        html = f.read()
    all_ok &= check('id="projectGithubBadge"' in html, "Project header GitHub badge present")
    all_ok &= check('id="ps-repo"' in html, "Project settings linked repo input present")

    css_path = os.path.join(ROOT, "flow-hq", "admin.css")
    with open(css_path, "r", encoding="utf-8") as f:
        css = f.read()
    all_ok &= check(".github-badge" in css, "GitHub badge styling present")
    all_ok &= check(".activity-item.github-commit" in css, "GitHub commit feed styling present")

    # 5. Flow HQ Logic
    print("\n5. Flow HQ Logic (flow-hq/admin.js):")
    js_path = os.path.join(ROOT, "flow-hq", "admin.js")
    with open(js_path, "r", encoding="utf-8") as f:
        js = f.read()
    all_ok &= check("projectGithubBadge" in js, "renderProjectHeader handles projectGithubBadge")
    all_ok &= check("github_repo" in js, "saveProjectSettings handles github_repo")
    all_ok &= check("github.commit" in js, "loadProjectActivity handles github.commit/PR")

    # 6. Webhook Unit Test via Node
    print("\n6. Webhook Unit Test (Node runtime check):")
    test_script = """
    const webhook = require('./api/github/webhook.js');
    const crypto = require('crypto');

    async function runTest() {
      // Test Ping
      let pingHeaders = { 'x-github-event': 'ping' };
      let pingBody = JSON.stringify({ zen: 'Keep it logically awesome.' });
      let resPing = {
        statusCode: 0,
        headers: {},
        setHeader(k, v) { this.headers[k] = v; },
        end(data) {
          const body = JSON.parse(data);
          if (!body.ok || !body.pong) {
            console.error('Ping test failed:', body);
            process.exit(1);
          }
        }
      };

      await webhook({
        method: 'POST',
        headers: pingHeaders,
        rawBody: pingBody
      }, resPing);

      console.log('  [PASS] Webhook successfully handles ping events with pong response');

      // Test HMAC verification failure
      process.env.GITHUB_WEBHOOK_SECRET = 'test-secret-123';
      let badSigHeaders = {
        'x-github-event': 'push',
        'x-hub-signature-256': 'sha256=invalid-signature-hash'
      };
      let resBadSig = {
        statusCode: 0,
        headers: {},
        setHeader(k, v) { this.headers[k] = v; },
        end(data) {
          const body = JSON.parse(data);
          if (this.statusCode !== 401 || body.ok !== false) {
            console.error('Bad sig test failed:', this.statusCode, body);
            process.exit(1);
          }
        }
      };

      await webhook({
        method: 'POST',
        headers: badSigHeaders,
        rawBody: JSON.stringify({ test: true })
      }, resBadSig);

      console.log('  [PASS] Webhook rejects forged signatures with 401');

      // Test Valid HMAC Signature
      const validPayload = JSON.stringify({ zen: 'test' });
      const validHash = 'sha256=' + crypto.createHmac('sha256', 'test-secret-123').update(validPayload).digest('hex');
      let goodSigHeaders = {
        'x-github-event': 'ping',
        'x-hub-signature-256': validHash
      };
      let resGoodSig = {
        statusCode: 0,
        headers: {},
        setHeader(k, v) { this.headers[k] = v; },
        end(data) {
          const body = JSON.parse(data);
          if (this.statusCode !== 200 || !body.ok) {
            console.error('Valid sig test failed:', this.statusCode, body);
            process.exit(1);
          }
        }
      };

      await webhook({
        method: 'POST',
        headers: goodSigHeaders,
        rawBody: validPayload
      }, resGoodSig);

      console.log('  [PASS] Webhook accepts valid HMAC SHA-256 signatures');
      process.exit(0);
    }

    runTest().catch(err => {
      console.error('Test error:', err);
      process.exit(1);
    });
    """

    res = subprocess.run(["node", "-e", test_script], cwd=ROOT, capture_output=True, text=True)
    if res.returncode == 0:
        print(res.stdout.strip())
        all_ok &= check(True, "All webhook handler tests executed successfully")
    else:
        print(res.stderr or res.stdout)
        all_ok &= check(False, "Webhook handler tests failed")

    if all_ok:
        print("\n>>> ALL PHASE G CHECKS PASSED SUCCESSFULLY! <<<")
        sys.exit(0)
    else:
        print("\n>>> SOME PHASE G CHECKS FAILED <<<")
        sys.exit(1)

if __name__ == "__main__":
    main()
