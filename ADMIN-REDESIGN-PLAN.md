# Flow HQ — Structural Redesign & Full Delivery Plan

Status: **proposed — nothing changes until you approve.**
Repo: `main` @ `83a817e`. This plan extends the current site. No rewrite, no Next.js, no
VPS. Public pages stay untouched except where a phase explicitly says "copy".

---

## 0. Why the panel feels "confusing and absurd"

These are concrete, visible problems in the current build — not taste. Each becomes a
fix in Phase A.

1. **One flat column.** `admin-main` is a single `overflow-y:auto` column. Nine sibling
   views, all full width, all stacked. There is no page sectioning, no landmarks, no
   visual hierarchy deeper than card → card.
2. **Nine equal-weight tabs.** Dashboard, Leads, Visitors, Content, Blog, Projects, Team,
   Settings. No grouping, no icons, no dividers, no "where am I" cue. A blog post editor
   looks the same weight as site settings.
3. **Hidden hierarchy.** `Project` is a hidden 10th tab reached only via `#project/<uuid>`.
   Nothing tells you you've drilled down. No breadcrumb, no back link.
4. **Settings is still one long form.** Four stacked cards and one Save button for accent,
   sections, availability and SEO. Nothing saves independently.
5. **Content lost its promised shape.** There is a rail, but no grouping
   (Site/Services/Work/Blog/Legal), no search, no "edited" dot, no collapsible field
   groups. The "preview" is still a text dump, not the real page.
6. **Everything says "Loading…".** No skeleton, no empty state, no error state worth the
   name. A dead Supabase looks identical to a slow one.
7. **No ops surface.** No integration health, no backup status, no danger zone, no audit
   viewer. The panel cannot tell you whether the platform is healthy.
8. **Project detail is thin.** One screen: header, modules, people, Kanban. No tab for
   Activity, Files or Settings. Task editor has no comments, priority, due date,
   attachments or linked commits.
9. **Accessibility debt in the board.** Drag-and-drop only; no keyboard "Move to…", no WIP
   counts, no assignee filter.

---

## 1. Previously discussed, still undelivered

Recorded from `PLATFORM-PLAN.md` §7 and the earlier UI directive. All of these were
promised and are still missing.

### Admin shell & navigation
- [ ] Grouped sidebar nav (Workspace / Content / Site / Settings) with section labels.
- [ ] Icons or glyphs per nav item; active section highlighted, not just a 2px inset.
- [ ] Breadcrumb + back link on drill-down screens (Project detail, Blog editor).
- [ ] Member nav: **My work · My projects · Reports · Notifications · Profile**.
- [ ] Admin nav parity: add **GitHub · Reports · Activity** to the existing nine.

### Dashboard / Leads / Visitors
- [ ] Stat cards with real deltas and sparkline, not five equal boxes.
- [ ] "Needs attention" strip: new leads, overdue tasks, invites pending, failed webhooks.
- [ ] Leads: inline detail drawer instead of a page-jump, saved filters, CSV export.
- [ ] Visitors: date-range filter, top pages table with trend, honest "no cookies" note
      kept.

### Content
- [ ] Search box over the page tree.
- [ ] Page tree grouped Site / Services / Work / Blog / Legal.
- [ ] "Edited" dot per page + field count.
- [ ] Collapsible field sections on the right.
- [ ] Per-field **Reset to default** (currently only a whole-page restore).
- [ ] Character counters on SEO fields.
- [ ] **Live `<iframe>` preview** of the real page at desktop + mobile widths, rendering
      unsaved edits through the same override path.
- [ ] Empty state for pages with no editable fields yet.

### Settings
- [ ] Section rail: **Brand · Homepage sections · SEO defaults · Integrations · Backups ·
      Danger zone**, each saving independently with inline success/failure.
- [ ] Accent: swatches + custom hex + **live contrast check** (warn below 4.5:1 body).
- [ ] Section toggles: name, one-line description, what it controls.
- [ ] SEO: SERP preview + honest "crawler-visible after rebuild" status.
- [ ] **Integrations**: read-only health for Supabase, SMTP last send, GitHub App install,
      last webhook, deploy hook last fired. Secrets never shown.
- [ ] **Danger zone**: export all content as JSON, reset overrides page by page, typed
      confirmation for anything destructive.

### Projects / Board
- [ ] Project view sub-tabs: **Board · Modules · Tasks · Activity · Files · Settings**.
- [ ] Kanban: WIP counts per column, assignee filter, keyboard **"Move to…"** menu.
- [ ] Task editor: priority, due date, comments, attachments, linked commits/PRs, activity.
- [ ] Member "My work" view across projects.

### Missing surfaces
- [ ] **Activity** tab (audit feed).
- [ ] **Reports** tab (daily report pre-filled from the day's commits/PRs; weekly rollup).
- [ ] **Notifications** bell + inbox + realtime badge.
- [ ] **GitHub** tab (repo links, connection health, unattributed commit mapping).
- [ ] **Client portal** at `/client/` (separate HTML entry, same tokens, none of the admin
      bundle).

---

## 2. The structural change (Phase A — do this first)

Goal: make the panel legible before adding more features. Same design tokens, same shell,
better bones.

### 2.1 Layout

```
┌───────────────┬───────────────────────────────────────────────┐
│  Flow HQ.     │  Breadcrumb ·····················  ⌘K  Search │
│               ├───────────────────────────────────────────────┤
│  WORKSPACE    │                                               │
│   Dashboard   │   <main class="workspace">                    │
│   Projects    │     page header (title, subtitle, actions)    │
│   Team        │     .surface  ← every view is a surface       │
│               │                                               │
│  CONTENT      │                                               │
│   Pages       │                                               │
│   Blog        │                                               │
│               │                                               │
│  SITE         │                                               │
│   Leads       │                                               │
│   Visitors    │                                               │
│               │                                               │
│  SYSTEM       │                                               │
│   Settings    │                                               │
│               │                                               │
│  ───────────  │                                               │
│  user · role  │                                               │
└───────────────┴───────────────────────────────────────────────┘
```

- **Grouped nav.** Four labelled groups with a small uppercase section header. Hidden
  tabs stay hidden by role, exactly as today (`applyRole()` logic unchanged).
- **Breadcrumb bar** in the topbar: `Workspace / Projects / <Project name>`,
  `Content / <Page>`. Replaces the bare `h1` + subtitle for drill-downs.
- **`.surface` primitive.** Every view renders inside a bounded surface with consistent
  padding, max-width (`min(1180px, 100%)`) and vertical rhythm. No more infinite
  full-width column.
- **Sticky page header** so actions (Save, New, Refresh) never scroll away.

### 2.2 Navigation grouping

| Group     | Tabs                                            | Roles            |
|-----------|-------------------------------------------------|------------------|
| Workspace | Dashboard · Projects · Team                     | owner/admin; projects for manager/member |
| Content   | Pages · Blog                                    | owner/admin      |
| Site      | Leads · Visitors                                | owner/admin      |
| System    | Settings · Activity · Reports                    | owner/admin      |
| GitHub    | GitHub                                          | owner/admin (Phase G) |

Manager/member see only **Projects** (and the project detail). Client role stays blocked in
Flow HQ until the portal ships, then gets `/client/`.

### 2.3 States
- **Skeleton** loaders per surface (2–3 shimmer rows), not "Loading…".
- **Empty** state per surface with one clear next action.
- **Error** state with the failing table/endpoint and a Retry button.
- All three are reusable helpers, not copy-pasted markup.

### 2.4 What Phase A does NOT touch
- Login screen, auth flow, `TAB_ACCESS`, RLS, `api/platform` router.
- Any public page or public CSS.

### 2.5 Phase A verification
- Every existing tab still opens and loads with the same data.
- Role gating unchanged: sign in as manager → only Projects visible.
- Unsaved-change guards on Content/Settings still fire.
- Keyboard: Tab reaches every nav item; active item has `aria-current="page"`.
- No horizontal scroll at 1024, 1280, 1440, 1920.

---

## 3. Phases after A (one at a time, each verified before the next)

Ordered so nothing blocks daily use. Each phase ends with a written report + a browser/API
check before we move on.

### Phase B — Workspace finish (collab UI)
Tables `task_comments`, `activity`, `notifications` are already live; no UI exists.
- Task drawer: comments (list + composer), attachments list, activity strip.
- Project sub-tabs: **Board · Modules · Tasks · Activity · Files · Settings**.
- Kanban: WIP counts, assignee filter, keyboard "Move to…".
- Activity tab reads `activity` with actor + target rendered.
- Verify: two members, roles enforced by RLS; a comment by A shows for B on reload; a
  task move writes one activity row.

### Phase C — Every page editable
`assets/site-cms.js` `PAGE_MAP` only covers 4 pages.
- Registry for all pages (services, work, legal, contact, blog index).
- Meta + JSON-LD fields per page.
- Content search, grouping, per-field reset, iframe preview completed (if not in A).
- Verify: edit a paragraph on a service page → visible without deploy; meta edit labelled
  "crawler-visible after rebuild".

### Phase D — Client portal
- `/client/` separate entry, client role, `project_clients` linking, `client_updates`,
  client-visible files.
- Admin: create client (temp password shown once), link project, post update, revoke.
- Client sees: status, module progress, published updates, client-visible files. **Never**
  tasks, comments, commits, activity, other clients.
- Verify: client API calls return zero rows for tasks/comments/activity/other projects.

### Phase E — Publishing
- Private Supabase Storage bucket for media.
- Blog live without redeploy; draft preview token; debounced rebuild only for crawler meta.
- Verify: publish a post → live in <5s; media upload renders.

### Phase F — Notifications & realtime
- Realtime subscriptions for tasks, comments, activity, notifications.
- Email notifications + weekly digest via existing SMTP.
- Reports: member-wise and project-wise rollups.
- Verify: comment from A appears for B without refresh; one notification per event.

### Phase G — GitHub
- GitHub App (Contents/PRs/Metadata read), install callback, HMAC webhook, idempotent by
  delivery ID, author attribution, `FLW-\d+` task linking.
- Needs you to install the App and name the first repos.
- Verify: push lands in the project feed in seconds, right member attached, replay creates
  no duplicate.

### Phase H — Hardening
- Security pass, CSP, rate limits, Playwright e2e, backup/restore drill, accessibility
  pass, production cutover with rollback point.

---

## 4. Files this touches

- `flow-hq/index.html` — nav → grouped; add breadcrumb slot; wrap views in surfaces.
- `flow-hq/admin.css` — `.admin-nav-group`, `.workspace`, `.surface`, `.skeleton`,
  `.empty`, `.error`, `.breadcrumb`. Tokens unchanged.
- `flow-hq/admin.js` — nav grouping render, breadcrumb per view, skeleton/empty/error
  helpers; later phases add comments, activity, reports, notifications, GitHub.
- `flow-hq/content-schema.js` — page grouping + registry expansion (Phase C).
- `assets/site-cms.js` — `PAGE_MAP` expansion (Phase C).
- New: `client/` (Phase D), `supabase/migrations/0004_*.sql`, `0005_*.sql` as needed.

Public pages, `assets/site.config.js`, and `api/platform` are not modified in Phase A.

---

## 5. Open decisions before I start

1. **Nav grouping names** — keep `Workspace / Content / Site / System`, or you prefer
   different labels?
2. **Dashboard priority** — is the "Needs attention" strip (new leads, overdue tasks,
   pending invites) wanted in Phase A, or after the workspace finish?
3. **Client portal scope** — default stays: status, modules, progress, published updates,
   client-visible files only. Say "wider" if clients should see the task board.
4. **Phase order** — approve A→B→C→D→E→F→G→H as listed, or reorder?

**Chosen (best picks) — user approved:**
1. **Nav groups:** keep `Workspace / Content / Site / System`.
2. **Dashboard strip:** add "Needs attention" in Phase A (quick win, surfaces invites/overdue/leads after new layout).
3. **Client portal scope:** default (status, modules, progress, published updates, client-visible files only).
4. **Phase order:** A→B→C→D→E→F→G→H.

## 6. UI template selection — Dome + Bright

Added per latest instruction: the frontend was feeling wrong ("sucked boob"), so we are
switching the public website to a **bright dome template** instead of the current dark
look.

- **Theme:** `body[data-theme="bright"]` token set added to `assets/site.css` (light
  background, dark ink, bright accent) — applied by adding `data-theme="bright"` to
  `<body>` on public pages. Admin panel keeps its own token set (`flow-hq/admin.css`)
  but gains the same bright variants via `.admin-layout[data-theme="bright"]` if you want
  Flow HQ bright too.
- **Template shape:** "dome" = rounded surface cards, pill buttons, soft corners, light
  base — replaces the current flat dark card look piece by piece across public pages.
- **Application order:** tokens first (no visual change until `data-theme` is added), then
  wrap hero/services/team/contact sections in `.dome-card` surfaces during Phase C/D
  frontend pass.
- **Verification:** light-theme contrast must stay ≥ 4.5:1 for body text; bright theme
  previewed at all breakpoints before committing.

---

## 7. Whole-website redesign — ThreeUI template selection (new workstream)

Per your latest instruction: **we will redesign the whole website** using templates from
**https://threeui.com/** as visual building blocks, with the **bright** theme preferred.

### 7.1 Source (ThreeUI)

- Site: `https://threeui.com/` — Three.js components, complete website templates,
  WebGL backgrounds, hero sections, UI effects, copy-ready templates.
- Categories surfaced: Sections (hero, testimonials, footers, pricing, features, how-it-works, CTA, about, work, services, team, awards, logos, coverage, contact, FAQ, timelines, chapters, content, specifications, configurators, news/press, faq), Landing Pages (Fold Line, DOH! Donuts, Plumb Planning, Lintel House, AURAL, NEST, Turun, ELYTRA, XGIMI, NEST Glass CTA, AURAL Interest, ELYTRA Arm Up, XGIMI Cinema, Turun Reserve, AURAL Headphones, ELYRA Ladybug, XGIMI Portable, XGIMI Short Throw, Dayward, Drift, OBLO, Polaroid Now+, Rondel One, Umbra, Aureon, Kibori, Kerf K1, Otto, Aeris Pool, KASANE, Retro Gaming Handheld, NOIR, Fathomless, Workshop Codex, Corvane Vault, Tandem, Dayward, DRIFT, OBLO, Fathomless, Workshop Codex, Corvane Vault, etc.

### 7.2 Candidate templates for The Flow Labs (bright + "dome")

Flow Labs is a software/product studio (three founders, 3 tiers: Design ₹25k, Systems ₹75k, Intelligence ₹40k) with a BHUBANESWAR base and client work. Picks from ThreeUI by section:

| Section | Candidate | Why it fits |
|---|---|---|
| Hero | **OBLO** — sculptural brand experience, bold typography, editorial brand story | Bold, editorial, agency-like; light/bright version fits "bright dome". |
| Hero (alt) | **Umbra** / **Rondel One** / **Tandem** — dark agency systems | Only if we keep a dark hero and go bright elsewhere. |
| Services | **Volta Atelier** — scroll-driven cylinder of studio capabilities | Distinctive capability showcase. |
| Services (alt) | **RenderLab** — numbered service cards with cutout robot illustrations | Compact, clean. |
| Work / Case Studies | **Volta Atelier** — scroll-driven fanned card stack, active-project rail | High-end case study feel. |
| Work (alt) | **Halvorsen** — rounded case-study cards with carved marble hand, glass garden | Nice for small portfolio feel. |
| Team | **Volta Atelier** — draggable portrait carousel on 3D arc, keyboard nav | Good for three-founder team. |
| Team (alt) | **RenderLab** — typographic marquees with scroll-responsive motion | No portraits needed. |
| Testimonials | **Arca** — bendable cards, oversized editorial lettering, brushstroke | Premium feel. |
| Testimonials (alt) | **Aniwall** — three glass cards + iridescent helix | Light/bright fits. |
| FAQ | **Aniwall** — editorial accordion with iridescent helix | Light/bright friendly. |
| CTA / Contact | **OBLO** — interactive project invitation, budget selector, draggable sculptural form | Perfect for "project scoping" flow. |
| CTA (alt) | **Turun** — live 3D postcard / reserve a morning. | |
| Footer | **Kage** / **Cadence** — compact studio footers. | |
| Pricing | **Umbra** — two-tier licence comparison with selectable pricing. | |
| Pricing (alt) | **Volta Atelier** — pick your shell. | |

### 7.3 Chosen direction (draft, pending user pick)

Suggested primary path for the whole-website redesign:

- **Hero → OBLO-style** (bold editorial typography, bright/cream, no dark).
- **Services → Volta Atelier-style** (scroll-driven capabilities) or RenderLab-style.
- **Work → Volta Atelier-style** (fanned scroll stack).
- **Team → RenderLab/Volta (draggable carousel or marquee).
- **Testimonials → Arca-style (bendy editorial cards).
- **FAQ → Aniwall-style (accordion).
- **CTA/Contact → OBLO-style (budget-selector project invitation).
- **Footer → Kage/Cadence-style (compact studio).

Bright theme applies to all chosen templates; "dome" = rounded surfaces + pill CTAs + light base. This supersedes the pure dark token set for public pages once the redesign ships (the CMS override layer must keep working: `data-cms` fields remain the source of truth).

### 7.4 Scope & sequencing

- This is a **new workstream**, sequenced after the admin redesign phases (or in parallel with Phase C/D "Every page editable" — the redesign should reuse the CMS field registry so content edits still drive the new templates).
- No changes made now (per your instruction). Nothing deployed.

---

## 8. Open decisions before I start (superseded by user picks)

1. **Nav grouping names** — keep `Workspace / Content / Site / System`, or you prefer different labels? → **Chosen: keep `Workspace / Content / Site / System`**.
2. **Dashboard priority** — is the "Needs attention" strip (new leads, overdue tasks, pending invites) wanted in Phase A, or after the workspace finish? → **Chosen: Phase A**.
3. **Client portal scope** — default stays: status, modules, progress, published updates, client-visible files only. Say "wider" if clients should see the task board. → **Chosen: default**.
4. **Phase order** — approve A→B→C→D→E→F→G→H as listed, or reorder? → **Chosen: A→B→C→D→E→F→G→H**.

---

## 9. Next move

- **No code changes since this plan update.** Files touched this session: `ADMIN-REDESIGN-PLAN.md`, `STATUS.md`, `assets/site.css` (added `[data-theme="bright"]`).
- Awaiting your approval of the plan + the ThreeUI whole-website redesign direction (section 7).
- After approval: execute **Phase A** first, then B→H, with the bright/dome + ThreeUI redesign integrated into the public-site phases.
