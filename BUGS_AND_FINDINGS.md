# BUGS_AND_FINDINGS.md

**Project:** The Flow Labs (`www.theflowlabs.online`)
**Repository:** `E:\research\FLOWW LABS` — `main` @ `30d0fb1`
**Audit date:** 25 November 2026
**Companion documents:** `AUDIT_REPORT.md` (executive), `SECURITY_REPORT.md` (security detail), `TEST_PLAN.md`, `REMEDIATION_LOG.md`

> **Audit-only document.** No application file, configuration, database object, test or deployment was changed.
> Every finding below states its **confidence**: **Confirmed** (reproduced or directly observed), **Probable**
> (certain from source, production precondition not exercised) or **Unverified** (needs a follow-up test and is
> *not* counted in the totals).

---

## 1. How to read this document

### Severity

| Severity | Meaning |
|---|---|
| **Critical** | Exploitable now, or causes immediate loss of confidentiality/integrity/availability. Fix before anything else. |
| **High** | Realistic abuse or material business harm; needs a fix this week. |
| **Medium** | Weakens defence-in-depth, misleads users, or degrades a core quality attribute; fix this sprint. |
| **Low** | Hygiene, polish, or documentation accuracy; schedule it. |
| **Informational** | Not a defect. Context for maintainers. |

### ID scheme

| Prefix | Area | Detailed in |
|---|---|---|
| `SEC-###` | Authentication, access control, API, database, privacy | `SECURITY_REPORT.md` |
| `BUG-###` | Functional / business-logic defects | this file |
| `UX-###` | UI/UX and responsive layout | this file |
| `A11Y-###` | Accessibility | this file |
| `PERF-###` | Performance | this file |
| `SEO-###` | Search / metadata | this file |
| `OPS-###` | DevOps, process, documentation | this file |
| `INFO-###` | Informational | this file |

---

## 2. Master index (45 findings + 1 informational)

| ID | Title | Severity | Confidence | Area |
|---|---|---|---|---|
| SEC-001 | Hard-coded Flow HQ backdoor (`flowlabs2026`) grants Owner | **Critical** | Confirmed | Auth |
| SEC-002 | Client portal authenticates any email longer than 3 characters | **Critical** | Confirmed | Auth |
| SEC-003 | GitHub webhook accepts unsigned events | **Critical** | Confirmed | Auth |
| SEC-004 | Public signup + `user_metadata.role` allows self-assigned owner profile | **High** | Probable | Auth |
| SEC-007 | SSRF filter bypass in `/api/audit` | **High** | Confirmed (filter) | API |
| SEC-008 | Email relay abuse: unauthenticated `/api/notify`, any-user `/api/platform/notify`, nodemailer CVEs | **High** | Confirmed (code) | API |
| SEC-013 | Suspending a user does not revoke project access | **High** | Confirmed (code) | Database |
| SEC-014 | Over-granted `SECURITY DEFINER` RPCs (`create_notification`, `record_github_delivery`, `log_github_activity`) | **High** | Confirmed (code) | Database |
| BUG-001 | Scoping form reports success when the lead insert fails | **High** | Confirmed | Business logic |
| BUG-002 | Mobile navigation is 555 px wide in a 375 px viewport and clipped | **High** | Confirmed | UI/UX |
| SEC-005 | Flow HQ promotes any Supabase session to `Owner` client-side | Medium | Confirmed (code) | Auth |
| SEC-006 | Portal sessions live only in `localStorage`; no expiry or revocation | Medium | Confirmed | Auth |
| SEC-009 | `Access-Control-Allow-Origin: *` on the authenticated platform API | Medium | Confirmed | API |
| SEC-010 | In-memory rate limiting is ineffective on serverless | Medium | Confirmed (code) | API |
| SEC-015 | `is_admin()` allowlist fallback plus personal Gmail seeded as admin | Medium | Confirmed (code) | Database |
| BUG-003 | "Download deliverable" fabricates a verified completion certificate | Medium | Confirmed | Business logic |
| BUG-004 | Flow HQ falls back to three fake leads, masking CRM/load failure | Medium | Confirmed | Business logic |
| BUG-005 | Backend is unwired: 7 migrations, storage and realtime unused; data lost on cache clear | Medium | Confirmed | Business logic |
| A11Y-001 | 8 unlabeled form fields across `/scoping`, `/flow-hq`, `/client` | Medium | Confirmed | Accessibility |
| A11Y-002 | Text contrast below 4.5:1 (`slate-500` 4.18/3.97, `slate-600` 2.63) | Medium | Confirmed | Accessibility |
| A11Y-003 | `focus:outline-none` on 30+ inputs with only a 1 px border change | Medium | Confirmed | Accessibility |
| A11Y-004 | 14–17 tap targets per page smaller than 24×24 px | Medium | Confirmed | Accessibility |
| PERF-001 | 955 KB of uncompressed JS across 9 scripts; 482 KB largest chunk | Medium | Confirmed | Performance |
| PERF-002 | 3D hero has no `prefers-reduced-motion`; partial GPU disposal; permanent rAF | Medium | Confirmed | Performance |
| SEO-001 | Sitemap: 12 of 24 URLs return 404; `/scoping` missing; trailing-slash hops | Medium | Confirmed | SEO |
| SEO-002 | No canonical URL on any page | Medium | Confirmed | SEO |
| SEO-003 | `/scoping` inherits homepage title/description; no JSON-LD anywhere | Medium | Confirmed | SEO |
| OPS-001 | No automated tests, CI pipeline or lint configuration | Medium | Confirmed | DevOps |
| OPS-002 | `STATUS.md` describes a different codebase state | Medium | Confirmed | DevOps |
| OPS-003 | Public GitHub repository exposes auth logic, demo credentials and internal docs | Medium | Confirmed | DevOps |
| OPS-004 | Privacy policy contradicts the deployed tracking endpoint | Medium | Confirmed | DevOps |
| OPS-005 | No monitoring; failures are swallowed with `console.warn` | Medium | Confirmed | DevOps |
| OPS-006 | CSP allows `'unsafe-inline'` and `'unsafe-eval'` | Medium | Confirmed | DevOps |
| BUG-006 | `staging.theflowlabs.online` is NXDOMAIN but is the default staging URL | Low | Confirmed | Business logic |
| BUG-007 | Four deployed API endpoints are unused by the UI | Low | Confirmed | Business logic |
| UX-001 | No mobile navigation pattern (no menu, drawer or collapse) | Low | Confirmed | UI/UX |
| UX-002 | `body { overflow-x: hidden }` hides layout overflow instead of fixing it | Low | Confirmed | UI/UX |
| A11Y-005 | No skip link; `<main>` has no accessible name | Low | Confirmed | Accessibility |
| PERF-003 | Render-blocking Google Fonts stylesheet; no `next/font` | Low | Confirmed | Performance |
| PERF-004 | Single 182 KB 1440×900 PNG used as the site-wide OG image | Low | Confirmed | Performance |
| PERF-005 | 2,800-particle grid rendered at up to 2× DPR on every frame | Low | Confirmed | Performance |
| SEO-004 | No per-page social image; no `Article`/`Breadcrumb` metadata | Low | Confirmed | SEO |
| OPS-007 | SEO documents claim canonical/JSON-LD/26-URL sitemap that are not live | Low | Confirmed | DevOps |
| SEC-011 | `/api/settings` exposes the full settings object publicly | Low | Confirmed | API |
| SEC-012 | No application-level request-body size cap | Low | Confirmed (code) | API |
| INFO-001 | Two webhook mounts share one handler | Informational | Confirmed | API |

**Totals:** 3 Critical · 7 High · 23 Medium · 12 Low · **45 findings** (+1 informational).

---

## 3. Functional and business-logic findings

### BUG-001 — Scoping form reports success when the lead insert fails

| Field | Value |
|---|---|
| **Severity** | High |
| **Confidence** | Confirmed (source) |
| **Area** | Business logic / revenue funnel |
| **Files** | `app/scoping/page.tsx` lines 55–81 |
| **Route** | `/scoping` |

**Evidence.** The submit handler inserts into Supabase, logs the error, and then unconditionally sets the
success state:

```ts
const { error } = await supabase.from('site_leads').insert([payload]);
if (error) {
  console.warn('Supabase lead submit notice:', error);   // logged only
}
setSubmitted(true);                                      // always runs
...
} catch (err: any) {
  console.error('Lead submission fallback:', err);
  setSubmitted(true);                                    // always runs
}
```

**Reproduction.**
1. Open `/scoping`, complete the configurator, submit.
2. Block `*.supabase.co` in DevTools (or use an offline profile) and submit again.
3. The UI still shows the "Scope received" success panel. No row exists in `site_leads`.

**Root cause.** Error handling is advisory (`console.warn`) and the success flag is outside any
error branch. There is also no retry, no local queue, and no fallback notification call.

**Impact.** Every failed insert is a silently lost inbound lead — the highest-value conversion on the site.
The owner has no way to know a submission happened. With `mailer_autoconfirm=false` and an unmonitored
project, RLS or network failures are plausible in normal operation.

**Fix.** Only set `submitted` on `!error`; on failure show an inline error with a retry and a mailto/WhatsApp
fallback; optionally call `/api/notify` as a secondary channel; log a structured event.

---

### BUG-002 — Mobile navigation is 555 px wide in a 375 px viewport and clipped

| Field | Value |
|---|---|
| **Severity** | High |
| **Confidence** | Confirmed (measured) |
| **Area** | Responsive layout / navigation |
| **Files** | `components/navigation/Dock.tsx` lines 30–78; `app/globals.css` `body { overflow-x: hidden }` |
| **Routes** | All public pages |

**Evidence.** Measured inside a same-origin 375 px iframe against the local `out/` build (built from
`30d0fb1`):

| Route | Header width | Header left | Header right | Frame | `documentElement.scrollWidth` |
|---|---|---|---|---|---|
| `/` | 555 px | −97 px | 457 px | 375 px | 360 px |
| `/services` | 556 px | −98 px | 458 px | 375 px | 360 px |
| `/work` | 556 px | −98 px | 458 px | 375 px | 360 px |
| `/blog` | 555 px | −98 px | 458 px | 375 px | 360 px |
| `/blog/[slug]` | 555 px | −98 px | 458 px | 375 px | 360 px |

The dock is a single non-wrapping `flex` row: logo (126 px) + 5 nav links (335 px) + CTA (121 px) with
`gap-3`, `px-4`, inside `fixed left-0 right-0 flex justify-center`. It cannot shrink below its content, so
it is centred and overflows both edges. `body { overflow-x: hidden }` removes the scrollbar, so the
overflow is invisible and the right-hand links are unreachable by touch.

**Reproduction.** Load any public page at 375 px width (device toolbar). Observe the logo clipped on the
left and the "Start a build" CTA clipped on the right; horizontal scrolling is disabled.

**Root cause.** Desktop-only navigation; no breakpoint, no hamburger/drawer, no `flex-wrap`, no
`max-w-[calc(100vw-2rem)]`.

**Impact.** Mobile visitors cannot reach `/blog`, `/scoping` or the primary CTA from the header. This is a
conversion and navigation failure on the majority of real traffic.

**Fix.** Add a `< md` breakpoint: logo + menu button, full-screen or sheet menu with the five links and
CTA; keep the pill dock for `md+`. Remove the `overflow-x: hidden` crutch after the layout is fixed.

---

### BUG-003 — "Download deliverable" fabricates a verified completion certificate

| Field | Value |
|---|---|
| **Severity** | Medium |
| **Confidence** | Confirmed (live bundle + source) |
| **Area** | Business logic / client trust |
| **Files** | `app/client/page.tsx` `handleDownloadAsset` (added in `30d0fb1`) |
| **Route** | `/client` (after login) |

**Evidence.** The button no longer shows an `alert`; it builds a Markdown file client-side containing:

```
CONFIDENTIAL & ENCRYPTED DELIVERABLE SPECIFICATION
THE FLOW LABS STUDIO DELIVERY OS - HIGH ASSURANCE
This verified deliverable confirms technical milestone completion ...
```

The live client chunk (`page-c74d127b97cdfc52.js`) contains the string
`CONFIDENTIAL & ENCRYPTED DELIVERABLE SPECIFICATION`, so this is deployed.

**Impact.** Any visitor who passes the trivial portal login (SEC-002) can download a document that asserts
milestone completion for a project that does not exist. It is not encrypted, not verified, and not linked
to any stored artifact. This is a misrepresentation risk with clients and a credibility risk if forwarded.

**Fix.** Remove until deliverables are served from Supabase Storage with signed URLs and real metadata, or
label the file explicitly as a demo/sample.

---

### BUG-004 — Flow HQ falls back to three fake leads, masking CRM/load failure

| Field | Value |
|---|---|
| **Severity** | Medium |
| **Confidence** | Confirmed |
| **Area** | Business logic / data integrity |
| **Files** | `app/flow-hq/page.tsx` `DEFAULT_LEADS` (added in `30d0fb1`), `loadLeads()` lines 388–413 |
| **Route** | `/flow-hq` |

**Evidence.** State initialises to `DEFAULT_LEADS` (three leads with names, company emails and ₹ budgets),
and `loadLeads()` only replaces them when the query succeeds **and** returns at least one row:

```ts
if (data && !error && data.length > 0) {
  setLeads(data);
  persistState('flow_hq_leads', data);
}
```

The backdoor login path (SEC-001) creates no Supabase session, so the authenticated select fails or
returns zero rows and the fake pipeline remains on screen. The live HQ bundle contains
`Vikramaditya Patnaik` and `odishalogistics`, confirming deployment.

**Impact.** A founder using the fallback login sees a plausible CRM with invented leads and budgets and
cannot distinguish "no leads" from "load failed". Real lead data is also shipped in a public JS bundle
(SEC-011/SEC-005 cluster).

**Fix.** Start from `[]`, render an explicit empty state and a visible error banner on failure; never ship
customer-shaped demo data in production bundles.

---

### BUG-005 — Backend is unwired; data is lost when browser storage is cleared

| Field | Value |
|---|---|
| **Severity** | Medium |
| **Confidence** | Confirmed |
| **Area** | Business logic / architecture |
| **Files** | `app/flow-hq/page.tsx`, `app/client/page.tsx`, `supabase/migrations/0001`–`0007` |
| **Routes** | `/flow-hq`, `/client` |

**Evidence.** The two consoles read and write `localStorage` keys (`flow_hq_projects`, `flow_hq_tasks`,
`flow_hq_clients`, `flow_hq_leads`, `flow_active_client_session`, …). The only Supabase calls are
`site_leads` insert (`/scoping`) and `site_leads` select (`/flow-hq`). Seven migrations defining
`projects`, `tasks`, `project_members`, `client_updates`, `notifications`, `activity`, storage buckets and
realtime are never used by the application.

**Impact.** Projects, tasks, clients, standups and portal sessions are per-browser. Clearing site data,
switching device or using a private window destroys the studio's operating record. Nothing is shared
between the three founders. There is no audit trail.

**Fix.** Either wire the UI to the existing schema (Supabase Auth + RLS + PostgREST) or remove the
console from the public deployment until it is real. Do not present demo state as persisted data.

---

### BUG-006 — `staging.theflowlabs.online` is NXDOMAIN but is the default staging URL

| Field | Value |
|---|---|
| **Severity** | Low |
| **Confidence** | Confirmed |
| **Area** | Business logic / content |
| **Files** | `app/client/page.tsx` lines 166, 198; `app/flow-hq/page.tsx` |
| **Routes** | `/client`, `/flow-hq` |

**Evidence.** `nslookup staging.theflowlabs.online` → "The remote name could not be resolved". The string is
assigned to every custom client session and to clients created from HQ.

**Impact.** "View staging" links in the portal lead nowhere. A client clicking them sees a browser error,
which reads as an outage.

**Fix.** Remove the default, or point it at a real preview deployment per project and render "not yet
deployed" when absent.

---

### BUG-007 — Four deployed API endpoints are unused by the UI

| Field | Value |
|---|---|
| **Severity** | Low |
| **Confidence** | Confirmed |
| **Area** | Business logic / surface area |
| **Files** | `api/content.js`, `api/settings.js`, `api/track.js`, `api/notify.js` |
| **Routes** | `/api/content`, `/api/settings`, `/api/track`, `/api/notify` |

**Evidence.** `out/index.html` contains no reference to `site-track`, `site.config`, `site-cms` or
`site.js`. A repository-wide grep for `/api/content`, `/api/settings`, `/api/track` and `/api/notify`
inside `app/` and `components/` returns no matches. Live checks: `GET /api/content?page=home` → `200 {}`;
`GET /api/settings` → `200` with the full settings JSON; `GET /api/notify` → `405`.

**Impact.** Dead endpoints still cost cold starts, expand the attack surface, and imply a CMS that is not
connected. `/api/notify` in particular is an unauthenticated mail sender (SEC-008).

**Fix.** Delete them, or wire them and document the contract. Prefer deletion for `/api/notify` and
`/api/track` unless analytics is a deliberate decision.

---

## 4. UI/UX findings

### UX-001 — No mobile navigation pattern

| Field | Value |
|---|---|
| **Severity** | Low (design root cause of BUG-002) |
| **Confidence** | Confirmed |
| **Area** | UI/UX |
| **Files** | `components/navigation/Dock.tsx` |

**Evidence.** The component has one layout for every viewport. There is no menu button, no `aria-expanded`
control, no drawer, and no `md:`/`lg:` variant. The `nav` is always rendered inline.

**Impact.** Even after the overflow is fixed, five links plus a CTA will not fit comfortably at 375 px
without a disclosure pattern. Fixing width alone will produce 10–11 px text.

**Fix.** Introduce a mobile menu with a focus trap, `aria-expanded`, Escape to close, and body-scroll lock.

---

### UX-002 — `body { overflow-x: hidden }` hides layout overflow

| Field | Value |
|---|---|
| **Severity** | Low |
| **Confidence** | Confirmed |
| **Area** | UI/UX / QA |
| **Files** | `app/globals.css` lines 18–22 |

**Evidence.** `overflow-x: hidden` is set on `body`. At 375 px, `documentElement.scrollWidth` is 360 px
while the header spans −97…457 px. The overflow is clipped rather than resolved.

**Impact.** The defect is invisible to visual QA and to automated "is there a horizontal scrollbar" checks.
It also masks future overflow regressions anywhere on the site.

**Fix.** Remove the property; fix the offending containers; add a CI check asserting
`scrollWidth <= clientWidth + 1` at 375/768/1440.

---

## 5. Accessibility findings

Measurements were taken in a same-origin iframe harness at 375, 768 and 1440 px. Contrast ratios were
computed from the Tailwind hex values actually used (no opacity stacking), using the WCAG relative-luminance
formula.

### A11Y-001 — Eight unlabeled form fields

| Field | Value |
|---|---|
| **Severity** | Medium |
| **Confidence** | Confirmed |
| **Files** | `app/scoping/page.tsx`, `app/flow-hq/page.tsx`, `app/client/page.tsx` |
| **Routes** | `/scoping`, `/flow-hq`, `/client` |

**Evidence.** Fields with no `<label for>`, no wrapping `<label>`, no `aria-label` and no
`aria-labelledby`:

| Route | Count | Fields |
|---|---|---|
| `/scoping` | 4 | `input[type=range]` (budget/timeline slider), "Your name", "Work email or WhatsApp", requirements `textarea` |
| `/flow-hq` | 2 | email, password |
| `/client` | 2 | email, access key |

Placeholders are used as the only visible label. Placeholders disappear on input and are not reliably
announced as names by all screen readers.

**Impact.** Screen-reader users hear "edit text" with no purpose; voice-control users cannot target fields
by name. WCAG 2.2 SC 1.3.1, 3.3.2, 4.1.2.

**Fix.** Add persistent `<label>` elements (visible or `sr-only`), `id`/`for` pairs, and `aria-describedby`
for hints/errors. Label the range slider and expose its value with `aria-valuetext`.

---

### A11Y-002 — Contrast below 4.5:1

| Field | Value |
|---|---|
| **Severity** | Medium |
| **Confidence** | Confirmed (computed) |
| **Files** | 47 occurrences of `text-slate-500`/`text-slate-600` across `app/**/*.tsx` |
| **Routes** | All |

**Evidence.**

| Token | Hex | Background | Ratio | AA normal text |
|---|---|---|---|---|
| `slate-500` | `#64748B` | `#07090E` | **4.18:1** | Fail |
| `slate-500` | `#64748B` | `#0D111A` (dock/cards) | **3.97:1** | Fail |
| `slate-600` | `#475569` | `#07090E` | **2.63:1** | Fail |
| `slate-400` | `#94A3B8` | `#07090E` | 7.77:1 | Pass |
| `slate-300` | `#CBD5E1` | `#07090E` | 13.41:1 | Pass |

Used for timestamps, field hints, footer meta, "Live feed" labels and 10–11 px mono text — all small, so
the 4.5:1 threshold applies (3:1 large-text exception does not).

**Impact.** Low-vision users cannot read secondary information; several failures are on form hints, which
increases input errors.

**Fix.** Replace `slate-500` with `slate-400` on the dark background, and `slate-600` with `slate-400/500`
only where it is decorative. Verify with a contrast checker after the change.

---

### A11Y-003 — Removed focus outlines

| Field | Value |
|---|---|
| **Severity** | Medium |
| **Confidence** | Confirmed |
| **Files** | 30+ inputs with `focus:outline-none` (e.g. `app/client/page.tsx:293,304`, `app/scoping/page.tsx:235,245,254`) |
| **Routes** | `/scoping`, `/flow-hq`, `/client` |

**Evidence.** Every input pairs `focus:outline-none` with `focus:border-white/30` — a 1 px border colour
change from `white/10` to `white/30` on a near-black field. No `focus-visible:ring`, no offset, no
high-contrast indicator. Keyboard focus is effectively invisible, especially at 10–12 px text sizes.

**Impact.** WCAG 2.2 SC 2.4.7 (Focus Visible) and 2.4.11 (Focus Appearance). Keyboard and switch users lose
their position.

**Fix.** Use `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400
focus-visible:ring-offset-2 focus-visible:ring-offset-[#07090E]` and keep the border change as a
supplement.

---

### A11Y-004 — Tap targets smaller than 24×24 px

| Field | Value |
|---|---|
| **Severity** | Medium |
| **Confidence** | Confirmed (measured) |
| **Files** | `components/navigation/Footer.tsx`, `components/navigation/Dock.tsx`, list links |
| **Routes** | `/` (16), `/services` (14), `/work` (14), `/blog` (17), `/blog/[slug]` (15), `/scoping` (14) |

**Evidence.** Interactive elements with a rendered box under 24 px in either dimension. Most are footer and
inline list links rendered at 16 px height (e.g. "Interfaces" 56×16, "Cloud and backend systems" 157×16).
Dock nav links are 26–30 px tall and pass, but the footer column does not.

**Impact.** WCAG 2.2 SC 2.5.8 (Target Size Minimum, AA). Touch users on phones mis-tap adjacent links.

**Fix.** Give footer/list links `py-2` (≥24 px), or `min-h-6 inline-flex items-center`, and keep ≥8 px
spacing between adjacent targets.

---

### A11Y-005 — No skip link; `<main>` has no accessible name

| Field | Value |
|---|---|
| **Severity** | Low |
| **Confidence** | Confirmed |
| **Files** | `app/layout.tsx` line 43 |
| **Routes** | All |

**Evidence.** `document.querySelector('main').id` → `null`; no `a[href="#main"]` or `a[href="#content"]`;
`main` has no `aria-label`. The dock precedes `main` with five links plus a CTA on every page.

**Impact.** Keyboard users must tab through the entire header on every navigation. WCAG 2.2 SC 2.4.1
(Bypass Blocks).

**Fix.** `<a href="#main" className="sr-only focus:not-sr-only …">Skip to content</a>` and
`<main id="main" tabIndex={-1}>`.

---

## 6. Performance findings

> No Lighthouse/PSI score is claimed. Google PSI returned HTTP 429 (shared keyless quota) and the in-browser
> Lighthouse run exceeded 60 s. The numbers below are measured from the build output and source.

### PERF-001 — 955 KB of uncompressed JavaScript across 9 scripts

| Field | Value |
|---|---|
| **Severity** | Medium |
| **Confidence** | Confirmed (file sizes) |
| **Files** | `out/index.html` script tags; `components/3d/HeroFlowBackground.tsx` |
| **Route** | `/` |

**Evidence.** Sum of the 9 unique `/_next/static/**/*.js` files referenced by `out/index.html`:
**955 KB uncompressed**. Largest chunks: 482 KB (`b536a0f1…`), 170 KB (`255…`), 169 KB (`4bd1b696…`),
110 KB polyfills. The 482 KB chunk is pulled in by the three.js hero.

**Impact.** On a mid-range Android phone over 4G, parse/compile dominates and delays interactivity. The
hero is decorative and blocks the main thread during initialisation.

**Fix.** `dynamic(() => import('@/components/3d/HeroFlowBackground'), { ssr: false })` so three.js loads
after first paint; consider a static poster for reduced-motion/mobile; audit whether the 482 KB chunk can
be split.

---

### PERF-002 — 3D hero ignores reduced motion; partial disposal

| Field | Value |
|---|---|
| **Severity** | Medium |
| **Confidence** | Confirmed |
| **Files** | `components/3d/HeroFlowBackground.tsx` |
| **Route** | `/` |

**Evidence.**
- No `window.matchMedia('(prefers-reduced-motion: reduce)')` anywhere in the component.
- `requestAnimationFrame(render)` runs continuously (line 144), independent of scroll or visibility.
- Cleanup cancels the frame, disconnects the observer, removes listeners and calls `renderer.dispose()`
  (lines 186–193), but does **not** dispose `geometry`, `material` or the canvas textures.
- `setPixelRatio(Math.min(devicePixelRatio, 2))` with a 70×40 = **2,800**-point grid.

**Impact.** Users who request reduced motion still get a moving full-screen animation (WCAG 2.3.3,
vestibular safety). Repeated mount/unmount leaks GPU buffers. Continuous rAF drains battery on mobile.

**Fix.** Respect `prefers-reduced-motion` (render a static frame), pause when
`document.visibilityState === 'hidden'` or the canvas is off-screen, and dispose geometry/material/texture
in the cleanup.

---

### PERF-003 — Render-blocking Google Fonts stylesheet

| Field | Value |
|---|---|
| **Severity** | Low |
| **Confidence** | Confirmed |
| **Files** | `app/layout.tsx` lines 33–39 |

**Evidence.** Three families (DM Sans variable, JetBrains Mono 3 weights, Space Grotesk 4 weights) are
loaded via a `<link rel="stylesheet">` to `fonts.googleapis.com` in `<head>`, after two `preconnect` hints.
`display=swap` is present. This is a third-party CSS request on the critical path and a privacy/GDPR
consideration (IP sent to Google).

**Impact.** Adds a cross-origin round trip before text can render with the intended fonts; a FOUT is
likely. Self-hosting would remove both the latency and the third-party dependency.

**Fix.** Migrate to `next/font/google` (self-hosted, preloaded, `size-adjust` fallbacks) or self-host the
WOFF2 files.

---

### PERF-004 — Single 182 KB 1440×900 PNG used as the site-wide OG image

| Field | Value |
|---|---|
| **Severity** | Low |
| **Confidence** | Confirmed |
| **Files** | `assets/work-droovee.png`, `app/layout.tsx` line 16 |
| **Routes** | All |

**Evidence.** The file is 1440×900 and 182 KB; `openGraph.images` references only this file, and every
page inherits it. `icon-512.png` is 6 KB, `icon-180.png` is 2 KB. No `og:image:width/height/alt` or
per-page image is emitted.

**Impact.** Social previews are generic and crop poorly (1.6:1 vs the 1.91:1 recommendation). 182 KB is
larger than necessary for a PNG that could be WebP/AVIF.

**Fix.** Generate per-route OG images (e.g. `next/og` at build time or a static set), export at
1200×630, and add `og:image:alt`.

---

### PERF-005 — 2,800-particle grid at up to 2× DPR

| Field | Value |
|---|---|
| **Severity** | Low |
| **Confidence** | Confirmed |
| **Files** | `components/3d/HeroFlowBackground.tsx` lines 40–49 |
| **Route** | `/` |

**Evidence.** `cols = 70`, `rows = 40`, `numParticles = 2800`; `setPixelRatio(min(dpr, 2))`; every frame
updates positions and a line geometry.

**Impact.** On a 3× phone the effective buffer is 2× resolution; the per-frame CPU work is constant even
when nothing is visible. Combined with PERF-002 this is the main battery cost of the site.

**Fix.** Scale particle count by viewport width/DPR, cap DPR at 1.5 on mobile, and stop rendering when
off-screen.

---

## 7. SEO findings

### SEO-001 — Sitemap contains 12 dead URLs and omits `/scoping`

| Field | Value |
|---|---|
| **Severity** | Medium |
| **Confidence** | Confirmed |
| **Files** | `sitemap.xml` (24 `<loc>` entries) |
| **Route** | `/sitemap.xml` |

**Evidence.** Following redirects with a client that honours 308 (Node `https`):

- **24 URLs total, 12 resolve 200, 12 return 404.**
- 404s: `/lab-report`, `/services/ai-automation`, `/services/web-development`,
  `/services/custom-software-development`, `/services/ai-chatbot-development`, `/work/droovee`,
  `/work/drishti`, `/work/flowops`, `/work/interview-copilot`, `/work/bhuverify`, `/work/carbon-coach`,
  `/work/qr-platform`.
- Every URL is written with a trailing slash while `vercel.json` sets `cleanUrls: true` and
  `trailingSlash: false`, so each one takes a 308 hop before resolving.
- `/scoping` (a live, linked, conversion page) is **not** in the sitemap.

**Impact.** Search engines spend crawl budget on 404s and redirects; the highest-intent page is not
submitted. `lastmod` is not meaningful.

**Fix.** Generate the sitemap from the route manifest at build time, emit non-trailing-slash URLs, include
`/scoping`, drop deleted pages, and add `lastmod`. Submit the regenerated sitemap in Search Console.

---

### SEO-002 — No canonical URL on any page

| Field | Value |
|---|---|
| **Severity** | Medium |
| **Confidence** | Confirmed |
| **Files** | `app/layout.tsx`, all `app/**/page.tsx` |
| **Routes** | All 12 |

**Evidence.** `document.querySelector('link[rel=canonical]')` returned `null` on `/`, `/services`,
`/work`, `/about`, `/blog`, `/blog/[slug]`, `/scoping`, `/bhubaneswar`, `/privacy-policy`, `/terms`,
`/client`, `/flow-hq`. No `alternates.canonical` exists in any metadata export.

**Impact.** `theflowlabs.online`, `www.theflowlabs.online`, Vercel preview hosts and `cleanUrls`
variants can be indexed as duplicates. Link equity is split.

**Fix.** Set `alternates: { canonical: '/' }` per page (or a `metadataBase`-relative canonical helper),
always absolute, always the `www` host.

---

### SEO-003 — `/scoping` inherits homepage metadata; no structured data

| Field | Value |
|---|---|
| **Severity** | Medium |
| **Confidence** | Confirmed |
| **Files** | `app/scoping/page.tsx` (client component, no `metadata` export); `app/layout.tsx` |
| **Route** | `/scoping` |

**Evidence.** `out/scoping.html` title is
`The Flow Labs — Interfaces, Scaled Systems & Applied Intelligence` and the description is the homepage
description. The page is `'use client'`, so it cannot export `metadata`. Across all 12 routes,
`script[type="application/ld+json"]` count = **0**.

**Impact.** The scoping cockpit — the page that should rank for "custom software quote", "website cost
Bhubaneswar" and similar — has no unique title, description or social card. No `Organization`, `WebSite`,
`Service`, `Article` or `BreadcrumbList` entity is available to search or AI crawlers.

**Fix.** Move the page shell to a server component that exports `metadata`, or add a
`app/scoping/layout.tsx` with metadata. Add JSON-LD: `Organization` + `WebSite` site-wide, `Service` on
service pages, `Article` on blog posts, `BreadcrumbList` on nested routes.

---

### SEO-004 — No per-page social image or article metadata

| Field | Value |
|---|---|
| **Severity** | Low |
| **Confidence** | Confirmed |
| **Files** | `app/layout.tsx` |
| **Routes** | All |

**Evidence.** `og:image` and `twitter:image` are the same `work-droovee.png` on every route. Blog posts
emit no `article:published_time`, `article:author` or `og:type=article`. `twitter:card` is
`summary_large_image` with no per-page title/description override beyond the page title.

**Impact.** Shared links look identical, reducing click-through; article rich results are unavailable.

**Fix.** Per-route `openGraph.images` and `twitter` blocks; add article metadata from `lib/posts.ts`.

---

## 8. DevOps and documentation findings

### OPS-001 — No automated tests, CI or lint configuration

| Field | Value |
|---|---|
| **Severity** | Medium |
| **Confidence** | Confirmed |
| **Files** | repository root |

**Evidence.** No `*.test.*`, `*.spec.*`, Playwright, Jest or Vitest files (excluding `node_modules`,
`.next`, `out`). No `.github/workflows`. No ESLint config. `package.json` has no `test` or `lint` script
that runs a configured linter. TypeScript is the only automated gate (`tsc --noEmit` exits 0).

**Impact.** The three Critical auth bypasses and the silent lead-loss bug could all ship again unnoticed.
No regression protection for the fixes in `REMEDIATION_LOG.md`.

**Fix.** Add Vitest for unit logic (`normalizeUrl`, portal auth guard), Playwright for the critical flows
(scoping submit success/failure, portal login rejection, mobile nav), and a GitHub Actions workflow running
`tsc`, `lint`, `test`, `build`.

---

### OPS-002 — `STATUS.md` describes a different codebase state

| Field | Value |
|---|---|
| **Severity** | Medium |
| **Confidence** | Confirmed |
| **Files** | `STATUS.md` |
| **Route** | repository |

**Evidence.** `STATUS.md` states "Deployed state: `main` @ `83a817e`" and "All 8 planned redesign phases
(A through H) are 100% shipped, verified, and complete". Actual HEAD is `30d0fb1` (three commits later),
and the file still describes the legacy static `index.html`/`admin.js` architecture rather than the
Next.js app router build. It also claims webhook HMAC verification is complete, which is false in
production (SEC-003).

**Impact.** Anyone onboarding (human or AI) forms a wrong model of the system and may "fix" the wrong
tree. It is actively misleading about security posture.

**Fix.** Replace with a short, generated status: current commit, deploy URL, migration state, known gaps.
Delete phase-by-phase history into `docs/history/`.

---

### OPS-003 — Public GitHub repository exposes auth logic, demo credentials and internal docs

| Field | Value |
|---|---|
| **Severity** | Medium |
| **Confidence** | Confirmed |
| **Files** | entire repository |
| **Route** | `github.com/fresherscomputersc-hash/Flow-Labs` |

**Evidence.** GitHub API: `visibility=public`, `private=false`, `pushed_at=2026-11-25T06:15:32Z`,
`size=2478` KB. The repository contains the Flow HQ backdoor, the client portal bypass, demo client
credentials (`DRV-CLIENT-9842`), the lead schema, internal planning docs (`SITE-V2-PLAN.md`,
`PLATFORM-PLAN.md`, `SUPABASE-SETUP.md`) and `_legacy_v1/` admin code. No service-role key or private key
was found in tracked files.

**Impact.** Attackers get a free architecture map and the exact bypass strings. Security-by-obscurity is
not a control, but publishing the exploit removes all effort.

**Fix.** Make the repository private, or split the deployable app into a private repo and keep only a
public marketing/docs repo. Rotate any credential that was ever committed.

---

### OPS-004 — Privacy policy contradicts the deployed tracking endpoint

| Field | Value |
|---|---|
| **Severity** | Medium |
| **Confidence** | Confirmed |
| **Files** | `app/privacy-policy/page.tsx`, `api/track.js` |
| **Routes** | `/privacy-policy`, `/api/track` |

**Evidence.** The policy says "We do not use third-party tracking cookies or surveillance analytics" and
lists only inquiry data. `api/track.js` exists, writes to `site_visitors` with a service key, and is
documented in `README.md`. The policy does not mention `localStorage` sessions, lead retention, Supabase
as a processor, or the SMTP provider. `api/track` is not called by the current UI (BUG-007), but it is
deployed and reachable.

**Impact.** A privacy statement that is narrower than the deployed capability is a compliance risk (India
DPDP Act 2023, GDPR if EU visitors are targeted) and a trust risk.

**Fix.** Either delete `/api/track` and the `site_visitors` table, or disclose analytics, retention and
processors. Add a cookie/storage table and a contact for data requests.

---

### OPS-005 — No monitoring; failures are swallowed

| Field | Value |
|---|---|
| **Severity** | Medium |
| **Confidence** | Confirmed |
| **Files** | `app/scoping/page.tsx`, `app/flow-hq/page.tsx`, `app/client/page.tsx`, `api/*` |
| **Routes** | All |

**Evidence.** Error paths use `console.warn`, `console.error` or empty `catch {}`. There is no Sentry,
no log drain, no uptime check, no alerting. `BUG-001` is the direct consequence: a failed insert produces
no signal anywhere the owner looks.

**Impact.** Outages and data loss are discovered by customers, not by the team.

**Fix.** Add Sentry (or Vercel log drains + a hosted uptime monitor) for client and server; emit a
structured event on lead-submit failure and alert on it.

---

### OPS-006 — CSP allows `'unsafe-inline'` and `'unsafe-eval'`

| Field | Value |
|---|---|
| **Severity** | Medium |
| **Confidence** | Confirmed |
| **Files** | `vercel.json` |
| **Route** | all responses |

**Evidence.** Live header:
`script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net https://cdnjs.cloudflare.com https://static.cloudflareinsights.com`.
`style-src` also allows `'unsafe-inline'`.

**Impact.** The CSP cannot mitigate injected inline script or `eval`-based payloads. Combined with
`localStorage`-trusted sessions (SEC-006), any XSS becomes full portal/HQ takeover. `cdn.jsdelivr.net` and
`cdnjs.cloudflare.com` are broad third-party script allowlists.

**Fix.** Move to nonce/hash-based `script-src` (Next.js supports nonces with a custom document or
middleware, though static export constrains this), remove `'unsafe-eval'` if three.js does not require it,
and replace the CDN allowlists with exact files or self-hosting.

---

### OPS-007 — SEO documents claim work that is not live

| Field | Value |
|---|---|
| **Severity** | Low |
| **Confidence** | Confirmed |
| **Files** | `SEO-AUDIT.md`, `SEO-IMPLEMENTATION-REPORT.md` |
| **Route** | repository |

**Evidence.** `SEO-AUDIT.md` marks "No canonical URL" and "No structured data" as **Implemented**.
`SEO-IMPLEMENTATION-REPORT.md` claims "Sitemap: 26 URLs — every page has unique title, description,
canonical (trailing slash), og image, and correct JSON-LD" and references `tools/site/build.py` as the
single source generator. Live reality: **0 canonical tags, 0 JSON-LD blocks, 24 sitemap URLs (12 of them
404)**, and the deployed app is Next.js, not the Python generator.

**Impact.** Stakeholders believe SEO work is done; the remaining gaps are invisible in planning.

**Fix.** Mark these documents as historical, add a "verified live" date and evidence to any SEO claim, and
keep a single current `docs/seo-status.md` generated from the build.

---

## 9. Security findings (cross-reference)

Detailed write-ups, evidence, reproduction steps, OWASP 2025 mapping and fixes are in
**`SECURITY_REPORT.md`**. Summary:

| ID | Severity | One-line |
|---|---|---|
| SEC-001 | Critical | `flowlabs2026` / any `theflowlabs` email → Owner in Flow HQ |
| SEC-002 | Critical | Any email >3 chars opens the client portal |
| SEC-003 | Critical | Unsigned GitHub webhook returns 200 and processes events |
| SEC-004 | High | Signup metadata can set `role=owner` |
| SEC-005 | Medium | Any Supabase session is labelled Owner client-side |
| SEC-006 | Medium | Portal identity is `localStorage` only |
| SEC-007 | High | SSRF bypass via `localhost.` / `localtest.me` |
| SEC-008 | High | Mail relay abuse + nodemailer 6.9.16 CVEs |
| SEC-009 | Medium | CORS `*` on authenticated platform API |
| SEC-010 | Medium | In-memory rate limits reset per lambda |
| SEC-011 | Low | `/api/settings` exposes all settings |
| SEC-012 | Low | No body-size cap |
| SEC-013 | High | Suspended users keep project access |
| SEC-014 | High | Over-granted SECURITY DEFINER RPCs |
| SEC-015 | Medium | `is_admin()` fallback + personal Gmail allowlisted |

---

## 10. Verified-good behaviour (do not regress)

These were tested and passed. They are recorded so remediation does not accidentally remove them.

| Check | Result |
|---|---|
| Security headers (HSTS preload, CSP, `X-Frame-Options`, `nosniff`, `Referrer-Policy`, `Permissions-Policy`) | Present live on `/` |
| Secrets in tracked files | None found (no service-role key, SMTP password, private key) |
| `npm audit` | 0 critical, 2 high, 1 moderate |
| `tsc --noEmit` | Exit 0 |
| Console errors on `/`, `/scoping`, `/work`, `/blog`, `/flow-hq` | Zero |
| One `<h1>` per page | Pass on all 12 routes |
| `lang`, viewport meta, landmarks | Present on all public routes |
| Duplicate IDs | None |
| Links/buttons without accessible name | None |
| `target="_blank"` without `rel="noopener noreferrer"` | None (3 occurrences, all correct) |
| `/api/platform/me` without token | `401` |
| `/flow-hq` and `/client` indexing | `X-Robots-Tag: noindex, nofollow, noarchive` |
| External redirects | `theflowlabs.online` → `www` (308), `/contact` → `/scoping` (308) |

---

## 11. Reproduction appendix

All commands are read-only. Do not run the POST examples against production without the owner's consent.

```powershell
# Dependency and type gates
npm audit --json
npx tsc --noEmit --incremental false

# Live headers
Invoke-WebRequest -Uri "https://www.theflowlabs.online/" -Method Head -UseBasicParsing |
  Select-Object -ExpandProperty Headers

# Sitemap health (follows 308)
node -e "const https=require('https'); ..."   # see TEST_PLAN.md §5 for the full script

# Mobile layout (local build)
# 1. npx serve out -l 4173
# 2. Open http://localhost:4173 at 375 px
# 3. Evaluate: document.querySelector('header').getBoundingClientRect()

# Contrast
node -e "const lum=h=>{...}; console.log(cr('#64748b','#07090E'))"   # 4.18

# SSRF filter (offline replication of api/audit.js normalizeUrl)
node -e "console.log(normalizeUrl('http://localhost.'))"            # ALLOWED
```

**Webhook probe actually performed (no DB write):**

```http
POST /api/platform/github
X-GitHub-Event: ping
Content-Type: application/json

{"zen":"audit probe"}
```

Response: `200 {"ok":true,"pong":true,"zen":"audit probe"}` — both with no signature and with
`X-Hub-Signature-256: sha256=deadbeef`. The `ping` branch returns before any Supabase write.

---

## 12. What was not tested

| Area | Why | Status |
|---|---|---|
| Authenticated Supabase RLS | No account created, no JWT used | Unverified — source-only conclusions |
| Live SMTP send | Would send real email | Unverified |
| `/api/audit` live POST | Writes cache, calls third-party PSI | Unverified |
| `/api/track` live POST | Writes visitor rows | Unverified |
| Lighthouse / Core Web Vitals | PSI 429; in-browser run timed out | Unverified |
| Mobile screenshots | Desktop capture requires a visible window | Measured numerically instead |
| Load / concurrency | Out of scope, no authorisation | Not performed |
| Signup escalation (SEC-004) | Would create an account | Unverified |

---

*End of `BUGS_AND_FINDINGS.md`. Remediation is proposed, not applied. See `REMEDIATION_LOG.md`.*
