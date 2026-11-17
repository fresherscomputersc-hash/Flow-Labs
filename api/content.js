// GET /api/content?page=home
// Public CMS overrides. Returns a flat { field_key: field_value } object.
// Cached for 60 seconds at the edge and in the function instance.

const memCache = new Map();
const TTL = 60 * 1000;

const send = (res, status, body, cache) => {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  if (cache) res.setHeader('Cache-Control', cache);
  res.end(JSON.stringify(body));
};

const clean = (value) => {
  const base = String(process.env.SUPABASE_URL || '').replace(/\/+$/, '');
  const key = process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_PUBLISHABLE_KEY || '';
  return { base, key };
};

module.exports = async (req, res) => {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return send(res, 405, { error: 'GET only' });
  }

  const page = String((req.query && req.query.page) || '').trim();
  if (!/^[a-z0-9-]{1,40}$/.test(page)) {
    return send(res, 400, { error: 'invalid page' }, 'no-store');
  }

  const fresh = String((req.query && req.query.fresh) || '') === '1';
  const cached = memCache.get(page);
  if (!fresh && cached && Date.now() - cached.at < TTL) {
    return send(res, 200, cached.value, 'public, s-maxage=60, stale-while-revalidate=300');
  }

  const { base, key } = clean();
  // Fail open: no config means the hardcoded HTML stays visible.
  if (!base || !key) return send(res, 200, {}, 'no-store');

  try {
    const url = base + '/rest/v1/site_content?select=field_key,field_value&page=eq.' + encodeURIComponent(page);
    const response = await fetch(url, {
      headers: {
        apikey: key,
        Authorization: 'Bearer ' + key,
        Accept: 'application/json'
      }
    });

    if (!response.ok) throw new Error('supabase ' + response.status);

    const rows = await response.json();
    const value = {};
    for (const row of rows || []) {
      if (row && row.field_key) value[row.field_key] = row.field_value;
    }

    if (!fresh) memCache.set(page, { at: Date.now(), value });
    return send(res, 200, value, fresh ? 'no-store' : 'public, s-maxage=60, stale-while-revalidate=300');
  } catch (error) {
    // Return an empty map rather than a visible error on the public site.
    return send(res, 200, {}, 'no-store');
  }
};
