# AUDIT_REPORT.md

**Project:** The Flow Labs (`theflowlabs.online`)
**Repository:** `E:\research\FLOWW LABS` — `main` @ `30d0fb1`
**Audit date:** 25 November 2026
**Audit type:** Full-stack, read-only audit (Phase 1: audit + report only)
**Auditor roles:** QA, Security, Frontend/Backend, UI/UX, DevOps, Performance

---

## 1. Executive summary

The site is a **Next.js 15 static export** (`output: 'export'`) deployed on Vercel behind Cloudflare, with a
separate set of Vercel serverless functions in `/api`, and a Supabase Postgres backend (7 SQL migrations).
The public marketing surface is small, fast to load, visually consistent, and free of console errors.
The security headers are unusually good for a studio site.

The **administrative and client-facing surfaces are not real applications**. Flow HQ and the Client Portal are
client-side React demos backed by `localStorage`, with **no server-side authorization**. Both ship
authentication bypasses to production:

1. **Flow HQ accepts any email with the hard-coded password `flowlabs2026`** (and any email containing
   `theflowlabs`), plus one-click "founder" login buttons. The string is present in the live JS bundle and in a
   **public GitHub repository**.
2. **The Client Portal logs anyone in** who types an email longer than 3 characters — no access key, no
   password, no server check.
3. **The GitHub webhook accepts unsigned requests** because `GITHUB_WEBHOOK_SECRET` is not configured; a
   signature-less `ping` returned `200 {"ok":true,"pong":true}` from production.

On the database side, the RLS design is thoughtful (SECURITY DEFINER helpers, no recursive policies), but three
SECURITY DEFINER RPCs are granted to every authenticated user, suspended accounts keep project access, and the
signup trigger trusts user-supplied `role` metadata.

The marketing funnel has a **silent lead-loss bug**: the scoping form shows "Scope received" even when the
Supabase insert fails.

### Overall health

| Area | Grade | Comment |
|---|---|---|
| Security posture (public site) | **C** | Strong headers, but three critical auth bypasses and an unsigned webhook |
| Security posture (admin/portal) | **F** | No server-side auth; demo data only |
| Correctness / business logic | **D** | Lead loss on failure; no persistence |
| UI/UX & responsiveness | **C** | Polished desktop, broken mobile navigation |
| Accessibility | **D** | Unlabeled fields, contrast failures, removed focus rings, small targets |
| Performance | **C** | 955 KB uncompressed JS on home; 3D loop without reduced-motion support |
| SEO | **C-** | Stale sitemap (all 308s, 8+ 404s), no canonical, no structured data, duplicate /scoping title |
| DevOps / process | **D** | No tests, no CI, no lint config, stale docs, unused deployed endpoints |
| Documentation accuracy | **D** | `STATUS.md` describes a different codebase state |

**Overall: 52 / 100 — "Launchable marketing site, unsafe admin surface, unverified business logic."**

### Finding counts

| Severity | Count |
|---|---|
| Critical | 3 |
| High | 7 |
| Medium | 23 |
| Low | 12 |
| **Total** | **45** (+1 informational) |

---

## 2. Scope and method

### In scope
- All routes: `/`, `/services`, `/work`, `/about`, `/blog`, `/blog/[slug]`, `/bhubaneswar`, `/scoping`,
  `/privacy-policy`, `/terms`, `/client`, `/flow-hq`, 404.
- All serverless functions in `/api`.
- Supabase schema and migrations (`supabase/migrations/0001`–`0007`, `supabase-schema.sql`).
- Configuration: `next.config.mjs`, `vercel.json`, `tsconfig.json`, `tailwind.config.ts`, `.env.example`,
  `robots.txt`, `sitemap.xml`.
- Dependencies (`npm audit`), TypeScript (`tsc --noEmit`).
- Live production behaviour (read-only GET/HEAD, one no-op webhook `ping`, client-side login probes).

### Out of scope / not performed
- No destructive testing, no load testing, no credential attacks, no account creation, no production writes.
- No POST to `/api/notify`, `/api/audit`, `/api/track`, or `/api/rebuild` (they write data or send email).
- No Supabase SQL was executed. RLS findings are from migration source, not live `pg_policies`.
- No penetration test of the Supabase REST layer with a real JWT.

### Tooling actually used
| Tool | Use |
|---|---|
| `npm audit --json` | Dependency CVEs |
| `npx tsc --noEmit --incremental false` | Type safety (exit 0) |
| Browser automation (native MCP: navigate, snapshot, evaluate, console) | Runtime UI/auth testing |
| Same-origin iframe harness (local `out/` build, 375/768/1440 px) | Responsive + a11y measurement |
| `Invoke-WebRequest` HEAD/GET | Live status codes, headers, redirects, sitemap crawl |
| DNS lookups, offline replication of `normalizeUrl` | SSRF filter validation |
| Supabase `GET /auth/v1/settings` | Signup/autoconfirm configuration |
| GitHub API | Repository visibility |
| Skills CLI | Installed the `webapp-testing` skill globally (see §7) |

### Evidence standard
Every finding below is labelled **Confirmed**, **Probable**, or **Unverified**:
- **Confirmed** — reproduced by execution or directly observable in live output.
- **Probable** — certain from source code, but the production configuration or a required precondition was not exercised.
- **Unverified** — plausible risk that needs a follow-up test; not counted in severity totals.

---

## 3. Architecture map

```
Browser
 ├─ Next.js static export (out/)  ── Vercel static hosting ── Cloudflare (proxy, NEL, CF-RAY)
 │    ├─ app/layout.tsx        Dock + Footer + Google Fonts <link>
 │    ├─ 11 routes, 3 blog posts (lib/posts.ts, hard-coded)
 │    ├─ components/3d/HeroFlowBackground.tsx  (three.js, 2,800 particles)
 │    └─ Supabase JS client (lib/supabase.ts) → direct PostgREST calls
 │         └─ site_leads INSERT (anon)  /  site_leads SELECT (admin JWT)
 ├─ /flow-hq   client-side demo (localStorage: projects, tasks, clients, team, standups, leads)
 ├─ /client    client-side demo (localStorage session, hard-coded demo clients)
 └─ /api/*     Vercel serverless (CommonJS, no framework)
      ├─ audit.js          PSI/Lighthouse + HTML heuristic + Supabase cache   (public POST)
      ├─ content.js        CMS overrides                                       (public GET)
      ├─ settings.js       site settings                                       (public GET)
      ├─ track.js          page-view insert with service key                    (public POST)
      ├─ notify.js         lead email via SMTP                                  (public POST)
      ├─ rebuild.js        Vercel deploy hook, gated by is_admin()               (admin POST)
      ├─ platform.js → platform/[...path].js   /me /team /team/invite /audit /notify /digest
      └─ github/webhook.js HMAC webhook (also mounted at /api/platform/github)

Supabase (project ref jolcqqwvzrvqydzxpwij)
 ├─ auth.users → trigger handle_new_user() → public.profiles
 ├─ RLS helpers: is_admin, current_role, is_client, is_member, can_access_project, can_manage_project,
 │               can_access_module, can_access_task, is_client_of
 ├─ site_leads, site_content, site_settings, site_visitors, site_audits, admin_users
 ├─ projects, modules, tasks, task_comments, activity, notifications, daily_reports, attachments,
 │  client_updates, project_members, project_clients, module_members, github_deliveries, audit_log
 └─ Storage: media (public), attachments (private)
```

**Deployment note:** `next.config.mjs` uses `output: 'export'`, so there is no Next.js server runtime. `/api` is
served by Vercel's standalone function runtime. Consequence: **every page is publicly readable static HTML**,
including `/flow-hq` and `/client`; all access control must happen in the browser or in the API.

---

## 4. Top risks (ranked)

| # | ID | Risk | Severity | Confidence |
|---|---|---|---|---|
| 1 | SEC-001 | Hard-coded `flowlabs2026` backdoor grants "Owner" in Flow HQ; string is live and public | Critical | Confirmed |
| 2 | SEC-002 | Client portal authenticates any email >3 chars; no server check | Critical | Confirmed |
| 3 | SEC-003 | GitHub webhook accepts unsigned events → forged activity/comments | Critical | Confirmed |
| 4 | BUG-001 | Scoping form reports success on failed insert → silent lead loss | High | Confirmed (code) |
| 5 | SEC-007 | SSRF filter bypass in `/api/audit` (`localhost.`, `localtest.me`, DNS rebinding) | High | Confirmed (filter) |
| 6 | SEC-008 | Any signed-in user can send arbitrary email through studio SMTP; nodemailer 6.9.16 injection CVEs | High | Confirmed (code) |
| 7 | SEC-004 | Public signup + `user_metadata.role` → self-assigned `owner` profile | High | Probable |
| 8 | SEC-013 | Suspending a user does not revoke project access | High | Confirmed (code) |
| 9 | BUG-002 | Mobile nav is 555 px wide in a 375 px viewport; clipped, no menu | High | Confirmed |
| 10 | BUG-005 | Admin/portal are localStorage demos; 7 migrations + storage + realtime unused | Medium | Confirmed |

---

## 5. What is genuinely good (do not regress)

- **Security headers**: HSTS (2 years, preload), CSP, `X-Frame-Options`, `nosniff`, `Referrer-Policy`,
  `Permissions-Policy` — verified live on `https://www.theflowlabs.online/`.
- **No secrets in tracked files**: no service-role key, SMTP password, or private key in the 150 tracked files.
- **`is_admin()` gating on writes**: leads, content, settings, audits, projects, tasks all gate writes on
  server-side role checks, not client claims.
- **`guard_profile_fields()` trigger** blocks self-promotion through PostgREST.
- **`/api/platform/me` returns 401 without a token** — the platform router does authenticate.
- **`api/rebuild.js`** verifies the caller with `is_admin()` before firing the deploy hook.
- **`npm audit`**: 0 critical, 2 high, 1 moderate.
- **TypeScript**: `tsc --noEmit` exits 0.
- **Zero console errors** on `/`, `/scoping`, `/work`, `/blog`, `/flow-hq`.
- **Semantic basics**: one `<h1>` per page, `lang="en"`, viewport meta, landmark elements, no unlabeled
  links/buttons, no duplicate IDs, no `target="_blank"` without `rel="noopener noreferrer"`.

---

## 6. Findings by category

| Category | Critical | High | Medium | Low |
|---|---|---|---|---|
| Authentication & access control | 3 | 1 | 2 | 0 |
| API & serverless | 0 | 2 | 2 | 2 |
| Database / RLS | 0 | 2 | 1 | 0 |
| Business logic & bugs | 0 | 1 | 3 | 2 |
| UI/UX & responsive | 0 | 1 | 0 | 2 |
| Accessibility | 0 | 0 | 4 | 1 |
| Performance | 0 | 0 | 2 | 3 |
| SEO | 0 | 0 | 3 | 1 |
| DevOps / configuration | 0 | 0 | 6 | 1 |
| **Total** | **3** | **7** | **23** | **12** |

Detailed write-ups: `BUGS_AND_FINDINGS.md` (functional, UI/UX, SEO, performance, ops) and
`SECURITY_REPORT.md` (all security findings with OWASP mapping).

---

## 7. Skills CLI step (what was actually done)

- `npx -y skills@latest --help` succeeded (Skills CLI available).
- Installed **`anthropics/skills → webapp-testing`** at user scope (`-g`), so no project files were touched.
  The skill is a Playwright toolkit (screenshots, console logs, local web-app verification).
- Its scripts were **not executed**: Playwright browsers are not installed in this environment, and the native
  browser MCP already provided navigation, accessibility snapshots, JS evaluation, console capture and
  network inspection. Running an unvetted installer inside the repo would also violate the no-modify policy.
- No other skills were installed. Skills were **not** allowed to modify application files.

---

## 8. Limitations and unverified areas

1. **No authenticated Supabase session was used.** RLS conclusions come from migration source, not from live
   `pg_policies`. The applied migration state could differ from the repository.
2. **No PageSpeed/Lighthouse performance score.** Google PSI returned `429` (shared keyless quota), and the
   in-browser Lighthouse run timed out at 60 s. Performance findings use bundle sizes, request structure and
   code inspection — not Core Web Vitals field data.
3. **No mobile screenshots.** The desktop capture API requires a visible window. Mobile layout was measured
   numerically inside a same-origin 375/768/1440 px iframe harness instead.
4. **Local `out/` is one build behind the live bundle hash.** Auth bypasses were re-verified against the
   live site. The live client chunk contains the `30d0fb1` deliverable-download code, confirming production
   is at HEAD; layout measurements used the local `out/` build of the same commit.
5. **Signup escalation (SEC-004) not exercised.** `disable_signup=false` and `mailer_autoconfirm=false` were
   confirmed; no account was created. The exploitability is mitigated by `status='invited'`, which is why it
   is High rather than Critical.
6. **Colour contrast computed from Tailwind hex values**, not from rendered pixels (no opacity stacking).
7. **No load or concurrency testing.** Rate-limit conclusions are from code.
8. **Legal/compliance review is not legal advice.**

---

## 9. Recommended fix order (summary)

Full detail in `REMEDIATION_LOG.md`.

1. **Today:** remove the Flow HQ fallback login and quick-login buttons; replace the client portal with real
   Supabase Auth + RLS; set `GITHUB_WEBHOOK_SECRET` and fail closed.
2. **This week:** fix the scoping form's false success; patch SSRF; restrict `/api/platform/notify` to admins;
   revoke over-granted RPCs; add `status='active'` to `can_access_project`.
3. **This sprint:** mobile navigation; sitemap regeneration; canonical URLs; metadata for `/scoping`;
   form labels, contrast and focus rings.
4. **Next sprint:** wire the backend or delete it; add tests + CI; refresh privacy/terms; trim dead assets.

---

## 10. Phase gate

This report is **audit-only**. No application file, configuration, database object, test, or deployment was
modified. The only writes were the five report files in the project root and a user-scope skill install.

**Awaiting explicit approval before any remediation.**
