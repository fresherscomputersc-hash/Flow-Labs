// ============================================================
// GitHub Webhook Handler for Flow HQ
//
// Handles push and pull_request events from GitHub:
// - HMAC SHA-256 signature verification via GITHUB_WEBHOOK_SECRET
// - Idempotency guarantee via x-github-delivery check
// - Automatic author attribution via profiles.github_username
// - Automatic task key linking (e.g. FLW-12) to public.activity
// ============================================================

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const json = (res, status, body) => {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.end(JSON.stringify(body));
};

const readConfig = () => {
  let url = process.env.SUPABASE_URL || '';
  let service = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || '';

  if (!url || !service) {
    try {
      const raw = fs.readFileSync(path.join(process.cwd(), 'assets', 'site.config.js'), 'utf8');
      const uMatch = raw.match(/supabaseUrl\s*:\s*["']([^"']+)["']/);
      const kMatch = raw.match(/supabaseAnonKey\s*:\s*["']([^"']+)["']/);
      if (!url && uMatch) url = uMatch[1];
      if (!service && kMatch) service = kMatch[1];
    } catch (e) {}
  }

  return {
    url: String(url || '').replace(/\/+$/, ''),
    service: service || ''
  };
};

const rest = async (endpoint, body) => {
  const cfg = readConfig();
  if (!cfg.url || !cfg.service) {
    throw new Error('Supabase configuration missing');
  }

  const response = await fetch(cfg.url + endpoint, {
    method: 'POST',
    headers: {
      apikey: cfg.service,
      Authorization: 'Bearer ' + cfg.service,
      'Content-Type': 'application/json',
      Accept: 'application/json'
    },
    body: JSON.stringify(body)
  });

  const text = await response.text();
  try { return JSON.parse(text); } catch (e) { return text; }
};

const readRawBody = async (req) => {
  if (req.rawBody && typeof req.rawBody === 'string') return req.rawBody;
  if (Buffer.isBuffer(req.rawBody)) return req.rawBody.toString('utf8');
  if (req.body && typeof req.body === 'object') return JSON.stringify(req.body);

  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  return Buffer.concat(chunks).toString('utf8');
};

const verifySignature = (rawBody, signature, secret) => {
  if (!secret) return false; // fail closed: reject if no secret configured
  if (!signature) return false;

  const expected = 'sha256=' + crypto.createHmac('sha256', secret).update(rawBody).digest('hex');
  const sigBuf = Buffer.from(signature);
  const expBuf = Buffer.from(expected);

  if (sigBuf.length !== expBuf.length) return false;
  return crypto.timingSafeEqual(sigBuf, expBuf);
};

module.exports = async (req, res) => {
  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    return res.end();
  }

  if (req.method !== 'POST') {
    return json(res, 405, { ok: false, error: 'Method not allowed' });
  }

  const deliveryId = req.headers['x-github-delivery'] || req.headers['x-delivery'] || '';
  const event = req.headers['x-github-event'] || req.headers['x-event'] || 'unknown';
  const signature = req.headers['x-hub-signature-256'] || '';
  const secret = process.env.GITHUB_WEBHOOK_SECRET || '';

  const rawBody = await readRawBody(req);

  // 1. Signature check — fail closed if secret not set or invalid
  if (!secret || !verifySignature(rawBody, signature, secret)) {
    return json(res, 401, { ok: false, error: 'Invalid or missing webhook signature' });
  }

  let payload = {};
  try {
    payload = JSON.parse(rawBody);
  } catch (err) {
    return json(res, 400, { ok: false, error: 'Invalid JSON payload' });
  }

  // 2. Ping event
  if (event === 'ping') {
    return json(res, 200, { ok: true, pong: true, zen: payload.zen });
  }

  const repo = (payload.repository && payload.repository.full_name) || '';
  const sender = (payload.sender && payload.sender.login) || '';

  // 3. Idempotency Check
  if (deliveryId) {
    try {
      const recordRes = await rest('/rest/v1/rpc/record_github_delivery', {
        p_delivery_id: deliveryId,
        p_event: event,
        p_repo: repo,
        p_sender: sender,
        p_summary: event === 'push' ? 'Push event' : 'GitHub event'
      });

      if (recordRes === false) {
        return json(res, 200, {
          ok: true,
          duplicate: true,
          message: 'Delivery ' + deliveryId + ' already processed'
        });
      }
    } catch (dbErr) {
      console.warn('[github-webhook] Idempotency record warning:', dbErr.message);
    }
  }

  const taskKeyRegex = /\b([A-Z][A-Z0-9]{1,7}-\d+)\b/g;
  const results = [];

  // 4. Handle Push event
  if (event === 'push') {
    const commits = payload.commits || [];
    for (const c of commits) {
      const msg = c.message || '';
      const sha = (c.id || '').substring(0, 7);
      const authorGithub = (c.author && c.author.username) || sender;
      const authorEmail = c.author && c.author.email;
      const matches = Array.from(new Set(msg.match(taskKeyRegex) || []));

      if (matches.length > 0) {
        for (const taskKey of matches) {
          try {
            const act = await rest('/rest/v1/rpc/log_github_activity', {
              p_repo: repo,
              p_actor_github: authorGithub,
              p_actor_email: authorEmail,
              p_kind: 'github.commit',
              p_entity_type: 'task',
              p_entity_id: sha,
              p_summary: sha + ': ' + msg.split('\n')[0].slice(0, 120),
              p_meta: {
                sha: sha,
                full_sha: c.id,
                url: c.url,
                repo: repo,
                branch: (payload.ref || '').replace('refs/heads/', ''),
                task_key: taskKey
              },
              p_task_key: taskKey
            });
            results.push({ task: taskKey, sha: sha, result: act });
          } catch (e) {
            console.error('[github-webhook] Failed logging task commit:', e.message);
          }
        }
      } else {
        // Project-level commit activity
        try {
          const act = await rest('/rest/v1/rpc/log_github_activity', {
            p_repo: repo,
            p_actor_github: authorGithub,
            p_actor_email: authorEmail,
            p_kind: 'github.commit',
            p_entity_type: 'commit',
            p_entity_id: sha,
            p_summary: sha + ': ' + msg.split('\n')[0].slice(0, 120),
            p_meta: {
              sha: sha,
              full_sha: c.id,
              url: c.url,
              repo: repo,
              branch: (payload.ref || '').replace('refs/heads/', '')
            },
            p_task_key: null
          });
          results.push({ sha: sha, result: act });
        } catch (e) {
          console.error('[github-webhook] Failed logging commit:', e.message);
        }
      }
    }
  }

  // 5. Handle Pull Request event
  if (event === 'pull_request') {
    const pr = payload.pull_request || {};
    const action = payload.action || '';
    const isMerged = action === 'closed' && pr.merged;
    const kind = isMerged ? 'github.pr.merged' : ('github.pr.' + action);
    const title = pr.title || '';
    const body = pr.body || '';
    const authorGithub = (pr.user && pr.user.login) || sender;
    const matches = Array.from(new Set((title + ' ' + body).match(taskKeyRegex) || []));

    const prNumber = String(pr.number || '');
    const summary = '#' + prNumber + ' (' + action + '): ' + title.slice(0, 100);

    if (matches.length > 0) {
      for (const taskKey of matches) {
        try {
          const act = await rest('/rest/v1/rpc/log_github_activity', {
            p_repo: repo,
            p_actor_github: authorGithub,
            p_actor_email: null,
            p_kind: kind,
            p_entity_type: 'task',
            p_entity_id: prNumber,
            p_summary: summary,
            p_meta: {
              pr_number: prNumber,
              url: pr.html_url,
              repo: repo,
              action: action,
              merged: isMerged,
              task_key: taskKey
            },
            p_task_key: taskKey
          });
          results.push({ task: taskKey, pr: prNumber, result: act });
        } catch (e) {
          console.error('[github-webhook] Failed logging task PR:', e.message);
        }
      }
    } else {
      try {
        const act = await rest('/rest/v1/rpc/log_github_activity', {
          p_repo: repo,
          p_actor_github: authorGithub,
          p_actor_email: null,
          p_kind: kind,
          p_entity_type: 'pull_request',
          p_entity_id: prNumber,
          p_summary: summary,
          p_meta: {
            pr_number: prNumber,
            url: pr.html_url,
            repo: repo,
            action: action,
            merged: isMerged
          },
          p_task_key: null
        });
        results.push({ pr: prNumber, result: act });
      } catch (e) {
        console.error('[github-webhook] Failed logging PR:', e.message);
      }
    }
  }

  return json(res, 200, {
    ok: true,
    event: event,
    repo: repo,
    processed: results.length,
    results: results
  });
};
