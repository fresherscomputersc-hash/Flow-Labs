// ============================================================
// /api/platform/* - privileged operations for Flow HQ
//
// Ordinary CRUD (projects, tasks, comments) goes straight from the
// browser to PostgREST and is protected by RLS. This router exists
// only for work that needs the service role or a secret:
//
//   GET    /api/platform/me
//   GET    /api/platform/team
//   POST   /api/platform/team/invite
//   PATCH  /api/platform/team/:id
//   DELETE /api/platform/team/:id
//   GET    /api/platform/audit
//
// Every route except none requires a valid Supabase session. The
// caller's profile is loaded server-side; a role sent by the client
// is ignored.
// ============================================================

const fs = require('fs');
const path = require('path');

const json = (res, status, body) => {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.end(JSON.stringify(body));
};

const http = (status, message) => {
  const error = new Error(message);
  error.status = status;
  return error;
};

const readPublicConfig = () => {
  try {
    const raw = fs.readFileSync(
      path.join(process.cwd(), 'assets', 'site.config.js'),
      'utf8'
    );
    const url = raw.match(/supabaseUrl\s*:\s*["']([^"']+)["']/);
    const key = raw.match(/supabaseAnonKey\s*:\s*["']([^"']+)["']/);
    return { url: url ? url[1] : '', key: key ? key[1] : '' };
  } catch (error) {
    return { url: '', key: '' };
  }
};

const publicConfig = readPublicConfig();

const config = () => ({
  base: String(process.env.SUPABASE_URL || publicConfig.url || '').replace(/\/+$/, ''),
  anon: process.env.SUPABASE_ANON_KEY
    || process.env.SUPABASE_PUBLISHABLE_KEY
    || publicConfig.key
    || '',
  service: process.env.SUPABASE_SERVICE_KEY
    || process.env.SUPABASE_SERVICE_ROLE_KEY
    || ''
});

const readBody = async (req) => {
  if (req.body && typeof req.body === 'object') return req.body;
  if (typeof req.body === 'string' && req.body.length) {
    try { return JSON.parse(req.body); } catch (error) { return {}; }
  }
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const raw = Buffer.concat(chunks).toString('utf8');
  if (!raw) return {};
  try { return JSON.parse(raw); } catch (error) { return {}; }
};

const rest = async (route, options = {}) => {
  const { base, anon, service } = config();
  const key = options.service ? service : anon;

  if (!base || !key) {
    throw http(503, 'Supabase is not configured on the server.');
  }

  const headers = {
    apikey: key,
    Authorization: 'Bearer ' + (options.token || key),
    Accept: 'application/json'
  };
  if (options.body) headers['Content-Type'] = 'application/json';
  if (options.prefer) headers.Prefer = options.prefer;

  const response = await fetch(base + route, {
    method: options.method || 'GET',
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined
  });

  const text = await response.text();
  let data = null;
  try { data = text ? JSON.parse(text) : null; } catch (error) { data = text; }

  if (!response.ok) {
    const message = (data && (data.message || data.error_description || data.error))
      || 'Request failed';
    const error = http(response.status, String(message));
    error.detail = data;
    throw error;
  }

  return data;
};

const bearer = (req) => {
  const header = String(req.headers.authorization || '');
  const match = header.match(/^Bearer\s+(.+)$/i);
  return match ? match[1].trim() : '';
};

// ------------------------------------------------------------
// Session + role guard
// ------------------------------------------------------------
const authenticate = async (req) => {
  const token = bearer(req);
  if (!token) throw http(401, 'Sign in required.');

  const user = await rest('/auth/v1/user', { token });
  if (!user || !user.id) throw http(401, 'Session is no longer valid.');

  const rows = await rest(
    '/rest/v1/profiles?id=eq.' + encodeURIComponent(user.id) + '&select=*',
    { token }
  );
  const profile = Array.isArray(rows) ? rows[0] : null;

  if (!profile) throw http(403, 'No profile exists for this account.');
  if (profile.status !== 'active') throw http(403, 'This account is suspended.');

  return { user, profile, token };
};

const isAdmin = (profile) => profile.role === 'owner' || profile.role === 'admin';
const isOwner = (profile) => profile.role === 'owner';

const requireAdmin = (profile) => {
  if (!isAdmin(profile)) throw http(403, 'Admin access required.');
};

// ------------------------------------------------------------
// Validation
// ------------------------------------------------------------
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const ROLES = ['owner', 'admin', 'manager', 'member', 'client'];
const STATUSES = ['invited', 'active', 'suspended'];

const cleanText = (value, max) => String(value == null ? '' : value).trim().slice(0, max);

const validateEmail = (value) => {
  const email = cleanText(value, 254).toLowerCase();
  if (!EMAIL.test(email)) throw http(422, 'Enter a valid email address.');
  return email;
};

const validateRole = (value, actor) => {
  const role = String(value || 'member').toLowerCase();
  if (!ROLES.includes(role)) throw http(422, 'Unknown role.');
  if (role === 'owner' && !isOwner(actor)) {
    throw http(403, 'Only an owner can create another owner.');
  }
  return role;
};

const countActiveAdmins = async () => {
  const rows = await rest(
    '/rest/v1/profiles?select=id&role=in.(owner,admin)&status=eq.active',
    { service: true }
  );
  return Array.isArray(rows) ? rows.length : 0;
};

const getProfileById = async (id) => {
  const rows = await rest(
    '/rest/v1/profiles?id=eq.' + encodeURIComponent(id) + '&select=*',
    { service: true }
  );
  return Array.isArray(rows) ? rows[0] : null;
};

// ------------------------------------------------------------
// Routes
// ------------------------------------------------------------
const handle = async (req, res, segments) => {
  // Public webhook endpoints (HMAC-verified, no Supabase session JWT)
  if (segments[0] === 'github') {
    return require('../github/webhook.js')(req, res);
  }

  const { profile, token } = await authenticate(req);
  const method = String(req.method || 'GET').toUpperCase();
  const route = segments.join('/');

  // GET /me
  if (route === 'me' && method === 'GET') {
    return json(res, 200, { ok: true, profile });
  }

  // GET /team
  if (route === 'team' && method === 'GET') {
    requireAdmin(profile);
    const rows = await rest(
      '/rest/v1/profiles?select=id,email,full_name,role,status,github_username,created_at'
      + '&order=created_at.asc',
      { service: true }
    );
    return json(res, 200, { ok: true, members: rows || [] });
  }

  // POST /team/invite
  if (route === 'team/invite' && method === 'POST') {
    requireAdmin(profile);

    const body = await readBody(req);
    const email = validateEmail(body.email);
    const fullName = cleanText(body.full_name, 120);
    const role = validateRole(body.role, profile);
    const password = typeof body.password === 'string' ? body.password : '';
    const projectIds = Array.isArray(body.project_ids) ? body.project_ids.slice(0, 100) : [];

    if (password && password.length < 10) {
      throw http(422, 'Temporary passwords need at least 10 characters.');
    }
    if (!password && role === 'client') {
      throw http(422, 'Client accounts need a temporary password.');
    }
    if (!config().service) {
      throw http(503, 'SUPABASE_SERVICE_KEY is not set on the server.');
    }

    // Refuse duplicates before touching auth.
    const existing = await rest(
      '/rest/v1/profiles?select=id&email=eq.' + encodeURIComponent(email),
      { service: true }
    );
    if (Array.isArray(existing) && existing.length) {
      throw http(409, 'An account with that email already exists.');
    }

    let created;
    if (password) {
      created = await rest('/auth/v1/admin/users', {
        method: 'POST',
        service: true,
        body: {
          email,
          password,
          email_confirm: true,
          user_metadata: { full_name: fullName, role }
        }
      });
    } else {
      created = await rest('/auth/v1/invite', {
        method: 'POST',
        service: true,
        body: { email, data: { full_name: fullName, role } }
      });
    }

    if (!created || !created.id) throw http(502, 'Supabase did not return a user.');

    // The on_auth_user_created trigger normally writes the profile.
    // If it is missing (0001 not applied), create the row explicitly
    // so the account is never left half-made.
    const createdProfile = await getProfileById(created.id);
    const finalStatus = password ? 'active' : 'invited';

    if (!createdProfile) {
      await rest('/rest/v1/profiles', {
        method: 'POST',
        service: true,
        prefer: 'return=minimal',
        body: {
          id: created.id,
          email,
          full_name: fullName,
          role,
          status: finalStatus
        }
      });
    } else {
      await rest('/rest/v1/profiles?id=eq.' + encodeURIComponent(created.id), {
        method: 'PATCH',
        service: true,
        prefer: 'return=minimal',
        body: {
          full_name: fullName,
          role,
          status: finalStatus
        }
      });
    }

    if (projectIds.length) {
      if (role === 'client') {
        const rows = projectIds.map((projectId) => ({
          project_id: projectId,
          user_id: created.id
        }));
        await rest('/rest/v1/project_clients', {
          method: 'POST',
          service: true,
          prefer: 'resolution=merge-duplicates,return=minimal',
          body: rows
        });
      } else {
        const rows = projectIds.map((projectId) => ({
          project_id: projectId,
          user_id: created.id,
          role: 'member',
          added_by: profile.id
        }));
        await rest('/rest/v1/project_members', {
          method: 'POST',
          service: true,
          prefer: 'resolution=merge-duplicates,return=minimal',
          body: rows
        });
      }
    }

    return json(res, 201, {
      ok: true,
      user_id: created.id,
      email,
      role,
      invited: !password,
      password: password || null
    });
  }

  // PATCH /team/:id
  const teamMatch = route.match(/^team\/([0-9a-f-]{36})$/i);
  if (teamMatch && method === 'PATCH') {
    requireAdmin(profile);
    const id = teamMatch[1];
    if (id === profile.id) {
      throw http(409, 'You cannot change your own role or status.');
    }

    const body = await readBody(req);
    const target = await getProfileById(id);
    if (!target) throw http(404, 'Account not found.');

    const patch = {};

    if (body.full_name !== undefined) patch.full_name = cleanText(body.full_name, 120);
    if (body.github_username !== undefined) {
      patch.github_username = cleanText(body.github_username, 60).replace(/^@/, '');
    }

    if (body.role !== undefined) {
      const role = validateRole(body.role, profile);
      if (target.role === 'owner' && !isOwner(profile)) {
        throw http(403, 'Only an owner can change an owner.');
      }
      const losingAdmin = isAdmin(target) && !isAdmin({ role });
      if (losingAdmin && (await countActiveAdmins()) <= 1) {
        throw http(409, 'This is the last active admin. Promote someone else first.');
      }
      patch.role = role;
    }

    if (body.status !== undefined) {
      const status = String(body.status).toLowerCase();
      if (!STATUSES.includes(status)) throw http(422, 'Unknown status.');
      const losingAdmin = isAdmin(target) && status !== 'active';
      if (losingAdmin && (await countActiveAdmins()) <= 1) {
        throw http(409, 'This is the last active admin. Promote someone else first.');
      }
      patch.status = status;
    }

    if (!Object.keys(patch).length) throw http(422, 'Nothing to update.');

    const rows = await rest('/rest/v1/profiles?id=eq.' + encodeURIComponent(id), {
      method: 'PATCH',
      service: true,
      prefer: 'return=representation',
      body: patch
    });

    return json(res, 200, { ok: true, profile: Array.isArray(rows) ? rows[0] : null });
  }

  // DELETE /team/:id
  if (teamMatch && method === 'DELETE') {
    requireAdmin(profile);
    const id = teamMatch[1];
    if (id === profile.id) throw http(409, 'You cannot delete your own account.');

    const target = await getProfileById(id);
    if (!target) throw http(404, 'Account not found.');
    if (isAdmin(target) && (await countActiveAdmins()) <= 1) {
      throw http(409, 'This is the last active admin.');
    }

    await rest('/auth/v1/admin/users/' + encodeURIComponent(id), {
      method: 'DELETE',
      service: true
    });

    return json(res, 200, { ok: true });
  }

  // GET /audit
  if (route === 'audit' && method === 'GET') {
    requireAdmin(profile);
    const limit = Math.min(Math.max(parseInt(req.query.limit || '50', 10) || 50, 1), 200);
    const rows = await rest(
      '/rest/v1/audit_log?select=id,created_at,actor_email,action,entity_type,entity_id'
      + '&order=created_at.desc&limit=' + limit,
      { token }
    );
    return json(res, 200, { ok: true, events: rows || [] });
  }

  // POST /notify - Send email alert for task / mention / milestone
  if (route === 'notify' && method === 'POST') {
    const b = await readBody(req);
    const to = b.to || process.env.NOTIFY_TO || process.env.SMTP_USER;
    const subject = b.subject || ('[Flow HQ] ' + (b.title || 'Notification'));
    const bodyText = b.body || b.text || '';
    const link = b.link ? ('\n\nView details: ' + (process.env.NEXT_PUBLIC_SITE_URL || 'https://theflowlabs.online') + b.link) : '';

    const host = process.env.SMTP_HOST;
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;

    if (!host || !user || !pass || !to) {
      return json(res, 200, { ok: true, sent: false, note: 'SMTP not configured or recipient missing' });
    }

    try {
      const nodemailer = require('nodemailer');
      const port = Number(process.env.SMTP_PORT || 465);
      const transporter = nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: { user, pass }
      });

      await transporter.sendMail({
        from: '"Flow HQ" <' + user + '>',
        to,
        subject,
        text: bodyText + link
      });

      return json(res, 200, { ok: true, sent: true });
    } catch (err) {
      console.warn('[notify] SMTP error:', err.message);
      return json(res, 200, { ok: true, sent: false, error: err.message });
    }
  }

  // POST /digest - Generate or email weekly / daily digest
  if (route === 'digest' && method === 'POST') {
    const b = await readBody(req);
    const projectId = b.project_id;
    const period = b.period || 'weekly';

    let projsQuery = '/rest/v1/projects?select=id,key,name,status';
    if (projectId) projsQuery += '&id=eq.' + encodeURIComponent(projectId);
    const projs = await rest(projsQuery, { token });

    const tasks = await rest('/rest/v1/tasks?select=id,project_id,key,title,status,completed_at,due_date', { token });
    const reports = await rest('/rest/v1/daily_reports?select=id,project_id,report_date,summary,blockers,hours&order=report_date.desc&limit=30', { token });

    const summary = {
      period,
      generated_at: new Date().toISOString(),
      projects_count: (projs || []).length,
      tasks_total: (tasks || []).length,
      tasks_done: (tasks || []).filter(t => t.status === 'done').length,
      reports_count: (reports || []).length
    };

    return json(res, 200, { ok: true, digest: summary });
  }

  throw http(404, 'Unknown endpoint.');
};

const parseSegments = (req) => {
  // Vercel does not always populate req.query.path for a nested
  // catch-all, so read the path straight off the request URL and fall
  // back to the query object.
  const pathname = String(req.url || '').split('?')[0];
  const marker = '/api/platform';
  const at = pathname.indexOf(marker);
  let rest = at === -1 ? pathname : pathname.slice(at + marker.length);
  rest = rest.replace(/^\/+|\/+$/g, '');

  let parts = rest ? rest.split('/') : [];

  if (!parts.length && req.query) {
    const raw = req.query.path || req.query['...path'];
    if (raw) parts = Array.isArray(raw) ? raw : String(raw).split('/');
  }

  return parts
    .filter(Boolean)
    .map((part) => {
      try { return decodeURIComponent(part); } catch (error) { return part; }
    });
};

module.exports = async (req, res) => {
  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    return res.end();
  }

  try {
    const segments = parseSegments(req);

    if (!segments.length) throw http(404, 'Unknown endpoint.');

    await handle(req, res, segments);
  } catch (error) {
    const status = error.status || 500;
    if (status >= 500) console.error('[platform]', error);
    json(res, status, {
      ok: false,
      error: status >= 500 ? 'Server error.' : error.message
    });
  }
};
