# ISSUE.md - QR Business Platform: unfinished work and open issues

Written: 2026-11-15
Repo: `E:\qr-platform` (private, github.com/fresherscomputersc-hash/qr, branch main)
Live demo: `theflowlabs.online/qr` (passcode 5620, admin `admin@qrbiz.test` / `AdminPass123`)

---

## Part 1: Unfinished tasks

### 1. Session/login fix - DONE, live-verified (2026-11-15)
- Both bugs fixed and deployed: proxy cookie strip (response-level cookies) + ephemeral per-instance DBs (stateless HMAC-signed sessions keyed on email).
- Live verification full green on both `www.theflowlabs.online/qr` and the app's own domain: passcode 200, login 200, console 200, businesses 200.
- Optional hardening still open: set `SESSION_SECRET` in Vercel env vars (value generated for the user; falls back to a demo constant until set).

### 2. Independent QR business run (plan in Part 3)
- Decisions taken (2026-11-15): rename Vercel project (name `qrflow` was globally taken by another tenant; Vercel assigned `qr-sooty-phi`), no domain purchase yet, persistence via Neon Postgres (user could not do Oracle).
- Port status: DONE and LIVE. Zero callsite changes achieved via a sync bridge:
  - `lib/db/pg-worker.mjs`: worker thread owns the postgres.js connection; boot failures self-report through shared memory.
  - `lib/db/pg-bridge.mjs`: synchronous better-sqlite3-compatible facade over shared memory (Atomics), with lazy schema/seed boot, transactions + savepoint nesting, 12s response timeout.
  - `lib/db/client.ts`: dual mode (DATABASE_URL -> Neon bridge; unset -> SQLite as before). Local dev unchanged.
  - `db/schema.postgres.sql`: ported schema (businesses before leads; page_versions before pages; circular FKs via trailing ALTERs).
  - `scripts/migrate.mjs` + `scripts/seed.mjs`: both run in either mode (seed await-codemodded, syntax-checked).
- Neon migrated + seeded (project `frosty-hill-62190485`, production branch `br-delicate-bar-azfa2nes`, region Singapore): 18 tables, 5 demo businesses, 3 leads, audit trail, staff accounts. Connection string lives in `E:\qr-platform\.env.local` (gitignored); clean copy for Vercel at `E:\qr-platform\DATABASE-URL-FOR-VERCEL.txt` (gitignored, safe to delete after setup).
- Live verification FULL GREEN on `https://qr-sooty-phi.vercel.app/qr` (2026-11-15): passcode 200, login 200, admin console/businesses/requests/analytics/settings 200, public `/b/fdtvjd3k` 200 with Spice Route data from Neon. Data is persistent.
- Production root-cause notes: Vercel env var must be the raw URL WITHOUT quotes (the .env.local copy has quotes; Next strips them locally, Vercel does not); worker crashed silently at boot before fix, producing 30s timeouts.
- `QR_DEBUG=1` is currently set in Vercel (temporary bring-up switch that echoes 500 error details to API responses). REMOVE it once stable: Vercel env vars -> delete QR_DEBUG -> redeploy.
- Flow Labs proxy updated to `qr-sooty-phi.vercel.app` (commit `b45b25f`); proxy verification pending at the time of writing.
- BasePath URL fix (2026-11-15): QR destinations and the QRPanel link now generate `/qr/b/...`. A platform-level Vercel rewrite `/b/:path*` -> `/qr/b/:path*` in the app's `vercel.json` keeps existing printed QR codes and bare-domain `/b/<code>` links working.
- Performance fix (2026-11-15): Neon is in `ap-southeast-1`, Vercel functions ran in `iad1` (US East) -> ~320 ms/query; analytics (~100 queries) took 28 s. Fixed by pinning functions to `sin1` (`regions` in app `vercel.json`) and batching the daily scans series from 30 queries into 1.

### 3. Frozen / deferred items (need your go-ahead)
- DNS fixes on `theflowlabs.online` (steps in `DNS-SETUP.md`, 3 items: SPF merge, DMARC p=none replace, Vercel apex-primary flip). Frozen with the cold-email pause.
- Cold email: OFF by your order. 62 drafts sit in Gmail unsent. 2 stale scheduled sends (Duggal, Pearl) need manual discard when you next open Gmail. 52 queue drafts in `tools/lead-factory/data/out/emails/` still carry the old identity and old links - need a rewrite pass before they are ever usable.
- Lead merge: 300+ leads from your other machine are not merged. Waiting on you to copy `tools/lead-factory/data` from that machine into this one.
- Lead plan phases A-D: never approved.
- Next "I want that" project hosting: pipeline is proven (QR platform is live through the site), waiting on you to name the next project (candidates seen on E:\: hrm, Intellix, asqrlf, plk, cyber security, gen ai apac, portf, websites).
- Gotham-India (`E:\gotham-india`): forgotten mid-deploy. Local repo with 2 commits, never pushed. Plan in `GOTHAM-DEPLOY.md` still valid if you want to revive it.
- Supabase QA-row cleanup: deferred.
- Gmail: old app password `gviw djyv zqiu tqbw` unused - regenerate when convenient.

---

## Part 2: Known issues (current state)

### 2.1 Content does not persist on Vercel free tier (IMPORTANT, by design)
- Each serverless instance keeps its own SQLite copy in `/tmp`. A business you add, a price you edit, a page you publish - all of it can vanish or be invisible a minute later because another instance holds a different copy. Cold boot re-seeds demo data.
- Sessions are now immune to this (stateless signed cookies), but CONTENT is not.
- Consequence: the Vercel deployment is demo-grade only. Real client work needs a persistent database (Part 3, Phase 1). Do not run paying clients' pages on the current Vercel setup.

### 2.2 Demo-specific gates must change before real use
- `middleware.ts` currently locks EVERY page behind the 5620 passcode and stamps `noindex` on everything. Correct for the private demo, wrong for a real product (customer pages must be public and findable; only the console should be locked).
- Demo seed accounts (`admin@qrbiz.test` / `AdminPass123`) and synthetic businesses are baked into every boot. Real use needs a production seed: real admin account, no fake businesses.

### 2.3 Small known quirks (documented, not blockers)
- Bare root of the app domain shows 404 by design (app lives under `/qr` basePath). Fixing this is part of independent deployment (remove basePath).
- Apex domain POSTs get 308-redirected to www (apex -> www redirect). Browsers handle it; always enter via `www.theflowlabs.online`.
- First request after ~1 minute idle takes a few extra seconds (cold boot runs schema + seed). Free-tier behavior.
- Node is pinned to 22.x (`engines` in package.json): better-sqlite3 v11 has no Node 26 prebuild.
- Seed has a double-run guard so two cold-booting instances cannot duplicate demo data.

### 2.4 What IS working right now
- Showcase page `theflowlabs.online/work/qr-platform/` (200, indexed), Work grid card, sitemap.
- Proxy `/qr/*` -> `qr-the-flow-labs.vercel.app` on both `the-flow-labs.vercel.app` and `theflowlabs.online`.
- Passcode gate + noindex through the proxy; passcode 5620 verified (old passcode returns 401).
- Local run: build, smoke tests, all green on Node 22.

---

## Part 3: Plan - run the QR business independently (no Flow Labs dependency)

Goal: you own the product end to end - your deployment, your URL, your clients, your money. Three phases, cheapest first.

### Phase 0 - Standalone on Vercel, today, Rs 0 (demo can go in front of a prospect tonight)
1. Push the pending session fix (`git push origin main` in `E:\qr-platform`). Vercel redeploys automatically.
2. Keep the app's own Vercel domain as the standalone URL: `qr-the-flow-labs.vercel.app/qr` already works without touching Flow Labs at all. Optionally rename the Vercel project to a neutral name (Vercel > qr > Settings > General) so the URL stops saying "the-flow-labs" - renaming to e.g. `qrflow` gives `qrflow.vercel.app` style stable domains for free.
3. Set env vars in Vercel: `SESSION_SECRET` (any long random string). Keep `DEMO_PASSCODE=5620` for now.
4. What you CAN do at this phase: walk a prospect through the demo on your screen, close the deal, and operate their page manually for your first 1-2 clients IF you accept the content-persistence quirk (2.1) for those first jobs - you re-check their page after edits.
- What you CANNOT do: leave a paying client's page running unattended on Vercel free tier.

### Phase 1 - Persistence, the real product, Rs 0, one evening
Pick ONE (both free):
- Option A (recommended, zero code changes): Oracle Cloud Always Free VM (4 ARM cores, 24 GB RAM, forever free). Steps: create VM (Ubuntu) > install Node 22 > clone the private repo > `npm install` > `npm run db:migrate && npm run db:seed` > `npm run build && npm start` (or pm2) > open port 3000 / put Caddy in front for free HTTPS. The SQLite file lives on a real disk: content persists, sessions persist, no cold boot lag. This is the same app, unmodified, finally running like a real server.
- Option B (stay serverless): port the DB layer from better-sqlite3 to Turso (free hosted SQLite over HTTP) or Neon free Postgres. Honest cost: the whole data layer is sync better-sqlite3 - this is a real refactor across many files, not an evening task. Only pick this if you refuse to run a VM.
After choosing: switch the seed to production mode - real admin account (email + strong password via env vars), no synthetic businesses (add an env flag like `SEED_DEMO=0`).

### Phase 2 - Make it a public product (remove demo scaffolding)
1. Remove the demo gate: in `middleware.ts`, drop the passcode check entirely (the admin login already protects the console) or scope the gate to `/admin` paths only.
2. Make customer pages indexable: remove the blanket `X-Robots-Tag: noindex` for `/b/*` pages; keep `noindex` on `/admin`.
3. Remove `basePath: '/qr'` from `next.config.mjs` and delete the proxy rewrites - the app then serves at its own root.
4. Replace seed demo accounts, disable or delete `admin@qrbiz.test`.
5. Fresh verification run: create a business > add content > publish > download QR > scan with a phone > confirm the page, the tracking and the Leads tab all work.

### Phase 3 - Your own domain (cost: ~Rs 300-800 per YEAR, the only non-free item)
1. Buy the domain you want to brand (e.g. something like `qrflow.in`). Point its A/CNAME at your Phase 1 host (Vercel or the VM).
2. Update app metadata (site name, emails, footer) to your brand instead of any Flow Labs references.
3. This is also the point to split branding: Flow Labs site keeps the case study (it proves your capability), the QR product runs under its own name - one business, two storefronts.

### Operating runbook (how you actually run the business once live)
1. Client signs up -> you add them in Businesses with their category, location, contacts.
2. Build their page in the Content tab (menu/services, photos, timings, offers).
3. Publish -> download the stable QR (PNG/SVG) -> they print it.
4. Content changes any time - the printed QR never changes.
5. Check Activity/Analytics per business; contact taps land in Leads - that is the report you send the client every week/month (this report IS your retention pitch).
6. Monthly backup: `npm run db:backup` (script exists) on the Phase 1 VM - cron it.

### Money model that fits this product
- Setup fee per business page (you build it, they approve) + small monthly retainer for updates + monthly analytics report. The retainer is the business: printed QR never changes, your service never ends.

---

## Immediate next action (when you are ready, say the word)
1. Push commit `1e591e7` -> verify login through `www.theflowlabs.online/qr` end to end.
2. Then start Phase 0/1 of the independent run.
