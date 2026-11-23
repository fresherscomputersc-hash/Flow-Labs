-- ============================================================
-- The Flow Labs — Migration 0004: Client Portal Policies
--
-- Enables client access to client_visible attachments and
-- ensures clients can read their linked projects and modules.
-- ============================================================

-- 1. Attachments: Allow clients to read files marked client_visible
-- for projects they are linked to via project_clients.
drop policy if exists "attachments read" on public.attachments;
create policy "attachments read"
  on public.attachments for select to authenticated
  using (
    (public.can_access_project(project_id) and (task_id is null or public.can_access_task(task_id)))
    or
    (client_visible and public.is_client_of(project_id))
  );

-- 2. Client updates: Allow admins/managers to manage updates,
-- and clients to read published updates for their projects.
drop policy if exists "client updates read" on public.client_updates;
create policy "client updates read"
  on public.client_updates for select to authenticated
  using (
    public.can_access_project(project_id)
    or
    (published and public.is_client_of(project_id))
  );

drop policy if exists "client updates write" on public.client_updates;
create policy "client updates write"
  on public.client_updates for all to authenticated
  using (public.can_manage_project(project_id))
  with check (public.can_manage_project(project_id));

-- 3. Project clients linking: ensure admins/managers can link clients
-- and clients can read their own link records.
drop policy if exists "project clients read" on public.project_clients;
create policy "project clients read"
  on public.project_clients for select to authenticated
  using (public.can_manage_project(project_id) or user_id = auth.uid());

drop policy if exists "project clients write" on public.project_clients;
create policy "project clients write"
  on public.project_clients for all to authenticated
  using (public.can_manage_project(project_id))
  with check (public.can_manage_project(project_id));
