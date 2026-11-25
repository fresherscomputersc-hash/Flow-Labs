# REMEDIATION_LOG.md

**Project:** The Flow Labs (`www.theflowlabs.online`)
**Repository:** `E:\research\FLOWW LABS` — `main` @ `30d0fb1`
**Log opened:** 25 November 2026
**Status:** **PROPOSED ONLY — NOTHING IMPLEMENTED**

> **No code, configuration, database, test or deployment change has been made.** This document is a
> sequenced remediation plan derived from `BUGS_AND_FINDINGS.md` and `SECURITY_REPORT.md`. Every entry is a
> proposal awaiting explicit owner approval. The only files written during the audit are the five report
> files in the project root.

--- 

## 1. Change log

| Date | Change | Files | Commit | Applied by |
|---|---|---|---|---|
| — | No changes applied | — | — | — |

**Working tree at audit time:** clean except the audit reports. `git status` shows only untracked
`AUDIT_REPORT.md`, `BUGS_AND_FINDINGS.md`, `SECURITY_REPORT.md`, `TEST_PLAN.md`, `REMEDIATION_LOG.md`.

--- 

## 2. How to use this log

- **Wave 0** — same day. Stop active exploitation paths. Do not wait for the full refactor.
- **Wave 1** — this week. Close the remaining High findings and the silent data-loss bug.
- **Wave 2** — this sprint. Correctness, accessibility, SEO and client-visible quality.
- **Wave 3** — next sprint. Architecture, performance, process and documentation.

Each item has: what changes, why, files, effort (S ≤ 2 h, M ≤ 1 day, L > 1 day), risk of regression, the
test that proves it, and how to roll back. **Do not batch unrelated items into one commit** — the rollback
column assumes one item per commit.

**Hard ordering rules**

1. Fix SEC-001/002/003 **before** wiring the consoles to Supabase (BUG-005). Wiring first converts a demo
   bypass into a real data breach.
2. Set and verify `GITHUB_WEBHOOK_SECRET` **before** allowing non-`ping` events.
3. Upgrade `nodemailer` **before** re-enabling any mail endpoint.
4. Remove `body { overflow-x: hidden }` **after** the mobile nav is fixed, never before.
5. Add the auth regression tests (RG-001…RG-012) **with** the fixes, not after.

--- 

## 3. Wave 0 — stop active exploitation (same day)

| ID | Addresses | Change | Files | Effort | Risk | Verification | Rollback |
|---|---|---|---|---|---|---|---|
| R-01 | SEC-001 | Delete the `flowlabs2026` / `theflowlabs` fallback and the three quick-founder buttons. Gate the console on a server-fetched `profiles.role` + `status`. | `app/flow-hq/page.tsx` (428–493, 806–833) | S | Low | RG-008: wrong password shows an error; no console renders | `git revert` — no data migration |
| R-02 | SEC-002 | Remove the `else if (email.length > 3)` fallback, the demo-credential block, and the `||` matcher. Interim: require both fields to match a configured client, and show a generic error. | `app/client/page.tsx` (53–66, 144–219, 320–335) | S | Low | RG-009: arbitrary email rejected; demo key alone rejected | `git revert` |
| R-03 | SEC-003 | Require `GITHUB_WEBHOOK_SECRET`; fail closed if unset; verify raw body before parse; allowlist event + repo; remove the anon-key fallback in `readConfig()`. Rotate the secret. | `api/github/webhook.js`, Vercel env | S | Medium (events stop if misconfigured) | RG-001/002/003 | Restore previous env + commit; events resume |
| R-04 | SEC-008 | Delete `api/notify.js` (unused by the UI). Add `requireAdmin(profile)` to `/api/platform/notify` and allowlist recipients. Reject CR/LF in header fields. | `api/notify.js`, `api/platform/[...path].js` (424–462), `vercel.json` if routed | M | Medium | RG-004/005 | `git revert`; endpoint returns with previous behaviour |
| R-05 | SEC-008 | Upgrade `nodemailer` to ≥ 10.6.1 (semver-major) and run the mail path in a preview. | `package.json`, lockfile | M | Medium | `npm audit` 0 high; preview send test | Revert dependency + lockfile |
| R-06 | OPS-003 | Make the GitHub repository private, or split the deployable app into a private repo. Rotate anything ever committed that is still valid. | GitHub settings | S | Low | `GET /repos/...` → `private=true` | Re-publicise (not recommended) |

**Wave 0 exit gate:** no published credential opens `/flow-hq`; no arbitrary email opens `/client`;
unsigned webhook returns `401`; `/api/notify` is gone or authenticated.

--- 

## 4. Wave 1 — High findings and data loss (this week)

| ID | Addresses | Change | Files | Effort | Risk | Verification | Rollback |
|---|---|---|---|---|---|---|---|
| R-07 | SEC-007 | Resolve DNS before fetching; reject any private/loopback/link-local/CGNAT/ULA result; pin the resolved IP for the request; allow only 80/443; keep per-hop redirect validation. | `api/audit.js` (83–102, 197–243) | M | Medium (may block legitimate hosts) | RG-007 corpus + a live scan of a public site | Revert to previous `normalizeUrl`; keep the endpoint disabled if needed |
| R-08 | SEC-013 | Add `profiles.status='active'` to `can_access_project`, `can_manage_project`, `can_access_module`, `can_access_task`. Optionally revoke memberships when status → `suspended`. | new migration `0008_access_hardening.sql` | S | Medium (locks out invited users) | RG-011; SQL query 5 returns no suspended members | Forward-fix migration; restore previous function bodies |
| R-09 | SEC-014 | `revoke execute` on `create_notification`, `record_github_delivery`, `log_github_activity` from `authenticated`; grant to `service_role` only. Move webhook writes to the service key. | new migration `0009_rpc_grants.sql`, `api/github/webhook.js` | S | Medium (notifications stop if the client called them) | RG-012; webhook still writes | Re-grant + revert handler |
| R-10 | SEC-004 | Stop reading `role` from `raw_user_meta_data`; default `member`; disable public signup if invite-only; promote only via an admin RPC. | `0001_identity.sql` (new migration), Supabase Auth settings | M | Medium (existing signups) | RG-010; signup with `role=owner` yields `member` | Restore trigger; re-enable signup |
| R-11 | BUG-001 | Set success only when `!error`; show inline error + retry + mailto/WhatsApp fallback; optionally notify via a server endpoint; emit a structured failure event. | `app/scoping/page.tsx` (55–81) | S | Low | RG-013/014 | `git revert` |
| R-12 | SEC-015 | Remove the `admin_users` fallback from `is_admin()` after bootstrap, or require the matched profile to be `active`. Replace `theflowlabs01@gmail.com` with a dedicated ops identity with MFA. | new migration, Supabase data | S | Medium (admin lockout) | SQL query 4; owner can still administer | Restore fallback branch |
| R-13 | SEC-009 | Replace `Access-Control-Allow-Origin: *` with an origin allowlist (`www.theflowlabs.online`, localhost in dev) and `Vary: Origin`. | `api/platform/[...path].js` (516–519) | S | Low | Preflight from an unlisted origin fails | `git revert` |
| R-14 | SEC-010 | Move rate limits to a shared store (Upstash/Vercel KV/Postgres) keyed by a trusted identifier; add a global circuit breaker; stop trusting client-supplied forwarding headers. | `api/audit.js`, `api/track.js` | M | Medium | Burst test across instances respects the limit | Revert to in-memory (documented degradation) |
| R-15 | SEC-005 | Derive the HQ role from `profiles` after `getSession()`; never hard-code Owner/Admin; render an explicit unauthorized screen. | `app/flow-hq/page.tsx` (366–386, 455–463) | S | Low | RG-008 variant: client account sees no console | `git revert` |
| R-16 | SEC-006 | Move portal/HQ sessions to server-issued `httpOnly`, `Secure`, `SameSite=Lax` cookies (Supabase SSR) or short-lived signed tokens with expiry and revocation. | `app/client/page.tsx`, `app/flow-hq/page.tsx`, `lib/supabase.ts` | L | High (auth rewrite) | RG-009 + manual sign-out/back-button test | Keep the old path behind a flag for one release |

**Wave 1 exit gate:** all High findings closed; RG-001…RG-012 green; no silent lead loss; suspended users denied; RPC grants reduced.

--- 

## 5. Wave 2 — correctness, accessibility, SEO (this sprint)

| ID | Addresses | Change | Files | Effort | Risk | Verification |
|---|---|---|---|---|---|---|
| R-17 | BUG-002, UX-001 | Add a `< md` header: logo + menu button + sheet/drawer with the five links and CTA; focus trap, `aria-expanded`, Escape, scroll lock. | `components/navigation/Dock.tsx`, `app/globals.css` | M | Medium | RG-015/016 at 375/768/1440 |
| R-18 | UX-002 | Remove `body { overflow-x: hidden }`; fix the offending containers; add a CI overflow assertion. | `app/globals.css` | S | Low | `scrollWidth ≤ clientWidth + 1` on all routes |
| R-19 | A11Y-001 | Add persistent `<label>` (or `sr-only`) + `id`/`for` for all 8 fields; label the range slider and add `aria-valuetext`. | `app/scoping/page.tsx`, `app/flow-hq/page.tsx`, `app/client/page.tsx` | S | Low | axe 0 critical; RG-020 |
| R-20 | A11Y-002 | Replace `slate-500`/`slate-600` body text with `slate-400` (7.77:1) or lighter on `#07090E`/`#0D111A`. | 47 occurrences across `app/**/*.tsx` | S | Low | Contrast ≥ 4.5:1 recheck |
| R-21 | A11Y-003 | Add `focus-visible:ring-2 ring-cyan-400 ring-offset-2 ring-offset-[#07090E]`; keep border change as supplement. | 30+ inputs in the three consoles | S | Low | Keyboard walkthrough; RG-019 |
| R-22 | A11Y-004 | Give footer/list links `py-2`/`min-h-6 inline-flex` and ≥ 8 px spacing. | `components/navigation/Footer.tsx`, list components | S | Low | Target audit ≥ 24×24 |
| R-23 | A11Y-005 | Add a skip link and `<main id="main" tabIndex={-1}>`. | `app/layout.tsx` | S | Low | First Tab reveals skip link |
| R-24 | SEO-001 | Generate `sitemap.xml` from the route manifest: non-trailing-slash, include `/scoping`, drop the 12 dead URLs, add `lastmod`. | `sitemap.xml`, build script | S | Low | RG-024: 0 non-200 |
| R-25 | SEO-002 | Add `alternates.canonical` to every route (absolute `www` URL). | `app/layout.tsx`, all `page.tsx`/`layout.tsx` | S | Low | 1 canonical per page |
| R-26 | SEO-003 | Give `/scoping` its own metadata via a server layout; add `Organization` + `WebSite` JSON-LD, `Service` on service pages, `Article` on posts, `BreadcrumbList` on nested routes. | `app/scoping/layout.tsx` (new), `app/layout.tsx`, blog pages | M | Low | RG-025 |
| R-27 | SEO-004 | Per-route OG images at 1200×630 with `og:image:alt`; add article timestamps/author. | `app/**/page.tsx`, `assets/` | M | Low | Social preview check |
| R-28 | BUG-003 | Remove the fabricated certificate; serve deliverables from Supabase Storage with signed URLs, or label the file explicitly as a sample. | `app/client/page.tsx` `handleDownloadAsset` | S | Low | RG-017 |
| R-29 | BUG-004 | Initialise leads to `[]`; render an empty state and an error banner; never ship demo PII in production bundles. | `app/flow-hq/page.tsx` `DEFAULT_LEADS` | S | Low | RG-018 |
| R-30 | BUG-006 | Remove the NXDOMAIN staging default; store a real per-project preview URL or render "not yet deployed". | `app/client/page.tsx`, `app/flow-hq/page.tsx` | S | Low | Link resolves or is absent |

**Wave 2 exit gate:** mobile navigation usable; no overflow; axe 0 critical/serious; sitemap/metadata green;
no fabricated deliverables or demo leads.

--- 

## 6. Wave 3 — architecture, performance, process (next sprint)

| ID | Addresses | Change | Files | Effort | Risk | Verification |
|---|---|---|---|---|---|---|
| R-31 | BUG-005 | Decide: wire the consoles to the existing schema (Auth + RLS + PostgREST/Realtime) **after** Wave 0/1, or remove them from the public deployment. Do not leave a half-wired demo. | `app/flow-hq`, `app/client`, `supabase/migrations` | L | High | Full UAT; data survives device change |
| R-32 | BUG-007 | Delete `/api/content`, `/api/settings`, `/api/track`, `/api/notify` unless wired; remove their env vars and docs. | `api/*`, `vercel.json`, `README.md` | S | Low | 404 on removed routes; no UI breakage |
| R-33 | SEC-011 | If `/api/settings` stays, return an explicit public projection only. | `api/settings.js` | S | Low | No non-public keys in response |
| R-34 | SEC-012 | Cap `Content-Length` at 100 KB, enforce `application/json`, validate shape. | `api/platform/[...path].js`, `api/notify.js` | S | Low | Oversized body → 413 |
| R-35 | OPS-006 | Tighten CSP: nonce/hash `script-src`, remove `'unsafe-eval'` if three.js allows, replace CDN allowlists with exact files or self-hosting. | `vercel.json` | M | Medium (breaks inline bootstrap) | CSP report-only → enforce |
| R-36 | PERF-001 | Dynamically import the three.js hero (`ssr: false`), load after first paint, consider a static poster on mobile/reduced motion. | `app/page.tsx`, `components/3d/HeroFlowBackground.tsx` | M | Medium | RG-026 bundle budget |
| R-37 | PERF-002 | Honour `prefers-reduced-motion`; pause on `visibilitychange`/off-screen; dispose geometry/material/texture. | `components/3d/HeroFlowBackground.tsx` | S | Low | Reduced-motion run shows a static frame |
| R-38 | PERF-003 | Move fonts to `next/font/google` (self-hosted, preloaded) or self-host WOFF2. | `app/layout.tsx` | S | Low | No third-party font request |
| R-39 | PERF-004, PERF-005 | Generate 1200×630 WebP/AVIF OG images; scale particle count by viewport/DPR and cap DPR at 1.5 on mobile. | `assets/`, `HeroFlowBackground.tsx` | M | Low | Visual check; bundle/image sizes |
| R-40 | OPS-001 | Add Vitest + Playwright + ESLint + GitHub Actions (`tsc`, lint, test, audit, build, e2e). | `package.json`, configs, `.github/workflows/ci.yml` | L | Low | CI green on a no-op PR |
| R-41 | OPS-002, OPS-007 | Replace `STATUS.md` and the SEO reports with generated, dated status; move history to `docs/history/`. | `STATUS.md`, `SEO-*.md` | S | Low | Commit hash matches HEAD |
| R-42 | OPS-004 | Align privacy policy with reality: disclose or delete analytics; document storage, retention, processors, contact. | `app/privacy-policy/page.tsx` | M | Low (legal review advised) | Policy matches endpoint inventory |
| R-43 | OPS-005 | Add Sentry (client + API) or log drains + uptime monitor; alert on lead-submit failure and webhook 401 spikes. | `package.json`, `api/*`, `app/*` | M | Low | Forced error produces an alert |
| R-44 | INFO-001 | Keep one webhook mount (`/api/github/webhook`) and redirect or remove the duplicate; document the canonical URL. | `vercel.json`, `api/platform/[...path].js` | S | Low | One documented endpoint |

**Wave 3 exit gate:** no dead endpoints; performance budget met; CI blocks regressions; docs match deployed
reality; monitoring proves failures are visible.

--- 

## 7. Per-change workflow (mandatory)

1. **Branch** — `fix/<finding-id>-<slug>` off `main`.
2. **Reproduce** — run the relevant test from `TEST_PLAN.md`; capture the failing output.
3. **Test first** — add the regression test (RG-xxx) and watch it fail.
4. **Change** — smallest diff that closes the finding; no drive-by refactors.
5. **Verify** — test passes, `tsc`, lint, build, and the manual check.
6. **Commit** — one finding per commit, message `fix(security): close SEC-001 …` with the ID.
7. **Deploy to preview** — run the UAT slice for that area.
8. **Production** — deploy, re-run the live check, update this log.
9. **Close** — mark the finding closed in `BUGS_AND_FINDINGS.md` with the commit and date.

--- 

## 8. Verification commands per wave

```powershell
# Static gates
npx tsc --noEmit --incremental false
npm run lint
npm run test -- --run
npm audit --audit-level=high
npm run build

# Live auth checks (after deploy)
# 1) Flow HQ must reject the old password
# 2) Client portal must reject an arbitrary email
# 3) Webhook must return 401 without a signature

# Sitemap health (Node, follows 308) — see TEST_PLAN.md §5
node scripts/check-sitemap.js

# Responsive
# 375/768/1440: document.documentElement.scrollWidth <= clientWidth + 1
# header.getBoundingClientRect(): left >= 0 && right <= viewport width

# Accessibility
npx axe http://localhost:4173 --exit
```

--- 

## 9. Rollback strategy

| Change type | Rollback |
|---|---|
| Client code | `git revert <commit>`; Vercel instant rollback to the previous deployment |
| API code | `git revert` + redeploy; functions are stateless |
| Env var / secret | Restore previous value in Vercel; redeploy; re-test the webhook/mail path |
| SQL migration | **Forward-fix** (preferred). Take a Supabase snapshot before Wave 1; restore only with owner approval |
| Dependency upgrade | Revert `package.json` + lockfile, `npm ci`, rebuild |
| Auth/session rewrite | Keep the old path behind a flag for one release; flip back if login failure rate spikes |

**Before any SQL migration:** create a Supabase snapshot and record the current function definitions:

```sql
select pg_get_functiondef('public.can_access_project(uuid)'::regprocedure);
select pg_get_functiondef('public.is_admin()'::regprocedure);
select pg_get_functiondef('public.create_notification(uuid,uuid,text,text,text,text)'::regprocedure);
```

--- 

## 10. Explicit non-goals

- No production database writes, backfills or destructive migrations during remediation without a snapshot
  and owner approval.
- No secret rotation performed by the auditor; the owner must rotate `GITHUB_WEBHOOK_SECRET`, the SMTP
  password and any credential that ever appeared in the public repo.
- No legal advice on the privacy policy; a qualified review is recommended.
- No load testing or external penetration testing without written authorization.
- No "big bang" rewrite; the plan is incremental and reversible.

--- 

## 11. Approval and sign-off

**Approval requested for:** the remediation plan only. No item will be executed until the owner replies with
an explicit instruction naming the wave or item IDs.

- [ ] Approve Wave 0 (R-01 … R-06)
- [ ] Approve Wave 1 (R-07 … R-16)
- [ ] Approve Wave 2 (R-17 … R-30)
- [ ] Approve Wave 3 (R-31 … R-44)
- [ ] Approve a subset: ______________________

| Role | Name | Decision | Date |
|---|---|---|---|
| Owner | | | |
| Engineering lead | | | |
| Reviewer | | | |

--- 

## 12. Post-remediation close-out (to be filled after work)

| Finding | Fix commit | Deployed | Verified by | Date | Status |
|---|---|---|---|---|---|
| SEC-001 | | | | | Open |
| SEC-002 | | | | | Open |
| SEC-003 | | | | | Open |
| SEC-004 | | | | | Open |
| SEC-005 | | | | | Open |
| SEC-006 | | | | | Open |
| SEC-007 | | | | | Open |
| SEC-008 | | | | | Open |
| SEC-009 | | | | | Open |
| SEC-010 | | | | | Open |
| SEC-011 | | | | | Open |
| SEC-012 | | | | | Open |
| SEC-013 | | | | | Open |
| SEC-014 | | | | | Open |
| SEC-015 | | | | | Open |
| BUG-001 | | | | | Open |
| BUG-002 | | | | | Open |
| BUG-003 | | | | | Open |
| BUG-004 | | | | | Open |
| BUG-005 | | | | | Open |
| BUG-006 | | | | | Open |
| BUG-007 | | | | | Open |
| UX-001 | | | | | Open |
| UX-002 | | | | | Open |
| A11Y-001 | | | | | Open |
| A11Y-002 | | | | | Open |
| A11Y-003 | | | | | Open |
| A11Y-004 | | | | | Open |
| A11Y-005 | | | | | Open |
| PERF-001 | | | | | Open |
| PERF-002 | | | | | Open |
| PERF-003 | | | | | Open |
| PERF-004 | | | | | Open |
| PERF-005 | | | | | Open |
| SEO-001 | | | | | Open |
| SEO-002 | | | | | Open |
| SEO-003 | | | | | Open |
| SEO-004 | | | | | Open |
| OPS-001 | | | | | Open |
| OPS-002 | | | | | Open |
| OPS-003 | | | | | Open |
| OPS-004 | | | | | Open |
| OPS-005 | | | | | Open |
| OPS-006 | | | | | Open |
| OPS-007 | | | | | Open |
| INFO-001 | | | | | Open |

--- 

*End of `REMEDIATION_LOG.md`. Awaiting explicit approval. Nothing has been implemented.*