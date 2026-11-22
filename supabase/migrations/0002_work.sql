-- ============================================================
-- 0002 - Work: projects, modules, tasks, membership
--
-- Phase 1b. Safe to re-run. Wrapped in a transaction.
-- Depends on 0001 (profiles, is_admin, audit_log).
--
-- Access rules implemented here, once:
--   * A project is visible to admins, its owner, and project_members.
--   * A client sees a project only through project_clients, never
--     through project_members.
--   * A member with no module_members rows in a project sees the
--     whole project. Once assigned to modules, they see only those
--     modules and their tasks.
--   * Tasks with module_id = null are project-level and visible to
--     anyone with project access.
-- ============================================================

begin;

-- ------------------------------------------------------------
-- 1. Enums
-- ------------------------------------------------------------
do $$
begin
  create type public.project_status as enum
    ('planning', 'active', 'on_hold', 'completed', 'archived');
exception when duplicate_object then null;
end $$;

do $$
begin
  create type public.project_role as enum ('manager', 'member', 'viewer');
exception when duplicate_object then null;
end $$;

do $$
begin
  create type public.task_status as enum
    ('backlog', 'todo', 'in_progress', 'review', 'blocked', 'done');
exception when duplicate_object then null;
end $$;

do $$
begin
  create type public.task_priority as enum ('low', 'medium', 'high', 'urgent');
exception when duplicate_object then null;
end $$;

-- ------------------------------------------------------------
-- 2. Projects
-- ------------------------------------------------------------
create table if not exists public.projects (
  id          uuid primary key default gen_random_uuid(),
  key         text not null,
  slug        text not null unique,
  name        text not null,
  summary     text,
  description text,
  status      public.project_status not null default 'planning',
  priority    smallint not null default 2 check (priority between 1 and 4),
  owner_id    uuid references public.profiles(id) on delete set null,
  start_date  date,
  due_date    date,
  created_by  uuid references public.profiles(id) on delete set null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  constraint projects_key_format check (key ~ '^[A-Z][A-Z0-9]{1,7}$')
);

create unique index if not exists projects_key_unique on public.projects (key);
create index if not exists projects_status_idx on public.projects (status, updated_at desc);

create table if not exists public.project_members (
  project_id uuid not null references public.projects(id) on delete cascade,
  user_id    uuid not null references public.profiles(id) on delete cascade,
  role       public.project_role not null default 'member',
  added_by   uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  primary key (project_id, user_id)
);

create index if not exists project_members_user_idx
  on public.project_members (user_id);

create table if not exists public.project_clients (
  project_id uuid not null references public.projects(id) on delete cascade,
  user_id    uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (project_id, user_id)
);

create index if not exists project_clients_user_idx
  on public.project_clients (user_id);

-- ------------------------------------------------------------
-- 3. Modules
-- ------------------------------------------------------------
create table if not exists public.modules (
  id          uuid primary key default gen_random_uuid(),
  project_id  uuid not null references public.projects(id) on delete cascade,
  name        text not null,
  description text,
  status      public.project_status not null default 'planning',
  position    integer not null default 0,
  lead_id     uuid references public.profiles(id) on delete set null,
  start_date  date,
  due_date    date,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists modules_project_idx
  on public.modules (project_id, position);

create table if not exists public.module_members (
  module_id  uuid not null references public.modules(id) on delete cascade,
  user_id    uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (module_id, user_id)
);

create index if not exists module_members_user_idx
  on public.module_members (user_id);

-- ------------------------------------------------------------
-- 4. Tasks
-- ------------------------------------------------------------
create table if not exists public.tasks (
  id             uuid primary key default gen_random_uuid(),
  project_id     uuid not null references public.projects(id) on delete cascade,
  module_id      uuid references public.modules(id) on delete set null,
  number         integer,
  key            text,
  title          text not null,
  description    text,
  status         public.task_status not null default 'todo',
  priority       public.task_priority not null default 'medium',
  assignee_id    uuid references public.profiles(id) on delete set null,
  reporter_id    uuid references public.profiles(id) on delete set null,
  due_date       date,
  estimate_hours numeric(6,2),
  position       numeric not null default 1000,
  completed_at   timestamptz,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  unique (project_id, number),
  unique (key)
);

create index if not exists tasks_project_status_idx
  on public.tasks (project_id, status, position);

create index if not exists tasks_assignee_idx
  on public.tasks (assignee_id, status);

create index if not exists tasks_module_idx
  on public.tasks (module_id);

create index if not exists tasks_due_idx
  on public.tasks (due_date) where due_date is not null;

-- ------------------------------------------------------------
-- 5. Access helpers
--    SECURITY DEFINER so policies never recurse into the table
--    they are protecting.
-- ------------------------------------------------------------
create or replace function public.is_client_of(p_project uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.project_clients pc
    join public.profiles pr on pr.id = pc.user_id
    where pc.project_id = p_project
      and pc.user_id = auth.uid()
      and pr.role = 'client'
      and pr.status = 'active'
  );
$$;

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
        where m.project_id = p_project and m.user_id = auth.uid()
      );
$$;

create or replace function public.can_manage_project(p_project uuid)
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
          and m.role = 'manager'
      );
$$;

-- Managers and viewers bypass module scoping. Members are scoped
-- only after they have at least one module assignment in the project.
create or replace function public.can_access_module(p_module uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.modules m
    where m.id = p_module
      and public.can_access_project(m.project_id)
      and (
        public.is_admin()
        or exists (
          select 1 from public.project_members pm
          where pm.project_id = m.project_id
            and pm.user_id = auth.uid()
            and pm.role in ('manager', 'viewer')
        )
        or not exists (
          select 1
          from public.module_members mm
          join public.modules m2 on m2.id = mm.module_id
          where m2.project_id = m.project_id
            and mm.user_id = auth.uid()
        )
        or exists (
          select 1 from public.module_members mm
          where mm.module_id = m.id and mm.user_id = auth.uid()
        )
      )
  );
$$;

create or replace function public.can_access_task(p_task uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.tasks t
    where t.id = p_task
      and public.can_access_project(t.project_id)
      and (
        t.module_id is null
        or public.can_access_module(t.module_id)
      )
  );
$$;

revoke all on function public.is_client_of(uuid)        from public;
revoke all on function public.can_access_project(uuid)  from public;
revoke all on function public.can_manage_project(uuid)  from public;
revoke all on function public.can_access_module(uuid)   from public;
revoke all on function public.can_access_task(uuid)     from public;

grant execute on function public.is_client_of(uuid)       to authenticated;
grant execute on function public.can_access_project(uuid) to authenticated;
grant execute on function public.can_manage_project(uuid) to authenticated;
grant execute on function public.can_access_module(uuid)  to authenticated;
grant execute on function public.can_access_task(uuid)    to authenticated;

-- ------------------------------------------------------------
-- 6. Progress RPC
--    Security definer, so it must check access itself.
-- ------------------------------------------------------------
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

  -- Admins, project managers and clients see the whole project.
  -- A member scoped to modules only counts tasks they can open, so
  -- the percentage does not leak work outside their modules.
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

revoke all on function public.project_progress(uuid) from public;
grant execute on function public.project_progress(uuid) to authenticated;

-- ------------------------------------------------------------
-- 7. Task key generation (FLW-12)
-- ------------------------------------------------------------
create or replace function public.set_task_key()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_project_key text;
begin
  select key into v_project_key from public.projects where id = new.project_id;

  if v_project_key is null then
    raise exception 'Project % does not exist', new.project_id;
  end if;

  if new.number is null then
    select coalesce(max(number), 0) + 1
      into new.number
    from public.tasks
    where project_id = new.project_id;
  end if;

  new.key := v_project_key || '-' || new.number;
  return new;
end;
$$;

drop trigger if exists tasks_set_key on public.tasks;
create trigger tasks_set_key
  before insert on public.tasks
  for each row execute function public.set_task_key();

-- ------------------------------------------------------------
-- 8. updated_at + completion timestamp
-- ------------------------------------------------------------
drop trigger if exists projects_touch on public.projects;
create trigger projects_touch
  before update on public.projects
  for each row execute function public.touch_updated_at();

drop trigger if exists modules_touch on public.modules;
create trigger modules_touch
  before update on public.modules
  for each row execute function public.touch_updated_at();

drop trigger if exists tasks_touch on public.tasks;
create trigger tasks_touch
  before update on public.tasks
  for each row execute function public.touch_updated_at();

create or replace function public.set_task_completed()
returns trigger
language plpgsql
as $$
begin
  if new.status = 'done' and old.status is distinct from 'done' then
    new.completed_at := now();
  elsif new.status <> 'done' then
    new.completed_at := null;
  end if;
  return new;
end;
$$;

drop trigger if exists tasks_completed on public.tasks;
create trigger tasks_completed
  before update of status on public.tasks
  for each row execute function public.set_task_completed();

-- ------------------------------------------------------------
-- 9. Audit every structural change
-- ------------------------------------------------------------
create or replace function public.audit_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_action text;
  v_id     text;
  v_before jsonb;
  v_after  jsonb;
begin
  if tg_op = 'INSERT' then
    v_action := tg_table_name || '.created';
    v_id     := new.id::text;
  elsif tg_op = 'UPDATE' then
    v_action := tg_table_name || '.updated';
    v_id     := new.id::text;
    v_before := to_jsonb(old);
  else
    v_action := tg_table_name || '.deleted';
    v_id     := old.id::text;
    v_before := to_jsonb(old);
  end if;

  if tg_op <> 'DELETE' then
    v_after := to_jsonb(new);
  end if;

  insert into public.audit_log
    (actor_id, actor_email, action, entity_type, entity_id, before, after)
  values (
    auth.uid(),
    coalesce(auth.jwt() ->> 'email', ''),
    v_action,
    tg_table_name,
    v_id,
    v_before,
    v_after
  );

  return null;
end;
$$;

drop trigger if exists projects_audit on public.projects;
create trigger projects_audit
  after insert or update or delete on public.projects
  for each row execute function public.audit_change();

drop trigger if exists modules_audit on public.modules;
create trigger modules_audit
  after insert or update or delete on public.modules
  for each row execute function public.audit_change();

drop trigger if exists tasks_audit on public.tasks;
create trigger tasks_audit
  after insert or update or delete on public.tasks
  for each row execute function public.audit_change();

-- ------------------------------------------------------------
-- 10. RLS
-- ------------------------------------------------------------
alter table public.projects        enable row level security;
alter table public.project_members enable row level security;
alter table public.project_clients enable row level security;
alter table public.modules         enable row level security;
alter table public.module_members  enable row level security;
alter table public.tasks           enable row level security;

-- projects
drop policy if exists "projects read" on public.projects;
create policy "projects read"
  on public.projects for select to authenticated
  using (public.can_access_project(id) or public.is_client_of(id));

drop policy if exists "projects insert" on public.projects;
create policy "projects insert"
  on public.projects for insert to authenticated
  with check (public.is_admin());

drop policy if exists "projects update" on public.projects;
create policy "projects update"
  on public.projects for update to authenticated
  using (public.can_manage_project(id))
  with check (public.can_manage_project(id));

drop policy if exists "projects delete" on public.projects;
create policy "projects delete"
  on public.projects for delete to authenticated
  using (public.is_admin());

-- project_members
drop policy if exists "project members read" on public.project_members;
create policy "project members read"
  on public.project_members for select to authenticated
  using (public.can_access_project(project_id) or user_id = auth.uid());

drop policy if exists "project members write" on public.project_members;
create policy "project members write"
  on public.project_members for all to authenticated
  using (public.can_manage_project(project_id))
  with check (public.can_manage_project(project_id));

-- project_clients
drop policy if exists "project clients read" on public.project_clients;
create policy "project clients read"
  on public.project_clients for select to authenticated
  using (public.can_manage_project(project_id) or user_id = auth.uid());

drop policy if exists "project clients write" on public.project_clients;
create policy "project clients write"
  on public.project_clients for all to authenticated
  using (public.can_manage_project(project_id))
  with check (public.can_manage_project(project_id));

-- modules
drop policy if exists "modules read" on public.modules;
create policy "modules read"
  on public.modules for select to authenticated
  using (public.can_access_module(id) or public.is_client_of(project_id));

drop policy if exists "modules insert" on public.modules;
create policy "modules insert"
  on public.modules for insert to authenticated
  with check (public.can_manage_project(project_id));

drop policy if exists "modules update" on public.modules;
create policy "modules update"
  on public.modules for update to authenticated
  using (public.can_manage_project(project_id))
  with check (public.can_manage_project(project_id));

drop policy if exists "modules delete" on public.modules;
create policy "modules delete"
  on public.modules for delete to authenticated
  using (public.can_manage_project(project_id));

-- module_members
drop policy if exists "module members read" on public.module_members;
create policy "module members read"
  on public.module_members for select to authenticated
  using (
    exists (
      select 1 from public.modules m
      where m.id = module_id and public.can_access_project(m.project_id)
    )
    or user_id = auth.uid()
  );

drop policy if exists "module members write" on public.module_members;
create policy "module members write"
  on public.module_members for all to authenticated
  using (
    exists (
      select 1 from public.modules m
      where m.id = module_id and public.can_manage_project(m.project_id)
    )
  )
  with check (
    exists (
      select 1 from public.modules m
      where m.id = module_id and public.can_manage_project(m.project_id)
    )
  );

-- tasks
drop policy if exists "tasks read" on public.tasks;
create policy "tasks read"
  on public.tasks for select to authenticated
  using (public.can_access_task(id));

drop policy if exists "tasks insert" on public.tasks;
create policy "tasks insert"
  on public.tasks for insert to authenticated
  with check (
    public.can_access_project(project_id)
    and (module_id is null or public.can_access_module(module_id))
  );

drop policy if exists "tasks update" on public.tasks;
create policy "tasks update"
  on public.tasks for update to authenticated
  using (public.can_access_task(id))
  with check (public.can_access_task(id));

drop policy if exists "tasks delete" on public.tasks;
create policy "tasks delete"
  on public.tasks for delete to authenticated
  using (public.can_manage_project(project_id));

-- ------------------------------------------------------------
-- 11. Grants
-- ------------------------------------------------------------
grant select, insert, update, delete on public.projects        to authenticated;
grant select, insert, update, delete on public.project_members to authenticated;
grant select, insert, update, delete on public.project_clients to authenticated;
grant select, insert, update, delete on public.modules         to authenticated;
grant select, insert, update, delete on public.module_members  to authenticated;
grant select, insert, update, delete on public.tasks           to authenticated;

commit;

-- ------------------------------------------------------------
-- Verify after running:
--
--   select count(*) from public.projects;
--   select proname from pg_proc where proname like 'can_%';
--   select public.project_progress('<a project uuid>');
--
-- Then create the first project as an admin in Flow HQ.
-- ------------------------------------------------------------
