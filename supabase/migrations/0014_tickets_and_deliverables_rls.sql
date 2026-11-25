-- ============================================================
-- 0014_tickets_and_deliverables_rls.sql
-- Fixes client ticket creation RLS and ensures project clients
-- can view client-visible deliverables (attachments) and updates.
-- ============================================================

-- 1. Ensure tickets.client_id defaults to auth.uid() when omitted
ALTER TABLE public.tickets
  ALTER COLUMN client_id SET DEFAULT auth.uid();

-- 2. Update client tickets policy so clients can insert/view/update
-- either their own tickets (client_id = auth.uid()) or tickets on their assigned project
DROP POLICY IF EXISTS "Client manage own tickets" ON public.tickets;
CREATE POLICY "Client manage own tickets" ON public.tickets
  FOR ALL TO authenticated
  USING (
    client_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.project_clients pc
      WHERE pc.project_id = tickets.project_id AND pc.user_id = auth.uid()
    )
  )
  WITH CHECK (
    (client_id IS NULL OR client_id = auth.uid())
    AND (
      project_id IS NULL
      OR EXISTS (
        SELECT 1 FROM public.project_clients pc
        WHERE pc.project_id = tickets.project_id AND pc.user_id = auth.uid()
      )
    )
  );

-- 3. Ensure testimonials.client_id also defaults to auth.uid()
ALTER TABLE public.testimonials
  ALTER COLUMN client_id SET DEFAULT auth.uid();

-- 4. Allow admins full access to attachments (deliverables) and client_updates
DROP POLICY IF EXISTS "Admins full attachments" ON public.attachments;
CREATE POLICY "Admins full attachments" ON public.attachments
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins full client_updates" ON public.client_updates;
CREATE POLICY "Admins full client_updates" ON public.client_updates
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());
