// GET /api/settings
// Public site settings (accent, section toggles, SEO). Cached 60 seconds.

const memCache = { at: 0, value: null };
const TTL = 60 * 1000;

const send = (res, status, body, cache) => {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  if (cache) res.setHeader('Cache-Control', cache);
  res.end(JSON.stringify(body));
};

module.exports = async (req, res) => {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return send(res, 405, { error: 'GET only' });
  }

  const fresh = String((req.query && req.query.fresh) || '') === '1';
  if (!fresh && memCache.value && Date.now() - memCache.at < TTL) {
    return send(res, 200, memCache.value, 'public, s-maxage=60, stale-while-revalidate=300');
  }

  const base = String(process.env.SUPABASE_URL || '').replace(/\/+$/, '');
  const key = process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_PUBLISHABLE_KEY || '';
  if (!base || !key) return send(res, 200, {}, 'no-store');

  try {
    const response = await fetch(base + '/rest/v1/site_settings?select=key,value', {
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
      if (row && row.key) value[row.key] = row.value;
    }

    if (!fresh) {
      memCache.at = Date.now();
      memCache.value = value;
    }
    return send(res, 200, value, fresh ? 'no-store' : 'public, s-maxage=60, stale-while-revalidate=300');
  } catch (error) {
    return send(res, 200, {}, 'no-store');
  }
};
