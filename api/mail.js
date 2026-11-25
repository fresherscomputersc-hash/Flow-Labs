// api/mail.js - Transactional Mailer for The Flow Labs
// Handles:
// 1. "new_lead": Founder alert on new scoping briefs + automated client confirmation.
// 2. "client_onboarding": Dispatches portal credentials (ID & password) to onboarded customers.

const nodemailer = require('nodemailer');
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://jolcqqwvzrvqydzxpwij.supabase.co';
const SERVICE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_SERVICE_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpvbGNxcXd2enJ2cXlkenhwd2lqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5Mzg3NDUyMSwiZXhwIjoyMTA5NDUwNTIxfQ.1fLjVpclKFx2q2CJxBWm8Rjkj7-w9H0Y0FZ2f9tLneE';

const getTransporter = () => {
  const host = process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = Number(process.env.SMTP_PORT || 465);
  const user = process.env.SMTP_USER || 'theflowlabs01@gmail.com';
  const pass = process.env.SMTP_PASS;

  if (!pass) {
    return null;
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass }
  });
};

module.exports = async (req, res) => {
  // CORS & method guard
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { type, lead, client } = req.body || {};

  if (!type) {
    return res.status(400).json({ error: 'Missing mail dispatch type' });
  }

  const transporter = getTransporter();
  const founderEmail = process.env.FOUNDER_EMAIL || 'theflowlabs01@gmail.com';
  const senderEmail = process.env.SMTP_USER || founderEmail;

  try {
    // -------------------------------------------------------------------------
    // 1. EVENT: NEW INBOUND SCOPING LEAD
    // -------------------------------------------------------------------------
    if (type === 'new_lead') {
      if (!lead || !lead.name || !lead.contact) {
        return res.status(400).json({ error: 'Missing lead details' });
      }

      // Record activity in Supabase if service key is available
      if (SERVICE_KEY) {
        try {
          const supabase = createClient(SUPABASE_URL, SERVICE_KEY);
          await supabase.from('activity').insert([{
            action: 'submitted project brief',
            target: `${lead.name} (${lead.budget || 'Custom'})`,
            created_at: new Date().toISOString()
          }]);
        } catch (dbErr) {
          console.warn('[mail] Supabase activity logging warning:', dbErr.message);
        }
      }

      if (!transporter) {
        console.warn('[mail] SMTP_PASS not set. Notification recorded in database.');
        return res.status(200).json({
          ok: true,
          sent: false,
          warning: 'SMTP_PASS not configured in environment. Lead recorded in database.'
        });
      }

      // 1A. Email founders with lead breakdown
      const founderMailPromise = transporter.sendMail({
        from: `"The Flow Labs Engine" <${senderEmail}>`,
        to: founderEmail,
        subject: `⚡ New Project Brief: ${lead.name} — ${lead.budget || 'Custom'}`,
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #07090E; color: #F8FAFC; padding: 32px 24px; border-radius: 12px; max-width: 600px; margin: 0 auto; border: 1px solid rgba(255,255,255,0.1);">
            <div style="margin-bottom: 24px; padding-bottom: 16px; border-bottom: 1px solid rgba(255,255,255,0.1);">
              <span style="font-family: monospace; font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; color: #22D3EE; background: rgba(34,211,238,0.1); padding: 4px 8px; border-radius: 4px;">Inbound Build Brief</span>
              <h2 style="font-size: 20px; font-weight: 600; color: #FFFFFF; margin: 12px 0 4px 0;">${lead.name}</h2>
              <p style="font-size: 14px; color: #94A3B8; margin: 0;">${lead.contact}</p>
            </div>

            <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
              <tr>
                <td style="padding: 8px 0; font-size: 13px; color: #94A3B8; font-family: monospace;">Scope / Type:</td>
                <td style="padding: 8px 0; font-size: 13px; color: #FFFFFF; font-weight: 500; text-align: right;">${lead.project_type || 'Custom Software'}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-size: 13px; color: #94A3B8; font-family: monospace;">Investment Tier:</td>
                <td style="padding: 8px 0; font-size: 13px; color: #34D399; font-weight: 600; text-align: right;">${lead.budget || 'Custom'}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-size: 13px; color: #94A3B8; font-family: monospace;">Source:</td>
                <td style="padding: 8px 0; font-size: 12px; color: #CBD5E1; text-align: right;">${lead.source || 'Scoping Cockpit'}</td>
              </tr>
            </table>

            <div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); padding: 16px; border-radius: 8px; margin-bottom: 24px;">
              <span style="display: block; font-family: monospace; font-size: 11px; color: #94A3B8; text-transform: uppercase; margin-bottom: 8px;">Project Requirements:</span>
              <p style="font-size: 14px; color: #E2E8F0; line-height: 1.6; margin: 0; white-space: pre-wrap;">${lead.idea || 'No additional details specified.'}</p>
            </div>

            <div style="text-align: center; padding-top: 8px;">
              <a href="https://www.theflowlabs.online/flow-hq" style="display: inline-block; background: #FFFFFF; color: #07090E; font-weight: 600; font-size: 13px; padding: 10px 20px; border-radius: 6px; text-decoration: none;">Open in Flow HQ</a>
            </div>
          </div>
        `
      });

      // 1B. If contact is an email, send automated client confirmation
      let clientConfirmPromise = Promise.resolve();
      if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(lead.contact)) {
        clientConfirmPromise = transporter.sendMail({
          from: `"The Flow Labs" <${senderEmail}>`,
          to: lead.contact,
          subject: `We received your project brief — The Flow Labs`,
          html: `
            <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #07090E; color: #F8FAFC; padding: 32px 24px; border-radius: 12px; max-width: 600px; margin: 0 auto; border: 1px solid rgba(255,255,255,0.1);">
              <div style="margin-bottom: 20px;">
                <span style="font-family: monospace; font-size: 11px; color: #22D3EE; text-transform: uppercase; letter-spacing: 0.1em;">The Flow Labs — Engineering Studio</span>
                <h2 style="font-size: 22px; font-weight: 600; color: #FFFFFF; margin: 8px 0 12px 0;">Thank you, ${lead.name}.</h2>
                <p style="font-size: 14px; color: #CBD5E1; line-height: 1.6; margin: 0;">
                  We have received your project requirements for <strong>${lead.project_type || 'Custom Engineering'}</strong>.
                </p>
              </div>

              <div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); padding: 16px; border-radius: 8px; margin-bottom: 20px;">
                <p style="font-size: 13px; color: #94A3B8; margin: 0 0 8px 0;">Summary of your request:</p>
                <p style="font-size: 14px; color: #F1F5F9; margin: 0 0 4px 0;"><strong>Investment Tier:</strong> ${lead.budget || 'Custom'}</p>
                <p style="font-size: 14px; color: #F1F5F9; margin: 0;"><strong>Studio Capacity:</strong> Capped at 4 builds a month (100% in-house)</p>
              </div>

              <p style="font-size: 14px; color: #94A3B8; line-height: 1.6; margin-bottom: 24px;">
                Our founding team reviews every brief directly. We will review your architecture requirements and reach out within 4 hours to coordinate a technical scoping conversation.
              </p>

              <div style="border-top: 1px solid rgba(255,255,255,0.1); padding-top: 16px; font-size: 12px; color: #64748B; font-family: monospace;">
                The Flow Labs · Infocity, Bhubaneswar, India · <a href="https://www.theflowlabs.online" style="color: #94A3B8; text-decoration: none;">theflowlabs.online</a>
              </div>
            </div>
          `
        }).catch((e) => console.warn('[mail] Client confirmation mail failed:', e.message));
      }

      await Promise.all([founderMailPromise, clientConfirmPromise]);
      return res.status(200).json({ ok: true, sent: true });
    }

    // -------------------------------------------------------------------------
    // 2. EVENT: CLIENT ONBOARDING CREDENTIAL DISPATCH
    // -------------------------------------------------------------------------
    if (type === 'client_onboarding') {
      if (!client || !client.email || !client.password) {
        return res.status(400).json({ error: 'Missing client email or password' });
      }

      if (!transporter) {
        return res.status(200).json({
          ok: true,
          sent: false,
          warning: 'SMTP_PASS not configured. Please supply client credentials manually.'
        });
      }

      const portalUrl = 'https://www.theflowlabs.online/client';

      await transporter.sendMail({
        from: `"The Flow Labs" <${senderEmail}>`,
        to: client.email,
        subject: `Welcome to The Flow Labs — Your Project Portal Access`,
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #07090E; color: #F8FAFC; padding: 32px 24px; border-radius: 12px; max-width: 600px; margin: 0 auto; border: 1px solid rgba(255,255,255,0.1);">
            <div style="margin-bottom: 24px; padding-bottom: 16px; border-bottom: 1px solid rgba(255,255,255,0.1);">
              <span style="font-family: monospace; font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; color: #34D399; background: rgba(52,211,153,0.1); padding: 4px 8px; border-radius: 4px;">Client Access Provisioned</span>
              <h2 style="font-size: 22px; font-weight: 600; color: #FFFFFF; margin: 12px 0 4px 0;">Welcome, ${client.name || 'Client'}.</h2>
              <p style="font-size: 14px; color: #94A3B8; margin: 0;">Your client tracking portal for <strong>${client.projectName || 'Your Build'}</strong> is now live.</p>
            </div>

            <div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); padding: 20px; border-radius: 8px; margin-bottom: 24px;">
              <span style="display: block; font-family: monospace; font-size: 11px; color: #94A3B8; text-transform: uppercase; margin-bottom: 12px;">Your Portal Login Credentials:</span>
              <p style="font-size: 14px; color: #CBD5E1; margin: 0 0 8px 0;">
                <strong>Portal URL:</strong> <a href="${portalUrl}" style="color: #22D3EE; text-decoration: none;">${portalUrl}</a>
              </p>
              <p style="font-size: 14px; color: #CBD5E1; margin: 0 0 8px 0;">
                <strong>Login ID (Email):</strong> <code style="font-family: monospace; background: rgba(255,255,255,0.06); padding: 2px 6px; border-radius: 4px; color: #FFFFFF;">${client.email}</code>
              </p>
              <p style="font-size: 14px; color: #CBD5E1; margin: 0;">
                <strong>Initial Password:</strong> <code style="font-family: monospace; background: rgba(255,255,255,0.06); padding: 2px 6px; border-radius: 4px; color: #FFFFFF;">${client.password}</code>
              </p>
            </div>

            <p style="font-size: 13px; color: #94A3B8; line-height: 1.6; margin-bottom: 24px;">
              You can log in at any time to monitor real-time sprint milestones, inspect test coverage, review staging builds, and download signed deliverables.
            </p>

            <div style="text-align: center; margin-bottom: 24px;">
              <a href="${portalUrl}" style="display: inline-block; background: #FFFFFF; color: #07090E; font-weight: 600; font-size: 14px; padding: 12px 24px; border-radius: 6px; text-decoration: none;">Open Client Portal</a>
            </div>

            <div style="border-top: 1px solid rgba(255,255,255,0.1); padding-top: 16px; font-size: 12px; color: #64748B; font-family: monospace;">
              The Flow Labs · Founder-Led Digital Engineering Studio · <a href="https://www.theflowlabs.online" style="color: #94A3B8; text-decoration: none;">theflowlabs.online</a>
            </div>
          </div>
        `
      });

      return res.status(200).json({ ok: true, sent: true });
    }

    return res.status(400).json({ error: `Unsupported mail event type: ${type}` });
  } catch (error) {
    console.error('[mail] Transactional mail dispatch error:', error);
    return res.status(500).json({ ok: false, error: error.message });
  }
};
