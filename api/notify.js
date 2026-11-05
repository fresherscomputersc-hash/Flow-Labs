// ------------------------------------------------------------
// The Flow Labs - lead notification
// Every new site-lead POSTs here; this emails the owner via SMTP.
// Credentials come from Vercel Environment Variables (never in code):
//   SMTP_HOST  e.g. smtp.gmail.com (Gmail) / smtp-relay.brevo.com (Brevo)
//   SMTP_PORT  e.g. 465
//   SMTP_USER  the sending account, e.g. theflowlabs01@gmail.com
//   SMTP_PASS  app password (NOT the account password)
//   NOTIFY_TO  where alerts go (defaults to SMTP_USER)
// No SMTP configured -> returns 503 and the site still works fine
// (the lead row is already saved in Supabase before this is called).
// ------------------------------------------------------------

const nodemailer = require('nodemailer');

const json = (res, status, body) => {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(body));
};

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return json(res, 405, { ok: false, error: 'POST only' });
  }

  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const to = process.env.NOTIFY_TO || user;

  if (!host || !user || !pass) {
    return json(res, 503, { ok: false, error: 'SMTP not configured yet' });
  }

  const b = req.body || {};
  const name = (b.name || '').slice(0, 80);
  const contact = (b.contact || '').slice(0, 120);
  const idea = (b.idea || '').slice(0, 4000);

  if (!name || !contact || !idea) {
    return json(res, 400, { ok: false, error: 'missing fields' });
  }

  const port = Number(process.env.SMTP_PORT || 465);

  try {
    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass }
    });

    const lines = [
      'New lead from the-flow-labs.vercel.app',
      '',
      'Name: ' + name,
      'Contact: ' + contact,
      'Project: ' + (b.project_type || '-'),
      'Budget: ' + (b.budget || 'not said'),
      'Source: ' + (b.source || 'site'),
      'When: ' + new Date().toISOString(),
      '',
      'Idea:',
      idea
    ].join('\n');

    await transporter.sendMail({
      from: '"Flow Labs Lead Bot" <' + user + '>',
      to,
      subject: '🔥 New lead: ' + name + ' (' + (b.project_type || 'idea') + ')',
      text: lines
    });

    return json(res, 200, { ok: true });
  } catch (ex) {
    return json(res, 500, { ok: false, error: 'smtp send failed' });
  }
};
