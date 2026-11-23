-- ============================================================
-- 0003 - Collaboration: comments, activity, notifications,
--        reports, attachments, client updates
--
-- Safe to re-run. Wrapped in a transaction.
-- Depends on 0001 (profiles, is_admin) and 0002 (projects, tasks,
-- can_access_project, can_access_task, can_manage_project).
--
-- Visibility rules:
--   * Comments and activity follow the task/project you can open.
--   * Notifications are private to the account they belong to.
--   * Client updates are invisible to clients until published.
--   * Attachments marked client_visible appear in the client portal.
-- ============================================================

begin;

-- ------------------------------------------------------------
-- 1. Hardening: anonymous callers cannot execute the helpers.
--    They always returned false/null, but anon has no reason to
--    reach them at all.
-- ------------------------------------------------------------
revoke execute on function public.is_admin()                 from anon;
revoke execute on function public.current_role()             from anon;
revoke execute on function public.is_client()                from anon;
revoke execute on function public.is_client_of(uuid)         from anon;
revoke execute on function public.can_access_project(uuid)   from anon;
revoke execute on function public.can_manage_project(uuid)   from anon;
revoke execute on function public.can_access_module(uuid)    from anon;
revoke execute on function public.can_access_task(uuid)      from anon;
revoke execute on function public.project_progress(uuid)     from anon;

-- ------------------------------------------------------------
-- 2. Directory RPC
--    Reads member names for a project the caller can access.
--    profiles RLS only exposes yourself unless you are an admin,
--    so managers need this door to render a member list.
-- ------------------------------------------------------------
create or replace function public.project_member_directory(p_project uuid)
returns table (
  user_id     uuid,
  full_name   text,
  email       text,
  project_role public.project_role,
  account_role public.app_role
)
language sql
stable
security definer
set search_path = public
as $$
  select pm.user_id,
         p.full_name,
         p.email,
         pm.role,
         p.role
  from public.project_members pm
  join public.profiles p on p.id = pm.user_id
  where pm.project_id = p_project
    and (public.can_access_project(p_project) or pm.user_id = auth.uid());
$$;

revoke all on function public.project_member_directory(uuid) from public;
revoke all on function public.project_member_directory(uuid) from anon;
grant execute on function public.project_member_directory(uuid) to authenticated;

-- ------------------------------------------------------------
-- 3. Task comments
-- ------------------------------------------------------------
create table if not exists public.task_comments (
  id         uuid primary key default gen_random_uuid(),
  task_id    uuid not null references public.tasks(id) on delete cascade,
  author_id  uuid references public.profiles(id) on delete set null,
  body       text not null check (length(btrim(body)) > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists task_comments_task_idx
  on public.task_comments (task_id, created_at);

drop trigger if exists task_comments_touch on public.task_comments;
create trigger task_comments_touch
  before update on public.task_comments
  for each row execute function public.touch_updated_at();

alter table public.task_comments enable row level security;

drop policy if exists "comments read" on public.task_comments;
create policy "comments read"
  on public.task_comments for select to authenticated
  using (public.can_access_task(task_id));

drop policy if exists "comments insert" on public.task_comments;
create policy "comments insert"
  on public.task_comments for insert to authenticated
  with check (author_id = auth.uid() and public.can_access_task(task_id));

drop policy if exists "comments update" on public.task_comments;
create policy "comments update"
  on public.task_comments for update to authenticated
  using (author_id = auth.uid() or public.is_admin())
  with check (author_id = auth.uid() or public.is_admin());

drop policy if exists "comments delete" on public.task_comments;
create policy "comments delete"
  on public.task_comments for delete to authenticated
  using (author_id = auth.uid() or public.is_admin());

grant select, insert, update, delete on public.task_comments to authenticated;

-- ------------------------------------------------------------
-- 4. Activity feed
-- ------------------------------------------------------------
create table if not exists public.activity (
  id          bigint generated always as identity primary key,
  project_id  uuid references public.projects(id) on delete cascade,
  actor_id    uuid references public.profiles(id) on delete set null,
  kind        text not null,
  entity_type text,
  entity_id   text,
  summary     text not null,
  meta        jsonb,
  created_at  timestamptz not null default now()
);

create index if not exists activity_project_idx
  on public.activity (project_id, created_at desc);

alter table public.activity enable row level security;

drop policy if exists "activity read" on public.activity;
create policy "activity read"
  on public.activity for select to authenticated
  using (project_id is null or public.can_access_project(project_id));

drop policy if exists "activity insert" on public.activity;
create policy "activity insert"
  on public.activity for insert to authenticated
  with check (
    actor_id = auth.uid()
    and (project_id is null or public.can_access_project(project_id))
  );

grant select, insert on public.activity to authenticated;

-- Automatic entries for the two events that matter on a board.
create or replace function public.log_task_activity()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'INSERT' then
    insert into public.activity
      (project_id, actor_id, kind, entity_type, entity_id, summary, meta)
    values (
      new.project_id,
      auth.uid(),
      'task.created',
      'task',
      new.id::text,
      coalesce(new.key, new.title) || ' created',
      jsonb_build_object('title', new.title, 'status', new.status)
    );
  elsif tg_op = 'UPDATE' and new.status is distinct from old.status then
    insert into public.activity
      (project_id, actor_id, kind, entity_type, entity_id, summary, meta)
    values (
      new.project_id,
      auth.uid(),
      'task.status',
      'task',
      new.id::text,
      coalesce(new.key, new.title) || ' moved to ' || new.status::text,
      jsonb_build_object('from', old.status, 'to', new.status)
    );
  end if;

  return null;
end;
$$;

drop trigger if exists tasks_activity on public.tasks;
create trigger tasks_activity
  after insert or update of status on public.tasks
  for each row execute function public.log_task_activity();

-- ------------------------------------------------------------
-- 5. Notifications
-- ------------------------------------------------------------
create table if not exists public.notifications (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.profiles(id) on delete cascade,
  project_id uuid references public.projects(id) on delete cascade,
  kind       text not null,
  title      text not null,
  body       text,
  link       text,
  read_at    timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists notifications_user_idx
  on public.notifications (user_id, created_at desc);

create index if not exists notifications_unread_idx
  on public.notifications (user_id) where read_at is null;

alter table public.notifications enable row level security;

drop policy if exists "notifications read" on public.notifications;
create policy "notifications read"
  on public.notifications for select to authenticated
  using (user_id = auth.uid());

drop policy if exists "notifications update" on public.notifications;
create policy "notifications update"
  on public.notifications for update to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- Written by triggers and the service role, never by the browser.
grant select, update on public.notifications to authenticated;

-- ------------------------------------------------------------
-- 6. Daily reports
-- ------------------------------------------------------------
create table if not exists public.daily_reports (
  id          uuid primary key default gen_random_uuid(),
  project_id  uuid not null references public.projects(id) on delete cascade,
  author_id   uuid not null references public.profiles(id) on delete cascade,
  report_date date not null default current_date,
  summary     text not null,
  blockers    text,
  hours       numeric(5,2),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique (project_id, author_id, report_date)
);

create index if not exists daily_reports_project_idx
  on public.daily_reports (project_id, report_date desc);

drop trigger if exists daily_reports_touch on public.daily_reports;
create trigger daily_reports_touch
  before update on public.daily_reports
  for each row execute function public.touch_updated_at();

alter table public.daily_reports enable row level security;

drop policy if exists "reports read" on public.daily_reports;
create policy "reports read"
  on public.daily_reports for select to authenticated
  using (public.can_access_project(project_id));

drop policy if exists "reports write" on public.daily_reports;
create policy "reports write"
  on public.daily_reports for all to authenticated
  using (author_id = auth.uid() and public.can_access_project(project_id))
  with check (author_id = auth.uid() and public.can_access_project(project_id));

grant select, insert, update, delete on public.daily_reports to authenticated;

-- ------------------------------------------------------------
-- 7. Attachments (metadata only; storage bucket comes later)
-- ------------------------------------------------------------
create table if not exists public.attachments (
  id             uuid primary key default gen_random_uuid(),
  project_id     uuid not null references public.projects(id) on delete cascade,
  task_id        uuid references public.tasks(id) on delete cascade,
  uploaded_by    uuid references public.profiles(id) on delete set null,
  file_name      text not null,
  storage_path   text not null,
  mime_type      text,
  size_bytes     bigint,
  client_visible boolean not null default false,
  created_at     timestamptz not null default now()
);

create index if not exists attachments_project_idx
  on public.attachments (project_id, created_at desc);

create index if not exists attachments_task_idx
  on public.attachments (task_id);

alter table public.attachments enable row level security;

drop policy if exists "attachments read" on public.attachments;
create policy "attachments read"
  on public.attachments for select to authenticated
  using (
    public.can_access_project(project_id)
    and (task_id is null or public.can_access_task(task_id))
  );

drop policy if exists "attachments write" on public.attachments;
create policy "attachments write"
  on public.attachments for all to authenticated
  using (uploaded_by = auth.uid() and public.can_access_project(project_id))
  with check (uploaded_by = auth.uid() and public.can_access_project(project_id));

grant select, insert, update, delete on public.attachments to authenticated;

-- ------------------------------------------------------------
-- 8. Client updates
-- ------------------------------------------------------------
create table if not exists public.client_updates (
  id           uuid primary key default gen_random_uuid(),
  project_id   uuid not null references public.projects(id) on delete cascade,
  author_id    uuid references public.profiles(id) on delete set null,
  title        text not null,
  body         text not null,
  published    boolean not null default false,
  published_at timestamptz,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index if not exists client_updates_project_idx
  on public.client_updates (project_id, created_at desc);

drop trigger if exists client_updates_touch on public.client_updates;
create trigger client_updates_touch
  before update on public.client_updates
  for each row execute function public.touch_updated_at();

alter table public.client_updates enable row level security;

drop policy if exists "client updates read" on public.client_updates;
create policy "client updates read"
  on public.client_updates for select to authenticated
  using (
    public.can_access_project(project_id)
    or (published and public.is_client_of(project_id))
  );

drop policy if exists "client updates write" on public.client_updates;
create policy "client updates write"
  on public.client_updates for all to authenticated
  using (public.can_manage_project(project_id))
  with check (public.can_manage_project(project_id));

grant select, insert, update, delete on public.client_updates to authenticated;

-- ------------------------------------------------------------
-- 9. Realtime
--    The browser subscribes to these tables so a board or feed
--    updates without a refresh.
-- ------------------------------------------------------------
do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    begin
      alter publication supabase_realtime add table public.tasks;
    exception when duplicate_object then null;
    end;
  end if;
end $$;

do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    begin
      alter publication supabase_realtime add table public.modules;
    exception when duplicate_object then null;
    end;
  end if;
end $$;

do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    begin
      alter publication supabase_realtime add table public.task_comments;
    exception when duplicate_object then null;
    end;
  end if;
end $$;

do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    begin
      alter publication supabase_realtime add table public.activity;
    exception when duplicate_object then null;
    end;
  end if;
end $$;

do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    begin
      alter publication supabase_realtime add table public.notifications;
    exception when duplicate_object then null;
    end;
  end if;
end $$;

commit;

-- ------------------------------------------------------------
-- Verify after running:
--
--   select public.project_member_directory('<project uuid>');
--   select count(*) from public.task_comments;
--   select tablename from pg_tables where schemaname = 'public'
--     and tablename in ('task_comments','activity','notifications',
--                       'daily_reports','attachments','client_updates');
-- ------------------------------------------------------------
