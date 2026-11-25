-- ============================================================
-- The Flow Labs — Migration 0008: Access Hardening
--
-- Ensures that suspended profiles lose project access.
-- Adds `profiles.status = 'active'` to all project membership helpers.
-- ============================================================

-- 1. can_access_project: add status check for project_members
drop function if exists public.can_access_project(uuid);
create or replace function public.can_access_project(p_project uuid)
  returns boolean
  language sql
  stable
  security definer
  set search_path = public
  as $$
    select public.is_admin()
        or exists (
          select 1 from public.projects p
          where p.id = p_project and p.owner_id = auth.uid()
        )
        or exists (
          select 1 from public.project_members m
          where m.project_id = p_project
            and m.user_id = auth.uid()
            and exists (select 1 from public.profiles p
                        where p.id = auth.uid() and p.status = 'active')
        );
  $$;

-- 2. can_manage_project: add status check for project_members
drop function if exists public.can_manage_project(uuid);
create or replace function public.can_manage_project(p_project uuid)
  returns boolean
  language sql
  stable
  security definer
  set search_path = public
  as $$
    select public.is_admin()
        or exists (
          select 1 from public.project_members m
          where m.project_id = p_project
            and m.user_id = auth.uid()
            and exists (select 1 from public.profiles p
                        where p.id = auth.uid() and p.status = 'active')
            and m.role in ('manager', 'admin')
        );
  $$;

-- 3. can_access_module: already calls can_access_project, which is now fixed.
-- No separate change needed; the policy below just delegates to the function.
drop policy if exists "can_access_module" on public.modules;
create policy "can_access_module"
  on public.modules for select to authenticated
  using (public.can_access_module(id));

-- 4. can_access_task: already calls can_access_project, which is now fixed.
-- No separate change needed; the policy below just delegates to the function.
drop policy if exists "can_access_task" on public.tasks;
create policy "can_access_task"
  on public.tasks for select to authenticated
  using (public.can_access_task(id));

-- 5. project_progress: already calls can_access_project, which is now fixed.
drop function if exists public.project_progress(uuid);
create or replace function public.project_progress(p_project uuid)
  returns jsonb
  language plpgsql
  stable
  security definer
  set search_path = public
  as $$
  declare
    v_total bigint;
    v_done  bigint;
    v_full  boolean;
  begin
    if not (public.can_access_project(p_project) or public.is_client_of(p_project)) then
      return null;
    end if;

    v_full := public.is_admin()
           or public.is_client_of(p_project)
           or public.can_manage_project(p_project);

    select count(*), count(*) filter (where status = 'done')
      into v_total, v_done
    from public.tasks t
    where t.project_id = p_project
    and (v_full or t.module_id is null or public.can_access_module(t.module_id));

    return jsonb_build_object(
      'total',   v_total,
      'done',    v_done,
      'percent', case when v_total = 0 then 0
                      else round(100.0 * v_done / v_total)::int end
    );
  end;
$$;

-- 6. RPC grants: these were already over-granted (SEC-014); this migration
-- only hardens the access functions. Revoking those grants is a separate
-- migration (0009_rpc_grants.sql).

-- Verify:
--   select public.can_access_project('<project-uuid>'::uuid);
--   select public.can_manage_project('<project-uuid>'::uuid);