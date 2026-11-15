# ISSUE.md - QR Business Platform: unfinished work and open issues

Written: 2026-11-15
Repo: `E:\qr-platform` (private, github.com/fresherscomputersc-hash/qr, branch main)
Live demo: `theflowlabs.online/qr` (passcode 5620, admin `admin@qrbiz.test` / `AdminPass123`)

---

## Part 1: Unfinished tasks

### 1. Session/login fix - code done, deploy pending (top priority)
- What: admins could not log in through `theflowlabs.online/qr`. Two bugs found and both fixed in code:
  - Bug A: session cookie was set via Next's `cookies()` store, which Vercel's edge strips on proxied responses. Fixed by attaching the cookie to the response object (commit `341d63e`, already pushed).
  - Bug B (deeper): Vercel free tier runs multiple serverless instances, each with its own ephemeral `/tmp` database. A DB-backed session row created by the login request does not exist in the instance serving the next request. Fixed by switching to stateless HMAC-signed session cookies keyed on the admin email (commit `1e591e7`, local only, NOT pushed).
- Status: build green, local smoke green (passcode 200, login 200 + signed cookie, admin console 200, businesses 200, logout clears cookie).
- Remaining: `git push origin main` from `E:\qr-platform`, wait ~4 min for Vercel redeploy, then retest through `www.theflowlabs.online/qr`: passcode 5620 -> login -> console opens.
- Optional hardening: set `SESSION_SECRET` in Vercel env vars (falls back to a demo constant otherwise).

### 2. Independent QR business run (plan in Part 3)
- Everything needed to run the QR product as its own business, without the Flow Labs website wrapper.

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
