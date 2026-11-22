// ------------------------------------------------------------
// The Flow Labs - rebuild trigger
// Flow HQ calls this after publishing, unpublishing or deleting a
// post. It verifies the caller is a signed-in admin, then fires the
// Vercel deploy hook so the static build re-renders the blog.
//
// Environment variables (Vercel -> Settings -> Environment):
//   VERCEL_DEPLOY_HOOK_URL  the hook URL from Vercel project settings
//   SUPABASE_URL            optional; falls back to assets/site.config.js
//   SUPABASE_ANON_KEY       optional; falls back to assets/site.config.js
//
// The anon key is already public in assets/site.config.js, so the
// fallback is safe: it is only used to read the caller's JWT.
// ------------------------------------------------------------

const fs = require('fs');
const path = require('path');

const json = (res, status, body) => {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Cache-Control', 'no-store');
  res.end(JSON.stringify(body));
};

const readPublicConfig = () => {
  try {
    const raw = fs.readFileSync(
      path.join(process.cwd(), 'assets', 'site.config.js'),
      'utf8'
    );
    return {
      url: (raw.match(/supabaseUrl:\s*"([^"]+)"/) || [])[1] || '',
      key: (raw.match(/supabaseAnonKey:\s*"([^"]+)"/) || [])[1] || ''
    };
  } catch (error) {
    return { url: '', key: '' };
  }
};

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return json(res, 405, { ok: false, error: 'POST only' });
  }

  const publicCfg = readPublicConfig();
  const supabaseUrl = (process.env.SUPABASE_URL || publicCfg.url || '').replace(/\/+$/, '');
  const anonKey = process.env.SUPABASE_ANON_KEY || publicCfg.key || '';

  if (!supabaseUrl || !anonKey) {
    return json(res, 503, { ok: false, error: 'Supabase is not configured for this deployment.' });
  }

  const header = req.headers.authorization || '';
  const token = header.toLowerCase().startsWith('bearer ') ? header.slice(7).trim() : '';
  if (!token) {
    return json(res, 401, { ok: false, error: 'Sign in to Flow HQ first.' });
  }

  // The database decides: is_admin() returns true only for allowlisted emails.
  let isAdmin = false;
  try {
    const check = await fetch(supabaseUrl + '/rest/v1/rpc/is_admin', {
      method: 'POST',
      headers: {
        apikey: anonKey,
        Authorization: 'Bearer ' + token,
        'Content-Type': 'application/json'
      },
      body: '{}'
    });
    isAdmin = check.ok && (await check.json()) === true;
  } catch (error) {
    return json(res, 502, { ok: false, error: 'Could not verify the session.' });
  }

  if (!isAdmin) {
    return json(res, 403, { ok: false, error: 'This account is not authorized.' });
  }

  const hook = process.env.VERCEL_DEPLOY_HOOK_URL;
  if (!hook) {
    return json(res, 503, {
      ok: false,
      error: 'VERCEL_DEPLOY_HOOK_URL is not set. Add it in Vercel, then redeploy.'
    });
  }

  try {
    const fired = await fetch(hook, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ source: 'flow-hq', at: new Date().toISOString() })
    });
    if (!fired.ok) {
      return json(res, 502, { ok: false, error: 'Vercel rejected the deploy hook (' + fired.status + ').' });
    }
  } catch (error) {
    return json(res, 502, { ok: false, error: 'Could not reach the deploy hook.' });
  }

  return json(res, 200, { ok: true, message: 'Rebuild started. Live in about a minute.' });
};
