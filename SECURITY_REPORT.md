# SECURITY_REPORT.md

**Project:** The Flow Labs (`www.theflowlabs.online`)
**Repository:** `E:\research\FLOWW LABS` — `main` @ `30d0fb1`
**Supabase project:** `jolcqqwvzrvqydzxpwij`
**Audit date:** 25 November 2026
**Audit type:** Read-only application security review (no remediation applied)

> **Authorization and safety.** Testing was limited to unauthenticated GET/HEAD requests, one no-op GitHub
> `ping` webhook, and client-side login probes in a browser. No account was created, no row was written, no
> email was sent, no load test was run, and no third-party system was attacked. All findings are either
> reproduced observations or direct source-code analysis.

---

## 1. Executive summary

The public marketing site has **strong transport and browser hardening** but the application layer has
**three production authentication bypasses** and a **fail-open webhook**. The admin console and client
portal are client-side demos, so the immediate data blast radius is smaller than the severity suggests —
but they are presented as real, and they are the intended control plane for a fully-modelled Supabase
schema that is already deployed.

### Risk rating

| Dimension | Rating | Basis |
|---|---|---|
| **Overall** | **High** | 3 Critical access-control bypasses, 4 High issues |
| Confidentiality | High | Portal/HQ accept anyone; lead and client data models are exposed |
| Integrity | High | Unsigned webhook can write activity; over-granted RPCs can poison audit data |
| Availability | Medium | Public mail relay, unauthenticated scan endpoint, in-memory rate limits |
| Compliance | Medium | Privacy policy narrower than deployed capability |

### Counts

| Severity | Count | IDs |
|---|---|---|
| Critical | 3 | SEC-001, SEC-002, SEC-003 |
| High | 5 | SEC-004, SEC-007, SEC-008, SEC-013, SEC-014 |
| Medium | 5 | SEC-005, SEC-006, SEC-009, SEC-010, SEC-015 |
| Low | 2 | SEC-011, SEC-012 |

> **Note on counts.** This report covers **15 security findings**: 3 Critical, **5 High** (SEC-004, SEC-007,
> SEC-008, SEC-013, SEC-014), 5 Medium (SEC-005, SEC-006, SEC-009, SEC-010, SEC-015) and 2 Low (SEC-011,
> SEC-012). The project-wide total is 45 findings across all categories; the executive split is
> 3 Critical / 7 High / 23 Medium / 12 Low, where the two additional High findings are `BUG-001` and
> `BUG-002`. See `BUGS_AND_FINDINGS.md` for the reconciled master index.

### The three that matter today

1. **SEC-001** — `flowlabs2026`, or any email containing `theflowlabs`, opens Flow HQ as **Owner**. The string
   is in the live JS bundle and in a public GitHub repository.
2. **SEC-002** — `/client` opens for **any email longer than three characters**, with no key.
3. **SEC-003** — the GitHub webhook returns `200 {"ok":true,"pong":true}` for **unsigned** requests because
   `GITHUB_WEBHOOK_SECRET` is not set and the verifier fails open.

---

## 2. Scope, method and evidence standard

### In scope
- All browser routes, with emphasis on `/flow-hq`, `/client`, `/scoping`.
- All Vercel functions under `api/`.
- Supabase schema and RLS in `supabase/migrations/0001`–`0007` and `supabase-schema.sql`.
- Supabase Auth configuration via `GET /auth/v1/settings`.
- Dependencies (`npm audit`), repository visibility, tracked secrets.
- Live response headers, redirects and one no-op webhook.

### Out of scope
- No authenticated Supabase session, no JWT forgery, no account creation.
- No SQL execution against the live database (`pg_policies` not queried).
- No SMTP send, no `/api/track` or `/api/audit` POST.
- No load, fuzz, brute-force or social-engineering testing.
- No mobile app, no third-party integrations beyond the GitHub webhook contract.

### Confidence labels
- **Confirmed** — reproduced against production or directly observed in live output.
- **Probable** — certain from source code; a production precondition was not exercised.
- **Unverified** — plausible but untested; excluded from counts.

### Environment facts used throughout

| Fact | Value | Source |
|---|---|---|
| Hosting | Vercel static export + serverless, Cloudflare in front | response headers |
| Next.js output | `output: 'export'` | `next.config.mjs` |
| Supabase signup | `disable_signup=false` | `GET /auth/v1/settings` |
| Email autoconfirm | `mailer_autoconfirm=false` | same |
| Anonymous sign-in | `false` | same |
| Repository | public, 2,478 KB, pushed 2026-11-25T06:15:32Z | GitHub API |
| Type check | `tsc --noEmit` exit 0 | local |
| Dependencies | 0 critical, 2 high, 1 moderate | `npm audit` |

---

## 3. System model and trust boundaries

```
                         ┌──────────────────────────────────────────────┐
  Internet ──TLS──▶ CF ──▶│ Vercel                                        │
                         │  ├─ static export (out/)  ← PUBLIC to all     │
                         │  │    /flow-hq, /client are plain HTML+JS     │
                         │  └─ /api/*  Node functions                    │
                         └───────┬───────────────────────┬──────────────┘
                                 │ service key           │ user JWT
                                 ▼                       ▼
                         ┌──────────────────────────────────────────────┐
                         │ Supabase (Postgres + Auth + Storage)          │
                         │  RLS: is_admin / can_access_project / …       │
                         └──────────────────────────────────────────────┘
```

**Trust boundary 1 — browser.** Because the app is a static export, every page (including `/flow-hq` and
`/client`) is publicly readable. There is no server-rendered gate and no middleware. Any authorization
decision made in React is a UX decision, not a security control.

**Trust boundary 2 — `/api`.** These functions hold the service-role key and bypass RLS. They are the only
place where server-side authorization can be enforced. Two of them (`/api/notify`, `/api/audit`) are
unauthenticated; `/api/platform/notify` authenticates but does not authorize.

**Trust boundary 3 — Supabase.** RLS is the last line of defence for direct PostgREST access from the
browser. It is generally well-structured, with two exceptions: suspended members keep project access
(SEC-013), and three `SECURITY DEFINER` RPCs are callable by every authenticated user (SEC-014).

---

## 4. Actor and capability matrix

| Actor | Can reach | Can do today |
|---|---|---|
| Anonymous visitor | all static pages, `/api/audit`, `/api/content`, `/api/settings`, `/api/track`, `/api/notify` | read marketing site, submit a lead, trigger scans, trigger mail to the owner's fixed address |
| Anyone with the published password | `/flow-hq` UI as Owner | see the full studio console (localStorage demo), create client records, download fabricated deliverables |
| Anyone with any email | `/client` portal | see a project dashboard, staging link and deliverables for a fabricated project |
| Authenticated `member`/`client` | `/api/platform/*` | read own profile, send arbitrary email via `/notify`, generate a digest |
| Authenticated `owner`/`admin` | `/api/platform/team/*`, `/api/rebuild` | manage team, trigger deploys |
| Suspended profile | PostgREST + project rows | retain member-level project access (SEC-013) |
| GitHub (unsigned) | `/api/github/webhook` | write activity/notifications via forged events (SEC-003) |

---

## 5. Authentication as built

| Surface | Claimed mechanism | Actual mechanism | Server-verified? |
|---|---|---|---|
| Flow HQ | Supabase email/password | Supabase **or** hard-coded fallback **or** one-click founder preset | No for fallback |
| Client portal | Email + access key | Email **or** access key **or** any email >3 chars | No |
| Platform API | Bearer JWT | Supabase JWT → `/auth/v1/user` → profile | Yes |
| Rebuild | Admin JWT | `is_admin()` RPC | Yes |
| GitHub webhook | HMAC SHA-256 | HMAC **only if secret is set** | No (secret unset) |
| Supabase direct | RLS | RLS helpers | Yes (with gaps) |

---

## 6. Findings

### SEC-001 — Hard-coded Flow HQ backdoor grants Owner

| Field | Value |
|---|---|
| **Severity** | **Critical** |
| **Confidence** | Confirmed (live) |
| **OWASP** | A01 Broken Access Control, A07 Authentication Failures |
| **Files** | `app/flow-hq/page.tsx` lines 428–493, 806–833 |
| **Route** | `/flow-hq` |

**Evidence.** After a failed `signInWithPassword`, the handler falls back to a hard-coded credential check:

```ts
if (
  authEmail.toLowerCase().includes('theflowlabs') ||
  authEmail.toLowerCase() === 'theflowlabs01@gmail.com' ||
  authPassword === 'flowlabs2026'
) {
  setSession({ userEmail: authEmail, userName: name, userRole: 'Owner', ... });
}
```

The same condition is duplicated in the `catch` branch. Three one-click buttons call
`handleFounderQuickLogin('smruti@theflowlabs.online', 'Owner', …)` with no credential at all.

Live confirmation:
- `https://www.theflowlabs.online/_next/static/chunks/app/flow-hq/page-11ae48b052ab6f2f.js`
  contains `flowlabs2026` and `Quick founder access`.
- Submitting `attacker@not-the-studio.com` / `flowlabs2026` rendered **"Attacker (Owner)"** and the full
  "Flow HQ Studio OS" console.
- Because the check is an `OR`, `anyone@theflowlabs.example` with **any password** also succeeds.

**Reproduction (safe, client-side only).**
1. Open `/flow-hq`.
2. Email `audit-probe@example.com`, password `flowlabs2026`.
3. Observe the console render as `Audit-probe (Owner)`.

**Root cause.** A development fallback shipped to production inside a statically exported client bundle.
No server call is made, so Supabase Auth is bypassed entirely. The static export guarantees the check is
readable by anyone.

**Impact.** Today the console's data is `localStorage` demo state, which limits direct data loss. But:
- it is the intended control plane for the real `projects`/`tasks`/`clients` schema (BUG-005);
- the same browser origin shares `flow_hq_clients` with `/client`, so a backdoor session can mint portal
  credentials;
- it destroys any claim that the console is access-controlled, and the credential is published in a public
  repository.

The moment the console is wired to Supabase with the service key or an admin session, this becomes full
studio compromise. It is Critical as an access-control defect.

**Fix.**
1. Delete the fallback branches and the three quick-login buttons.
2. Gate the console on a server-verified profile (`role in ('owner','admin')` and `status='active'`).
3. Rotate any credential that ever used `flowlabs2026`; assume it is public.
4. Treat the console as compromised until audited for unauthorized use.

---

### SEC-002 — Client portal authenticates any email longer than three characters

| Field | Value |
|---|---|
| **Severity** | **Critical** |
| **Confidence** | Confirmed (live) |
| **OWASP** | A01 Broken Access Control, A07 Authentication Failures |
| **Files** | `app/client/page.tsx` lines 144–210, 53–66 |
| **Route** | `/client` |

**Evidence.** The login matcher accepts a match on **either** identifier, then falls back to any email:

```ts
const matched = allClients.find(
  (c) => c.clientEmail.toLowerCase() === emailInput.trim().toLowerCase() ||
         c.accessKey.toUpperCase() === keyInput.trim().toUpperCase()
);
if (matched) { setSession(matched); ... }
else if (emailInput.trim().length > 3) {
  const customSession = { clientEmail: emailInput.trim(), projectName: 'Custom Sprint Build', ... };
  setSession(customSession);
  localStorage.setItem('flow_active_client_session', JSON.stringify(customSession));
}
```

The demo credential `DRV-CLIENT-9842` and the client email `rohan@droovee.in` are printed on the login
screen and shipped in the bundle.

Live confirmation: `probe-live@example.com` with a blank access key opened the portal, created
`flow_active_client_session`, and displayed "Custom Sprint Build" with deliverables.

**Root cause.** The portal has no backend. "Authentication" is a local string comparison; the fallback was
added so any prospect could preview the portal. The `||` also means knowing only the email or only the key
is sufficient.

**Impact.** Anyone can view the client-delivery UI, project metadata, sprint progress, staging links and
deliverables, and can download a fabricated "verified" completion certificate (BUG-003). If migration
`0004_client_portal.sql` is ever wired to this UI, the same path exposes real client projects.

**Fix.**
1. Remove the `else if` fallback and the demo credentials block.
2. Require **both** identifiers with `&&`, and verify server-side.
3. Use Supabase Auth magic link or an `access_key_hash` checked by a `SECURITY DEFINER` RPC that returns a
   short-lived signed session — never a client-side boolean.
4. Add rate limiting and lockout on the access-key path.

---

### SEC-003 — GitHub webhook accepts unsigned events

| Field | Value |
|---|---|
| **Severity** | **Critical** |
| **Confidence** | Confirmed (live) |
| **OWASP** | A01 Broken Access Control, A08 Software and Data Integrity Failures |
| **Files** | `api/github/webhook.js` lines 73–105; `api/platform/[...path].js` lines 190–194 |
| **Routes** | `/api/github/webhook`, `/api/platform/github` |

**Evidence.**

```js
const verifySignature = (rawBody, signature, secret) => {
  if (!secret) return true;              // development fallback
  ...
};
...
const secret = process.env.GITHUB_WEBHOOK_SECRET || '';
if (secret && !verifySignature(rawBody, signature, secret)) {
  return json(res, 401, ...);
}
```

Two independent fail-open conditions: the verifier returns `true` when the secret is empty, and the caller
skips verification entirely when the secret is empty. Live probes:

| Request | Result |
|---|---|
| `POST /api/platform/github`, `X-GitHub-Event: ping`, **no signature** | `200 {"ok":true,"pong":true,"zen":"audit probe"}` |
| Same with `X-Hub-Signature-256: sha256=deadbeef` | `200 {"ok":true,"pong":true,"zen":"audit probe"}` |

The `ping` branch returns before any database write, so this probe was non-destructive. Non-ping events
continue into `record_github_delivery` and `log_github_activity`.

**Additional weakness.** The handler falls back to the **anon key** from `assets/site.config.js` when
`SUPABASE_SERVICE_KEY` is absent (`readConfig()`), then calls service-style RPCs with it. That either fails
silently (availability) or relies on anon grants that should not exist (integrity).

**Impact.**
- Forged `push`/`pull_request`/`issues`/`issue_comment` payloads can create activity entries, notifications
  and task links attributed to arbitrary GitHub users.
- An attacker can pre-register a `X-GitHub-Delivery` value through the webhook to make the real delivery
  look like a duplicate and be dropped (idempotency poisoning).
- The audit trail becomes untrustworthy, which matters because it is the record of production changes.

**Fix.**
1. Require `GITHUB_WEBHOOK_SECRET` at startup; refuse to process events if unset (fail closed).
2. Verify the signature **before** JSON parsing, on the raw body, with `timingSafeEqual` (already used).
3. Validate `X-GitHub-Event` against an allowlist and the repository against a configured value.
4. Use the service-role key only; remove the anon-key fallback.
5. Rotate the webhook secret.

---

### SEC-004 — Public signup plus `user_metadata.role` can create an owner profile

| Field | Value |
|---|---|
| **Severity** | **High** |
| **Confidence** | Probable (latent; currently gated by `status='invited'`) |
| **OWASP** | A01 Broken Access Control, A07 Authentication Failures |
| **Files** | `supabase/migrations/0001_identity.sql` `handle_new_user()` |
| **Surface** | Supabase Auth signup |

**Evidence.** The signup trigger trusts caller-supplied metadata:

```sql
v_role := case
  when new.raw_user_meta_data ->> 'role'
       in ('owner','admin','manager','member','client')
    then (new.raw_user_meta_data ->> 'role')::public.app_role
  else 'member'::public.app_role
end;
...
status = case when new.email_confirmed_at is null then 'invited' else 'active' end
```

Supabase settings confirm `disable_signup=false` and `mailer_autoconfirm=false`, so anyone can call
`signUp({ email, password, options: { data: { role: 'owner' } } })`.

**Why it is not Critical today.** `handle_new_user` is an `AFTER INSERT` trigger only. A confirmed signup
updates `auth.users` but does **not** re-run the trigger, so `profiles.status` stays `invited`. `is_admin()`
requires `status='active'`, and `authenticate()` rejects non-active profiles. The escalation is therefore
latent: it becomes exploitable the moment an activation trigger, an admin invite, or any code path sets
`status='active'` without resetting the role.

**Impact.** A self-registered account can carry `role=owner`. Combined with any activation path, it yields
full admin over leads, projects, team and settings. It also pollutes the role model with unverified claims.

**Fix.**
1. Never read `role` from `raw_user_meta_data`; default to `member` and ignore client-supplied roles.
2. Promote only through an admin-only RPC that validates the actor.
3. Disable public signup if accounts are invite-only.
4. Add a test that signs up with `role=owner` and asserts the resulting profile is `member`/`invited`.

---

### SEC-005 — Flow HQ promotes any Supabase session to Owner client-side

| Field | Value |
|---|---|
| **Severity** | Medium |
| **Confidence** | Confirmed (code) |
| **OWASP** | A01 Broken Access Control |
| **Files** | `app/flow-hq/page.tsx` lines 366–386, 455–463 |

**Evidence.**

```ts
const { data } = await supabase.auth.getSession();
if (data?.session?.user) {
  const email = data.session.user.email || 'smruti@theflowlabs.online';
  setSession({ ..., userRole: 'Owner', ... });     // any session
}
```

A successful password sign-in is also hard-coded to `userRole: 'Admin'` (line 461), regardless of the
profile row. The role is never fetched from `profiles`.

**Impact.** Any authenticated account — including a `client` or a suspended user with a still-valid JWT —
sees the founder console and Owner/Admin affordances. Server-side RLS still blocks data it should not read,
so this is an authorization-UI defect today; it becomes privilege escalation wherever the UI's role is
trusted by a future API call.

**Fix.** After `getSession()`, select `role, status` from `profiles` and derive the UI role from the server
response; render an explicit "not authorized" screen otherwise.

---

### SEC-006 — Portal sessions live only in `localStorage`

| Field | Value |
|---|---|
| **Severity** | Medium |
| **Confidence** | Confirmed (live) |
| **OWASP** | A04 Cryptographic Failures, A07 Authentication Failures |
| **Files** | `app/client/page.tsx` lines 180–205, 212–219; `app/flow-hq/page.tsx` lines 357–364 |
| **Routes** | `/client`, `/flow-hq` |

**Evidence.** Login writes a plain JSON object under `flow_active_client_session`; HQ persists projects,
tasks, clients and leads under `flow_hq_*`. There is no signature, no expiry, no `httpOnly`, no
`SameSite`, and no server-side revocation. Live probe produced:

```json
{"clientEmail":"probe-live@example.com","clientName":"probe-live",
 "companyName":"Client Workspace","projectName":"Custom Sprint Build","projectKey":"FLW", ...}
```

**Impact.** Any script on the origin (including a future XSS) can read and rewrite the session. Sessions
survive indefinitely, are shared by anyone using the same browser profile, and cannot be revoked. The
"sign out" action only clears React state.

**Fix.** Move to server-issued sessions (Supabase SSR with `httpOnly`, `Secure`, `SameSite=Lax` cookies) or
short-lived signed tokens; add expiry and a server-side revocation list.

---

### SEC-007 — SSRF filter bypass in `/api/audit`

| Field | Value |
|---|---|
| **Severity** | **High** |
| **Confidence** | Confirmed (filter behaviour) |
| **OWASP** | A01 Broken Access Control, A10 Mishandling of Exceptional Conditions |
| **Files** | `api/audit.js` lines 83–102, 197–243, 354–365 |
| **Route** | `/api/audit` |

**Evidence.** The blocklist checks literal hostnames:

```js
if (!host.includes('.')) return null;
if (host === 'localhost' || host.endsWith('.local') || host.endsWith('.internal')) return null;
if (/^(127\.|10\.|0\.|169\.254\.|192\.168\.)/.test(host)) return null;
if (/^172\.(1[6-9]|2\d|3[01])\./.test(host)) return null;
if (/^\[?::1\]?$/.test(host)) return null;
```

Offline replication against the real function:

| Input | Result |
|---|---|
| `http://localhost` | blocked |
| `http://localhost.` | **ALLOWED** (trailing dot bypasses equality) |
| `http://localtest.me` | **ALLOWED** (public DNS → `::1`) |
| `http://127.0.0.1` | blocked |
| `http://169.254.169.254/latest/meta-data/` | blocked |
| `http://10.0.0.5`, `http://192.168.1.1`, `http://172.16.0.1` | blocked |
| `http://[::1]`, `http://[::ffff:127.0.0.1]`, `http://0x7f000001`, `http://2130706433` | blocked |

DNS resolution confirms `localhost.` → `::1` and `localtest.me` → `::1`. There is **no post-resolution
check** and no IP pinning, so any hostname an attacker controls that resolves to a private address (or
rebinds between check and fetch) passes.

**Mitigating detail.** Redirects are fetched with `redirect: 'manual'` and each `Location` is re-validated
through `normalizeUrl()` before following (`fetchHtml`, lines 197–241). The classic "302 to metadata"
variant is therefore blocked; the hostname/DNS variant is not. The fetched body is read up to 900 KB and
parsed for title/meta/headers — partial read, not blind.

**Impact.**
- Reach internal services and cloud metadata endpoints reachable by name.
- Port/host scanning via status codes and TTFB returned in the report.
- Cache poisoning of `site_audits` with attacker-chosen internal URLs.
- The endpoint is public and unauthenticated, so no account is needed.

**Fix.**
1. Resolve the hostname first; reject if **any** A/AAAA record is loopback, private, link-local, CGNAT,
   multicast, or IPv6 ULA.
2. Pin the resolved IP for the actual request (custom `lookup`/dispatcher) to defeat rebinding.
3. Allow only ports 80/443 and only `http(s)`.
4. Keep manual redirects with per-hop revalidation.
5. Prefer an egress proxy with an allowlist.

---

### SEC-008 — Email relay abuse and nodemailer injection CVEs

| Field | Value |
|---|---|
| **Severity** | **High** |
| **Confidence** | Confirmed (code); live SMTP state unverified |
| **OWASP** | A05 Injection, A01 Broken Access Control |
| **Files** | `api/notify.js`; `api/platform/[...path].js` lines 424–462; `package.json` |
| **Routes** | `/api/notify`, `/api/platform/notify` |

**Evidence — two paths.**

1. **`/api/notify` is unauthenticated.** It accepts `POST` from anyone, builds a message to a **fixed**
   recipient (`NOTIFY_TO || SMTP_USER`), and interpolates attacker-controlled `name`, `contact`,
   `project_type`, `budget` and `idea` into the subject and body. If SMTP is configured, anyone can send
   arbitrary content to the owner's inbox, repeatedly, from the studio's own mail identity.
2. **`/api/platform/notify` authenticates but does not authorize.** After `authenticate(req)` there is no
   `requireAdmin`, and `to`, `subject`, `body` and `link` are all caller-controlled:

```js
const to = b.to || process.env.NOTIFY_TO || process.env.SMTP_USER;
const subject = b.subject || ('[Flow HQ] ' + (b.title || 'Notification'));
await transporter.sendMail({ from: '"Flow HQ" <' + user + '>', to, subject, text: bodyText + link });
```

Any active profile — including a `client` account — can send arbitrary email to any address from the
studio domain.

**Dependency CVEs.** `npm audit` reports **nodemailer 6.9.16** with two advisories: "Email to an unintended
domain can occur due to Interpretation Conflict" and "SMTP command injection". Fix is `nodemailer@10.6.1`
(a semver-major upgrade). Attacker-controlled `subject`/`name` reach nodemailer, so the injection surface is
real even if exploitation depends on the SMTP server.

**Impact.** Phishing from a trusted domain, spam, SMTP quota exhaustion, sender-reputation damage, and
potential SMTP command injection. This is a high-value primitive because the domain is the studio's own.

**Fix.**
1. Delete `/api/notify` or require a signed, short-lived token plus a strict rate limit.
2. Add `requireAdmin(profile)` to `/api/platform/notify`; restrict `to` to an allowlist of team addresses.
3. Reject CR/LF in every header-bound field; use structured `replyTo` rather than string interpolation.
4. Upgrade nodemailer to ≥10.6.1 and re-test.
5. Add SPF/DKIM/DMARC monitoring for the sending domain.

---

### SEC-009 — `Access-Control-Allow-Origin: *` on the authenticated platform API

| Field | Value |
|---|---|
| **Severity** | Medium |
| **Confidence** | Confirmed |
| **OWASP** | A02 Security Misconfiguration |
| **Files** | `api/platform/[...path].js` lines 516–519 |
| **Routes** | `/api/platform/*` |

**Evidence.**

```js
res.setHeader('Access-Control-Allow-Origin', '*');
res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS');
res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
```

**Impact.** Bearer tokens (not cookies) mean this is not classic CSRF, but any website can call the API with
a token it obtains (leaked URL, malicious extension, shared browser) and read the response. It also
encourages token storage in `localStorage` (SEC-006), which is XSS-readable.

**Fix.** Allowlist `https://www.theflowlabs.online` (and localhost in dev); echo the origin only on match;
keep `Vary: Origin`.

---

### SEC-010 — In-memory rate limiting is ineffective on serverless

| Field | Value |
|---|---|
| **Severity** | Medium |
| **Confidence** | Confirmed (code) |
| **OWASP** | A06 Insecure Design, A10 Mishandling of Exceptional Conditions |
| **Files** | `api/audit.js` lines 15–26, 45–68; `api/track.js` lines 12–52 |

**Evidence.** Limits are module-level `Map`/counter state:

```js
const MAX_PER_IP = 1;
const IP_WINDOW_MS = 5 * 60 * 1000;
const MAX_PER_DAY = 500;
const ipHits = new Map();
let dayCount = 0;
```

Each Vercel lambda instance has its own memory; instances scale horizontally and are recycled. A burst
across instances multiplies the effective quota, and `dayCount` resets on cold start. The per-IP key
derives from request headers, so a client that can vary `X-Forwarded-For` may also reset its bucket.

**Impact.** `/api/audit` (third-party quota and compute) and `/api/track` (database writes) can be abused
for cost and resource exhaustion despite appearing rate-limited.

**Fix.** Use a shared store (Upstash Redis, Vercel KV, or a Postgres table with an atomic upsert) keyed by a
trusted client identifier; add a global circuit breaker; never trust a client-supplied forwarding header.

---

### SEC-011 — `/api/settings` exposes the full settings object publicly

| Field | Value |
|---|---|
| **Severity** | Low |
| **Confidence** | Confirmed (live) |
| **OWASP** | A01 Broken Access Control |
| **Files** | `api/settings.js` |
| **Route** | `/api/settings` |

**Evidence.** `GET /api/settings` returns `200` with `accent_color`, `section_home_work`,
`section_home_process`, `section_home_faq`, `section_home_team`, and the rest of the settings row. No secret
is present today, but the endpoint is an unfiltered table dump.

**Impact.** Low today; becomes a leak if a secret-bearing key (SMTP, tokens, internal URLs) is ever added to
`site_settings`.

**Fix.** Return an explicit public projection (`select=key,value` filtered by an allowlist) or remove the
endpoint (it is unused by the UI — BUG-007).

---

### SEC-012 — No application-level request-body size cap

| Field | Value |
|---|---|
| **Severity** | Low |
| **Confidence** | Confirmed (code) |
| **OWASP** | A10 Mishandling of Exceptional Conditions |
| **Files** | `api/platform/[...path].js` `readBody()` lines 63–71; `api/notify.js` |

**Evidence.** `readBody` concatenates chunks and `JSON.parse`s the result with no length check:

```js
const raw = Buffer.concat(chunks).toString('utf8');
```

Vercel enforces a platform body limit (≈4.5 MB), so this is not unbounded, but there is no application cap
and no content-type validation.

**Impact.** Memory pressure and parser cost up to the platform limit; malformed input reaches `JSON.parse`.

**Fix.** Reject `Content-Length > 100 KB`, enforce `application/json`, and validate the parsed shape.

---

### SEC-013 — Suspending a user does not revoke project access

| Field | Value |
|---|---|
| **Severity** | **High** |
| **Confidence** | Confirmed (code) |
| **OWASP** | A01 Broken Access Control |
| **Files** | `supabase/migrations/0002_work.sql` `can_access_project()`, `can_manage_project()` |
| **Surface** | RLS on `projects`, `modules`, `tasks` |

**Evidence.**

```sql
create or replace function public.can_access_project(p_project uuid)
...
  select public.is_admin()
      or exists (select 1 from public.projects p
                 where p.id = p_project and p.owner_id = auth.uid())
      or exists (select 1 from public.project_members m
                 where m.project_id = p_project and m.user_id = auth.uid());
```

There is no join to `profiles.status`. Compare `is_client_of()`, which correctly requires
`pr.status = 'active'`. So an `owner`, member or module member whose profile is set to `suspended` keeps
read/write access through RLS. `authenticate()` blocks the platform API, but direct PostgREST calls with a
still-valid JWT do not go through `authenticate()`.

**Impact.** Offboarding fails. A suspended contractor or ex-founder can continue to read and modify
projects, tasks and modules until their auth user is deleted or their membership rows are removed.

**Fix.** Add `and exists (select 1 from public.profiles p where p.id = auth.uid() and p.status='active')`
to `can_access_project`, `can_manage_project`, `can_access_module` and `can_access_task`; or revoke
memberships transactionally when status changes to `suspended`.

---

### SEC-014 — Over-granted `SECURITY DEFINER` RPCs

| Field | Value |
|---|---|
| **Severity** | **High** |
| **Confidence** | Confirmed (code) |
| **OWASP** | A01 Broken Access Control, A08 Integrity Failures |
| **Files** | `supabase/migrations/0006_notifications_triggers.sql` lines 14–43; `0007_github_integration.sql` lines 43–171 |
| **Surface** | PostgREST `/rest/v1/rpc/*` |

**Evidence.** Three `SECURITY DEFINER` functions (which run with the definer's privileges and bypass RLS)
are granted to every authenticated user:

| Function | Grant | Missing check | Abuse |
|---|---|---|---|
| `create_notification(p_user_id, p_project_id, p_kind, p_title, p_body, p_link)` | `authenticated` | no relationship or project check | send arbitrary in-app notifications to any user, with any link — phishing/spam |
| `record_github_delivery(p_delivery_id, …)` | `authenticated` | no repo/actor check | pre-insert a delivery ID so the real GitHub event is treated as a duplicate and dropped |
| `log_github_activity(p_repo, p_actor_github, p_actor_email, p_kind, …, p_meta, p_task_key)` | `authenticated` | no project/actor check | write arbitrary activity rows, attributed to anyone, into any project matched by `github_repo` |

`create_notification` does not even verify that `p_user_id` is a colleague or that the actor can access
`p_project_id`.

**Impact.** Any low-privilege account (including a client) can:
- phish other users inside the product with a trusted in-app notification;
- suppress legitimate GitHub activity (integrity/availability of the delivery log);
- poison the activity/audit trail used to reconstruct what happened.

**Fix.**
1. `revoke execute ... from authenticated` on all three; grant only to `service_role`.
2. If the client must call them, add `auth.uid()` checks: actor is an active member of the project, target
   user shares a project, and the delivery/activity is bound to an allowed repo.
3. Move webhook writes to the service key exclusively.

---

### SEC-015 — `is_admin()` allowlist fallback and a personal Gmail god account

| Field | Value |
|---|---|
| **Severity** | Medium |
| **Confidence** | Confirmed (code) |
| **OWASP** | A01 Broken Access Control, A02 Security Misconfiguration |
| **Files** | `supabase/migrations/0001_identity.sql` `is_admin()`; `supabase-schema.sql` lines 61–63 |
| **Surface** | every RLS policy that calls `is_admin()` |

**Evidence.**

```sql
select exists (
  select 1 from public.profiles p
  where p.id = auth.uid() and p.role in ('owner','admin') and p.status = 'active'
)
or exists (                       -- Temporary fallback so a fresh migration cannot lock admins out.
  select 1 from public.admin_users a
  where lower(a.email) = lower(coalesce(auth.jwt() ->> 'email', ''))
);
```

`admin_users` is seeded with `theflowlabs01@gmail.com`. The fallback path ignores `profiles.status`, so that
address is a permanent admin that cannot be suspended through the profile lifecycle, and it is a personal
Gmail account outside the studio domain (no centralized MFA/offboarding).

**Impact.** A single compromised personal mailbox yields full admin over leads, projects, team and settings.
The "temporary" bootstrap path has no expiry.

**Fix.** Remove the fallback once a real owner exists, or require the matched profile to also be
`status='active'`. Replace the personal address with a dedicated ops identity with hardware MFA, and add a
migration that fails if `admin_users` is non-empty after bootstrap.

---

## 7. Database and RLS review

### Helper functions

| Function | Checks | Status |
|---|---|---|
| `is_admin()` | profile `role in (owner,admin)` **and** `status='active'` **or** `admin_users` email match | ⚠ SEC-015 (fallback ignores status) |
| `is_client()` | profile role `client` and active | OK |
| `is_client_of(project)` | `project_clients` + profile role `client` + `status='active'` | OK |
| `can_access_project(project)` | admin, owner, or `project_members` | ⚠ SEC-013 (no status) |
| `can_manage_project(project)` | admin, owner, or manager member | ⚠ SEC-013 (no status) |
| `can_access_module`, `can_access_task` | project/module membership | ⚠ inherits SEC-013 |
| `guard_profile_fields()` | blocks self-change of `role`/`status` | ✅ positive control |

### Policy posture

- `projects`, `modules`, `tasks`, `activity`, `notifications`, `client_updates`, `attachments` all have RLS
  enabled and are scoped through the helpers above.
- `site_leads` allows `anon` INSERT with `with check (true)` — intended (public form) — and admin-only
  SELECT/UPDATE/DELETE via `is_admin()`. ✅
- `admin_users` has RLS enabled with **no policies**, so only the service role can read it. ✅
- `profiles` is self-read/self-update with `guard_profile_fields` protection; admin insert/update. ✅
- `github_deliveries` and `audit_log` are written by `SECURITY DEFINER` functions — but the functions are
  over-granted (SEC-014).

### Grants that should be reviewed

```sql
grant execute on function public.create_notification(...)          to authenticated;  -- SEC-014
grant execute on function public.record_github_delivery(...)       to authenticated;  -- SEC-014
grant execute on function public.log_github_activity(...)          to authenticated;  -- SEC-014
grant select, update, delete on public.site_leads to authenticated;                    -- gated by RLS, OK
grant insert on public.site_leads to anon, authenticated;                              -- intended
```

### Migration state caveat

Conclusions are from migration source, not from live `pg_policies`. The applied state could differ. Before
remediation, run the verification queries in `TEST_PLAN.md` §6 against the project and compare.

---

## 8. API inventory

| Endpoint | Method | Auth | Authorization | Rate limit | Notes |
|---|---|---|---|---|---|
| `/api/audit` | POST | none | none | in-memory (SEC-010) | SSRF surface (SEC-007) |
| `/api/content` | GET | none | public read | none | unused (BUG-007) |
| `/api/settings` | GET | none | public read | none | full row (SEC-011) |
| `/api/track` | POST | none | none | in-memory | writes with service key; unused |
| `/api/notify` | POST | **none** | none | none | mail relay (SEC-008) |
| `/api/rebuild` | POST | bearer | `is_admin()` RPC | none | ✅ correct pattern |
| `/api/platform/me` | GET | bearer | self | none | 401 without token ✅ |
| `/api/platform/team` | GET | bearer | `requireAdmin` | none | ✅ |
| `/api/platform/team/invite` | POST | bearer | `requireAdmin` | none | creates auth users with service key |
| `/api/platform/team/:id` | PATCH/DELETE | bearer | `requireAdmin` + last-admin guard | none | ✅ |
| `/api/platform/notify` | POST | bearer | **any active profile** | none | arbitrary `to` (SEC-008) |
| `/api/platform/digest` | POST | bearer | any active profile | none | RLS-scoped reads |
| `/api/platform/github` | POST | **none** (secret unset) | none | none | unsigned (SEC-003) |
| `/api/github/webhook` | POST | **none** (secret unset) | none | none | same handler (INFO-001) |

---

## 9. Dependencies and supply chain

`npm audit` against the installed tree:

| Package | Severity | Advisory | Fix |
|---|---|---|---|
| `nodemailer` 6.9.16 | High | Email to an unintended domain (interpretation conflict); SMTP command injection | `10.6.1` (major) |
| `postcss` (via `next`) | High | XSS via unescaped `</style>`; arbitrary file read / info disclosure | `next@16.4.6` (major) |
| `next` | Moderate | advisory in the installed range | `next@16.4.6` (major) |

Both high fixes are semver-major and need a build/regression pass. `nodemailer` is reachable from
`/api/notify` and `/api/platform/notify` with attacker-influenced headers (SEC-008), which raises the
practical priority above a typical transitive advisory.

Supply-chain observations:
- The repository is public, so the exact dependency tree and auth logic are enumerable.
- There is no CI to run `npm audit` or pin a reviewed lockfile on every change (OPS-001).
- Third-party scripts are allowed from `cdn.jsdelivr.net` and `cdnjs.cloudflare.com` in the CSP (OPS-006).

---

## 10. Secrets and repository hygiene

| Check | Result |
|---|---|
| Service-role key in tracked files | Not found |
| SMTP password in tracked files | Not found (only empty `.env.example` keys) |
| Private keys (`BEGIN … PRIVATE KEY`) | Not found |
| Cloud/API tokens (`sk-`, `AKIA`, `ghp_`, `xoxb-`) | Not found |
| Committed `.env` | Not tracked |
| Public repository | **Yes** — `visibility=public` |
| Demo credentials in bundle | **Yes** — `flowlabs2026`, `DRV-CLIENT-9842`, client email |
| Internal planning docs public | **Yes** — `SITE-V2-PLAN.md`, `PLATFORM-PLAN.md`, `SUPABASE-SETUP.md` |

No live secret was found in the working tree. The exposure is architectural: the bypass strings and the
schema are public, so the only remaining control is server-side authorization — which SEC-001/002/003 lack.

---

## 11. OWASP Top 10 (2025) mapping

| Category | Findings |
|---|---|
| **A01 Broken Access Control** | SEC-001, SEC-002, SEC-003, SEC-004, SEC-005, SEC-011, SEC-013, SEC-014, SEC-015 |
| **A02 Security Misconfiguration** | SEC-009, SEC-015, OPS-006 (CSP), public repo |
| **A03 Software Supply Chain Failures** | nodemailer / postcss / next advisories; no CI gate |
| **A04 Cryptographic Failures** | SEC-003 (HMAC absent), SEC-006 (unsigned client state) |
| **A05 Injection** | SEC-008 (SMTP header/command injection), SEC-014 (untrusted content into notifications/activity) |
| **A06 Insecure Design** | SEC-002, SEC-005, SEC-010, BUG-005 (demo backend presented as real) |
| **A07 Authentication Failures** | SEC-001, SEC-002, SEC-004, SEC-006 |
| **A08 Software and Data Integrity Failures** | SEC-003, SEC-014, BUG-003 (fabricated certificate) |
| **A09 Security Logging and Alerting Failures** | OPS-005, BUG-001 (silent lead loss) |
| **A10 Mishandling of Exceptional Conditions** | SEC-007, SEC-012, BUG-001 (fail-open success) |

---

## 12. Positive controls (verified)

| Control | Evidence |
|---|---|
| HSTS 2 years, `includeSubDomains`, `preload` | live header |
| CSP with `default-src 'self'`, `object-src 'none'`, `frame-ancestors 'self'` | live header |
| `X-Frame-Options: SAMEORIGIN`, `nosniff`, `Referrer-Policy`, `Permissions-Policy` | live header |
| `/flow-hq` and `/client` marked `noindex, nofollow, noarchive` | live header |
| `/api/*` marked `noindex, nofollow` | `vercel.json` |
| Service key never shipped to the browser | no match in `out/`; `lib/supabase.ts` uses anon key only |
| `/api/rebuild` checks `is_admin()` server-side | source |
| `/api/platform/me` returns `401` without a token | live |
| `timingSafeEqual` for HMAC comparison | source |
| Redirects re-validated per hop in `fetchHtml` | source |
| `guard_profile_fields()` blocks self-promotion | migration |
| `admin_users` RLS with no policies | migration |
| TypeScript strict build passes | `tsc --noEmit` exit 0 |
| No high-signal secret in tracked files | scan of all tracked files |
| `rel="noopener noreferrer"` on all `target="_blank"` | 3/3 |

---

## 13. Residual risk and unverified areas

| Item | Why unverified | Risk if wrong |
|---|---|---|
| Live RLS state | No authenticated JWT used; conclusions from migrations | Applied policies may differ from source |
| SEC-004 exploitability | No account created | Could be exploitable if an activation trigger exists |
| SMTP configuration | No email sent | SEC-008 impact is zero if SMTP is unset; the endpoint is still unsafe |
| `/api/audit` live SSRF | No POST performed (writes cache, calls PSI) | Filter bypass confirmed offline; live egress unknown |
| Webhook non-ping effects | Only `ping` sent (no DB write) | Forged events would write activity if secret unset |
| Rate-limit effectiveness | No load test | Instance count and recycling unknown |
| Dependency exploitability | No PoC run | Advisories may be unreachable in this configuration |
| Client-side XSS | No injection found in reviewed code; React escapes by default | Would turn SEC-006 into session theft |

---

## 14. Remediation order (security)

1. **Immediately (same day)**
   - Remove the Flow HQ fallback and quick-login buttons (SEC-001).
   - Remove the client portal fallback and demo credentials; require server verification (SEC-002).
   - Set `GITHUB_WEBHOOK_SECRET`, fail closed, rotate it (SEC-003).
   - Delete or lock down `/api/notify` (SEC-008).
2. **This week**
   - Fix SSRF with DNS resolution + IP pinning (SEC-007).
   - Add `requireAdmin` to `/api/platform/notify`; allowlist recipients (SEC-008).
   - Add `status='active'` to project access helpers (SEC-013).
   - Revoke the three RPC grants from `authenticated` (SEC-014).
   - Stop trusting `user_metadata.role`; disable public signup (SEC-004).
3. **This sprint**
   - Server-derived roles in Flow HQ (SEC-005); server sessions (SEC-006).
   - CORS allowlist (SEC-009); shared rate-limit store (SEC-010).
   - Remove the `is_admin()` bootstrap fallback and the personal Gmail (SEC-015).
   - Tighten CSP, remove dead endpoints, add body caps (SEC-011, SEC-012, OPS-006).
4. **Next sprint**
   - Upgrade nodemailer and Next; add CI with `npm audit`, tests and a security regression suite.
   - Make the repository private and rotate anything ever committed.

Detailed, sequenced changes with verification steps are in `REMEDIATION_LOG.md`.

---

*End of `SECURITY_REPORT.md`. No remediation has been applied.*
