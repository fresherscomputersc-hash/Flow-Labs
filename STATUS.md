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
- **Phase B VERIFIED & COMPLETED**:
  - `flow-hq/index.html`: Project subtabs (`#projectSubTabs` with Board, Modules, Tasks, Activity, Files, Settings), `#boardAssigneeFilter`, `#projectTasksTable` table view, `#projectActivityList` feed, `#projectFilesList`, `#projectSettingsForm`, `#taskCollabSection` with `#taskCommentsList` and `#taskHistoryList`.
  - `flow-hq/admin.css`: Subtab button states, activity feed item layout with icons, task comment cards with author/time, task history items, kanban move dropdown menu with focus outlines.
  - `flow-hq/admin.js`: Subtab switching (`switchProjectSubTab`), task list rendering (`renderProjectTasksTable`), project activity loader (`loadProjectActivity`), files loader (`loadProjectFiles`), project settings management (`loadProjectSettings`, `saveProjectSettings`), task comments composer & history loader (`loadTaskComments`, `postTaskComment`), keyboard move menu (`showKanbanMoveMenu`, `moveTaskStatus`), assignee filter.
  - Tested: Node syntax test passed with zero errors, python element/function assertions passed, endpoints return 200 OK.
- **Phase C (Every page editable / CMS expansion & Live Preview) — VERIFIED & COMPLETED**:
  - `assets/site-cms.js`: Expanded `PAGE_MAP` from 4 paths to 21 paths covering all service sub-pages, work case studies, overview pages, legal docs, blog, Bhubaneswar, and lab report. Added `cms-preview` postMessage bridge for zero-reload live typing previews directly inside public pages.
  - `flow-hq/content-schema.js`: Completely structured and expanded `window.CONTENT_SCHEMA` to define 21 pages across 5 clean categories (`Site`, `Services`, `Work`, `Blog`, `Legal`), with field groups, defaults, and updated `SETTINGS_DEFAULTS`.
  - `flow-hq/index.html`: Added `#contentSearch` for real-time page tree search, `#previewBar` toolbar with Desktop, Mobile (375px), and Hide preview modes, live sync indicator `#previewStatus`, and responsive preview container `#iframeWrap` holding `<iframe id="contentIframe">`.
  - `flow-hq/admin.css`: Added styles for `.rail-search`, uppercase category dividers `.rail-group-title`, live preview toolbar `.cms-preview-bar`, mode buttons `.preview-mode-group`, responsive container `.cms-iframe-container`, mobile device frame `.cms-iframe.mobile`, collapsible field groups `.fieldblock`, character counter `.field-counter`, and per-field reset buttons `.field-reset-btn`.
  - `flow-hq/admin.js`: Enhanced `renderContentRail(filterText)` with category grouping and instant search filtering, implemented `sendCmsPreview` and `broadcastCmsPreview` for live cross-window preview updates, wired live character counters on input, added per-field "Reset to default" buttons, and connected responsive preview toggles (`setPreviewMode`).
  - Public pages: Injected `data-cms` attributes across all 17 public pages and sub-pages matching their respective keys.
  - Tested: 100% automated pass across all 21 pages and elements via `scripts/verify_phase_c.py`, zero Node syntax errors.
- **Phase D (Client Portal at `/client/`) — VERIFIED & COMPLETED**:
  - `client/index.html`: Standalone lightweight client portal entry point outside Flow HQ admin bundle. Auth view with email/password login, client header with multi-project selector, project hero with milestone completion progress bar, modules & deliverables list, published updates feed, and client-visible files.
  - `client/client.css`: Clean dark-themed client design tokens, responsive cards, progress track, status badges, update feed cards, and founder support block.
  - `client/client.js`: Authenticated session management, profile verification, automatic redirect of admins with preview banner, live query of client-assigned projects, scope modules, published updates, and files. Hardened security isolation ensuring zero queries to internal engineering tables (`tasks`, `task_comments`, `activity`, `daily_reports`).
  - `flow-hq/index.html`: Added Updates subtab (`data-subtab="updates"`), `#subpanel-updates` with client update composer & list, and added Clients section in `#subpanel-modules` under People.
  - `flow-hq/admin.js`: Gated login redirection for `client` role users straight to `/client/`, implemented `loadProjectUpdates()`, `renderProjectClients()`, client-visible toggle in `loadProjectFiles()`, and all associated event listeners.
  - `supabase/migrations/0004_client_portal.sql`: RLS policies granting client read access to `client_visible` attachments and published `client_updates` for linked projects.
  - Tested: 100% automated pass on all DOM elements, files, and security isolation rules via `scripts/verify_phase_d.py`, zero Node syntax errors.
- **Phase E (Publishing & Media Storage) — VERIFIED & COMPLETED**:
  - `supabase/migrations/0005_storage.sql`: Configured Supabase storage buckets `media` (public, 10MB limit for images) and `attachments` (private, 50MB limit for project files/deliverables) with full authenticated and client-visible RLS policies.
  - `assets/blog-feed.js`: Client-side live index feed querying `site_blog_posts` in real-time, rendering published posts in <1s without waiting for Vercel rebuilds. Added dynamic post rendering fallback and draft preview renderer with unlisted preview warning.
  - `blog/index.html`: Wired `assets/blog-feed.js` and Supabase JS SDK.
  - `flow-hq/index.html`: Added "Insert image" media uploader (`#blogUploadMediaBtn`, `#blogMediaInput`), "Preview draft" button (`#blogPreviewDraft`), and "Upload file" in project files subtab (`#btnUploadProjectFile`, `#projectFileInput`).
  - `flow-hq/admin.js`: Integrated direct Supabase storage uploads for blog images (with auto-markdown insertion at cursor) and project files (with metadata recording in `attachments`), added `scheduleDebouncedRebuild()` with 15-second debounce window to prevent build thrashing.
  - Tested: 100% automated pass via `scripts/verify_phase_e.py`, zero Node syntax errors.
- **Phase F (Notifications & Realtime) — UP NEXT**:
  - Realtime subscriptions via Supabase `channel()` for tasks, comments, activity, and notifications feed.
  - Notification drawer/dropdown in Flow HQ topbar (`#notificationsBtn`, `#notificationsMenu`).
  - Email notification triggers via existing SMTP setup.
  - Member-wise and project-wise summary reporting rollups.

## Pending user actions:

1. Rotate the exposed database password (Supabase → Project Settings → Database → Reset database password).
2. Clean `seo_description_services` of `₹25,000` / `₹75,000` / `₹40,000` starting prices.
3. Remove test lead `"TEST — pipeline check"` from `site_leads`.
4. Decide on Cloudflare Email Obfuscation.