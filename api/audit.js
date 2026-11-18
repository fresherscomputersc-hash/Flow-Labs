// ------------------------------------------------------------
// The Flow Labs — The Lab Report
// POST /api/audit  { "url": "https://example.com" }
// Returns a small, honest score card for any public URL.
//
// Costs nothing to run:
//   - Google PageSpeed Insights (keyless works; PSI_KEY optional)
//   - Vercel Hobby for the function
//   - Supabase free tier for the 24h cache (optional)
//
// Guardrails: 1 request per IP per 5 minutes, 500 per day,
// 24h cache, private hosts blocked, 20s upstream timeout.
// ------------------------------------------------------------

const MAX_PER_IP = 1;
const IP_WINDOW_MS = 5 * 60 * 1000;
const MAX_PER_DAY = 500;
const CACHE_MS = 24 * 60 * 60 * 1000;
const UPSTREAM_TIMEOUT_MS = 20000;

// Best-effort in-memory state. A warm lambda keeps it; a cold one forgets.
// Supabase is the durable layer when it is configured.
const ipHits = new Map();
const memCache = new Map();
let dayKey = '';
let dayCount = 0;

const json = (res, status, body, extra) => {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  if (extra) {
    Object.keys(extra).forEach((k) => res.setHeader(k, extra[k]));
  }
  res.end(JSON.stringify(body));
};

const clientIp = (req) => {
  const fwd = req.headers['x-forwarded-for'];
  if (typeof fwd === 'string' && fwd.length) return fwd.split(',')[0].trim();
  return (req.socket && req.socket.remoteAddress) || 'unknown';
};

const todayKey = () => new Date().toISOString().slice(0, 10);

const takeSlot = (ip) => {
  const now = Date.now();
  const day = todayKey();
  if (day !== dayKey) { dayKey = day; dayCount = 0; }

  if (dayCount >= MAX_PER_DAY) return { ok: false, reason: 'daily' };

  const hits = (ipHits.get(ip) || []).filter((t) => now - t < IP_WINDOW_MS);
  if (hits.length >= MAX_PER_IP) {
    ipHits.set(ip, hits);
    return { ok: false, reason: 'rate', retry: Math.ceil((IP_WINDOW_MS - (now - hits[0])) / 1000) };
  }
  hits.push(now);
  ipHits.set(ip, hits);
  dayCount += 1;

  if (ipHits.size > 2000) {
    for (const [key, value] of ipHits) {
      if (!value.some((t) => now - t < IP_WINDOW_MS)) ipHits.delete(key);
    }
  }
  return { ok: true };
};

// A failed upstream call must not cost the visitor their 5-minute slot,
// otherwise the retry message is "one scan every five minutes" after an
// outage that was not their fault.
const refundSlot = (ip) => {
  const hits = ipHits.get(ip);
  if (hits && hits.length) {
    hits.pop();
    if (hits.length) ipHits.set(ip, hits);
    else ipHits.delete(ip);
  }
  if (dayCount > 0) dayCount -= 1;
};

const normalizeUrl = (raw) => {
  let value = String(raw || '').trim();
  if (!value) return null;
  if (value.length > 300) return null;
  if (!/^https?:\/\//i.test(value)) value = 'https://' + value;

  let parsed;
  try { parsed = new URL(value); } catch (e) { return null; }
  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return null;

  const host = parsed.hostname.toLowerCase();
  if (!host.includes('.')) return null;
  if (host === 'localhost' || host.endsWith('.local') || host.endsWith('.internal')) return null;
  if (/^(127\.|10\.|0\.|169\.254\.|192\.168\.)/.test(host)) return null;
  if (/^172\.(1[6-9]|2\d|3[01])\./.test(host)) return null;
  if (/^\[?::1\]?$/.test(host)) return null;

  parsed.hash = '';
  return { url: parsed.toString(), host };
};

const supabaseConfig = () => {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return { url: url.replace(/\/+$/, ''), key };
};

// Cards written before the findings fix carry a "did not return detail"
// placeholder. Treat them as stale so the old copy cannot sit in the cache
// for 24 hours after a deploy.
const isStaleCard = (payload) => {
  const findings = (payload && payload.findings) || [];
  return findings.some((line) => String(line).indexOf('did not return detail') > -1);
};

const cacheGet = async (key) => {
  const local = memCache.get(key);
  if (local && Date.now() - local.at < CACHE_MS && !isStaleCard(local.data)) return local.data;

  const sb = supabaseConfig();
  if (!sb) return null;

  try {
    const res = await fetch(
      sb.url + '/rest/v1/site_audits?select=payload,created_at&url_key=eq.' +
      encodeURIComponent(key) + '&limit=1',
      { headers: { apikey: sb.key, Authorization: 'Bearer ' + sb.key } }
    );
    if (!res.ok) return null;
    const rows = await res.json();
    const row = Array.isArray(rows) ? rows[0] : null;
    if (!row || !row.payload) return null;
    if (Date.now() - new Date(row.created_at).getTime() > CACHE_MS) return null;
    if (isStaleCard(row.payload)) return null;
    memCache.set(key, { at: Date.now(), data: row.payload });
    return row.payload;
  } catch (e) {
    return null;
  }
};

const cachePut = async (key, payload) => {
  memCache.set(key, { at: Date.now(), data: payload });
  const sb = supabaseConfig();
  if (!sb) return;
  try {
    await fetch(sb.url + '/rest/v1/site_audits?on_conflict=url_key', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: sb.key,
        Authorization: 'Bearer ' + sb.key,
        Prefer: 'resolution=merge-duplicates,return=minimal'
      },
      body: JSON.stringify([{ url_key: key, payload, created_at: new Date().toISOString() }])
    });
  } catch (e) { /* cache is optional */ }
};

const AUDIT_LABELS = {
  'largest-contentful-paint': 'The main content is slow to appear on a phone.',
  'first-contentful-paint': 'Nothing renders for too long at the start.',
  'total-blocking-time': 'JavaScript blocks the page from responding to taps.',
  'cumulative-layout-shift': 'Content jumps around while the page loads.',
  'speed-index': 'The page visibly fills in slowly.',
  'render-blocking-resources': 'Styles and scripts block the first paint.',
  'unused-javascript': 'Too much JavaScript ships that the page never uses.',
  'unused-css-rules': 'Stylesheets carry rules this page does not need.',
  'uses-responsive-images': 'Images are larger than the space they display in.',
  'modern-image-formats': 'Images use old formats instead of WebP or AVIF.',
  'offscreen-images': 'Images below the fold load before they are needed.',
  'image-alt': 'Some images have no alt text, so screen readers skip them.',
  'color-contrast': 'Some text does not have enough contrast to read comfortably.',
  'label': 'Form fields are missing proper labels.',
  'link-name': 'Some links have no readable name for screen readers.',
  'meta-description': 'The page has no meta description, so search results look empty.',
  'document-title': 'The page title is missing or too vague.',
  'crawlable-anchors': 'Some links are not crawlable by search engines.',
  'is-crawlable': 'Search engines are told not to index this page.',
  'viewport': 'The page is not set up for mobile screens.'
};

const gradeFor = (score) => {
  if (score >= 90) return 'A';
  if (score >= 75) return 'B';
  if (score >= 60) return 'C';
  if (score >= 40) return 'D';
  return 'E';
};

// ------------------------------------------------------------
// Fallback: markup-only scan when PageSpeed is unavailable.
// Fetches the raw HTML, verifies what can be verified without
// Lighthouse, and labels the result as an estimate. Redirects are
// followed manually so every hop is re-checked against the private
// host block in normalizeUrl().
// ------------------------------------------------------------
const fetchHtml = async (url) => {
  let current = url;
  for (let hop = 0; hop < 3; hop += 1) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 12000);
    const started = Date.now();
    let res;
    try {
      res = await fetch(current, {
        signal: controller.signal,
        redirect: 'manual',
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; FlowLabsLabReport/1.0; +https://www.theflowlabs.online/lab-report/)',
          Accept: 'text/html,application/xhtml+xml'
        }
      });
    } catch (e) {
      clearTimeout(timer);
      return null;
    }
    const ttfb = Date.now() - started;

    if (res.status >= 300 && res.status < 400) {
      clearTimeout(timer);
      const next = res.headers.get('location');
      if (!next) return null;
      let resolved;
      try { resolved = new URL(next, current).toString(); } catch (e) { return null; }
      const safe = normalizeUrl(resolved);
      if (!safe) return null;
      current = safe.url;
      continue;
    }

    const type = String(res.headers.get('content-type') || '');
    if (!res.ok || type.indexOf('text/html') === -1) {
      clearTimeout(timer);
      return null;
    }

    const html = (await res.text()).slice(0, 900000);
    clearTimeout(timer);
    return { html, ttfb, finalUrl: current };
  }
  return null;
};

const heuristicScan = async (target) => {
  const page = await fetchHtml(target.url);
  if (!page) return null;

  const html = page.html;
  const title = ((html.match(/<title[^>]*>([\s\S]{0,300}?)<\/title>/i) || [])[1] || '').trim();
  const desc = ((html.match(/<meta[^>]+name=["']description["'][^>]*content=["']([^"']{0,400})["']/i) || [])[1] || '').trim();
  const h1Count = (html.match(/<h1[\s>]/gi) || []).length;
  const imgs = html.match(/<img[\s>][^>]*>/gi) || [];
  const noAlt = imgs.filter((tag) => !/alt\s*=/i.test(tag)).length;
  const scripts = (html.match(/<script[\s>]/gi) || []).length;
  const hasViewport = /<meta[^>]+name=["']viewport["']/i.test(html);
  const hasLang = /<html[^>]+lang=/i.test(html);
  const kb = Math.round(html.length / 1024);

  const speed = Math.max(0, Math.min(100, 100
    - (page.ttfb > 1200 ? 45 : page.ttfb > 600 ? 25 : page.ttfb > 300 ? 10 : 0)
    - (kb > 400 ? 25 : kb > 200 ? 12 : 0)
    - (scripts > 25 ? 15 : scripts > 12 ? 7 : 0)));

  const a11y = Math.max(0, Math.min(100, 100
    - (hasLang ? 0 : 25)
    - (imgs.length ? Math.min(40, Math.round((noAlt / imgs.length) * 40)) : 0)
    - (h1Count === 0 ? 15 : 0)));

  const seo = Math.max(0, Math.min(100, 100
    - (title ? 0 : 30)
    - (title && (title.length < 15 || title.length > 70) ? 8 : 0)
    - (desc ? 0 : 25)
    - (h1Count === 1 ? 0 : 10)
    - (hasViewport ? 0 : 10)));

  const findings = [];
  if (page.ttfb > 600) findings.push('The page took ' + (page.ttfb / 1000).toFixed(1) + 's to start responding.');
  if (kb > 200) findings.push('The HTML alone is ' + kb + ' KB before images load.');
  if (!desc) findings.push('No meta description, so search results look empty.');
  if (!title) findings.push('The page title is missing.');
  if (noAlt) findings.push(noAlt + ' image' + (noAlt === 1 ? ' has' : 's have') + ' no alt text.');
  if (!hasLang) findings.push('The html tag has no lang attribute for screen readers.');
  if (!hasViewport) findings.push('No mobile viewport tag, so phones zoom out.');
  if (!findings.length) findings.push('Markup basics are clean. Speed detail needs the deeper scan.');
  findings.unshift('Estimated from the page markup — the full PageSpeed scan was unavailable.');

  const scores = [
    { label: 'Performance', value: speed },
    { label: 'Accessibility', value: a11y },
    { label: 'Search', value: seo }
  ];
  const overall = Math.round((speed + a11y + seo) / 3);

  return {
    ok: true,
    host: target.host.replace(/^www\./, ''),
    url: page.finalUrl,
    grade: gradeFor(overall),
    overall,
    scores,
    findings: findings.slice(0, 4),
    mode: 'heuristic',
    scannedAt: new Date().toISOString()
  };
};

// Lighthouse keeps the per-audit results in lighthouseResult.audits and the
// category -> audit mapping in lighthouseResult.categories[*].auditRefs.
// Reading categories[*].audits (the old shape here) always came back empty,
// which is why every scan fell through to the "no detail" copy.
const collectFindings = (lh) => {
  const findings = [];
  const seen = new Set();
  const audits = (lh && lh.audits) || {};
  const categories = (lh && lh.categories) || {};

  const relevant = new Set();
  Object.keys(categories).forEach((name) => {
    const refs = (categories[name] || {}).auditRefs || [];
    refs.forEach((ref) => { if (ref && ref.id) relevant.add(ref.id); });
  });

  Object.keys(audits).forEach((id) => {
    if (relevant.size && !relevant.has(id)) return;
    const audit = audits[id];
    if (!audit || audit.score === null || audit.score === undefined) return;
    if (audit.score >= 0.9) return;
    if (audit.scoreDisplayMode === 'informative' || audit.scoreDisplayMode === 'notApplicable') return;
    if (!AUDIT_LABELS[id] || seen.has(id)) return;
    seen.add(id);
    findings.push({ weight: audit.score, text: AUDIT_LABELS[id] });
  });

  findings.sort((a, b) => a.weight - b.weight);
  return findings.slice(0, 3).map((f) => f.text);
};

const FALLBACK_FINDINGS = [
  'The upstream scanner did not return detail this time.',
  'Run it again in a minute for a full read.',
  'Or email us the URL and we will run it by hand.'
];

const CLEAN_FINDINGS = [
  'Nothing blocking found — the page passes every check this scan measures.',
  'Scores come from Google Lighthouse on a mobile profile, run just now.',
  'Results are cached for 24 hours. Fix something and re-run to compare.'
];

module.exports = async (req, res) => {
  if (req.method !== 'POST') return json(res, 405, { ok: false, error: 'POST only' });

  let body = req.body;
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch (e) { body = {}; }
  }
  if (!body || typeof body !== 'object') body = {};

  const target = normalizeUrl(body.url);
  if (!target) return json(res, 400, { ok: false, error: 'That does not look like a public URL.' });

  const cached = await cacheGet(target.url);
  if (cached) return json(res, 200, cached, { 'X-Lab-Cache': 'hit' });

  const ip = clientIp(req);
  const slot = takeSlot(ip);
  if (!slot.ok) {
    if (slot.reason === 'daily') {
      return json(res, 429, { ok: false, error: 'The scanner has hit its daily limit. Try tomorrow.' });
    }
    return json(res, 429, {
      ok: false,
      error: 'One scan every five minutes. Try again in ' + slot.retry + ' seconds.'
    }, { 'Retry-After': String(slot.retry || 60) });
  }

  const psi = new URL('https://www.googleapis.com/pagespeedonline/v5/runPagespeed');
  psi.searchParams.set('url', target.url);
  psi.searchParams.set('strategy', 'mobile');
  ['performance', 'accessibility', 'best-practices', 'seo'].forEach((c) => psi.searchParams.append('category', c));
  if (process.env.PSI_KEY) psi.searchParams.set('key', process.env.PSI_KEY);

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), UPSTREAM_TIMEOUT_MS);

  let data;
  try {
    const upstream = await fetch(psi.toString(), { signal: controller.signal });
    if (!upstream.ok) throw new Error('psi ' + upstream.status);
    data = await upstream.json();
  } catch (e) {
    clearTimeout(timer);
    const fallback = await heuristicScan(target);
    if (fallback) {
      await cachePut(target.url, fallback);
      return json(res, 200, fallback, { 'X-Lab-Cache': 'miss-heuristic' });
    }
    refundSlot(ip);
    // 429 from Google means the PSI quota is exhausted, not that the URL is bad.
    if (/psi 429/.test(String((e && e.message) || ''))) {
      return json(res, 503, {
        ok: false,
        error: 'The scanner is out of free scans for now. Email hello@theflowlabs.online and we will run it by hand.'
      }, { 'Retry-After': '3600' });
    }
    return json(res, 503, { ok: false, error: 'The scanner is busy. Try again in a minute.' });
  }
  clearTimeout(timer);

  const lh = (data && data.lighthouseResult) || {};
  const cats = lh.categories || {};

  const scoreOf = (name) => {
    const cat = cats[name];
    if (!cat || typeof cat.score !== 'number') return null;
    return Math.round(cat.score * 100);
  };

  const scores = [];
  const perf = scoreOf('performance');
  const a11y = scoreOf('accessibility');
  const bp = scoreOf('best-practices');
  const seo = scoreOf('seo');

  if (perf !== null) scores.push({ label: 'Performance', value: perf });
  if (a11y !== null) scores.push({ label: 'Accessibility', value: a11y });
  if (seo !== null) scores.push({ label: 'Search', value: seo });
  if (bp !== null) scores.push({ label: 'Best practices', value: bp });

  if (!scores.length) {
    const fallback = await heuristicScan(target);
    if (fallback) {
      await cachePut(target.url, fallback);
      return json(res, 200, fallback, { 'X-Lab-Cache': 'miss-heuristic' });
    }
    refundSlot(ip);
    return json(res, 503, { ok: false, error: 'The scanner returned no scores for that URL.' });
  }

  const overall = Math.round(scores.reduce((sum, s) => sum + s.value, 0) / scores.length);
  const findings = collectFindings(lh);

  const payload = {
    ok: true,
    host: target.host.replace(/^www\./, ''),
    url: target.url,
    grade: gradeFor(overall),
    overall,
    scores,
    findings: findings.length ? findings : (overall >= 85 ? CLEAN_FINDINGS : FALLBACK_FINDINGS),
    scannedAt: new Date().toISOString()
  };

  await cachePut(target.url, payload);
  return json(res, 200, payload, { 'X-Lab-Cache': 'miss' });
};
