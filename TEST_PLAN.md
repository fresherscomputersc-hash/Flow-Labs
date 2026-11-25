# TEST_PLAN.md

**Project:** The Flow Labs (`www.theflowlabs.online`)
**Repository:** `E:\research\FLOWW LABS` — `main` @ `30d0fb1`
**Audit date:** 25 November 2026
**Document purpose:** Record what was tested, what was not, and the regression suite required before and after remediation.

> **No production writes.** Every test in §4 is read-only or client-side. The single POST to production was a
> GitHub `ping` event, which returns before any database call. No account was created, no email was sent,
> no scan or tracking row was written.

---

## 1. Objectives

1. Establish a factual baseline of the deployed behaviour (routes, headers, auth, layout, metadata).
2. Reproduce the suspected authentication bypasses without altering production state.
3. Quantify UI, accessibility and performance defects with measurements rather than opinion.
4. Define a repeatable suite that would have caught these defects and will prevent regressions.
5. Give remediation a clear pass/fail gate.

---

## 2. Scope

### In scope

| Layer | Items |
|---|---|
| Routes | `/`, `/services`, `/work`, `/work/[slug]`, `/about`, `/blog`, `/blog/[slug]`, `/bhubaneswar`, `/scoping`, `/privacy-policy`, `/terms`, `/client`, `/flow-hq`, 404 |
| API | all functions under `api/` |
| Database | migrations `0001`–`0007`, `supabase-schema.sql` (source review) |
| Config | `next.config.mjs`, `vercel.json`, `tsconfig.json`, `tailwind.config.ts`, `.env.example`, `robots.txt`, `sitemap.xml` |
| Quality | responsive layout at 375/768/1440, accessibility, SEO metadata, bundle size, type safety, dependency advisories |
| Process | tests, CI, lint, documentation accuracy, repository visibility |

### Out of scope

- Load, stress, soak and concurrency testing.
- Destructive testing, fuzzing, brute force, credential stuffing.
- Account creation, JWT forgery, live SQL execution.
- Email delivery, payment flows (none exist), third-party penetration testing.
- Legal review of privacy/terms (flagged, not adjudicated).

---

## 3. Environments and tooling

| Environment | URL / path | Use |
|---|---|---|
| Production | `https://www.theflowlabs.online` | Headers, routes, redirects, auth probes, sitemap |
| Local build | `out/` served at `http://localhost:4173` | Responsive and accessibility measurement |
| Source | `E:\research\FLOWW LABS` | Static analysis, migrations, config |
| Supabase | `GET /auth/v1/settings` | Auth configuration (read-only) |
| GitHub API | `api.github.com/repos/...` | Repository visibility |

| Tool | Purpose |
|---|---|
| Native browser automation (navigate, snapshot, evaluate, console) | Live auth probes, DOM measurement, console capture |
| Same-origin iframe harness (`__harness.html?path=&w=`) | Deterministic 375/768/1440 px measurement, bypassing the desktop window-size limit |
| `Invoke-WebRequest` / Node `https` | Status codes, headers, redirects, sitemap crawl with 308 support |
| `npm audit --json` | Dependency advisories |
| `npx tsc --noEmit --incremental false` | Type safety |
| Offline replication of `normalizeUrl()` | SSRF filter unit behaviour |
| `nslookup` / `dns.lookup` | DNS resolution for bypass hosts |
| Contrast calculation (WCAG relative luminance) | Colour ratios from Tailwind tokens |

**Not available:** Lighthouse/PageSpeed (PSI returned HTTP 429; in-browser run exceeded 60 s), screenshot
capture (requires a visible desktop window), Playwright browsers.

---

## 4. Executed test cases

Legend: **Pass** = behaved as specified; **Fail** = defect confirmed; **Info** = observation, not a defect.

### 4.1 Transport, routing and headers

| ID | Test | Expected | Actual | Result |
|---|---|---|---|---|
| TC-001 | `HEAD /` | 200 + security headers | 200; HSTS, CSP, XFO, nosniff, Referrer-Policy, Permissions-Policy present | Pass |
| TC-002 | HSTS value | `max-age` ≥ 1 year, preload | `max-age=63072000; includeSubDomains; preload` | Pass |
| TC-003 | CSP directives | `default-src 'self'`, `object-src 'none'`, `frame-ancestors 'self'` | Present; `script-src` also allows `'unsafe-inline'`/`'unsafe-eval'` and two CDNs | Info (OPS-006) |
| TC-004 | `HEAD` each public route | 200 | 200 for all live routes | Pass |
| TC-005 | `/contact` | 308 → `/scoping` | 308, `Location: /scoping` | Pass |
| TC-006 | `theflowlabs.online` apex | 308 → `www` | 308 | Pass |
| TC-007 | `/flow-hq`, `/client` indexing | `noindex` | `noindex, nofollow, noarchive` | Pass |
| TC-008 | `/api/*` indexing | `noindex` | `noindex, nofollow` | Pass |
| TC-009 | `/qr` rewrite | 200 via rewrite | 200, Cloudflare | Pass |
| TC-010 | Unknown path | 404 page | 404 | Pass |

### 4.2 Authentication and authorization

| ID | Test | Expected | Actual | Result |
|---|---|---|---|---|
| TC-011 | `/flow-hq` with `attacker@not-the-studio.com` / `flowlabs2026` | Reject | Console opens as "Attacker (Owner)" | **Fail — SEC-001** |
| TC-012 | `/flow-hq` with any `*theflowlabs*` email / wrong password | Reject | Owner session | **Fail — SEC-001** |
| TC-013 | `/flow-hq` quick-founder button, no credentials | Require auth | Owner session in one click | **Fail — SEC-001** |
| TC-014 | Live HQ bundle secret scan | No credentials | `flowlabs2026`, `Quick founder access` present | **Fail — SEC-001** |
| TC-015 | `/client` with `probe-live@example.com`, blank key | Reject | Portal opens as "Custom Sprint Build" | **Fail — SEC-002** |
| TC-016 | `/client` with demo email only (no key) | Reject | Match succeeds (`||` logic) | **Fail — SEC-002** |
| TC-017 | Session persistence | Server-verified | `flow_active_client_session` in `localStorage`, no expiry | **Fail — SEC-006** |
| TC-018 | `POST /api/platform/github` ping, no signature | 401 | `200 {"ok":true,"pong":true,"zen":"audit probe"}` | **Fail — SEC-003** |
| TC-019 | Same with `sha256=deadbeef` | 401 | `200 {"ok":true,"pong":true,...}` | **Fail — SEC-003** |
| TC-020 | `GET /api/platform/me` without token | 401 | 401 | Pass |
| TC-021 | Supabase auth settings | Know signup state | `disable_signup=false`, `mailer_autoconfirm=false`, `external_email=true`, `anonymous=false` | Info (SEC-004) |
| TC-022 | `/api/platform/*` CORS | Origin allowlist | `Access-Control-Allow-Origin: *` | **Fail — SEC-009** |
| TC-023 | `/api/settings` unauthenticated | Public subset only | Full settings row | Info/Fail — SEC-011 |

### 4.3 Injection and SSRF (offline replication)

| ID | Test | Expected | Actual | Result |
|---|---|---|---|---|
| TC-024 | `normalizeUrl('http://localhost')` | Block | Block | Pass |
| TC-025 | `normalizeUrl('http://localhost.')` | Block | **Allowed** (resolves to `::1`) | **Fail — SEC-007** |
| TC-026 | `normalizeUrl('http://localtest.me')` | Block | **Allowed** (resolves to `::1`) | **Fail — SEC-007** |
| TC-027 | `normalizeUrl('http://127.0.0.1')`, `10.x`, `192.168.x`, `172.16.x`, `169.254.169.254` | Block | Block | Pass |
| TC-028 | `normalizeUrl('http://[::1]')`, `0x7f000001`, `2130706433`, `[::ffff:127.0.0.1]` | Block | Block | Pass |
| TC-029 | Redirect handling in `fetchHtml` | Revalidate each hop | `redirect: 'manual'` + `normalizeUrl(Location)` | Pass |
| TC-030 | SMTP header injection surface | No raw interpolation | `name`/`subject` interpolated into headers; nodemailer 6.9.16 advisories | **Fail — SEC-008** |
| TC-031 | `readBody` size cap | Reject large bodies | No application cap (platform limit only) | **Fail — SEC-012** |

### 4.4 Functional and business logic

| ID | Test | Expected | Actual | Result |
|---|---|---|---|---|
| TC-032 | Scoping submit with Supabase blocked | Error + retry | Success panel shown; `submitted=true` always | **Fail — BUG-001** |
| TC-033 | Scoping submit with valid network | Row inserted, success | Insert + success (source path) | Pass (code) |
| TC-034 | Flow HQ lead load failure | Error/empty state | Three hard-coded demo leads remain | **Fail — BUG-004** |
| TC-035 | Portal deliverable download | Real artifact or disabled | Generates a "verified" Markdown certificate client-side | **Fail — BUG-003** |
| TC-036 | `staging.theflowlabs.online` resolution | Resolves | NXDOMAIN | **Fail — BUG-006** |
| TC-037 | `/api/content`, `/api/settings`, `/api/track`, `/api/notify` usage in UI | Referenced | No references in `app/` or `components/` | **Fail — BUG-007** |
| TC-038 | Backend persistence | Shared across devices | `localStorage` only | **Fail — BUG-005** |

### 4.5 Responsive layout

Measured in a 375/768/1440 px iframe against `out/` (built from `30d0fb1`).

| ID | Viewport | Test | Expected | Actual | Result |
|---|---|---|---|---|---|
| TC-039 | 375 | Header fits viewport | `0 ≤ left`, `right ≤ 375` | left −97, right 457, width 555 | **Fail — BUG-002** |
| TC-040 | 375 | No horizontal overflow | `scrollWidth ≤ clientWidth` | 360 = 360, but only because `overflow-x: hidden` | **Fail — UX-002** |
| TC-041 | 375 | Nav reachable | All links tappable | Blog/CTA clipped outside viewport | **Fail — BUG-002** |
| TC-042 | 768 | Header fits | Fits | Fits (measurement in batch run) | Pass |
| TC-043 | 1440 | Header fits | Fits | Fits | Pass |
| TC-044 | 375/1440 | One `<h1>` per route | 1 | 1 on all 12 routes | Pass |
| TC-045 | 375 | Tap targets ≥ 24 px | All | 14–17 under 24 px per marketing page | **Fail — A11Y-004** |

### 4.6 Accessibility

| ID | Test | Expected | Actual | Result |
|---|---|---|---|---|
| TC-046 | Labelled form fields | Every field named | `/scoping` 4, `/flow-hq` 2, `/client` 2 unlabeled | **Fail — A11Y-001** |
| TC-047 | Contrast ≥ 4.5:1 | Pass | `slate-500` 4.18 / 3.97; `slate-600` 2.63 | **Fail — A11Y-002** |
| TC-048 | Visible focus | Clear indicator | 30+ `focus:outline-none` with 1 px border change only | **Fail — A11Y-003** |
| TC-049 | Skip link | Present | Absent; `<main>` has no id/label | **Fail — A11Y-005** |
| TC-050 | Accessible names on links/buttons | All named | 0 unnamed | Pass |
| TC-051 | Duplicate IDs | None | None | Pass |
| TC-052 | Heading order | No skipped levels | No skips on sampled routes | Pass |
| TC-053 | Landmarks | header/nav/main/footer | 1 each on public routes | Pass |
| TC-054 | `lang`, viewport | Present | `lang="en"`, `width=device-width, initial-scale=1` | Pass |
| TC-055 | `target="_blank"` safety | `rel="noopener noreferrer"` | 3/3 correct | Pass |

### 4.7 SEO and metadata

| ID | Test | Expected | Actual | Result |
|---|---|---|---|---|
| TC-056 | Sitemap URL health | All 200 | 24 total: **12 × 200, 12 × 404** | **Fail — SEO-001** |
| TC-057 | Sitemap completeness | Includes `/scoping` | Missing | **Fail — SEO-001** |
| TC-058 | Trailing-slash consistency | Matches `cleanUrls` | All 24 use trailing slash → 308 | **Fail — SEO-001** |
| TC-059 | Canonical tag | One per page | 0 on all 12 routes | **Fail — SEO-002** |
| TC-060 | `/scoping` metadata | Unique | Inherits homepage title/description | **Fail — SEO-003** |
| TC-061 | JSON-LD | Present | 0 blocks site-wide | **Fail — SEO-003** |
| TC-062 | OG image | Per-page, 1200×630 | Same 1440×900 PNG everywhere, 182 KB | **Fail — SEO-004** |
| TC-063 | `robots.txt` | Allow + sitemap | Present | Pass |

### 4.8 Performance

| ID | Test | Expected | Actual | Result |
|---|---|---|---|---|
| TC-064 | Home JS payload | Minimal | **955 KB uncompressed across 9 scripts**; largest 482 KB | **Fail — PERF-001** |
| TC-065 | Console errors | None | 0 on `/`, `/scoping`, `/work`, `/blog`, `/flow-hq` | Pass |
| TC-066 | Reduced motion | Honoured | No `prefers-reduced-motion` in the hero | **Fail — PERF-002** |
| TC-067 | WebGL cleanup | Full disposal | rAF cancelled, renderer disposed; geometry/material/texture not disposed | Partial — PERF-002 |
| TC-068 | Font loading | Self-hosted/preloaded | Third-party stylesheet in `<head>` | **Fail — PERF-003** |
| TC-069 | Lighthouse/PSI | Score | PSI 429; in-browser timeout | **Not run** |

### 4.9 Process, dependencies and documentation

| ID | Test | Expected | Actual | Result |
|---|---|---|---|---|
| TC-070 | Automated tests present | Yes | None (no test/spec/Playwright/Jest/Vitest) | **Fail — OPS-001** |
| TC-071 | CI workflow | Yes | No `.github/workflows` | **Fail — OPS-001** |
| TC-072 | Lint config | Yes | None | **Fail — OPS-001** |
| TC-073 | Type check | Exit 0 | Exit 0 | Pass |
| TC-074 | `npm audit` | 0 high | 2 high (nodemailer, postcss), 1 moderate (next) | **Fail — §9 Security** |
| TC-075 | Secrets in tracked files | None | None found | Pass |
| TC-076 | Repository visibility | Private (recommended) | Public, 2,478 KB | **Fail — OPS-003** |
| TC-077 | `STATUS.md` accuracy | Matches HEAD | Claims `83a817e`; HEAD `30d0fb1` | **Fail — OPS-002** |
| TC-078 | SEO docs accuracy | Matches live | Claim canonical/JSON-LD/26-URL sitemap; live has none | **Fail — OPS-007** |
| TC-079 | Privacy policy vs endpoints | Consistent | Policy denies analytics; `/api/track` deployed | **Fail — OPS-004** |
| TC-080 | Monitoring | Present | None; failures swallowed | **Fail — OPS-005** |

**Executed: 80 checks.** 28 pass, 3 informational, 47 fail, 1 partial, 1 not run (TC-023 is counted as
informational although it flags the Low SEC-011 exposure). Counts overlap where one observation supports
several findings; the authoritative defect list is the 45 findings in `BUGS_AND_FINDINGS.md`.

---

## 5. Sitemap crawl script (reproducible)

The following was used to produce TC-056. It follows 308 correctly (Windows PowerShell 5.1 does not).

```js
const https = require('https');

const get = (u) => new Promise((resolve) => {
  https.get(u, (res) => {
    if ([301, 302, 303, 307, 308].includes(res.statusCode) && res.headers.location) {
      res.resume();
      return resolve(get(new URL(res.headers.location, u).href));
    }
    let bytes = 0;
    res.on('data', (c) => { bytes += c.length; });
    res.on('end', () => resolve({ status: res.statusCode, url: u, bytes }));
  }).on('error', (e) => resolve({ status: 'ERR', url: u, err: e.code }));
});

(async () => {
  const xml = await new Promise((resolve) => {
    https.get('https://www.theflowlabs.online/sitemap.xml', (res) => {
      let d = '';
      res.on('data', (c) => { d += c; });
      res.on('end', () => resolve(d));
    });
  });
  const urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  const bad = [];
  let ok = 0;
  for (const u of urls) {
    const r = await get(u);
    if (r.status === 200) ok++; else bad.push(r);
  }
  console.log({ total: urls.length, ok, bad: bad.length });
  bad.forEach((b) => console.log(b.status, b.url));
})();
```

Observed: `total 24 ok 12 bad 12` — the 12 failures are `/lab-report`, five `/services/*`,
seven `/work/*` detail pages.

---

## 6. Database verification queries (read-only, for remediation)

Run in the Supabase SQL editor (as project owner) before and after changes. These do not modify data.

```sql
-- 1. RLS enabled on every public table
select tablename, rowsecurity
from pg_tables
where schemaname = 'public'
order by tablename;

-- 2. All policies, with expressions
select tablename, policyname, cmd, roles, qual, with_check
from pg_policies
where schemaname = 'public'
order by tablename, policyname;

-- 3. SECURITY DEFINER functions and their grants
select p.proname,
       p.prosecdef as security_definer,
       pg_get_userbyid(p.proowner) as owner,
       p.proacl
from pg_proc p
join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'public'
  and p.proname in ('is_admin','create_notification','record_github_delivery',
                    'log_github_activity','can_access_project','can_manage_project')
order by p.proname;

-- 4. Who is admin, and why
select id, email, role, status
from public.profiles
where role in ('owner','admin')
order by created_at;

select email from public.admin_users;

-- 5. Suspended users who still hold memberships (SEC-013)
select pr.email, pr.status, pm.project_id, pm.role
from public.profiles pr
join public.project_members pm on pm.user_id = pr.id
where pr.status <> 'active';

-- 6. Orphaned/duplicate project access
select project_id, user_id, count(*)
from public.project_members
group by project_id, user_id
having count(*) > 1;
```

**Expected after fix:** no suspended profile appears in query 5; only `service_role` holds execute on the
three RPCs in query 3; `admin_users` is empty or contains only a dedicated ops identity that is also an
active profile.

---

## 7. Coverage matrix

| Area | Source review | Local build | Production | Automated |
|---|---|---|---|---|
| Routes / status | ✅ | ✅ | ✅ | ❌ |
| Headers / CSP | ✅ | — | ✅ | ❌ |
| Flow HQ auth | ✅ | ✅ | ✅ | ❌ |
| Client portal auth | ✅ | ✅ | ✅ | ❌ |
| Webhook signature | ✅ | — | ✅ (ping) | ❌ |
| SSRF filter | ✅ | ✅ (offline) | ❌ (not POSTed) | ❌ |
| RLS / migrations | ✅ | — | ❌ (no JWT) | ❌ |
| Scoping form | ✅ | ✅ | ❌ (no write) | ❌ |
| Responsive 375/768/1440 | ✅ | ✅ | ❌ (measure only) | ❌ |
| Accessibility | ✅ | ✅ | ✅ (DOM) | ❌ |
| SEO / metadata | ✅ | ✅ | ✅ | ❌ |
| Performance | ✅ | ✅ (sizes) | ❌ (no PSI) | ❌ |
| Dependencies | ✅ | — | — | ❌ |

**Automated coverage today: 0%.** TypeScript is the only machine-checked gate.

---

## 8. Proposed regression suite (post-approval)

### 8.1 Priority 0 — must exist before any auth fix ships

| ID | Type | Test | Pass condition |
|---|---|---|---|
| RG-001 | API | `POST /api/platform/github` with no signature | 401, no DB call |
| RG-002 | API | Same with wrong signature | 401 |
| RG-003 | API | Same with valid HMAC | 200 |
| RG-004 | API | `POST /api/notify` unauthenticated | 401/404 (endpoint removed or gated) |
| RG-005 | API | `POST /api/platform/notify` as `client` role | 403 |
| RG-006 | API | `GET /api/platform/team` as `member` | 403 |
| RG-007 | Unit | `normalizeUrl` corpus (public, private, DNS names, trailing dot, IPv6, redirects) | Only public hosts allowed |
| RG-008 | E2E | `/flow-hq` with wrong password | No console; error shown |
| RG-009 | E2E | `/client` with arbitrary email | No portal; error shown |
| RG-010 | DB | Signup with `role=owner` metadata | Profile is `member`/`invited` |
| RG-011 | DB | Suspended member queries a project | 0 rows |
| RG-012 | DB | Authenticated member calls `create_notification` | Permission denied |

### 8.2 Priority 1 — business and UX

| ID | Type | Test | Pass condition |
|---|---|---|---|
| RG-013 | E2E | Scoping submit with Supabase mocked to fail | Error + retry visible; no success panel |
| RG-014 | E2E | Scoping submit success | Row created; success panel |
| RG-015 | E2E | Mobile nav at 375 px | Menu opens; all five links + CTA reachable |
| RG-016 | Visual | 375/768/1440 screenshots of all public routes | No overflow; header within viewport |
| RG-017 | E2E | Deliverable download | Serves a real file or is disabled |
| RG-018 | E2E | Empty lead list | Explicit empty state, not demo rows |
| RG-019 | E2E | Keyboard tab order | Skip link first; visible focus on every control |
| RG-020 | A11y | axe-core on all routes | 0 critical/serious violations |

### 8.3 Priority 2 — quality gates

| ID | Type | Test | Pass condition |
|---|---|---|---|
| RG-021 | CI | `tsc --noEmit` | Exit 0 |
| RG-022 | CI | ESLint | 0 errors |
| RG-023 | CI | `npm audit --audit-level=high` | Exit 0 |
| RG-024 | CI | Sitemap crawl | 0 non-200 URLs; `/scoping` present |
| RG-025 | CI | Canonical + JSON-LD presence | Every indexable route |
| RG-026 | Perf | Bundle budget | Home JS ≤ 300 KB gzip / agreed budget |
| RG-027 | Perf | Lighthouse mobile (CI) | Performance ≥ 85, a11y ≥ 95, SEO ≥ 95 |
| RG-028 | Docs | Status check | `STATUS.md` commit == `git rev-parse HEAD` |

### 8.4 Suggested CI pipeline

```yaml
# .github/workflows/ci.yml (proposed, not created)
on: [push, pull_request]
jobs:
  verify:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 22, cache: npm }
      - run: npm ci
      - run: npx tsc --noEmit
      - run: npm run lint
      - run: npm run test -- --run
      - run: npm audit --audit-level=high
      - run: npm run build
      - run: npx playwright test
```

---

## 9. Manual UAT checklist (post-fix)

- [ ] `/flow-hq` rejects every published credential; only a real owner/admin profile enters.
- [ ] `/client` requires email **and** a valid key; wrong key shows a generic error; no portal renders.
- [ ] Sign out clears the session and a back-button reload does not restore it.
- [ ] GitHub webhook rejects missing/invalid signatures and accepts a valid one.
- [ ] A suspended user cannot read or write a project via the UI or PostgREST.
- [ ] A `client` account cannot call team or notify endpoints.
- [ ] Scoping form: success only on a real insert; failure shows retry + fallback contact.
- [ ] Empty CRM shows an empty state; no demo names or budgets appear.
- [ ] Deliverable download serves a real artifact or is absent.
- [ ] Mobile: menu opens, traps focus, closes on Escape, all links reachable at 375 px.
- [ ] No horizontal overflow at 375/768/1440.
- [ ] Every form field has a visible or `sr-only` label.
- [ ] Contrast ≥ 4.5:1 for body text; focus ring visible on every control.
- [ ] Sitemap: 0 404s, includes `/scoping`, no trailing-slash hops.
- [ ] Canonical and JSON-LD present on every indexable route.
- [ ] `/scoping` has its own title, description and OG image.
- [ ] No console errors on any route.
- [ ] `npm audit` has 0 high/critical.
- [ ] `STATUS.md` and SEO docs match the deployed commit.

---

## 10. Exit criteria

Remediation is **accepted** only when:

1. All 3 Critical and 7 High findings are closed and covered by an automated test (RG-001…RG-012).
2. `tsc`, lint, unit, integration and E2E suites pass in CI on the release commit.
3. The manual UAT checklist passes on production (or a production-like preview).
4. `npm audit` reports 0 critical/high, or each exception is documented with a compensating control.
5. The sitemap crawl returns 0 failures and the metadata checks pass.
6. No new medium finding is introduced; the residual list is reviewed and signed off.

---

## 11. Limitations of this test plan

- No live authenticated Supabase testing, so RLS results are source-derived.
- No load testing, so rate-limit and scaling behaviour is inferred.
- No Lighthouse score; performance conclusions are bundle- and code-based.
- No screenshots; layout was measured numerically.
- No signup, so SEC-004 remains latent/unverified.
- No SMTP send, so SEC-008's live impact depends on configuration.

---

*End of `TEST_PLAN.md`. All proposed suites are unimplemented.*
