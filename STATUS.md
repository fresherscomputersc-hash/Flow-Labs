# The Flow Labs — Project Status

> **Handoff file.** When another agent picks this up, it MUST read this file first and
> treat `ADMIN-REDESIGN-PLAN.md` + this file as the source of truth. Do not restart from
> scratch. Do not re-read the whole repo to re-derive context unless the task requires it.

## Current date context

- Today: **Mon Nov 23 2026**.

## Repo & deployment

- Repo: `github.com/fresherscomputersc-hash/Flow-Labs`, branch `main`.
- Working dir: `E:\research\FLOWW LABS`.
- **Deployed state: `main` @ `83a817e`** (Content + Settings rebuild shipped + live).
- Vercel + Supabase (ref `jolcqqwvzrvqydzxpwij`). `SUPABASE_SERVICE_KEY` set in Vercel.
- Vercel Hobby function cap: **12**; currently using ~6 (catch-all router).

### Git history (in order)

| Commit | What |
|---|---|
| `a974431` | SEO work live on `main`: `/bhubaneswar/`, sitemap, schema, service-page location blocks. |
| `0a98a03` | Hero copy removed from `index.html` (verified live). |
| `ae1c74d` | Platform merge (Flow HQ admin + public site). |
| `296bee1` | Project workspace shipped (detail header/progress, modules + create, people panel, 6-col Kanban, task editor, DnD status, module filter, deep links, role gating, focusable cards Enter/Space). |
| `ce6532f` | Catch-all routing fix. |
| `83a817e` | Content + Settings rebuild shipped + deployed + live. |

## What is shipped (done)

1. **SEO**: `/bhubaneswar/`, sitemap, schema, service-page location blocks.
2. **DB migrations applied + verified from outside**: `0001_identity.sql`, `0002_work.sql`,
   `0003_collab.sql`. Collab tables (`task_comments`, `activity`, `notifications`,
   `daily_reports`, `attachments`, `client_updates`) return HTTP 200 `[]` for anon.
   `project_member_directory` → `42501 permission denied` for anon (intended).
3. **Platform API**: `api/platform/[...path].js` (JWT auth, `/me`, `/team` CRUD, `/audit`,
   guards, client→`project_clients` assignment). Catch-all routing fix in `ce6532f`.
4. **Flow HQ shell**: role-aware nav, Projects tab, Team tab (invite, role change, suspend/
   restore, delete, project assignment). Admins: create projects, list team, add members.
   Managers can create modules/tasks and change statuses.
5. **Project workspace** (`flow-hq/`): detail header/progress, modules + create, people
   panel, 6-column Kanban, task editor, drag-and-drop status, module filter, deep links,
   role gating; cards focusable with Enter/Space; keyboard handler verified in browser.
6. **Content + Settings rebuild** (`83a817e`): page rail with edit counts, hero preview,
   grouped fields, per-field "Use default", save bar with dirty tracking, unsaved-change
   guards; Settings split into accent/swatch, section switches, availability, search
   appearance with counters + SERP preview; grid-overflow fix
   (`.admin-form > *`, `.admin-view > *`, `.split > *`, `.admin-grid-2 > * { min-width: 0 }`,
   `minmax(min(320px, 100%), 1fr)`).
7. **Copy directive applied**: removed "Fixed quote before we start. Three founders on the
   build. The repository is yours at handover." and "Based in Bhubaneswar, Odisha — building
   for teams across India and abroad."; Bhubaneswar kept only at the bottom.

## Not yet done (plan-driven)

- **UI changes you specified that were NOT delivered** — all in `ADMIN-REDESIGN-PLAN.md`.
- **Admin panel structural change** — user: "looks so much confusing and absurd".
- **Task comments + project activity feed UI** — DB tables live (0003), UI missing.
- Client portal `/client/` — DB ready (`client`, `project_clients`, `client_updates`),
  surface not built; `enter()` still blocks client logins.
- Blog/CMS Phase C — `assets/site-cms.js` `PAGE_MAP` only covers 4 pages.
- Publishing Phase E — needs private Supabase storage bucket (user to create).
- GitHub Phase G — needs user to install GitHub App.
- Notifications/realtime Phase F, hardening Phase H.

## Agreed phase order

1. Database — **done**
2. Workspace finish (task comments + activity feed) — **next** — **Phase B testing not started**: DB tables (0003) are live but UI implementation incomplete; task drawer, activity feed, sub-tabs, keyboard "Move to…" need verification
3. Every page editable
4. Client portal
5. Publishing
6. Notifications / realtime
7. GitHub
8. Hardening

## Pending operational tasks (user to do)

1. **Rotate the exposed database password** (Supabase → Project Settings → Database →
   Reset database password). Do this soon; treat it as compromised.
2. `site_settings.accent_color` still `#6EA8FF` (probably default) — verify/clean.
3. `seo_description_services` still contains `₹25,000` / `₹75,000` / `₹40,000` — per copy
   directive, remove starting prices.
4. Test lead `"TEST — pipeline check"` still in `site_leads` — clean before launch.
5. Cloudflare Email Obfuscation still on — decide off.
6. PSI key absent — decide whether to add.
7. Search Console removals pending user action.

## UI template (bright / dome) — decision recorded

- `assets/site.css`: `[data-theme="bright"]` token block added (light base `#FFFFFF`, dark ink `#111827`, blue accent `#3B82F6`).
- Not yet applied to any HTML (`data-theme="bright"` not added to `<body>` on public pages — pending your approval).
- Admin panel (`flow-hq/admin.css`) keeps its own tokens; bright variant available if you want Flow HQ bright too.
- References "dome" template shape: rounded surfaces, pill buttons, light base — applied piece by piece during frontend pass (Phase C/D), not a blanket redesign.

## Known gotchas (read before touching code)

- `flow-hq/admin.js` and `flow-hq/index.html` are **UTF-8**; never round-trip through
  PowerShell `Get-Content | Set-Content` (mangles UTF-8) — use `edit`/`write` tools or
  Python `io.open(..., encoding="utf-8", newline="\n")`.
- PowerShell has no `grep` — use the grep tool.
- Multi-table `curl` loops with `-o NUL -w "%{http_code}"` produced bogus 404s; make single
  explicit calls for truth.
- PostgREST schema cache can lag a fresh migration ~15s then refresh.
- Browser automation window is **800×535** — below the 900px breakpoint, so wide-desktop
  layout is unverified visually.
- Browser caches `admin.js`/`admin.css` aggressively during local smoke tests — version the
  URLs or fixes appear missing.
- Local preview: `python -m http.server 8321` from repo root; the process dies silently —
  restart if pages return 502/blank.
- Smoke collateral (`flow-hq/_smoke.html`, `_smoke2.html`) must be deleted before commit.
- Never write secrets/connection strings to repo files.

## Open decisions awaiting user approval

From `ADMIN-REDESIGN-PLAN.md`:
1. Nav group labels — `Workspace / Content / Site / System` or yours to choose?
2. Dashboard "Needs attention" strip — Phase A or after Phase B?
3. Client portal scope — default (status, modules, progress, updates, files) or "wider"?
4. Phase order — A→B→C→D→E→F→G→H or reorder?

## Next move

- **Phase A VERIFIED & READY**:
  - `flow-hq/index.html`: Grouped navigation (`Workspace / Content / Site / System`), sticky topbar breadcrumbs (`#adminBreadcrumb`), `.workspace` wrapper enclosing all views, `#attentionStrip` on Dashboard.
  - `flow-hq/admin.css`: Clean uppercase nav group headers, sticky blurred topbar, breadcrumb typography, `.workspace` bounded surface container (`min(1180px, 100%)`), attention strip styling, state helpers (`.skeleton`, `.empty-state`, `.error-state`).
  - `flow-hq/admin.js`: Nav group role-gating in `applyRole()`, dynamic breadcrumb in `updateBreadcrumb(tab)` (including project and blog editor drilldowns), `confirmLeaveTab` dirty-state protection intact, attention strip data population in `loadDashboard()`, zero syntax errors.
  - Tested: Node syntax test passed, local server 200 OK on endpoints, DOM and authView verified.
- **Phase B (Workspace finish / Collab UI) — UP NEXT**:
  - Task drawer comments UI + author attribution (`task_comments` table).
  - Project sub-tabs (**Board · Modules · Tasks · Activity · Files · Settings**).
  - Project activity feed component (`activity` table).
  - Kanban WIP counts & keyboard "Move to…" accessibility.
  - Verify collab workflow between roles.

## Pending user actions:

1. Rotate the exposed database password (Supabase → Project Settings → Database → Reset database password).
2. Clean `seo_description_services` of `₹25,000` / `₹75,000` / `₹40,000` starting prices.
3. Remove test lead `"TEST — pipeline check"` from `site_leads`.
4. Decide on Cloudflare Email Obfuscation.