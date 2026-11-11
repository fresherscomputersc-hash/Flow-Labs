# theflowlabs.online — Deliverability Setup (owner steps, ~45 min total)

GOAL: cold outreach from `hello@theflowlabs.online` that lands in inboxes, at ₹0 cost.
Zoho's Forever Free plan was discontinued (Nov 2025), so we use the free replacement:
**Cloudflare Email Routing (free forwarding) + a FRESH Gmail account for sending.**

⚠️ Do NOT reuse theflowlabs01@gmail.com for outreach. It sent 300+ cold emails with a
10-15% bounce rate; its reputation is burnt for this job. It stays as the support/alert
address. We create one brand-new Gmail account purely for outreach sending.

---

## PART 1 — Vercel: attach the domain (10 min)

1. Vercel dashboard → the project → **Settings → Domains → Add** → `theflowlabs.online`
   (also add `www.theflowlabs.online`; set the apex as primary).
2. Note the DNS records Vercel asks for (typically: A `@` → `76.76.21.21`,
   CNAME `www` → `cname.vercel-dns.com`). You will re-enter these in Cloudflare in Part 2,
   because Cloudflare will manage the zone.
3. Do NOT redirect the site anywhere yet.

PING ME when the domain is added in Vercel — I flip the site canonicals (BASE constant
→ theflowlabs.online, regen 19 pages + sitemap) and redeploy.

## PART 2 — Cloudflare: DNS + Email Routing (15 min, free)

1. Create a free account at cloudflare.com → **Add a domain** → `theflowlabs.online`
   → choose the **Free plan**.
2. Cloudflare shows two nameservers. Go to your registrar (where you bought the domain)
   → replace the default nameservers with Cloudflare's two. (This is normal; the domain
   still points wherever the DNS records say.)
3. In Cloudflare DNS, re-add the site records from Part 1:
   | Type | Name | Value |
   |---|---|---|
   | A | `@` | `76.76.21.21` |
   | CNAME | `www` | `cname.vercel-dns.com` |
   (proxied = OFF / "DNS only" for these two, Vercel handles SSL better that way)
4. **Email** tab → **Email Routing** → enable → add destination address:
   your NEW Gmail (step below) → Cloudflare sends a verification email → confirm.
5. Create the address: Custom address `hello@theflowlows.online` → action: forward to
   the new Gmail. Also enable **catch-all** → forward everything → new Gmail (so
   replies to any@ still reach you).
   Cloudflare auto-adds its MX + SPF records for routing. Leave those untouched.

## PART 3 — Fresh Gmail identity (10 min, free)

1. Create a NEW Gmail account (e.g. `theflowlabs.outreach@gmail.com` — pick something
   clean and brandable). This account exists ONLY for the outreach engine.
2. In it: Gmail → Settings → **Accounts and Import** → **Send mail as** → add
   `hello@theflowlabs.online` → "Treat as alias" ✓ → send via **Gmail servers**
   (smtp.gmail.com NOT required; use the "Send through Gmail" option).
   Gmail sends a confirmation to hello@… → it arrives via Cloudflare routing → click it.
3. Result: you send from hello@theflowlabs.online, replies land in the new Gmail.

## PART 4 — DNS records for SENDING reputation (paste in Cloudflare)

| Type | Name | Value | Notes |
|---|---|---|---|
| TXT | `@` | `v=spf1 include:_spf.google.com ~all` | SPF: Gmail may send as us |
| TXT | `_dmarc` | `v=DMARC1; p=none; rua=mailto:hello@theflowlabs.online` | DMARC, start lenient |

(DKIM on the custom domain is not possible without Workspace; SPF alignment + Gmail
infrastructure is what the free path gives. It is a big upgrade over a burnt address.
If cold email becomes our main revenue engine, the ₹100/mo Zoho Mail Lite upgrade adds
full DKIM — decide in a month, not now.)

## PART 5 — Warm-up (the part everyone skips, then cries about)

The NEW account has zero reputation: treat the first 14 days as a credit-building game.

| Days | Volume/day | What |
|---|---|---|
| 1-5 | 5-8 | Warm-up: emails to your own accounts/friends, replies, real threads. No cold. |
| 6-10 | 10-12 | First cold sends: ONLY verified emails (the 62 + new discoveries). |
| 11-14 | 15-20 | Full cadence. |
| forever | ≤20/day | ≥4h between batches, never Sunday, never a 300-blast again. |

- Follow-up on Day 3 and Day 7 in the same thread, then STOP. Replies come on touch #2.
- Every send = one draft at a time. No mass-paste, ever.

## PART 6 — Follow-up cadence templates (same as before)

Touch 2 (Day 3, REPLY in same thread):

> Namaste/Hi [name] team,
>
> Following up once, because [9.2s / the Not Secure badge / 1,015 KB] doesn't shrink while I wait.
> The 1-page fix plan is still written and still free. Reply "send it" and it's in your
> inbox within the hour.
>
> After this, one more note next week, then I stop. Promise.
>
> - The Flow Labs, hello@theflowlabs.online

Touch 3 (Day 7, same thread, 4 lines max):

> Last one from me. The plan exists, it's free, and it costs you one reply.
> If timing's wrong, tell me when to check back and I actually will.
> Either way: reply STOP and I vanish.
> - The Flow Labs

## PART 7 — What I do on your ping

1. Domain added in Vercel → I flip `BASE` → regen all pages + sitemap → redeploy.
2. New Gmail ready → I update `icp.json` from_email to hello@theflowlabs.online.
3. You bring the other machine's `tools/lead-factory/data` folder → I dedupe the 300+
   against this repo's 161, mark bounced addresses suppressed, and re-verify the rest.
4. Phase A email discovery re-run → the warm mailbox gets a fresh verified queue.

## TODO-OWNER

- [ ] Add domain in Vercel (Part 1)
- [ ] Cloudflare zone + nameservers + Email Routing (Part 2)
- [ ] New Gmail + send-as hello@ (Part 3)
- [ ] SPF + DMARC records (Part 4)
- [ ] Respect the warm-up ladder (Part 5)
- [ ] Copy the lead-factory data folder from the other machine
