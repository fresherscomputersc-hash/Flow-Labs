# SEO Audit — the-flow-labs.vercel.app
Audit date: 2026-11-05 · Audited live site + repo (`index.html`, `assets/`, `api/`)

## Stack findings
- Pure static HTML (no framework, no build). Vercel static hosting + one serverless function (`api/notify.js`).
- Fully server-rendered content (all copy in HTML) → crawlable. No client-side rendering risk.
- Deploy from GitHub main, no `vercel.json`, no redirects configured.

## Audit table

| Priority | Issue | Location | Recommended fix | Status |
|---|---|---|---|---|
| Critical | No `sitemap.xml` — Google has nothing to crawl from | site root | Add XML sitemap with all canonical pages | Implemented |
| Critical | No `robots.txt` | site root | Add robots.txt allowing all + sitemap pointer | Implemented |
| Critical | No canonical URL on page | `index.html` head | Add `<link rel="canonical">` to every page | Implemented |
| Critical | Indexation ceiling: single page competes for zero specific queries; no service/portfolio/about/blog routes exist at all | whole site | Build multi-page architecture (`/services/…`, `/work/…`, `/about/`, `/contact/`, `/blog/…`, `/privacy-policy/`) | Implemented |
| High | `og:image` missing — shared links render as bare text (no social thumbnail) | `index.html` head | Add `og:image` (reuse `assets/work-droovee.png`, 1440×900) | Implemented |
| High | No `og:url`, no Twitter card meta | `index.html` head | Add og:url + twitter:card summary_large_image | Implemented |
| High | No structured data anywhere | `index.html` | Add JSON-LD `Organization` + `WebSite`; `Service` on service pages; `BreadcrumbList` on subs; `Article` on posts (accurate fields only, no invented address/reviews) | Implemented |
| High | Title doesn't state services or market ("Websites, AI, Automation & Software" — no Bhubaneswar signal, no "development") | `index.html:6` | SEO title: "AI Automation & Software Development in Bhubaneswar \| The Flow Labs" | Implemented |
| High | Meta description carries no service/market keywords | `index.html:7` | Replace with services + Bhubaneswar/India + brand voice | Implemented |
| Medium | Trust bar "10+ projects shipped" vs. only 6 projects shown — unverifiable count | `index.html:332` | Replace with verifiable framing ("6 products in the lab") | Implemented |
| Medium | No about page — E-E-A-T gap (founder-led claim, no identity page) | missing | Add `/about/` explaining real operating model; founder names marked TODO for owner | Implemented (names TODO) |
| Medium | No privacy policy despite collecting names/contacts/ideas (form compliance risk) | missing | Add `/privacy-policy/` (what's collected, why, Supabase storage, opt-out) | Implemented |
| Medium | Duplicate dead code: validation-blur block defined twice; `errContact` referenced before its `const` declaration line — works by accident, confusing to maintain | `index.html:736–753` | Remove the duplicate block, declare `errContact` before use | Implemented |
| Medium | Form modal is homepage-only; every future page needs a working enquiry path without cloning modal logic | `index.html:686–874` | Add `/contact/` page with an inline (non-modal) form; same Supabase payload + fallback chain | Implemented |
| Medium | Nav/footer links missing from planned routes; "Back to top" footer-only linking | `index.html:298–303,557–561` | Update nav: Work → `/work/`, Services → `/services/`, About, Contact → `/contact/`; footer gains Blog + Privacy links | Implemented |
| Medium | Images missing explicit dimensions → CLS guard relies on CSS aspect-ratio only | work cards | Add `width`/`height` attrs to imgs | Implemented |
| Medium | Lead form collects personal data with no visible privacy link | modal + new contact page | Privacy policy link under form + in footer | Implemented |
| Low | No `og:locale`; `lang="en"` OK for now (Hinglish copy uses en-Latn words) | head | Add `og:locale` en_IN | Implemented |
| Low | Google Fonts stylesheet is render-blocking (display=swap already on) | `index.html:14` | Acceptable; keep (compression would break caching simplicity). Documented, not changed |
| Low | PNG screenshots avg ~190 KB, lazy-loaded below fold — fine | assets/*.png | Keep; next pass could convert to WebP |
| Low | No GA4 / Search Console integration points | missing | Owner/token-based setup documented (SEARCH-CONSOLE-SETUP.md); no fake IDs injected | Implemented as guide |
| Low | No favicon.ico fallback for crawlers roots (SVG data-URI favicon present) | head | Keep; non-blocking |

## Verified claims vs. fabricated-claims check
- ✅ Droovee live product with public URL (droovee.vercel.app) — verified on homepage.
- ✅ Drishti / FlowOps / BHOOMI labeled "Built in-house"; INTERVIEW-COPILOT / Carbon Coach labeled "Open source" — distinctions preserved as-is in project pages.
- ⚠️ "10+ projects shipped" — unverifiable → replaced("…what that means for you" wording avoided; see homepage).
- ⚠️ "48h reply always / 24h teardown" — service-side promises, kept (they are commitments, not stats).
- ❌ No invented client names, revenue, user counts, or metrics added anywhere. Project pages told honestly (what + how), with `[TODO]` markers only where owner input genuinely needed.

## Performance baseline (observed, not a Lighthouse import)
- No Lighthouse run yet: baseline will be captured post-implementation vs. now to avoid invented numbers.
- Static HTML-in-browser: render-blocking CSS/JS ~11 KB + Google Fonts fetch; single JS bundle (~4 KB inline).
- Three PNGs ~578 KB total, all lazy-loaded below the fold; hero carries zero images.

## Local SEO pre-check
- Business location stated on homepage? Currently absent → get genuinely-additive "Bhubaneswar" signals via: SEO title, JSON-LD `areaServed`, service pages, about page, Droovee story. No address invented (owner must confirm operating address / GBP eligibility → documented, not fabricated).
