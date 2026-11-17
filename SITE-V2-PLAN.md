# The Flow Labs — V2 "Controlled Storm" Plan

**Status:** **APPROVED — build complete in working tree; nothing committed or pushed.** Implemented phases: A (truth pass), B (energy layer), C (First Light + slots), D (motion system), E (work cards), F (services depth), G (Lab Report). Page count now 21 including `/lab-report/`.
**Date:** 2026-11-16
**Scope:** brand de-localisation, team roles, contact/email repair, CTA contrast, energised art direction, work-card rebuild, deeper services page, first-load brand sting, real-capacity slot meter, and one differentiator no competitor has.
**Supersedes:** the calm visual treatment in `assets/site.css` only. Every functional decision from `SITE-OVERHAUL-PLAN.md` (compatibility CSS, homepage form/FAQ/process, keyword titles, `is_admin()` RLS, `/api/settings`, cookie-less analytics, hidden `/flow-hq/`) stays.

## Approved inputs

| Input | Value |
|---|---|
Founder | Smruti Ranjan |
Co-founders | Biswash, Arpita |
Canonical host | `https://www.theflowlabs.online` |
Interfaces starting price | ₹25,000 |
Systems starting price | ₹75,000 |
Intelligence starting price | ₹40,000 |
Build capacity | 4 per month |
December 2026 | 2 taken, 2 open |
Intro | 1800ms, once per browser per 7 days, homepage only |
Differentiator | The Lab Report, ₹0/month |

Any of these can be changed later from Flow HQ or one constant — none of them are hardcoded into a page.

## Delivery map (the whole update, at a glance)

| Surface | What changes |
|---|---|
**Global** | New tokens (acid + signal + system blue), 10–18px card radii, pill CTAs, ticker, scroll rail, page transitions, footer rewrite, live IST clock, `www` canonicals, sitemap |
**Home** | First Light intro, new eyebrow, kinetic hero, Flow Field canvas, stat strip, 3-layer stack, feature work card + asymmetric grid, x-ray hover, filter FLIP, team roles, slot meter, new FAQ, rewritten footer |
**Work index** | Same cards, filter, "what this proves" line per project, Ship Log |
**3 service pages** | Place-free slugs + 301, deeper sections (who it's for, what you get, what we need, timeline, 6 FAQs, related work) |
**Services hub** | Stack bands, progressive disclosure, compare table, layer chooser, "what we don't do", from-prices |
**About** | Smruti Ranjan + F/CF, place-free copy, one address paragraph, new FAQ answers |
**Contact** | Email promoted above form (Cloudflare-proof), slot meter, "what to include" checklist, acid submit button |
**Blog** | Rewritten titles/intros, one slug rename + 301, place-free meta |
**Lab Report** | New page + `/api/audit.js`, graded card, animated bars, cache, rate limit, home teaser, privacy update |
**CMS / admin** | 4 slot keys, ticker/availability/lab-report teaser keys, updated defaults, schema seeds, `site_audits` table |
**Docs** | README, SUPABASE-SETUP, `.env.example`, this plan |

---

## 0. First: did we finish all the phases?

**Yes — the code is complete. The launch is not.**

All 7 phases (0–7) in `SITE-OVERHAUL-PLAN.md §13` are implemented in the working tree. The implementation appendix at §18 records it, and the local verification run passed:

- `python tools/site/build.py` → 20 sub-pages, no errors
- `python tools/site/check_cms_keys.py` → 42 bindings across 21 pages, clean
- `node --check` on all authored JS → clean
- 24 local routes → HTTP 200
- No horizontal overflow, correct accent/radii/year, form wired

What is **not** done is operational, not missing code:

| Item | State |
|---|---|
| Commit the work | ❌ everything is uncommitted (`git status` shows ~30 modified, ~20 untracked) |
| Run `supabase-schema.sql` in Supabase | ❌ manual step |
| Create admin auth user + add to `admin_users` | ❌ manual step |
| Set Vercel env vars | ❌ not set |
| `vercel dev` API test | ❌ blocked, CLI not authenticated |
| Deploy this working tree | ⚠️ live site appears to run an earlier build of the same redesign |

So: **phases complete, launch checklist open.** This document is a new phase (call it V2), not a rescue of an unfinished one.

One correction to the earlier report: the live site is **behind Cloudflare** and that is the actual cause of the missing email. Details in §1.1.

---

## 1. Diagnosis — what is actually wrong, with evidence

### 1.1 The email is not missing. Cloudflare is hiding it.

Live HTML at `https://www.theflowlabs.online/contact/` renders:

```
Email: [email protected]
```

The markup is correct (`mailto:hello@theflowlabs.online`, `data-cms="contact-email"`). Cloudflare's **Email Address Obfuscation** (Scrape Shield) rewrites every `mailto:` link and every plain-text address into `/cdn-cgi/l/email-protection`. When its script is blocked, delayed, or fails, the visitor sees the literal string `[email protected]`. That is exactly what you are seeing.

Three-part fix:

1. **Dashboard:** Cloudflare → Scrape Shield → **Email Address Obfuscation = Off**. This is the root fix.
2. **Code:** stop shipping the address as a literal string. Assemble it client-side (`hello` + `@` + `theflowlabs.online`) into a real `<a>` with `href`, plus a visually-hidden `<noscript>` fallback. Cloudflare cannot rewrite what is not in the served HTML.
3. **Layout:** email currently sits *below* the form in a "Direct channels" block, so even when it renders it reads like fine print. Promote it to a card above the form, with a copy button.

Also: `theflowlabs.online` **308-redirects to `www.theflowlabs.online`**, but every canonical tag, `og:url`, JSON-LD and `sitemap.xml` entry says `https://theflowlabs.online`. The canonical points at a URL that redirects. That is a real (if minor) indexing problem and it splits analytics. Fix in §9.

### 1.2 The CTA button is low-contrast, not the wrong colour

Current: `.btn-primary` and `.submit-btn` use `background: #3B82F6` with `color: #F0F0F2`.

| Pair | Ratio | AA normal text (4.5:1) |
|---|---|---|
| `#F0F0F2` on `#3B82F6` | **3.23:1** | ❌ fails |
| `#FFFFFF` on `#3B82F6` | 3.68:1 | ❌ fails |
| `#0C0C0E` on `#3B82F6` | **5.13:1** | ✅ passes |
| `#0C0C0E` on `#C8FF3D` (proposed acid) | **15.98:1** | ✅ passes easily |
| `#FFFFFF` on `#FF5C35` (proposed signal) | 3.30:1 | ❌ fails |

So the button looks "off" because the label is washed into the blue, not because blue is wrong. V2 changes the primary CTA to **acid lime with near-black text**, which fixes contrast and adds the energy in the same move.

### 1.3 "Piano-selling company" — where the calm comes from

The site is not badly designed. It is **over-composed**. Five causes:

1. **Serif display + muted grey body + one restrained blue** reads premium-editorial, which in 2026 reads luxury-retail.
2. **Perfect symmetry.** Every section is label → title → subtitle → grid. Predictable rhythm = calm.
3. **3px radii everywhere + 1px hairline borders + no shadows** = jewellery-box precision.
4. **Motion is a single fade-up.** Nothing moves with personality.
5. **Copy is explanatory, not opinionated.** "We engineer every layer" is a brochure sentence.

V2 keeps the craft but injects: a second hot accent, broken grid, oversized type, sticker/ticker devices, press-and-tilt micro-interactions, and shorter, spikier copy.

### 1.4 Bhubaneswar inventory (what must change vs. stay)

| Location | Change |
|---|---|
`index.html` title/description/OG/Twitter | remove place
`index.html` JSON-LD `areaServed` (City Bhubaneswar) | replace with `address` (PostalAddress, Bhubaneswar) + `areaServed` India/Worldwide
`index.html` hero eyebrow `hero-label` | rewrite (no place)
`index.html` FAQ "Do you work outside Bhubaneswar?" | rewrite to "Do you work outside India?"
`index.html` footer tagline + `Engineered in Bhubaneswar` | rewrite; keep address block only
Homepage work card (Droovee) copy | remove place
`about/` title, OG, eyebrow, subtitle, body-2, FAQ ×2 | rewrite; keep one address paragraph
`contact/` title, hero, address paragraph | keep address line, remove place elsewhere
`services/index.html` footer | same footer change
3 service detail pages: route slug, title, OG, H1, body, FAQ, "Serving Bhubaneswar and beyond" | rename routes + rewrite
`blog/` index + 1 article + slug | rename article slug + rewrite copy
`work/droovee/` eyebrow `LIVE PRODUCT · Bhubaneswar` + copy | rewrite
`assets/work-bhoomi.svg` text `Bhubaneswar · R-4` | replace with `R-4 · Survey Plot`
`content-schema.js` defaults (hero, about, SEO ×4) | rewrite
`supabase-schema.sql` `site_settings` seeds (SEO home/about/services) | rewrite
Footer everywhere: `Bhubaneswar, Odisha` under "Studio" | **KEEP** (this is the address)

### 1.5 Team roles — locked

| Person | Name on site | Role label |
|---|---|---|
| 1 | **Smruti Ranjan** | Founder |
| 2 | **Biswash** | Co-Founder |
| 3 | **Arpita** | Co-Founder |

Note: the site currently says `Subham` in three places (`index.html`, `content-schema.js`, `build.py`). It becomes **Smruti Ranjan** everywhere, including the CMS default and the avatar initial (`S` stays correct).

Craft moves into the existing one-line bio, which stays editable in Flow HQ:

- Smruti Ranjan — *Founder* — "Sets direction and leads engineering across every build."
- Biswash — *Co-Founder* — "Builds the platforms, APIs and backend infrastructure that scale."
- Arpita — *Co-Founder* — "Shapes the interfaces, user experience and visual identity."

No abbreviations on the page. `F` / `CF` are internal shorthand, not customer language.

---

## 2. Direction: "Controlled Storm"

**One line:** a lab that is clearly having fun being good.

**What it must feel like:** fast, loud in the right places, precise everywhere else. Confidence, not chaos. A workshop with the music on, not a showroom with the lights dimmed.

**Reference points (feel, not copy):** Teenage Engineering's playfulness, Linear's type discipline, a race-team pit wall, an indie game studio's site.

**Non-negotiables (so "toofani" doesn't become a mess):**

- No glassmorphism, no glow, no particles, no gradient text, no scroll-jacking, no autoplay video.
- One hot accent per viewport. Acid is for action; signal orange is for status; blue stays for links and system state.
- Motion is 150–400 ms, easing out, and every animation is either feedback or reveal. Nothing loops except the ticker.
- All of it collapses cleanly under `prefers-reduced-motion: reduce`.
- Zero invented metrics, awards, client logos or testimonials. Still the honest-lab brand.

---

## 3. Design system changes (`assets/site.css`)

### 3.1 Tokens

Keep the dark base (it works and it is the brand). Add a hot layer.

```
--ink          #08090A   /* near-black, text on acid */
--bg           #0B0B0C
--surface      #141416
--surface-2    #1B1B1F
--line         #2A2A2E
--line-hot     rgba(200,255,61,.30)

--text         #F4F4F0
--muted        #9A9AA2
--faint        #5A5A63

--acid         #C8FF3D   /* action, highlight, energy */
--acid-press   #B4EB2A
--signal       #FF5C35   /* live dots, numbers, eyebrows */
--system       #4D8DFF   /* links, focus, info (blue, demoted) */

--radius-sm    4px
--radius-md    10px
--radius-lg    18px
```

Rationale for adding real radii back: 3px on every element is a large part of the "piano showroom" feel. Cards and image frames go to 10–18px; buttons stay 999px (pill) as a deliberate, playful counterpoint. The old spec banned pill buttons — this plan explicitly reverses that for CTAs only, because a pill CTA with a hard offset shadow is the single cheapest "energised" signal.

### 3.2 Type

- Display: keep **Instrument Serif** (distinctive, warm, not the default tech sans). But scale it up hard: hero `clamp(3.4rem, 9.2vw, 8rem)`, `line-height: 0.9`, `letter-spacing: -0.035em`.
- Body: keep **Geist**.
- Labels: keep **IBM Plex Mono**, uppercase, `0.68rem`, `letter-spacing: .16em`. This becomes the "sticker" voice.
- Optional (decision): add **Caveat** for 2–3 hand-written margin notes ("we actually ship this", "ask us why"). Max 3 per page. Adds personality; overuse looks cheap. Default: **off** until you approve.

### 3.3 New components

| Component | Spec | Where |
|---|---|---|
**Ticker** | full-width strip under nav, acid text on ink, mono, `≈` separator, infinite marquee, pauses on hover + reduced motion | home, work, services |
**Sticker** | mono uppercase on acid, ink text, `rotate(-2deg)`, hard shadow `3px 3px 0 var(--ink)`, 999px radius | service cards, work cards |
**Offset shadow button** | acid bg, ink text, `box-shadow: 4px 4px 0 #000`, hover `translate(2px,2px)` + shadow `2px 2px`, active `translate(4px,4px)` + shadow none | every primary CTA |
**Stat strip** | 3 oversized numbers in serif italic with mono captions, separated by vertical lines | home (after hero) |
**Section index** | giant outlined `01`–`07` at 7rem, 8% opacity, absolutely positioned | every section |
**Marker highlight** | `background: linear-gradient(transparent 58%, rgba(200,255,61,.35) 58%)` on key phrase | headings, 1 per section |
**Cursor spotlight** | radial acid at 5% opacity following pointer, hero only, `pointer:fine` only | home hero |
**Scroll progress** | 2px acid bar, top of viewport | all pages |
**Card tilt** | `perspective(800px) rotateX/rotateY(±0.8deg)` on pointer move, reset on leave | work cards |

### 3.4 Motion system — "Alive"

This is the answer to *"make the user find it interesting."* Motion is the cheapest way to make a static studio site feel like a product, and it is where most competitors do nothing.

#### Principles

1. **Motion explains something.** Every animation must answer "what did that tell me?" — where I am, what this does, what just happened. Decorative-only motion gets cut.
2. **Maximum two moving things per viewport** at once.
3. **Transform, opacity and filter only.** Never animate width, height, top, left, or box-shadow colour on scroll.
4. **60 fps or it does not ship.** Every scroll handler is `requestAnimationFrame`-throttled and passive.
5. **Reduced motion is a first-class mode,** not a broken one.
6. **No libraries.** Target: ~220 lines of vanilla JS total, split into named modules.

#### Layer 1 — Signature motion (one per page, the thing people remember)

| Page | Effect | Detail |
|---|---|---|
**Home** | **Flow Field** | Full-hero `<canvas>`, 90–140 particles drifting on a slow curl field, 1px acid lines at 8% opacity, gentle repel within 120px of the cursor. Drift speed eases up with scroll velocity, so scrolling feels like stirring it. Fades to 0 over 700ms when the hero leaves the viewport. Pauses on `visibilitychange` and when off-screen. DPR capped at 1.5. Mobile: 50 particles, no pointer repel. |
**Work** | **X-ray scan hover** | On card hover: a 1px acid scanline sweeps top→bottom over the cover (900ms), a faint 24px technical grid fades in at 6%, corner brackets draw in, and the status sticker lifts 2px. Reads as "we inspect things for a living." CSS-only. |
**Services** | **Layer stack choreography** | Sticky 100vh container. The three layer bands slide and settle into a stacked offset as you scroll (`translateY` + `scale` driven by scroll progress, transform only). By the time you reach the end, you are looking at a physical stack of three plates. This is the "three layers, one team" idea, animated. |
**Lab Report** | **Score stamp** | Score bars fill from 0 with `cubic-bezier(.34,1.56,.64,1)`, then the letter grade stamps in with a 1.12 → 1.0 overshoot and a 2px impact nudge on the card. One reward moment, no confetti. |

And before any of it, on the homepage only: the one-time **First Light** wordmark sting (§14). It fires once per browser per week and is skippable by any input.

#### Layer 2 — Structural motion (every page)

- **Hero type reveal:** each line rises from a `clip-path` mask, 90ms stagger, 700ms total, `em` word lands last with 4% overshoot.
- **Section reveal:** `clip-path` wipe + 14px rise, 420ms, 60ms stagger, `IntersectionObserver` with `rootMargin: 0 0 -10%`.
- **Scroll progress rail:** 2px acid line at the top, width = scroll %, no animation loop (rAF on scroll only).
- **Sticky section index:** the giant `01`–`07` numeral stays pinned while its section scrolls, then hands off to the next one.
- **Page transitions:** the View Transitions API. `@view-transition { navigation: auto; }` plus a 220ms cross-fade and 8px slide. One CSS rule, no SPA, works in Chromium, silently ignored elsewhere.
- **Ticker:** 28s linear marquee, pauses on hover and on focus-within.

#### Layer 3 — Micro-interaction (the "this feels alive" layer)

| Interaction | Behaviour |
|---|---|
**Magnetic buttons** | Desktop + fine pointer only. Within 80px, the button translates up to 5px toward the cursor; the offset shadow counter-moves. Resets on leave. |
**Card tilt + spotlight** | Work cards tilt ±0.8° on pointer move, with a soft acid radial highlight following the cursor at 6%. Mobile: off. |
**Filter FLIP** | Filtering work cards animates cards to their new positions (First–Last–Invert–Play, ~20 lines) instead of snapping. The single most "product-like" detail on the site. |
**Nav underline draw** | 1px acid underline scales from left on hover, 180ms. Active page keeps it drawn. |
**Accordion** | Height animates via `grid-template-rows: 0fr → 1fr`, content staggers in 40ms per line. No measured heights, no jank. |
**Chip press** | Selected filter chips pop 1.03× and back in 120ms. |
**Form success** | The existing checkmark SVG draws its stroke (`stroke-dashoffset`), then the card lifts 4px. |
**Live studio clock** | Footer: `It's 14:32 IST — we're building.` Ticks every 30s. Human, free, weirdly engaging. |
**Counters** | The capability stats (`3 layers / 1 team / 0 handoffs`) count up once on first view, 700ms. |
**Sticker wobble** | Stickers rotate ±1° on hover. 120ms. Stupid, effective. |

#### Explicitly rejected (so the site stays premium)

Custom cursors, scroll hijacking, parallax on body text, autoplay video, particle explosions, cursor trails across the whole page, typewriter text, blinking badges, 3D tilt on every element, animated gradients, confetti.

#### Performance budget

- Canvas: one `requestAnimationFrame` loop, stopped when hidden or off-screen; resize debounced 150ms; particle count scales with viewport width.
- `content-visibility: auto` on below-fold sections.
- Max one `scroll` listener, rAF-throttled.
- No `will-change` left on permanently.
- Gate: Lighthouse mobile TBT < 200ms, CLS < 0.1, no long task > 50ms in the Performance panel.
- The flow-field canvas is a separate 2.5KB file, loaded `defer` on the homepage only.

#### Accessibility

`@media (prefers-reduced-motion: reduce)`:

- Canvas not initialised at all (checked in JS, not just CSS).
- Ticker static, tilt/magnetic/FLIP disabled, counters set instantly.
- Reveals become instant visibility.
- Progress rail still shows position (state, not motion).
- Hover/focus states keep their colour change — feedback is never removed, only movement.

#### Files

- `assets/site.css` — keyframes, transitions, `@view-transition`, reduced-motion block.
- `assets/site.js` — `ticker`, `progress`, `reveal`, `magnetic`, `tilt`, `filterFLIP`, `accordion`, `counter`, `clock`, `email`.
- `assets/flow-field.js` — new, homepage only, ~2.5KB.

### 3.5 Section rhythm

Current: every section `padding: clamp(5rem,10vw,9rem)`. V2 alternates:
`A` full-bleed dark · `B` inset panel with 18px radius and 1px line · `C` acid band (one per page max) · `D` full-bleed with oversized background numeral.
This alone removes most of the "composed" feel.

---

## 4. Hero rewrite (homepage)

**Eyebrow options (no place):**

1. `Interfaces · Systems · Intelligence` ← recommended, reinforces the 3-layer model
2. `Founder-led · In-house · Shipping`
3. `A small studio with a big build list`

**Headline:** keep `If it lives on a screen, we build it.` It is the strongest line on the site and already yours. Only change: set `it.` in acid italic at a larger optical size.

**Subhead (rewrite, shorter, more human):**

> Three people. Interfaces, backends and AI, built in the same room. Fixed price agreed before code, demos every week, nothing outsourced.

**Under the hero:** replace the three dot-facts with a **stat strip** (real numbers only — you supply them):

| Slot | Needs from you |
|---|---|
`01` Projects shipped | count |
`02` Live products | currently 1 (Droovee) — confirm |
`03` Avg. reply time | 48h (already claimed) |

If you do not want to publish counts, use capability stats instead (`3 layers`, `1 team`, `0 handoffs`) — playful and true.

**New hero device:** a thin acid "availability" strip above the fold: `● 2 build slots open · December` (CMS-editable via `settings`). Urgency without a fake countdown.

---

## 5. Work cards — full rebuild

Current cards are: image, name, type, one grey line. They are a portfolio index, not a sales asset. They also all have identical weight, so nothing is featured.

### New card anatomy

```
┌──────────────────────────────────────────────┐
│  [status sticker: LIVE / IN-HOUSE / OSS]     │
│                                              │
│              cover image                     │
│        (16:10, object-fit: cover)            │
│                                              │
│  01 ─────────────────────────────  ↗        │
├──────────────────────────────────────────────┤
│  Droovee                    Live platform    │
│  Chauffeur booking, end to end.              │
│  [Next.js] [Supabase] [Maps]                 │
│  Live in production · 2026                   │
└──────────────────────────────────────────────┘
```

- **Status sticker** top-left, rotated −2°, colour-coded: acid = live, blue = in-house, outline = open source.
- **Index number** `01`–`07`, mono, with a hairline rule to the arrow.
- **Hover:** x-ray scanline sweep + technical grid + corner brackets (see §3.4), image `scale(1.045)`, card lifts 4px, arrow slides 6px, acid border sweep (1px).
- **Tilt:** ±0.8° on pointer move with a soft acid spotlight, desktop only.
- **Focus-visible:** same as hover + 2px acid outline. Keyboard parity is required.
- **Whole card is one `<a>`** (already the case) with an `aria-label` that includes name + one-line description.

### Layout

- **Droovee** becomes a full-width **feature card** (2-col internal split: copy left, image right). It is the only live product; it should dominate.
- Then an **asymmetric grid**: Drishti (large), FlowOps (small), BHOOMI (small), QR (wide).
- **Filter row** above the grid: `All · Live · AI systems · Open source` — client-side, ~15 lines of JS, `aria-pressed` state. Adds interactivity and lets a visitor self-select in one click.
- **Mobile:** single column, image 4:3, sticker scales down; no horizontal scroll.

### Work index page `/work/`

Apply the same cards + filter. Add a one-line **"What this proves"** under each card (e.g. *"payments + real-time dispatch under load"*) so the page sells capability, not just artefacts.

### Honesty rule

No invented metrics. Where a number would help and you don't have one, the card says what it is instead: `Live in production`, `Open source`, `Internal build`. If you can supply 2–3 real numbers (trips booked, tickets triaged, response-time improvement), they go in the feature card only.

---

## 6. Services page — depth without a wall of text

The brief: *more information, but not everything at once*. So: **progressive disclosure around a physical metaphor.**

### Structure

1. **Hero** — `Three layers. One team.` + one-line promise. Sticky left column on desktop.
2. **The Stack** — three tall horizontal bands (`Interfaces / Systems / Intelligence`), each collapsed to: number, name, one-line promise, and a `+ What's inside` control.
   - Expanding reveals a 3-column panel: **What you get** (6–8 bullets), **How long** (range), **From** (price band), plus **Deliverables** chips and 2 links to related work.
   - Only one open at a time on mobile (accordion). On desktop, all can be open but default = first only.
3. **Compare** — a toggle `Compare all three` opens a 3-column table: best for / timeline / starting range / what's included / what's not. This is the "deep" part, hidden until asked.
4. **Pick your layer** — a 3-question chooser (radio chips, no submit): *Do you need a screen, a system, or a brain?* → recommends a layer with a one-line reason and a CTA. Playful, useful, and unique among local studios.
5. **What we don't do** — 4 honest lines (no rank guarantees, no 24/7 on-call without a retainer, no projects under ₹25k, no white-label reselling). Trust through subtraction.
6. **How a build runs** — compact 4-step timeline (reuse the homepage copy, do not duplicate it word-for-word).
7. **CTA band** — acid, single button.

### Content depth (draft, needs your price sign-off)

| Layer | What's included | Timeline | From |
|---|---|---|---|
**Interfaces** | marketing sites, landing pages, web apps, design systems, CMS, performance budgets, analytics wiring, SEO foundations, accessibility pass | 2–6 weeks | ₹25k |
**Systems** | internal tools, dashboards, APIs, integrations (payments/WhatsApp/ERP), auth + roles, migrations, admin panels, audit logs | 4–12 weeks | ₹75k |
**Intelligence** | assistants on your docs, support triage, document extraction, workflow automation, human-in-the-loop review, evals | 2–8 weeks | ₹40k |

> **Decision: publish the ranges.** A "from" price filters out unqualified enquiries and is something almost no local studio does — it is a trust differentiator, not a liability. Rules: always say "from", always say "final fixed quote after scoping", and keep each figure in a single CMS field so any number can be changed or removed in 30 seconds without touching code.

### Per-service detail pages

Keep the three money pages but:
- Rename routes to place-free slugs (§9).
- Add: `Who this is for`, `What we need from you`, `What you get`, `Timeline`, `FAQ (6)`, `Related work (2)`.
- Keep the honest price FAQ but remove the place name from the question.

---

## 7. The differentiator: **The Lab Report**

The thing competitors do not have. Not a gimmick page — a lead engine that also proves competence before you talk to anyone.

### What it is

A public tool at `/lab-report/`: paste any URL, get a **graded teardown in ~30 seconds**. No signup, no email gate for the result.

**Output card:**

```
        THE FLOW LABS · LAB REPORT
        example.com                     Grade  B−
  ─────────────────────────────────────────────
  SPEED          72   ███████░░░
  MOBILE         64   ██████░░░░
  FINDABILITY    81   ████████░░
  TRUST          90   █████████░
  CONVERSION     48   ████░░░░░░
  ─────────────────────────────────────────────
  3 things costing you enquiries:
   1. Hero headline has no outcome in it
   2. No visible phone/WhatsApp on mobile
   3. Largest image is 2.4 MB
  → Want these fixed? Send us the report.
```

### Why it wins

- **It gives value before asking.** Every competitor's site says "contact us for a free consultation"; this one is the consultation.
- **It is shareable.** A grade is a screenshot. People post grades.
- **It feeds the pipeline.** Every report ends in one CTA, pre-filled with the findings.
- **It is an SEO asset.** "Free website audit India" is a real query with weak competition.
- **It is on-brand.** It is what a lab does: measure, report, fix.

### How it is built — zero cost, free tiers only

Confirmed constraint: **the Lab Report must cost ₹0/month.** It does. Nothing here needs a paid plan.

- `/lab-report/` static page + form.
- `/api/audit.js` on Vercel Hobby (free: 100k invocations/month — this tool will use a few hundred).
- **Speed/Mobile:** Google PageSpeed Insights API, keyless and free. Optional `PSI_KEY` only if you later want a higher quota; not required.
- **Findability/Trust/Conversion:** server-side fetch of the HTML → title length, meta description, single H1, canonical, viewport, HTTPS, OG image, contact link, form/CTA presence, image alt coverage, page weight.
- **Score:** weighted 0–100, letter grade A–F.
- **Cache:** `site_audits` in Supabase free tier (`url_hash`, `report jsonb`, `created_at`), 24h TTL, ~2KB per row. Prune rows older than 7 days.
- **Rate limit:** 1 audit / IP / 5 min, plus 500/day global cap. No IP is stored — the limiter is in-memory.
- **Fails safe:** if PSI is down or quota-limited, still produce the HTML-derived report and label speed "unavailable". Never a dead end, never a paid fallback.
- **Privacy:** URL is user-supplied and cached anonymously by hash. No report is published without the owner opting in. Disclosed in `/privacy-policy/`.

If the free quota ever becomes a problem, the degradation is graceful: cached reports keep serving, new ones get the HTML-only score. No bill, ever.

### Optional second layer (cheap, no API)

**Ship Log** — a dated, public list on `/work/`: `2026-11-14 · FlowOps v2 triage accuracy +18% · shipped`. Ten lines of CMS data. It makes the studio look alive every week and costs nothing to maintain. Include only if you will actually update it; a stale log is worse than none.

### Naming

Primary: **Lab Report**. Alternatives: `The X-Ray`, `Site Autopsy` (use this for the outreach content series, which you already started in `content/autopsy-flow-labs/`), `Flow Check`. One name only, everywhere.

---

## 8. Copy bank (reuse + rewrite)

You asked whether I still have the earlier written work. **Yes.** It lives in the repo, not in a chat log:

- `SITE-OVERHAUL-PLAN.md` §6–§11 — page structure, CMS copy, SEO intent.
- `tools/site/build.py` — the full copy of every generated page, including the three service pages and all three articles.
- `index.html` — homepage copy, FAQ, process, team, references.
- `blog/*/index.html` — three full articles, still usable.
- `content/` — social scripts, captions, the autopsy series.
- `research/` — acquisition plans, code-space makeover copy.

Nothing needs to be fetched from the live site. The live site is a subset of what is in this repo.

**Voice rules for V2:** shorter sentences. Present tense. Second person. One idea per line. Opinions allowed ("most agency dashboards are theatre"). No "in today's fast-paced world", no "it's not X, it's Y", no three-item lists in every paragraph, no em-dash chains.

**Sample rewrites:**

| Now | V2 |
|---|---|
We engineer every layer — interface, infrastructure, and intelligence — under one roof. One team. Fixed-price. No handoffs. | You get the people who wrote the code. No account manager between you and the build.
Founder-led engineering studio in Bhubaneswar, Odisha. | A three-person product studio. We design it, build it, and stay for the launch.
A predictable process. | No mystery weeks.
Most agencies hand you a website. We hand you a product. | Keep this. It is the best differentiator line you own — move it into the hero-adjacent band.

---

## 9. SEO + URL migration (the part that can hurt you)

Removing the place name **will cost local search visibility**. Be clear-eyed:

- You currently rank-*intend* for "web development Bhubaneswar", "AI automation Bhubaneswar", "custom software Bhubaneswar". Those pages are the only local-intent assets on the site.
- A place-free brand competes on "product studio", "AI automation agency India", "custom software studio" — bigger pond, harder fight.
- Mitigation: keep **one** location signal Google can read (the `PostalAddress` in JSON-LD + the address line on `/contact/` + Google Business Profile). That is enough for local pack eligibility without putting the city in every headline.

### Slug changes (with 301s) — approved

Renaming, because a place-free brand with `-bhubaneswar` in the URL is a contradiction a visitor sees in the address bar. The 301s preserve whatever ranking those URLs have.

| Old | New |
|---|---|
`/services/web-development-bhubaneswar/` | `/services/web-development/`
`/services/custom-software-development-bhubaneswar/` | `/services/custom-software-development/`
`/services/ai-automation-bhubaneswar/` | `/services/ai-automation/`
`/blog/ai-automation-for-bhubaneswar-businesses/` | `/blog/ai-automation-for-small-businesses/`

Add to `vercel.json` `redirects` (permanent 301), update `sitemap.xml`, update every internal link in `build.py` + `index.html`, and delete the old output directories so the build cannot emit duplicates. Old URLs must still resolve (301) on the live host — verify with `curl -sI` after deploy.

Expected cost: local-intent rankings soften over 4–8 weeks. Offsets: `PostalAddress` in JSON-LD, the address line on `/contact/`, and Google Business Profile. Accepted deliberately.

Keep `/work/bhuverify/` — it is a project codename (BHOOMI), not a city claim. Only its SVG caption (`Bhubaneswar · R-4`) changes.

### Canonical host — locked to `www`

Decision: **`https://www.theflowlabs.online` is canonical.** Cloudflare already sends apex → www, so the code follows reality instead of fighting it. Zero dashboard changes, zero redirect risk.

Changes required:

- `index.html` canonical + `og:url`
- every generated page's canonical + `og:url` (`build.py`)
- every JSON-LD `url` and `image`
- `sitemap.xml` (regenerated by `build.py`)
- `robots.txt` sitemap line
- `.env.example` / docs references where they describe the public origin

Verification: `curl -sI https://theflowlabs.online/` still 308s to www; `curl -sI https://www.theflowlabs.online/` returns 200; canonical on 5 sampled pages matches the 200 URL exactly.

### Titles after de-localisation

| Page | New title |
|---|---|
Home | `The Flow Labs — Interfaces, Systems & AI, Built In-House`
Services | `Services — Web, Software & AI Systems | The Flow Labs`
Web | `Web Development & Product Engineering | The Flow Labs`
Custom | `Custom Software Development | The Flow Labs`
AI | `AI Automation & AI Assistants | The Flow Labs`
About | `About — A Three-Person Product Studio | The Flow Labs`
Contact | `Start a Project | The Flow Labs`
Lab Report | `Free Website Lab Report — Graded in 30 Seconds | The Flow Labs`

---

## 10. Technical work list

| File | Change |
|---|---|
`index.html` | hero eyebrow, subhead, stat strip, ticker, work cards, team roles, FAQ, footer, JSON-LD, meta, spotlight/tilt hooks, intro overlay, slot meter |
`assets/site.css` | tokens, radii, accent layer, buttons, ticker, stickers, work cards, services stack, Lab Report UI, section rhythm, reduced-motion block |
`assets/site.js` | ticker, scroll progress, reveal, magnetic buttons, card tilt, filter FLIP, services accordion, layer chooser, counters, live clock, email assembler, intro controller, slot meter
`assets/flow-field.js` | **new** — homepage-only canvas, ~2.5KB, `defer` |
`tools/site/build.py` | place-free copy, renamed routes, service depth, work index cards, footer, titles, JSON-LD, sitemap, new `/lab-report/` page |
`flow-hq/content-schema.js` | updated defaults for changed keys; add `ticker-text`, `availability-note`, `lab-report-teaser` (keep ≤ 30 home keys) |
`assets/site-cms.js` | no structural change; verify all new `data-cms` keys resolve |
`api/audit.js` | **new** — Lab Report endpoint, PSI + HTML checks, cache, rate limit |
`supabase-schema.sql` | add `site_audits` table + RLS (no anon reads), update settings seeds |
`vercel.json` | 4 × 301 redirects, `/lab-report` headers |
`sitemap.xml` | regenerated by `build.py` |
`tools/site/check_cms_keys.py` | must pass after key changes |
`privacy-policy/` | disclose Lab Report URL handling |
`SUPABASE-SETUP.md` / `README.md` | new table + env var (`PSI_KEY` optional) |

**Do not touch:** the inline Supabase form script and form markup in `index.html` (byte-identical to `HEAD`), `api/notify.js`, `assets/site-track.js`, `api/track.js`.

**New env var (optional):** `PSI_KEY` for higher PageSpeed quota. The tool works without it.

---

## 11. Phases

| Phase | Work | Est. | Ship gate |
|---|---|---|---|
**0. Checkpoint** | Scoped commit of the existing site/CMS work before anything new | 10 min | `git status` clean for site files; deploy-able tree preserved |
**A. Truth pass** | De-localise all copy/titles/JSON-LD, Smruti Ranjan + F/CF roles, email fix (code side), CTA contrast, canonical → `www`, 4 × 301 | 0.5–1 day | `build.py` + `check_cms_keys.py` clean; email visible with Cloudflare script blocked; a11y ≥ 95 |
**B. Energy layer** | Tokens, type scale, ticker, stickers, offset-shadow buttons, section rhythm, hero rebuild, view transitions | 1.5 days | No overflow 390/768/1440; reduced-motion pass; CLS < 0.1 |
**C. First Light + slots** | Intro overlay, skip logic, storage, shutter reveal; contact slot meter + CMS fields | 0.5 day | Plays once then never; skippable at any input; hidden for bots/reduced-motion; meter hides when stale |
**D. Motion system** | Flow Field canvas, hero type reveal, reveals, magnetic buttons, card tilt, nav draw, live clock, counters, scroll rail | 1.5 days | 60 fps on a mid-range Android profile; canvas stops off-screen; reduced-motion kills all of it |
**E. Work cards + `/work/`** | New card component, feature card, asymmetric grid, x-ray hover, flip-filter, "what this proves" | 1.5 days | Keyboard parity, FLIP correct, mobile single column, no CLS |
**F. Services depth** | Stack bands + choreography, progressive disclosure, compare table, layer chooser, "what we don't do", per-service depth | 1.5 days | Accordion a11y (`aria-expanded`), no shift on expand, price fields CMS-editable |
**G. Lab Report** | `/api/audit.js` (free tier), `/lab-report/` page, animated score card, cache, rate limit, privacy copy, home teaser, Ship Log | 2–3 days | Works with PSI down, 1/IP/5min, ₹0 running cost, no PII stored, cached 200 |
**H. QA + deploy** | Full matrix, redirects, sitemap, Lighthouse, commit, Vercel deploy, Cloudflare email toggle | 0.5 day | §12 all green |

**Total ≈ 10–11 working days.** A and B are independently shippable. C is one page plus two small components and can be reverted alone. G is the only phase with an external dependency, and it degrades to a static report rather than failing.

**Build state (2026-11-16):** Phases A–G implemented. Verification run just now:

| Check | Result |
|---|---|
| `python tools/site/build.py` | ✅ `generated 21 pages` |
| `python tools/site/check_cms_keys.py` | ✅ `checked 29 CMS bindings across 22 pages`, all keys resolve |
| `node --check` (`api/audit.js`, `assets/site.js`, `assets/site-cms.js`, `flow-hq/content-schema.js`) | ✅ clean |
| Local server (`:8321`) | ✅ `/`, `/contact/`, `/lab-report/`, `/services/`, `/about/`, `/work/`, `/blog/`, `/sitemap.xml` → HTTP 200 |

**Outstanding before deploy (owner / ops, not code):** run `supabase-schema.sql` in Supabase; set `PSI_KEY`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` in Vercel; Cloudflare toggle (Scrape Shield → Email Address Obfuscation = Off); confirm DNS. Nothing committed or pushed.

---

## 12. Verification matrix (must pass before deploy)

| Area | Check |
|---|---|
Build | `python tools/site/build.py` → 20 pages + `/lab-report/`; no traceback
CMS | `python tools/site/check_cms_keys.py` → 0 orphans
JS | `node --check` on every `.js`
Place | `rg -i bhubaneswar` returns only: contact address, footer address, JSON-LD `PostalAddress`, work SVG (removed), and plan docs
Email | With Cloudflare obfuscation ON and JS blocked, `hello@theflowlabs.online` still visible (noscript path)
Email | With JS on, link is a working `mailto:`; copy button writes to clipboard
CTA | `#C8FF3D` + `#08090A` = 15.98:1 (asserted); all buttons pass AA
Roles | Smruti Ranjan = Founder, Biswash = Co-Founder, Arpita = Co-Founder
Work | Cards: hover, focus, x-ray sweep, flip-filter, mobile stack, no CLS
Services | Accordion keyboard, one-open-on-mobile, compare toggle, chooser output, price fields editable
Lab Report | Valid URL, bad URL, unreachable site, PSI timeout, cached hit, rate limit, mobile render
Motion | `prefers-reduced-motion: reduce` → canvas never initialised, no ticker/tilt/magnetic/FLIP/counters
Motion | Canvas pauses on `visibilitychange` and when hero is off-screen; CPU near idle on a static page
Motion | View Transitions degrade to normal navigation in Firefox/Safari (no blank frame, no double paint)
Motion | Max two concurrent animated elements in any viewport; no animation on layout properties
Cost | Lab Report runs with zero paid services and no API key; 500/day cap enforced
Intro | Plays on `/` first load; second load in the same browser does not play
Intro | Any key/click/scroll skips within 300ms; focus never trapped; `aria-hidden`
Intro | Skipped for reduced-motion, save-data, bots and Lighthouse; `?intro=1` forces it
Intro | LCP is the overlay or hero H1, never a late font; no CLS when the overlay clears
Slots | Meter shows configured month only; past month hides; 0 left shows "full" copy
Slots | Missing CMS values hide the component; no invented default numbers
Slots | Live in the contact section only — not in nav, footer or other pages
Canonical | `www` only; apex 308s to it; canonical/OG/JSON-LD/sitemap all agree
Perf | Lighthouse mobile: perf ≥ 85, a11y ≥ 95, SEO ≥ 95, TBT < 200ms
Privacy | Lab Report stores no IP, no email, no cookies; cache keyed by URL hash only
Responsive | 390 / 768 / 1024 / 1440 → no horizontal scroll
Regression | Homepage form script + markup byte-identical to `HEAD`

---

## 13. Decisions — locked

| # | Decision | Answer |
|---|---|---|
1 | Team | **Smruti Ranjan — Founder**; Biswash — Co-Founder; Arpita — Co-Founder
2 | Slugs | **Rename** to place-free URLs, 4 × 301, old dirs removed
3 | Canonical | **`https://www.theflowlabs.online`**
4 | Services pricing | **Publish "from" ranges**, CMS-editable, revertible in one field
5 | Work metrics | **None available** → capability facts only (`Live`, `Open source`, `In-house`), no invented numbers
6 | Differentiator | **Lab Report, built on free tiers only**, ₹0/month
7 | Checkpoint commit | **Yes**, before Phase A, scoped to site files

### Auto-decided (you said "choose the best")

| Decision | Choice | Why |
|---|---|---|
Hero eyebrow | `Interfaces · Systems · Intelligence` | Reinforces the three-layer model in the first 200ms; no place, no filler
CTA accent | Acid `#C8FF3D` + ink text | 15.98:1 contrast and the single biggest energy signal on the page
Radii | 10–18px cards, pill CTAs, 3px inputs | Removes the jewellery-box sameness; pills make CTAs feel pressable
Caveat font | **Skip for now** | It is the fastest way to make a small studio look cheap. Revisit after the motion layer ships — if it still feels flat, add it in one place only.
Ship Log | **Yes**, but only if you will update it weekly | A stale log damages the "we ship" claim more than no log
Page transitions | View Transitions API | One CSS rule, free, degrades silently
Intro length | **1800ms**, once per browser per week, homepage only | Long enough to feel like a title sequence, short enough to not cost the click
Intro style | Letters + line + shutter, no spinner/counter | The 2014 loading-screen look is the fastest way to date a brand
Slots default | 4 builds/month, 2 taken, December 2026 | Placeholder values, editable in Flow HQ; hides itself if the month passes

### Confirmed inputs

1. **Starting prices** — ₹25,000 (Interfaces), ₹75,000 (Systems), ₹40,000 (Intelligence). Approved.
2. **Slot numbers** — 4 builds/month; December 2026 has 2 taken, 2 open. Approved.

---

## 14. First-load brand sting + contact FOMO

### 15.1 The intro — "First Light"

A one-time, cinematic wordmark reveal on the homepage. It is the ad before the site, except it is 1.8 seconds, silent, and never repeats for the same person.

#### Sequence (1.8s total)

| Time | What happens |
|---|---|
0ms | Full-bleed `#08090A` overlay with a faint film grain and vignette. A 1px acid line starts at 0 width, centred. |
120ms | Line grows to 56px. |
220ms | Wordmark `THE FLOW LABS` rises letter-by-letter from a mask, 35ms stagger, 8% overshoot. Instrument Serif, `clamp(3rem, 9vw, 7rem)`. |
820ms | The acid period pops in with a 1.15 → 1.0 bounce and one soft pulse of its glow. |
980ms | Mono caption fades up: `INTERFACES · SYSTEMS · INTELLIGENCE`. |
1280ms | **Shutter:** the overlay splits horizontally, top half slides up, bottom half slides down, `cubic-bezier(.76,0,.24,1)`, 520ms. The hero is already rendered underneath, so it is revealed, not loaded. |

No spinner. No percentage counter. No logo morph. No sound. Those read as 2014.

#### When it does **not** play

| Condition | Reason |
|---|---|
Already seen in the last **7 days** (`localStorage.fl_intro_at`) | "Not every time" |
Not the homepage (`/`) | Someone arriving from Google onto a service page must see the offer, not a logo |
`prefers-reduced-motion: reduce` | Accessibility |
`navigator.connection.saveData` | Data saver |
Lighthouse / PageSpeed / bot user-agent | Keep audit scores honest |
Any scroll, click, tap or keypress before it finishes | Instant skip, no jank |

`/?intro=1` forces it — for showing clients, screen recordings, or your own preview.

#### Why it does not hurt performance

- Markup is a single `display:none` div at the very top of `<body>`; a 12-line inline script adds `.intro-on` synchronously, so the hero never flashes first.
- The hero HTML, fonts and CSS load normally underneath. The overlay is pure CSS transforms — no images, no video, no canvas.
- The overlay paints instantly, so LCP is a solid-colour element rather than a late font. Content is revealed, not blocked.
- Total added weight: ~1.4KB HTML + 0.6KB inline JS + ~90 lines CSS. No new request.

#### Rules

- It plays **once per browser per week**, so a returning visitor never waits again.
- It is `aria-hidden="true"` and never traps focus. It cannot block input after 1.2s.
- If the script fails, the overlay is never shown. Fail-open, like the CMS.
- Tunable: one constant `INTRO_MS` in `site.js`. If it ever feels long, drop to 1100ms without touching anything else.

### 15.2 Contact-section FOMO — "Build slots"

Scarcity only works if it is true. So this is a **real capacity meter**, not a countdown timer.

**Placement:** only inside the contact section on the homepage (`#contact`) and above the form on `/contact/`. Nowhere else — no sticky banner, no popup.

**Design:**

```
● DECEMBER BUILDS
2 of 4 slots open
[██][██][  ][  ]
We take four builds a month so every project gets the founders.
```

- Acid pulsing dot, mono label, one bold number, four segmented bars (filled = taken).
- Sits above the form, full-width, subtle 1px border — it reads as status, not an ad.
- On mobile it stacks to two lines and the bars stay visible.

**Honest mechanics:**

- `data-month="2026-12"`, `data-total="4"`, `data-taken="2"` — set in Flow HQ, not in code.
- JS derives the month name, computes remaining, and renders the bar.
- If the configured month is in the past → **hide entirely**. No stale urgency.
- If remaining = 0 → `December is full — join the January list` with a mailto CTA. Still honest, still converts.
- If the fields are missing → hide. Never a fake default.
- Month auto-rolls on the 1st, so nobody has to remember.

**Why this is the right kind of FOMO:** it explains *why* capacity is limited ("four builds a month so every project gets the founders"), which is the same fixed-price, no-handoff promise the rest of the site makes. A countdown would contradict the brand.

**CMS keys:** `contact-slots-month`, `contact-slots-total`, `contact-slots-taken`, `contact-slots-note` (4 new keys, contact page only).

---

## 15. What I will not do

- Invent testimonials, client logos, awards or metrics.
- Put the city back into headlines "for SEO" against your instruction.
- Add a framework, a chart library, a font CDN beyond the existing Google Fonts, or a paid service.
- Break the homepage form, the cookie-less analytics, or the hidden admin.
- Ship a 5 MB hero video to feel "energised".
- Add a custom cursor, scroll hijacking, or animation that delays content or blocks input.
- Let the canvas run when the tab is hidden or the hero is off-screen.
- Show the intro more than once a week, on subpages, or to returning visitors who already know the brand.
- Use a countdown timer or fake "3 people viewing" style scarcity. The slot meter is real capacity or it is hidden.
