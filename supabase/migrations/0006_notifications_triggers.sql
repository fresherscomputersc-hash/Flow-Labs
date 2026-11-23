-- ============================================================
-- The Flow Labs — Migration 0006: Notifications, Triggers & Realtime
--
-- Automatically creates notifications on task assignment, status changes,
-- and task comments; provides RPCs for batch marking as read and rollups;
-- and ensures tables are active in supabase_realtime.
-- ============================================================

begin;

-- ------------------------------------------------------------
-- 1. Helper function: create_notification RPC
-- ------------------------------------------------------------
create or replace function public.create_notification(
  p_user_id    uuid,
  p_project_id uuid,
  p_kind       text,
  p_title      text,
  p_body       text default null,
  p_link       text default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id uuid;
begin
  if p_user_id is null or p_title is null then
    return null;
  end if;

  insert into public.notifications (user_id, project_id, kind, title, body, link)
  values (p_user_id, p_project_id, coalesce(p_kind, 'general'), p_title, p_body, p_link)
  returning id into v_id;

  return v_id;
end;
$$;

revoke all on function public.create_notification(uuid, uuid, text, text, text, text) from public;
grant execute on function public.create_notification(uuid, uuid, text, text, text, text) to authenticated;

-- ------------------------------------------------------------
-- 2. Helper function: mark_all_notifications_read RPC
-- ------------------------------------------------------------
create or replace function public.mark_all_notifications_read()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_count integer;
begin
  update public.notifications
  set read_at = now()
  where user_id = auth.uid()
    and read_at is null;

  get diagnostics v_count = row_count;
  return v_count;
end;
$$;

revoke all on function public.mark_all_notifications_read() from public;
grant execute on function public.mark_all_notifications_read() to authenticated;

-- ------------------------------------------------------------
-- 3. Automatic Notifications on Task Events
-- ------------------------------------------------------------
create or replace function public.notify_on_task_event()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Task Assigned (INSERT or UPDATE of assignee_id)
  if tg_op = 'INSERT' then
    if new.assignee_id is not null and new.assignee_id <> coalesce(auth.uid(), '00000000-0000-0000-0000-000000000000'::uuid) then
      insert into public.notifications (user_id, project_id, kind, title, body, link)
      values (
        new.assignee_id,
        new.project_id,
        'task.assigned',
        'Assigned: ' || coalesce(new.key, new.title),
        'You were assigned to ' || new.title,
        '/flow-hq/?project=' || new.project_id || '&task=' || new.id
      );
    end if;
  elsif tg_op = 'UPDATE' then
    -- Assignment change
    if new.assignee_id is not null and new.assignee_id is distinct from old.assignee_id
       and new.assignee_id <> coalesce(auth.uid(), '00000000-0000-0000-0000-000000000000'::uuid) then
      insert into public.notifications (user_id, project_id, kind, title, body, link)
      values (
        new.assignee_id,
        new.project_id,
        'task.assigned',
        'Assigned: ' || coalesce(new.key, new.title),
        'You were assigned to ' || new.title,
        '/flow-hq/?project=' || new.project_id || '&task=' || new.id
      );
    end if;

    -- Status change
    if new.status is distinct from old.status then
      -- Notify assignee if not the person who moved it
      if new.assignee_id is not null and new.assignee_id <> coalesce(auth.uid(), '00000000-0000-0000-0000-000000000000'::uuid) then
        insert into public.notifications (user_id, project_id, kind, title, body, link)
        values (
          new.assignee_id,
          new.project_id,
          'task.status',
          coalesce(new.key, new.title) || ' moved to ' || new.status::text,
          'Task status changed from ' || old.status::text || ' to ' || new.status::text,
          '/flow-hq/?project=' || new.project_id || '&task=' || new.id
        );
      end if;

      -- Notify reporter if different from assignee and actor
      if new.reporter_id is not null
         and new.reporter_id <> coalesce(auth.uid(), '00000000-0000-0000-0000-000000000000'::uuid)
         and new.reporter_id <> coalesce(new.assignee_id, '00000000-0000-0000-0000-000000000000'::uuid) then
        insert into public.notifications (user_id, project_id, kind, title, body, link)
        values (
          new.reporter_id,
          new.project_id,
          'task.status',
          coalesce(new.key, new.title) || ' moved to ' || new.status::text,
          'Task status changed from ' || old.status::text || ' to ' || new.status::text,
          '/flow-hq/?project=' || new.project_id || '&task=' || new.id
        );
      end if;
    end if;
  end if;

  return null;
end;
$$;

drop trigger if exists tasks_notifications on public.tasks;
create trigger tasks_notifications
  after insert or update of assignee_id, status on public.tasks
  for each row execute function public.notify_on_task_event();

-- ------------------------------------------------------------
-- 4. Automatic Notifications on Comments
-- ------------------------------------------------------------
create or replace function public.notify_on_comment()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_task record;
begin
  select t.id, t.key, t.title, t.project_id, t.assignee_id, t.reporter_id
  into v_task
  from public.tasks t
  where t.id = new.task_id;

  if not found then
    return null;
  end if;

  -- Notify task assignee if not the comment author
  if v_task.assignee_id is not null and v_task.assignee_id <> new.author_id then
    insert into public.notifications (user_id, project_id, kind, title, body, link)
    values (
      v_task.assignee_id,
      v_task.project_id,
      'task.comment',
      'Comment on ' || coalesce(v_task.key, v_task.title),
      substring(new.body from 1 for 140),
      '/flow-hq/?project=' || v_task.project_id || '&task=' || v_task.id
    );
  end if;

  -- Notify task reporter if not the author and not assignee
  if v_task.reporter_id is not null
     and v_task.reporter_id <> new.author_id
     and v_task.reporter_id <> coalesce(v_task.assignee_id, '00000000-0000-0000-0000-000000000000'::uuid) then
    insert into public.notifications (user_id, project_id, kind, title, body, link)
    values (
      v_task.reporter_id,
      v_task.project_id,
      'task.comment',
      'Comment on ' || coalesce(v_task.key, v_task.title),
      substring(new.body from 1 for 140),
      '/flow-hq/?project=' || v_task.project_id || '&task=' || v_task.id
    );
  end if;

  return null;
end;
$$;

drop trigger if exists comments_notifications on public.task_comments;
create trigger comments_notifications
  after insert on public.task_comments
  for each row execute function public.notify_on_comment();

-- ------------------------------------------------------------
-- 5. Realtime Publication Verification
-- ------------------------------------------------------------
do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    begin alter publication supabase_realtime add table public.tasks; exception when duplicate_object then null; end;
    begin alter publication supabase_realtime add table public.modules; exception when duplicate_object then null; end;
    begin alter publication supabase_realtime add table public.task_comments; exception when duplicate_object then null; end;
    begin alter publication supabase_realtime add table public.activity; exception when duplicate_object then null; end;
    begin alter publication supabase_realtime add table public.notifications; exception when duplicate_object then null; end;
    begin alter publication supabase_realtime add table public.daily_reports; exception when duplicate_object then null; end;
  end if;
end $$;

commit;
