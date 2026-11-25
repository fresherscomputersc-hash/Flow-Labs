// ============================================================
// /api/onboard - Privileged User Provisioning & Management
// Handles:
//   POST   - Create user (client or team member) with ID & password + welcome mail
//   PATCH  - Update team member details (name, role, status)
//   DELETE - Delete client or team member account
// ============================================================

const fs = require('fs');
const path = require('path');
const nodemailer = require('nodemailer');

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://jolcqqwvzrvqydzxpwij.supabase.co';
const SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY
  || process.env.SUPABASE_SERVICE_ROLE_KEY
  || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpvbGNxcXd2enJ2cXlkenhwd2lqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5Mzg3NDUyMSwiZXhwIjoyMTA5NDUwNTIxfQ.1fLjVpclKFx2q2CJxBWm8Rjkj7-w9H0Y0FZ2f9tLneE';

const json = (res, status, data) => {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.end(JSON.stringify(data));
};

const readBody = async (req) => {
  if (req.body && typeof req.body === 'object') return req.body;
  return new Promise((resolve) => {
    let raw = '';
    req.on('data', (chunk) => { raw += chunk; });
    req.on('end', () => {
      try {
        resolve(raw ? JSON.parse(raw) : {});
      } catch {
        resolve({});
      }
    });
  });
};

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    return res.end();
  }

  try {
    const body = await readBody(req);
    const method = req.method;

    // ----------------------------------------------------
    // POST: Create / Provision User + Dispatch Welcome Mail
    // ----------------------------------------------------
    if (method === 'POST') {
      const { email, full_name, password, role = 'member', project_ids = [] } = body;

      if (!email || !full_name || !password) {
        return json(res, 400, { ok: false, error: 'Email, Full Name, and Password are required.' });
      }

      if (password.length < 6) {
        return json(res, 400, { ok: false, error: 'Password must be at least 6 characters.' });
      }

      const cleanEmail = String(email).trim().toLowerCase();
      const cleanName = String(full_name).trim();

      // Check if user already exists in profiles
      const checkRes = await fetch(`${SUPABASE_URL}/rest/v1/profiles?email=eq.${encodeURIComponent(cleanEmail)}&select=id`, {
        headers: {
          apikey: SERVICE_KEY,
          Authorization: `Bearer ${SERVICE_KEY}`
        }
      });
      const existing = await checkRes.json();
      if (Array.isArray(existing) && existing.length > 0) {
        return json(res, 409, { ok: false, error: `An account with ${cleanEmail} already exists.` });
      }

      // Create User via Supabase Admin API
      const createRes = await fetch(`${SUPABASE_URL}/auth/v1/admin/users`, {
        method: 'POST',
        headers: {
          apikey: SERVICE_KEY,
          Authorization: `Bearer ${SERVICE_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: cleanEmail,
          password,
          email_confirm: true,
          user_metadata: {
            full_name: cleanName,
            role
          }
        })
      });

      const createData = await createRes.json();
      if (!createRes.ok || !createData?.id) {
        return json(res, createRes.status || 500, {
          ok: false,
          error: createData?.msg || createData?.message || createData?.error_description || 'Failed to create user in Auth system.'
        });
      }

      const userId = createData.id;

      // Upsert profile
      await fetch(`${SUPABASE_URL}/rest/v1/profiles`, {
        method: 'POST',
        headers: {
          apikey: SERVICE_KEY,
          Authorization: `Bearer ${SERVICE_KEY}`,
          'Content-Type': 'application/json',
          Prefer: 'resolution=merge-duplicates,return=minimal'
        },
        body: JSON.stringify({
          id: userId,
          email: cleanEmail,
          full_name: cleanName,
          role,
          status: 'active'
        })
      });

      // Link Project
      if (Array.isArray(project_ids) && project_ids.length > 0) {
        const projectId = project_ids[0];
        if (role === 'client') {
          await fetch(`${SUPABASE_URL}/rest/v1/project_clients`, {
            method: 'POST',
            headers: {
              apikey: SERVICE_KEY,
              Authorization: `Bearer ${SERVICE_KEY}`,
              'Content-Type': 'application/json',
              Prefer: 'resolution=merge-duplicates,return=minimal'
            },
            body: JSON.stringify({
              project_id: projectId,
              user_id: userId
            })
          });
        } else {
          await fetch(`${SUPABASE_URL}/rest/v1/project_members`, {
            method: 'POST',
            headers: {
              apikey: SERVICE_KEY,
              Authorization: `Bearer ${SERVICE_KEY}`,
              'Content-Type': 'application/json',
              Prefer: 'resolution=merge-duplicates,return=minimal'
            },
            body: JSON.stringify({
              project_id: projectId,
              user_id: userId,
              role: 'member'
            })
          });
        }
      }

      // Automated Welcome Email
      try {
        const host = process.env.SMTP_HOST || 'smtp.gmail.com';
        const port = Number(process.env.SMTP_PORT || 465);
        const user = process.env.SMTP_USER || 'theflowlabs01@gmail.com';
        const pass = process.env.SMTP_PASS;

        if (pass) {
          const transporter = nodemailer.createTransport({
            host,
            port,
            secure: port === 465,
            auth: { user, pass }
          });

          const isClient = role === 'client';
          const portalUrl = isClient ? 'https://www.theflowlabs.online/client' : 'https://www.theflowlabs.online/flow-hq';
          const subject = isClient
            ? 'Welcome to The Flow Labs — Your Project Portal Access'
            : 'Welcome to The Flow Labs Team — Flow HQ Access';

          await transporter.sendMail({
            from: `"The Flow Labs" <${user}>`,
            to: cleanEmail,
            subject,
            html: `
              <div style="font-family: sans-serif; background-color: #07090E; color: #F8FAFC; padding: 28px; border-radius: 10px; max-width: 560px; margin: 0 auto; border: 1px solid rgba(255,255,255,0.1);">
                <h2 style="color: #FFFFFF; margin-top: 0;">Welcome, ${cleanName}</h2>
                <p style="color: #94A3B8; font-size: 14px;">Your ${isClient ? 'Client Portal' : 'Flow HQ'} access has been provisioned.</p>
                <div style="background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); padding: 16px; border-radius: 8px; margin: 20px 0;">
                  <p style="margin: 0 0 8px 0; font-size: 13px;"><strong>Login Portal:</strong> <a href="${portalUrl}" style="color: #22D3EE;">${portalUrl}</a></p>
                  <p style="margin: 0 0 8px 0; font-size: 13px;"><strong>Login ID (Email):</strong> <code style="color: #FFFFFF;">${cleanEmail}</code></p>
                  <p style="margin: 0; font-size: 13px;"><strong>Initial Password:</strong> <code style="color: #FFFFFF;">${password}</code></p>
                </div>
                <p style="color: #94A3B8; font-size: 12px; margin-bottom: 20px;">Use your email and password to sign in to your dashboard.</p>
                <a href="${portalUrl}" style="display: inline-block; background: #FFFFFF; color: #07090E; font-weight: 600; font-size: 13px; padding: 10px 20px; border-radius: 6px; text-decoration: none;">Open Portal &rarr;</a>
              </div>
            `
          });
        }
      } catch (mailErr) {
        console.warn('[onboard] Welcome email dispatch notice:', mailErr.message);
      }

      return json(res, 201, {
        ok: true,
        user_id: userId,
        email: cleanEmail,
        role
      });
    }

    // ----------------------------------------------------
    // PATCH: Update Member Details (Name, Role, Status)
    // ----------------------------------------------------
    if (method === 'PATCH') {
      const { id, full_name, role, status } = body;
      if (!id) return json(res, 400, { ok: false, error: 'User ID is required.' });

      const patch = {};
      if (full_name !== undefined) patch.full_name = String(full_name).trim();
      if (role !== undefined) patch.role = role;
      if (status !== undefined) patch.status = status;

      const updateRes = await fetch(`${SUPABASE_URL}/rest/v1/profiles?id=eq.${encodeURIComponent(id)}`, {
        method: 'PATCH',
        headers: {
          apikey: SERVICE_KEY,
          Authorization: `Bearer ${SERVICE_KEY}`,
          'Content-Type': 'application/json',
          Prefer: 'return=representation'
        },
        body: JSON.stringify(patch)
      });

      const updated = await updateRes.json();
      return json(res, 200, { ok: true, profile: Array.isArray(updated) ? updated[0] : null });
    }

    // ----------------------------------------------------
    // DELETE: Delete Client or Team Member
    // ----------------------------------------------------
    if (method === 'DELETE') {
      const urlObj = new URL(req.url, 'http://localhost');
      const id = body.id || urlObj.searchParams.get('id');

      if (!id) return json(res, 400, { ok: false, error: 'User ID is required.' });

      // Unlink project memberships and clients
      await fetch(`${SUPABASE_URL}/rest/v1/project_clients?user_id=eq.${encodeURIComponent(id)}`, {
        method: 'DELETE',
        headers: { apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}` }
      });

      await fetch(`${SUPABASE_URL}/rest/v1/project_members?user_id=eq.${encodeURIComponent(id)}`, {
        method: 'DELETE',
        headers: { apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}` }
      });

      // Delete profile
      await fetch(`${SUPABASE_URL}/rest/v1/profiles?id=eq.${encodeURIComponent(id)}`, {
        method: 'DELETE',
        headers: { apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}` }
      });

      // Delete Auth User
      await fetch(`${SUPABASE_URL}/auth/v1/admin/users/${encodeURIComponent(id)}`, {
        method: 'DELETE',
        headers: { apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}` }
      });

      return json(res, 200, { ok: true, deleted: id });
    }

    return json(res, 405, { ok: false, error: 'Method not allowed.' });
  } catch (err) {
    console.error('[onboard] Handler error:', err);
    return json(res, 500, { ok: false, error: err.message || 'Server error.' });
  }
};
