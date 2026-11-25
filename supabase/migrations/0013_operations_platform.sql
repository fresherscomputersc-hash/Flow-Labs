-- Migration 0013: Studio Operations Platform (Admin, Team Member, Client Portals)
-- Non-destructive additions: proposals, contracts, invoices, payments, expenses,
-- payouts, time tracking, tickets, change requests, handover checklists, testimonials, and extensions.

-- 1. Enhance existing tables safely
ALTER TABLE projects ADD COLUMN IF NOT EXISTS budget_hours numeric(8,2) DEFAULT 0;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS spent_hours numeric(8,2) DEFAULT 0;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS health text DEFAULT 'on_track';
ALTER TABLE projects ADD COLUMN IF NOT EXISTS service_type text DEFAULT 'web';
ALTER TABLE projects ADD COLUMN IF NOT EXISTS health_score integer DEFAULT 100;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS is_archived boolean DEFAULT false;

ALTER TABLE tasks ADD COLUMN IF NOT EXISTS is_blocked boolean DEFAULT false;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS blocker_reason text;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS estimated_hours numeric(6,2) DEFAULT 0;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS spent_hours numeric(6,2) DEFAULT 0;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS in_review boolean DEFAULT false;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS reviewer_id uuid REFERENCES profiles(id) ON DELETE SET NULL;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS subtasks jsonb DEFAULT '[]'::jsonb;

ALTER TABLE site_leads ADD COLUMN IF NOT EXISTS stage text DEFAULT 'new';
ALTER TABLE site_leads ADD COLUMN IF NOT EXISTS budget_range text;
ALTER TABLE site_leads ADD COLUMN IF NOT EXISTS service_type text;
ALTER TABLE site_leads ADD COLUMN IF NOT EXISTS notes text;
ALTER TABLE site_leads ADD COLUMN IF NOT EXISTS converted_to_client_id uuid REFERENCES profiles(id) ON DELETE SET NULL;
ALTER TABLE site_leads ADD COLUMN IF NOT EXISTS converted_at timestamptz;

-- 2. Proposals Table
CREATE TABLE IF NOT EXISTS proposals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id bigint REFERENCES site_leads(id) ON DELETE SET NULL,
  client_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  title text NOT NULL,
  scope text,
  deliverables jsonb DEFAULT '[]'::jsonb,
  line_items jsonb DEFAULT '[]'::jsonb,
  total_amount numeric(12,2) DEFAULT 0,
  currency text DEFAULT 'USD',
  terms text,
  status text DEFAULT 'draft', -- draft, sent, viewed, accepted, rejected
  accepted_at timestamptz,
  valid_until timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 3. Contracts Table
CREATE TABLE IF NOT EXISTS contracts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
  client_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  contract_type text DEFAULT 'agreement', -- agreement, nda, retainer
  content text NOT NULL,
  status text DEFAULT 'pending', -- pending, signed, declined
  signed_at timestamptz,
  signature_name text,
  signature_ip text,
  created_at timestamptz DEFAULT now()
);

-- 4. Onboarding Checklists
CREATE TABLE IF NOT EXISTS onboarding_checklists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
  client_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  items jsonb DEFAULT '[]'::jsonb,
  status text DEFAULT 'in_progress', -- in_progress, completed
  completed_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- 5. Invoices Table
CREATE TABLE IF NOT EXISTS invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_number text UNIQUE NOT NULL,
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
  client_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  milestone_id uuid REFERENCES modules(id) ON DELETE SET NULL,
  type text DEFAULT 'milestone', -- advance, milestone, final, retainer
  line_items jsonb DEFAULT '[]'::jsonb,
  subtotal numeric(12,2) DEFAULT 0,
  tax numeric(12,2) DEFAULT 0,
  total_amount numeric(12,2) DEFAULT 0,
  currency text DEFAULT 'USD',
  status text DEFAULT 'draft', -- draft, sent, paid, overdue, cancelled
  due_date date NOT NULL DEFAULT (CURRENT_DATE + INTERVAL '14 days'),
  paid_at timestamptz,
  payment_method text,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 6. Payments Table
CREATE TABLE IF NOT EXISTS payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id uuid REFERENCES invoices(id) ON DELETE CASCADE,
  amount numeric(12,2) NOT NULL,
  payment_method text DEFAULT 'card',
  reference_id text,
  status text DEFAULT 'completed',
  paid_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- 7. Expenses Table
CREATE TABLE IF NOT EXISTS expenses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES projects(id) ON DELETE SET NULL,
  category text NOT NULL, -- software, hosting, contractor, assets, other
  description text NOT NULL,
  amount numeric(12,2) NOT NULL,
  currency text DEFAULT 'USD',
  incurred_date date DEFAULT CURRENT_DATE,
  receipt_url text,
  created_at timestamptz DEFAULT now()
);

-- 8. Team Payouts Table
CREATE TABLE IF NOT EXISTS team_payouts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  project_id uuid REFERENCES projects(id) ON DELETE SET NULL,
  hours_logged numeric(6,2) DEFAULT 0,
  hourly_rate numeric(10,2) DEFAULT 0,
  total_amount numeric(10,2) NOT NULL,
  period_start date,
  period_end date,
  status text DEFAULT 'pending', -- pending, approved, paid
  approved_at timestamptz,
  paid_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- 9. Time Logs Table
CREATE TABLE IF NOT EXISTS time_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id uuid REFERENCES tasks(id) ON DELETE CASCADE,
  member_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
  hours numeric(5,2) NOT NULL,
  description text,
  logged_date date DEFAULT CURRENT_DATE,
  is_billable boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- 10. Tickets Table (Client Support / Bugs / Questions)
CREATE TABLE IF NOT EXISTS tickets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
  client_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  assigned_to uuid REFERENCES profiles(id) ON DELETE SET NULL,
  title text NOT NULL,
  description text NOT NULL,
  type text DEFAULT 'bug', -- bug, question, feature_request, change_request
  priority text DEFAULT 'normal', -- low, normal, high, urgent
  status text DEFAULT 'open', -- open, in_progress, resolved, closed
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 11. Change Requests Table
CREATE TABLE IF NOT EXISTS change_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
  client_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  scope_description text NOT NULL,
  estimated_hours numeric(6,2),
  price numeric(10,2) DEFAULT 0,
  status text DEFAULT 'pending', -- pending, approved, declined, invoiced
  client_approved_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- 12. Handover Checklists Table
CREATE TABLE IF NOT EXISTS handover_checklists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE UNIQUE,
  items jsonb DEFAULT '[]'::jsonb,
  is_completed boolean DEFAULT false,
  completed_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- 13. Testimonials Table
CREATE TABLE IF NOT EXISTS testimonials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
  client_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  rating integer CHECK (rating >= 1 AND rating <= 5),
  review text,
  author_name text,
  author_role text,
  company_name text,
  is_featured boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- 14. Enable Row Level Security (RLS) on all new tables
ALTER TABLE proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE onboarding_checklists ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_payouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE change_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE handover_checklists ENABLE ROW LEVEL SECURITY;
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;

-- 15. RLS Policies

-- Admins can do everything
DO $$ BEGIN
  CREATE POLICY "Admins full proposals" ON proposals FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Admins full contracts" ON contracts FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Admins full checklists" ON onboarding_checklists FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Admins full invoices" ON invoices FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Admins full payments" ON payments FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Admins full expenses" ON expenses FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Admins full team_payouts" ON team_payouts FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Admins full time_logs" ON time_logs FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Admins full tickets" ON tickets FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Admins full change_requests" ON change_requests FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Admins full handover" ON handover_checklists FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Admins full testimonials" ON testimonials FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Client Policies: Clients see only their own data
DO $$ BEGIN
  CREATE POLICY "Client view own proposals" ON proposals FOR SELECT TO authenticated USING (client_id = auth.uid());
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Client update own proposals" ON proposals FOR UPDATE TO authenticated USING (client_id = auth.uid()) WITH CHECK (client_id = auth.uid());
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Client view own contracts" ON contracts FOR SELECT TO authenticated USING (client_id = auth.uid());
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Client sign own contracts" ON contracts FOR UPDATE TO authenticated USING (client_id = auth.uid()) WITH CHECK (client_id = auth.uid());
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Client view and update checklists" ON onboarding_checklists FOR ALL TO authenticated USING (client_id = auth.uid()) WITH CHECK (client_id = auth.uid());
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Client view own invoices" ON invoices FOR SELECT TO authenticated USING (client_id = auth.uid());
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Client view own payments" ON payments FOR SELECT TO authenticated USING (
    EXISTS (SELECT 1 FROM invoices WHERE invoices.id = payments.invoice_id AND invoices.client_id = auth.uid())
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Client manage own tickets" ON tickets FOR ALL TO authenticated USING (client_id = auth.uid()) WITH CHECK (client_id = auth.uid());
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Client view and accept change requests" ON change_requests FOR ALL TO authenticated USING (client_id = auth.uid()) WITH CHECK (client_id = auth.uid());
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Client view handover checklist" ON handover_checklists FOR SELECT TO authenticated USING (
    EXISTS (SELECT 1 FROM project_clients WHERE project_clients.project_id = handover_checklists.project_id AND project_clients.user_id = auth.uid())
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Client manage own testimonials" ON testimonials FOR ALL TO authenticated USING (client_id = auth.uid()) WITH CHECK (client_id = auth.uid());
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Team Member Policies: Team members see their own time logs, assigned tickets, and assigned projects
DO $$ BEGIN
  CREATE POLICY "Team manage own time logs" ON time_logs FOR ALL TO authenticated USING (member_id = auth.uid()) WITH CHECK (member_id = auth.uid());
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Team view own payouts" ON team_payouts FOR SELECT TO authenticated USING (member_id = auth.uid());
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Team view tickets on assigned projects" ON tickets FOR SELECT TO authenticated USING (
    EXISTS (SELECT 1 FROM project_members WHERE project_members.project_id = tickets.project_id AND project_members.user_id = auth.uid())
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Team update assigned tickets" ON tickets FOR UPDATE TO authenticated USING (
    assigned_to = auth.uid() OR EXISTS (SELECT 1 FROM project_members WHERE project_members.project_id = tickets.project_id AND project_members.user_id = auth.uid())
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
