# Search Console + Analytics Setup Guide (owner steps)
No credentials or tokens were invented or embedded in the repo. Every step below needs YOUR account access.

## 1. Google Search Console (10 min, do this first)
1. Go to https://search.google.com/search-console → Add property.
2. Choose **Domain property** → enter `the-flow-labs.vercel.app`
   (Domain verification needs a DNS record; if you don't control DNS for that subdomain, choose **URL prefix** `https://the-flow-labs.vercel.app/` instead — Vercel supports meta-tag verification.)
3. Verify:
   - *URL prefix route:* pick "HTML tag" and add the meta tag as a custom `head` entry (Vercel project Settings → General... or ask the assistant to add the tag once you paste it — that's the one piece of config missing until verified).
   - *Domain route:* add the TXT record at your DNS provider.
4. Once verified, submit the sitemap: **Sitemaps → enter `sitemap.xml` → Submit**. It currently lists 26 URLs (all service, work, blog, about/contact/privacy pages).
5. After 3–7 days use **URL Inspection** on the money pages:
   - /services/ai-automation-bhubaneswar/
   - /services/web-development-bhubaneswar/
   - /services/custom-software-development-bhubaneswar/
   - /work/droovee/
   and "Request indexing" if they show as "Discovered - not indexed".

## 2. Custom domain (strongly recommended next, ~₹800/yr)
- Buy a domain (e.g. theflowlabs.in) → add it in Vercel → Settings → Domains.
- Then tell the assistant: canonical URLs and og:url are hardcoded to `the-flow-labs.vercel.app` in `tools/site/build.py` (BASE constant) and `index.html` — one script run updates everything.
- Do this BEFORE building backlinks so you don't accumulate links to the vercel.app URL.

## 3. Google Analytics 4 (optional, privacy-conscious)
1. analytics.google.com → create property → get Measurement ID (G-XXXXXXX).
2. Paste the measurement ID to the assistant OR add it yourself in `index.html` + `tools/site/build.py` template (one `<script async>` block).
3. Candidate events to configure (Marked as Conversion in GA4):
   - `generate_lead` on form submit (file: the `showSuccess()` call after Supabase 201)
   - `contact_click` on mailto/Instagram links
   - `service_page_view` scroll depth on service pages
4. GA4 privacy note: add a simple consent line to the privacy policy when analytics goes live (TODO marked in implementuation report).

## 4. Google Business Profile (only if eligible)
- Only if you have a genuine, verifiable operating address for Bhubaneswar: create a profile with a real address or service-area definition. Do NOT create a fake/virtual office listing — it gets suspended and hurts trust.
- Add services (AI automation, web development, custom software), real photos of work (screenshots of Droovee/Drishti are fine as "work by us"), and the site URL.
