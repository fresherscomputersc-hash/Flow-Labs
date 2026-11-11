# The Flow Labs

Founder-led engineering studio in Bhubaneswar, Odisha. We design and build AI-powered workflows, responsive websites, and custom software with fixed-price scoping and transparent delivery.

Live site: [the-flow-labs.vercel.app](https://the-flow-labs.vercel.app)

---

## Architecture & Tech Stack

This project is a multi-page static site built with modern vanilla HTML, CSS, and JavaScript, paired with a lightweight Python site generator and a serverless lead capture backend.

- **Frontend**: Static HTML5, vanilla CSS (`assets/site.css`), and vanilla JavaScript (`assets/site.js`). No frontend frameworks or heavy client dependencies.
- **Typography & Design System**: Geist font family via Google Fonts, warm near-black background (`#080605`), subtle copper/amber glow accents (`#C8552B`), pure CSS star background, 1px-border cards, and responsive fluid layouts.
- **Page Generator (`tools/site/build.py`)**: Python standard-library script that serves as the single source of truth for generating all sub-pages, semantic metadata, OpenGraph tags, JSON-LD schemas (`Organization`, `Service`, `Article`, `BreadcrumbList`), `sitemap.xml`, and `robots.txt`.
- **Database & Lead Storage (Supabase)**: Form submissions write directly to the `site_leads` table via Supabase REST API using row-level security (RLS).
- **Email Notifications (`api/notify.js`)**: A Vercel serverless function triggered upon lead submission to dispatch instant lead alert emails to the founders via SMTP (Nodemailer). A client-side `mailto:` fallback is included if the API is unreachable.

---

## Directory Structure

```text
.
├── index.html                               # Studio homepage (Hero, Services, Work, FAQ, Contact)
├── assets/
│   ├── site.css                             # Unified design tokens, components, and responsive styles
│   ├── site.js                              # Header scroll behavior, mobile nav toggle, animations
│   ├── site.config.js                       # Client-side configuration (Supabase URL and anon key)
│   └── work-*                               # Project screenshots and vector asset illustrations
├── tools/site/
│   └── build.py                             # Sub-page generator, sitemap, and robots compiler
├── api/
│   └── notify.js                            # Serverless endpoint for SMTP email notifications
├── services/                                # Service landing pages
│   ├── ai-automation-bhubaneswar/
│   ├── ai-chatbot-development/
│   ├── custom-software-development-bhubaneswar/
│   └── web-development-bhubaneswar/
├── work/                                    # Case studies & lab projects
│   ├── droovee/                             # Live chauffeur booking platform
│   ├── drishti/                             # State transport fleet operations AI
│   ├── flowops/                             # AI support triage & automation console
│   ├── interview-copilot/                   # Open-source AI interview assistant
│   ├── bhuverify/                           # BHOOMI land intelligence stack
│   └── carbon-coach/                        # Open-source sustainability tracker
├── blog/                                    # Technical insights & guides
│   ├── ai-automation-for-bhubaneswar-businesses/
│   ├── custom-software-vs-ready-made-software/
│   └── how-to-plan-a-website-for-a-new-startup/
├── about/                                   # Founder-led studio statement & working model
├── contact/                                 # Dedicated enquiry page with lead capture form
├── privacy-policy/                          # User privacy and data retention policy
├── supabase-schema.sql                      # Supabase table schema, RLS policies, and indexes
├── sitemap.xml                              # XML sitemap for search indexing
└── robots.txt                               # Search crawler directives
```

---

## Local Development

### 1. View Pages Locally
Serve the root directory with any local static web server:

```bash
# Python
python -m http.server 8000

# or Node
npx serve .
```

Open `http://localhost:8000` in your browser.

### 2. Regenerating Sub-pages
When editing templates, page copy, or metadata, update `tools/site/build.py` and run:

```bash
python tools/site/build.py
```

This compiles:
- All 19 sub-pages under `services/`, `work/`, `blog/`, `about/`, `contact/`, and `privacy-policy/`
- `sitemap.xml`
- `robots.txt`

---

## Deployment & Configuration

### Hosting
Deployed automatically to **Vercel** on pushes to the repository.

### Environment Variables (for `/api/notify`)
Set these in your Vercel project settings:

| Variable | Description |
| :--- | :--- |
| `SMTP_HOST` | Outgoing SMTP server (e.g., `smtp.gmail.com` or custom relay) |
| `SMTP_PORT` | SMTP port (`465` for SSL, `587` for TLS) |
| `SMTP_USER` | SMTP username / email address |
| `SMTP_PASS` | SMTP application-specific password |
| `NOTIFY_EMAIL` | Destination email where lead notifications are delivered |

### Supabase Setup
Run the SQL queries in `supabase-schema.sql` in your Supabase SQL Editor to create the `site_leads` table, enable Row Level Security, and configure the public insertion policy. Ensure `assets/site.config.js` contains your Supabase project URL and anon public key.

---

## Contact & Inquiries

- **Email**: [theflowlabs01@gmail.com](mailto:theflowlabs01@gmail.com)
- **Instagram**: [@the.flow.labs](https://www.instagram.com/the.flow.labs/)
- **Location**: Bhubaneswar, Odisha, India
