// POST /api/track
// Cookie-less page-view analytics. Writes with the service role key.
// No IP address, no cookies, no identifiers are stored.

const hits = new Map();

const noContent = (res) => {
  res.statusCode = 204;
  res.end();
};

const rateLimited = (ip) => {
  if (!ip) return false;
  const now = Date.now();
  const last = hits.get(ip) || 0;
  if (now - last < 1000) return true;
  hits.set(ip, now);

  // Lazy eviction keeps the map bounded on long-lived instances.
  if (hits.size > 5000) {
    for (const [key, value] of hits) {
      if (now - value > 60000) hits.delete(key);
    }
  }
  return false;
};

const normalizePage = (value) => {
  try {
    const url = new URL(String(value || '/'), 'https://www.theflowlabs.online');
    return url.pathname.slice(0, 200);
  } catch (error) {
    return '/';
  }
};

const normalizeReferrer = (value) => {
  if (!value) return null;
  try {
    const url = new URL(String(value));
    if (!/^https?:$/.test(url.protocol)) return null;
    return url.origin.slice(0, 120);
  } catch (error) {
    return null;
  }
};

const sizePart = (value) => {
  const number = Number(value);
  if (!Number.isFinite(number) || number <= 0) return 0;
  return Math.min(10000, Math.round(number));
};

module.exports = async (req, res) => {
  if (req.method === 'OPTIONS') return noContent(res);
  if (req.method !== 'POST') {
    res.statusCode = 405;
    res.setHeader('Allow', 'POST');
    res.end();
    return;
  }

  const length = Number(req.headers['content-length'] || 0);
  if (length > 2048) return noContent(res);

  let body = req.body;
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch (error) {
      return noContent(res);
    }
  }
  if (!body || typeof body !== 'object') return noContent(res);

  const page = normalizePage(body.page);
  if (page.startsWith('/flow-hq') || page.startsWith('/api/') || page.startsWith('/assets/')) {
    return noContent(res);
  }

  const agent = String(req.headers['user-agent'] || '').slice(0, 500);
  if (/bot|crawler|spider|headless|preview/i.test(agent)) return noContent(res);

  const ip = String(req.headers['x-forwarded-for'] || req.headers['x-real-ip'] || '')
    .split(',')[0]
    .trim();
  if (rateLimited(ip)) {
    res.statusCode = 429;
    res.end();
    return;
  }

  const base = String(process.env.SUPABASE_URL || '').replace(/\/+$/, '');
  const key = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || '';
  // Missing config is not a visitor-facing error.
  if (!base || !key) return noContent(res);

  const width = sizePart(body.w);
  const height = sizePart(body.h);

  const row = {
    page_url: page,
    referrer: normalizeReferrer(body.ref),
    user_agent: agent,
    screen_size: width && height ? width + 'x' + height : null,
    timestamp: new Date().toISOString()
  };

  try {
    const response = await fetch(base + '/rest/v1/site_visitors', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: key,
        Authorization: 'Bearer ' + key,
        Prefer: 'return=minimal'
      },
      body: JSON.stringify(row)
    });
    if (!response.ok && response.status !== 201) {
      // swallow: analytics must never break the page
    }
  } catch (error) {
    // swallow
  }

  return noContent(res);
};
