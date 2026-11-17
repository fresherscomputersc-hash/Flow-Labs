# The Flow Labs

Founder-led engineering studio in Bhubaneswar, Odisha. We design and build AI-powered workflows, responsive websites, and custom software with fixed-price scoping and transparent delivery.

Live site: [www.theflowlabs.online](https://www.theflowlabs.online)

---

## Architecture & Tech Stack

This project is a multi-page static site built with modern vanilla HTML, CSS, and JavaScript, paired with a lightweight Python site generator and a serverless lead capture backend.

- **Frontend**: Static HTML5, vanilla CSS (`assets/site.css`), and vanilla JavaScript (`assets/site.js`). No frontend frameworks or heavy client dependencies.
- **Typography & Design System**: Space Grotesk display + DM Sans body + IBM Plex Mono labels via Google Fonts. "Launch blue" palette — near-black surfaces (`#0B0B10`), silver-grey text (`#94A3B8` / `#78879E`), a single blue accent (`#3B82F6`, press `#2563EB`), pill buttons with hard 4px offset shadows, a single soft radial glow behind the hero, and a grain overlay at 3%. All animation respects `prefers-reduced-motion`.
- **Page Generator (`tools/site/build.py`)**: Python standard-library script that serves as the single source of truth for generating all sub-pages, semantic metadata, OpenGraph tags, JSON-LD schemas (`Organization`, `Service`, `Article`, `BreadcrumbList`), `sitemap.xml`, and `robots.txt`.
- **Database & Lead Storage (Supabase)**: Form submissions write directly to the `site_leads` table via Supabase REST API using row-level security (RLS).
- **Email Notifications (`api/notify.js`)**: A Vercel serverless function triggered upon lead submission to dispatch instant lead alert emails to the founders via SMTP (Nodemailer). A client-side `mailto:` fallback is included if the API is unreachable.
- **Content & Settings API (`api/content.js`, `api/settings.js`)**: Public, cached, read-only endpoints that serve CMS overrides and site settings. They fail open: if Supabase is unreachable, the hardcoded HTML stays visible.
- **Cookie-less Analytics (`api/track.js`, `assets/site-track.js`)**: Page views are counted without cookies, localStorage, fingerprinting, or stored IP addresses. Writes use the service role key server-side only.
- **Hidden Admin (`flow-hq/`)**: A noindex, unlinked console for leads, visitor stats, content overrides, and settings. Authorization is enforced by Supabase Auth plus the `is_admin()` RLS function, not by a client-side email list.

---

## Directory Structure

```text
.
├── index.html                               # Studio homepage (Hero, Services, Work, Team, FAQ, Contact)
├── assets/
│   ├── site.css                             # Design tokens, components, legacy compatibility layer
│   ├── site.js                              # Nav, mobile menu, reveals, brand intro, Flow Field canvas, slots, work filter, service stack, Lab Report client
│   ├── site-cms.js                          # Applies /api/content and /api/settings overrides
│   ├── site-track.js                        # Cookie-less page-view beacon
│   ├── site.config.js                       # Client-side configuration (Supabase URL and anon key)
│   └── work-*                               # Project screenshots and vector asset illustrations
├── flow-hq/                                 # Hidden admin console (noindex, unlinked)
│   ├── index.html
│   ├── admin.css
│   ├── admin.js
│   └── content-schema.js                    # CMS field registry shared with the admin UI
├── tools/site/
│   ├── build.py                             # Sub-page generator, sitemap, and robots compiler
│   └── check_cms_keys.py                    # Verifies every data-cms key has a schema field
├── api/
│   ├── notify.js                            # Serverless endpoint for SMTP email notifications
│   ├── content.js                           # Public CMS overrides
│   ├── settings.js                          # Public site settings
│   └── track.js                             # Cookie-less page-view ingestion
├── services/                                # Service landing pages
│   ├── web-development/
│   ├── custom-software-development/
│   ├── ai-automation/
│   └── ai-chatbot-development/
├── work/                                    # Case studies & lab projects
│   ├── droovee/                             # Live chauffeur booking platform
│   ├── drishti/                             # State transport fleet operations AI
│   ├── flowops/                             # AI support triage & automation console
│   ├── interview-copilot/                   # Open-source AI interview assistant
│   ├── bhuverify/                           # BHOOMI land intelligence stack
│   ├── carbon-coach/                        # Open-source sustainability tracker
│   └── qr-platform/                         # Managed QR pages product
├── blog/                                    # Technical insights & guides
│   ├── ai-automation-for-small-businesses/
│   ├── custom-software-vs-ready-made-software/
│   └── how-to-plan-a-website-for-a-new-startup/
├── lab-report/                              # Free public URL scanner (PageSpeed Insights)
├── about/                                   # Founder-led studio statement & working model
├── contact/                                 # Dedicated enquiry page with lead capture form
├── privacy-policy/                          # User privacy and data retention policy
├── supabase-schema.sql                      # Tables, RLS policies, is_admin(), visitor_stats()
├── sitemap.xml                              # XML sitemap for search indexing
└── robots.txt                               # Search crawler directives
```

---

## Local Development

### 1. View Pages Locally
Static pages render with any local web server, but `/api/*` routes need the Vercel runtime:

```bash
# Recommended: full parity, including API routes
npx vercel dev

# Static-only preview (no /api/content, /api/settings, /api/track)
python -m http.server 8000
```

Open `http://localhost:3000` (Vercel) or `http://localhost:8000` (static).

### 2. Regenerating Sub-pages
When editing templates, page copy, or metadata, update `tools/site/build.py` and run:

```bash
python tools/site/build.py
python tools/site/check_cms_keys.py
```

This compiles:
- All 21 sub-pages under `services/`, `work/`, `blog/`, `about/`, `contact/`, `lab-report/`, and `privacy-policy/`
- `sitemap.xml` (deduplicated, `/flow-hq/` excluded)
- `robots.txt`

`check_cms_keys.py` fails if any `data-cms` attribute has no matching field in `flow-hq/content-schema.js`, if a schema field has no home on the page, or if a `data-section` toggle has no setting.

The homepage (`index.html`) is hand-written and is not regenerated.

---

## Deployment & Configuration

### Hosting
Deployed automatically to **Vercel** on pushes to the repository.

`vercel.json` adds `X-Robots-Tag: noindex, nofollow, noarchive`, `X-Frame-Options: DENY`, and `Referrer-Policy: no-referrer` to `/flow-hq/*`.

### Environment Variables
Set these in your Vercel project settings (see `.env.example`):

| Variable | Description |
| :--- | :--- |
| `SUPABASE_URL` | Supabase project URL |
| `SUPABASE_ANON_KEY` | Public anon key, used by `/api/content` and `/api/settings` |
| `SUPABASE_SERVICE_KEY` | Service role key, used only by `/api/track` (server-side) |
| `SMTP_HOST` | Outgoing SMTP server (e.g., `smtp.gmail.com` or custom relay) |
| `SMTP_PORT` | SMTP port (`465` for SSL, `587` for TLS) |
| `SMTP_USER` | SMTP username / email address |
| `SMTP_PASS` | SMTP application-specific password |
| `NOTIFY_TO` | Destination email where lead notifications are delivered |
| `PSI_KEY` | Optional Google PageSpeed Insights API key for the Lab Report (`/api/audit`). Without it, the keyless free endpoint is used. |
| `SUPABASE_URL` | Also read by `/api/audit` to persist the 24-hour scan cache (`site_audits`). |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-side key used by `/api/audit` to write the scan cache. Falls back to `SUPABASE_ANON_KEY` if unset. |

> **Note on the Lab Report:** all three of the above are optional. With none set, `/api/audit` still scans via the keyless PageSpeed endpoint and caches in memory only. It never fails hard: if PSI is down it returns a 503 and the page shows a "try again in a minute" message.

### Supabase Setup
Run `supabase-schema.sql` in the Supabase SQL Editor. It is idempotent and creates:

- `site_leads` — insert-only for visitors, read/write for admins
- `admin_users` — allowlist checked by `is_admin()`
- `site_content` — CMS overrides, one row per page + field key
- `site_settings` — accent, section toggles, SEO defaults, build-slot keys
- `site_visitors` — anonymous page views, inserted only by the service role
- `site_audits` — The Lab Report 24-hour cache (one row per scanned URL)
- `visitor_stats()` — aggregate RPC used by the admin dashboard

Then create the admin auth user in **Authentication → Users**, insert their email into `admin_users`, and disable public signups.

### The Lab Report
`/lab-report/` is a free public URL scanner powered by `/api/audit.js`. It runs on zero paid services: Google PageSpeed Insights, Vercel Hobby, and the Supabase free tier for the 24-hour cache. Rate limits: 1 request per IP per 5 minutes, 500 per day. Scans are cached for 24 hours and never attached to an enquiry.

**Set `PSI_KEY`.** Google's keyless endpoint shares one quota across every anonymous caller, so it is regularly exhausted. With a key (free, 25,000 requests/day) the full Lighthouse scan always runs. Without one, the endpoint degrades to a markup-only estimate — response time, page weight and the SEO/accessibility basics that live in the HTML — clearly labelled as an estimate in the findings. A failed upstream call never consumes the visitor's 5-minute slot.

### Email address visibility
The live address `hello@theflowlabs.online` is assembled client-side from `data-email`/`data-user`/`data-domain` attributes so Cloudflare's Email Address Obfuscation cannot rewrite it. The `noscript` fallback prints `hello [at] theflowlabs [dot] online`. For the plain-text `mailto:` and footer link to render correctly without JavaScript, also toggle the Cloudflare setting off: **Dashboard → Security → Scrape Shield → Email Address Obfuscation = Off**.

### Hidden Admin
`/flow-hq/` is unlinked, absent from `sitemap.xml` and `robots.txt`, and served with `noindex` headers. Authorization is enforced in the database by `is_admin()` RLS policies, so an authenticated non-admin sees nothing.

### Content Overrides
Public copy is overridden through `data-cms` attributes. The admin panel writes to `site_content`; `/api/content` returns a flat `{ key: value }` map; `assets/site-cms.js` applies it after load and fails open.

Only `br`, `em`, `strong`, `b`, `i`, and `a` survive sanitisation. Everything else is flattened or removed.

Caching is 60 seconds at the edge and per function instance, so edits appear within about a minute.

---

## Contact & Inquiries

- **Email**: [hello@theflowlabs.online](mailto:hello@theflowlabs.online)
- **Instagram**: [@the.flow.labs](https://www.instagram.com/the.flow.labs/)
- **Location**: Bhubaneswar, Odisha, India
