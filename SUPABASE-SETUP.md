# Supabase Setup — forms, admin, CMS and analytics

The site uses one Supabase project for four things:

1. `site_leads` — public insert-only enquiry form (already live)
2. `admin_users` + `is_admin()` — who may use `/flow-hq/`
3. `site_content` + `site_settings` — CMS overrides and site settings
4. `site_visitors` — cookie-less page-view counts

Until step 2 is finished, form submissions fall back to a **prefilled email to
theflowlabs01@gmail.com**. No lead is lost, but do this tonight.

## 1. Create the project (free)
1. Go to https://supabase.com → Sign up (GitHub login works) → **New project**
2. Name: `flow-labs-site`, region nearest your buyers: **Singapore/Mumbai**,
   set a DB password (save it somewhere).
3. Wait ~2 min for provisioning.

## 2. Create the schema
1. In the Dashboard: **SQL Editor → New query**.
2. Copy the whole contents of `supabase-schema.sql` (repo root) → paste → **Run**.
3. You should see `Success. No rows returned`.

What it builds:

| Table | Purpose | Public access |
| :--- | :--- | :--- |
| `site_leads` | Enquiries from every form | INSERT only |
| `admin_users` | Email allowlist for Flow HQ | none |
| `site_content` | Per-page CMS overrides | none (read via `/api/content`) |
| `site_settings` | Accent, section toggles, SEO | none (read via `/api/settings`) |
| `site_visitors` | Anonymous page views | none (write via service role) |

It also creates `is_admin()` and `visitor_stats()`, indexes, and default
settings. The script is idempotent — safe to re-run after updates.

## 3. Create the admin user
1. Dashboard → **Authentication → Users → Add user**.
2. Use the founder email you want as the login, set a strong password.
3. Copy that email into the allowlist (SQL Editor):
   ```sql
   insert into public.admin_users (email)
   values ('you@example.com')
   on conflict (email) do nothing;
   ```
4. Dashboard → **Authentication → Providers → Email** → turn **off**
   "Enable signups". Public signup must stay disabled.

The schema seeds `theflowlabs01@gmail.com`; add or replace rows as needed.

Authorization is enforced in the database by `is_admin()` inside the RLS
policies. The browser never decides who is an admin; it only renders what the
policies allow.

## 4. Connect the site
1. Dashboard → **Settings → API** → copy **Project URL**, **anon public** key,
   and **service_role** key.
2. Open `assets/site.config.js` and paste the URL + anon key:
   ```js
   window.SITE_CONFIG = {
     supabaseUrl: "https://xxxxxxxx.supabase.co",
     supabaseAnonKey: "eyJhbGciOi..."
   };
   ```
   The anon key is safe to expose: public users can insert leads and nothing else.
3. Add the server-side variables in Vercel (see `.env.example`):
   `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_KEY`.
   The **service role key must never appear in frontend code**; only
   `/api/track` uses it.
4. Commit + push (Vercel redeploys automatically).

## 5. Verify (5 min)
1. Open the live site, fill the form with a real email, submit.
2. Dashboard → **Table Editor → site_leads** → your row is there.
3. Open `/flow-hq/`, sign in with the admin user.
4. **Leads** tab shows the enquiry; change its status.
5. **Visitors** tab shows at least one recent page view (after browsing the site).
6. **Content** tab: change a hero subtitle, save, wait ~60 seconds, reload the
   homepage — the new copy appears.
7. **Settings** tab: change the accent colour, save, reload — the site accent
   changes.

## Daily use
- New leads land in **Flow HQ → Leads** (newest first). Set status to
  `contacted` / `converted` / `lost` and keep private notes there.
- The `source` column shows where the lead came from (`site`, or `?src=` lanes).
- Content edits are per page (`home`, `about`, `services`, `contact`). Blank
  fields fall back to the hardcoded HTML.
- Section toggles hide homepage sections without a deploy.

## Analytics notes
- One row per page view: path, referring **origin only**, coarse screen size,
  user agent, timestamp.
- No cookies, no localStorage, no identifiers, **no IP address stored**.
- `Do Not Track` is respected; bots, `/flow-hq/`, `/api/` and asset requests are
  skipped.
- Raw rows can be pruned anytime without breaking the dashboard, e.g. keep 90
  days: `delete from public.site_visitors where timestamp < now() - interval '90 days';`

## Safety notes
- The anon key in `assets/site.config.js` is safe to expose: `site_leads` only
  accepts INSERT from the public and reading is blocked by RLS.
- The form has a hidden honeypot field — bots "succeed" silently without writing
  a row.
- The CMS only renders `br`, `em`, `strong`, `b`, `i`, and `a`. All other HTML
  is stripped or flattened before it reaches `innerHTML`.
- `/flow-hq/` is unlinked, excluded from `sitemap.xml` and `robots.txt`, marked
  `noindex`, and served with `X-Robots-Tag` and `X-Frame-Options: DENY`.
