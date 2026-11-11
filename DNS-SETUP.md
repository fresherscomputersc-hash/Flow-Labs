# theflowlabs.online — Deliverability Setup (owner steps, ~45 min total)

Goal: cold outreach from `hello@theflowlabs.online` (or founder@) with SPF/DKIM/DMARC,
so emails land in INBOXES. The old Gmail address (theflowlabs01@gmail.com) goes back to
being the lead-alert receiver and support address ONLY. No more cold sends from it.

Estimated time: 20 min Vercel + 15 min Zoho + 10 min DNS paste + waiting for propagation.

---

## PART 1 — Vercel: attach the domain (10 min)

1. Vercel dashboard → the project → **Settings → Domains → Add** → `theflowlabs.online`
   (add both `theflowlabs.online` and `www.theflowlabs.online`; set the apex as primary,
   www redirects to it).
2. Vercel will show you DNS records to add. Typical values (yours may differ slightly,
   Vercel's dashboard text is the source of truth):

   | Type | Name | Value |
   |---|---|---|
   | A | `@` | `76.76.21.21` |
   | CNAME | `www` | `cname.vercel-dns.com` |

3. Do NOT click "redirect to vercel.app" anywhere; leave the vercel.app URL as a secondary.

After DNS propagates (minutes to a few hours), https://theflowlabs.online serves the site.
PING ME when done — I flip the site's canonical URLs from theflow-labs.vercel.app to
theflowlabs.online (one constant + regen of all pages + sitemap) and redeploy.

## PART 2 — Zoho Mail free mailbox (15 min)

1. zoho.com/mail → **Forever Free Plan** (up to 5 users, custom domain, free).
2. Add domain `theflowlabs.online`. Choose region: **India (IN) datacenter** (you're in India).
3. Create ONE user: `hello@theflowlabs.online`. (Keep it single. One warm mailbox beats two cold ones.)
4. Zoho's wizard will show a **verification TXT code** and an **SPF record**. Copy-paste
   them into the DNS sheet below (Part 3). The SPF include depends on your datacenter:
   - India: `include:zoho.in`  (US: `include:zohomail.com`, EU: `include:zoho.eu`)
   - Use exactly what Zoho's admin console displays.

## PART 3 — DNS records at your registrar (10 min paste)

Add these to theflowlabs.online's DNS zone (Namecheap/GoDaddy/Hostinger — same shapes):

| # | Type | Host/Name | Value | Notes |
|---|---|---|---|---|
| 1 | TXT | `@` | (Zoho domain-verification code from wizard) | verifies ownership |
| 2 | MX | `@` | `mx.zoho.in` (priority 10) | mail routing (IN datacenter) |
| 3 | MX | `@` | `mx2.zoho.in` (priority 20) | |
| 4 | MX | `@` | `mx3.zoho.in` (priority 50) | |
| 5 | TXT | `@` | `v=spf1 include:zoho.in ~all` | SPF: who may send for us |
| 6 | TXT | `zmail._domainkey` | (2048-bit DKIM key: Zoho Admin → Mail → DKIM → generate, then copy the TXT) | DKIM: signed mail |
| 7 | TXT | `_dmarc` | `v=DMARC1; p=none; rua=mailto:hello@theflowlabs.online` | DMARC: start at p=none |

Wait — CONFLICT ALERT: if you point MX at Zoho, mail to @theflowlabs.online stops going
anywhere else. That is correct and intended: the site never needs to receive mail on this
domain. Gmail stays the alerts/support address.

After saving, wait for propagation, then in Zoho Admin verify the domain + DKIM.

## PART 4 — Warm-up (the part everyone skips, then cries about)

Mailboxes have reputations like credit scores. Schedule, hard rules:

| Days | Volume/day | What |
|---|---|---|
| 1-5 | 5-8 | Warm-up: email friends/own accounts, reply to lead-alerts, reply threads. Real conversations. |
| 6-10 | 10-12 | Start LEADS: only our 62 verified + newly verified. Max 20 total/day. |
| 11-14 | 15-20 | Full cadence. NEVER above 20/day even when it works. |
| forever | ≤20/day | Also: ≥4h between batches, never on Sunday. |

Additional hard rules:
- 1 follow-up on Day 3, 1 on Day 7, then STOP. Most replies arrive on touch #2.
- No mass-paste. Every send goes through drafts (engine) or manually, one at a time.
- If Gmail ever warns about a sending limit on the OLD account, that account is done for
  outreach. Do not keep squeezing it.

## PART 5 — Follow-up cadence templates (paste into drafts engine)

Touch 1 = the existing 10 style drafts (or batch-2 drafts later).
Touch 2 (Day 3), same thread (REPLY, not new email):

> Subject: (same thread - just reply)
>
> Namaste/Hi [name] team,
>
> Following up once, because [number: 9.2s / Not Secure / 1,015 KB] doesn't shrink while I wait.
> The 1-page fix plan is still written and still free. Reply "send it" and it's in your
> inbox within the hour.
>
> After this, one more note next week, then I'll stop. Promise.
>
> - The Flow Labs, hello@theflowlabs.online

Touch 3 (Day 7), same thread, 4 lines max:

> Last one from me. The plan exists, it's free, and it costs you one reply.
> If timing's wrong, tell me when to check back and I actually will.
> Either way: reply STOP and I vanish. [The Flow Labs]

## PART 6 — What I do once you say the records are added

1. Flip BASE in `tools/site/build.py` → regen 19 pages + sitemap + robots → redeploy.
2. Update `icp.json` from_email → `hello@theflowlabs.online` so new drafts carry it.
3. Re-run email discovery on the no-email leads (Phase A) so the warm mailbox has a queue.
4. Set up SPF/DKIM/DMARC validation check (mail-tester free report) before the first real send.

## TODO-OWNER (only you can do these)

- [ ] Add domain in Vercel dashboard (Part 1)
- [ ] Create Zoho account + user (Part 2)
- [ ] Paste DNS records at registrar (Part 3)
- [ ] Generate DKIM in Zoho admin (Part 3, row 6)
- [ ] Complete warm-up schedule (Part 4)
