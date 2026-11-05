# Supabase Setup — The Flow Labs site form (5 minutes, ₹0)

The form on the-flow-labs.vercel.app stores every submission in Supabase.
Until you finish these steps, submissions fall back to a **prefilled email to
theflowlabs01@gmail.com** — no lead is ever lost, but do this tonight.

## 1. Create the project (free)
1. Go to https://supabase.com → Sign up (GitHub login works) → **New project**
2. Name: `flow-labs-site`, region nearest your buyers: **Singapore/Mumbai**,
   set a DB password (save it somewhere).
3. Wait ~2 min for provisioning.

## 2. Create the table
1. In the Dashboard: **SQL Editor → New query**.
2. Copy the whole contents of `supabase-schema.sql` (repo root) → paste → **Run**.
3. You should see `Success. No rows returned`.

What it builds: table `site_leads` (name, contact, project_type, idea, budget,
source, user_agent, status) — RLS ON, **insert-only for visitors**. Nobody can
read your leads through the public key; only you in the dashboard.

## 3. Connect the site
1. Dashboard → **Settings → API** → copy **Project URL** and the **anon public**
   key (NOT the service_role key - never put that in frontend code).
2. Open `assets/site.config.js` and paste:
   ```js
   window.SITE_CONFIG = {
     supabaseUrl: "https://xxxxxxxx.supabase.co",
     supabaseAnonKey: "eyJhbGciOi..."
   };
   ```
3. Commit + push (Vercel redeploys automatically).

## 4. Verify (2 min)
1. Open the live site, fill the form with a real email, submit.
2. Dashboard → **Table Editor → site_leads** → your row is there.
3. Every new lead = status `new`. Work them here or export as CSV.

## Daily use
- New leads land in **Table Editor → site_leads** (newest first).
- Set `status` to `contacted` / `won` / `dead` in the table editor as you work them.
- The `source` column tells you where the lead came from
  (site / cold-email lane from `?src=` URLs later in P3).

## Safety notes
- The anon key in `assets/site.config.js` is safe to expose: the table only
  accepts INSERT from the public, and reading is blocked by RLS.
- The form also has a hidden honeypot field — bots "succeed" silently without
  writing a row.
