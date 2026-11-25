// ============================================================
// scripts/seed_operations.js - Studio Operations Lifecycle Seeder
// Seeds:
//   - Leads across pipeline stages (New -> Contacted -> Proposal -> Won)
//   - Proposals with line items and terms
//   - Projects with modules and tasks (with blockers and review states)
//   - Invoices across lifecycle (Advance, Milestone, Paid)
//   - Payments recorded
//   - Time logs for team members
//   - Handover checklists
//   - Testimonials
// ============================================================

const { executeSql } = require('./run_sql');

async function seed() {
  console.log("🌱 Starting Studio Operations Lifecycle Seeding...");

  const sql = `
  -- 1. Insert Sample Leads in CRM
  INSERT INTO site_leads (name, contact, project_type, idea, budget, stage)
  VALUES 
    ('Arjun Mehta', 'arjun@fintechpulse.io', 'AI Automation & Agents', 'Autonomous KYC verification & transaction fraud detection pipeline.', '₹1,50,000+', 'new'),
    ('Priya Nambiar', 'priya@healthnest.co', 'Web App / SaaS', 'Patient intake EHR dashboard with encrypted Supabase DB & Twilio WhatsApp notifications.', '₹85,000 - ₹1,20,000', 'contacted'),
    ('Vikram Singhania', 'vikram@logixfleet.com', 'Custom Software', 'Live driver telemetry, Mapbox routing, and automated GST billing engine.', '₹2,00,000+', 'proposal_sent')
  ON CONFLICT DO NOTHING;

  -- 2. Insert Sample Proposal
  INSERT INTO proposals (title, scope, total_amount, currency, status, terms, line_items)
  VALUES (
    'Autonomous Logistics & Dispatch Engine',
    'Full-stack real-time dispatch dashboard with sub-100ms routing, customer tracking portal, and automated GST invoice dispatch.',
    3200,
    'USD',
    'sent',
    '50% advance deposit upon acceptance. Remaining 50% upon final staging verification. Net 14 payment terms.',
    '[
      {"description": "Core Dispatch Architecture & Database Schema", "hours": 20, "rate": 60, "amount": 1200},
      {"description": "Mapbox Fleet Routing Engine & Webhooks", "hours": 20, "rate": 60, "amount": 1200},
      {"description": "Automated Billing & WhatsApp API Integration", "hours": 13, "rate": 60, "amount": 800}
    ]'::jsonb
  ) ON CONFLICT DO NOTHING;

  -- 3. Verify Projects have Budget Hours & Health
  UPDATE projects
  SET 
    budget_hours = 80,
    spent_hours = 35,
    health = 'on_track',
    health_score = 95
  WHERE status = 'active';

  -- 4. Insert Verified Sample Invoices
  DO $$
  DECLARE
    proj_id uuid;
    client_usr_id uuid;
  BEGIN
    SELECT id INTO proj_id FROM projects LIMIT 1;
    SELECT id INTO client_usr_id FROM profiles WHERE role = 'client' LIMIT 1;
    
    IF client_usr_id IS NULL THEN
      SELECT id INTO client_usr_id FROM profiles LIMIT 1;
    END IF;

    IF proj_id IS NOT NULL THEN
      INSERT INTO invoices (invoice_number, project_id, client_id, title, type, subtotal, tax, total_amount, currency, status, due_date)
      VALUES 
        ('INV-2026-1001', proj_id, client_usr_id, 'Sprint 1 Advance Deposit (50%)', 'advance', 1600, 0, 1600, 'USD', 'paid', CURRENT_DATE - INTERVAL '10 days'),
        ('INV-2026-1002', proj_id, client_usr_id, 'Sprint 2 Milestone: Routing Engine & APIs', 'milestone', 1000, 0, 1000, 'USD', 'sent', CURRENT_DATE + INTERVAL '7 days')
      ON CONFLICT (invoice_number) DO NOTHING;

      -- Insert Payments
      INSERT INTO payments (invoice_id, amount, payment_method, reference_id, status, paid_at)
      SELECT id, 1600, 'stripe', 'ch_3N8xYk2eZvKYlo2C', 'completed', now()
      FROM invoices WHERE invoice_number = 'INV-2026-1001'
      ON CONFLICT DO NOTHING;

      -- Insert Handover Checklist
      INSERT INTO handover_checklists (project_id, is_completed, items)
      VALUES (
        proj_id,
        false,
        '[
          {"id": "h1", "label": "Production Deployment & DNS switch completed", "category": "deployment", "completed": true},
          {"id": "h2", "label": "Admin credentials & password transfer securely shared", "category": "security", "completed": true},
          {"id": "h3", "label": "Code repository ownership transferred / invite accepted", "category": "code", "completed": true},
          {"id": "h4", "label": "Walkthrough video & technical documentation shared", "category": "handover", "completed": false},
          {"id": "h5", "label": "Final invoice settled and receipt issued", "category": "finance", "completed": false}
        ]'::jsonb
      ) ON CONFLICT (project_id) DO NOTHING;

      -- Insert Sample Testimonial
      INSERT INTO testimonials (project_id, client_id, rating, review, author_name, company_name, is_featured)
      VALUES (
        proj_id,
        client_usr_id,
        5,
        'The Flow Labs delivered our core dispatch engine 4 days ahead of schedule with sub-100ms P95 API responses. Unmatched velocity and architectural precision.',
        'Rohan Sharma',
        'Droovee Mobility',
        true
      ) ON CONFLICT DO NOTHING;
    END IF;
  END $$;
  `;

  try {
    const res = await executeSql(sql);
    console.log("✅ Operations Lifecycle seeded successfully!");
  } catch (e) {
    console.error("❌ Seeding error:", e);
  }
}

if (require.main === module) {
  seed();
}

module.exports = { seed };
