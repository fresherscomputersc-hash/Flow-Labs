-- ============================================================
-- The Flow Labs — Migration 0007: GitHub App & Webhook Integration
--
-- Adds project repository linking, webhook delivery idempotency,
-- and RPC helpers for attributing commits/PRs to tasks and members.
-- ============================================================

begin;

-- ------------------------------------------------------------
-- 1. Project GitHub Repository Link
-- ------------------------------------------------------------
alter table public.projects
  add column if not exists github_repo text;

create index if not exists projects_github_repo_idx
  on public.projects (lower(github_repo))
  where github_repo is not null;

-- ------------------------------------------------------------
-- 2. Webhook Deliveries (Idempotency)
-- ------------------------------------------------------------
create table if not exists public.github_deliveries (
  delivery_id  text primary key,
  event        text not null,
  repo         text,
  sender       text,
  summary      text,
  processed_at timestamptz not null default now()
);

alter table public.github_deliveries enable row level security;

-- Deliveries are internal system records
drop policy if exists "github deliveries admin read" on public.github_deliveries;
create policy "github deliveries admin read"
  on public.github_deliveries for select to authenticated
  using (public.is_admin());

grant select on public.github_deliveries to authenticated;

-- Helper to record delivery idempotently
create or replace function public.record_github_delivery(
  p_delivery_id text,
  p_event       text,
  p_repo        text default null,
  p_sender      text default null,
  p_summary     text default null
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_delivery_id is null then
    return false;
  end if;

  insert into public.github_deliveries (delivery_id, event, repo, sender, summary)
  values (p_delivery_id, p_event, p_repo, p_sender, p_summary);
  return true;
exception when unique_violation then
  return false; -- Already processed!
end;
$$;

revoke all on function public.record_github_delivery(text, text, text, text, text) from public;
grant execute on function public.record_github_delivery(text, text, text, text, text) to authenticated;

-- ------------------------------------------------------------
-- 3. Log GitHub Activity & Task Linking
-- ------------------------------------------------------------
create or replace function public.log_github_activity(
  p_repo         text,
  p_actor_github text,
  p_actor_email  text,
  p_kind         text,
  p_entity_type  text,
  p_entity_id    text,
  p_summary      text,
  p_meta         jsonb,
  p_task_key     text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_project_id uuid;
  v_actor_id   uuid;
  v_task_id    uuid;
begin
  -- 1. Find project by github_repo (e.g. 'fresherscomputersc-hash/Flow-Labs')
  if p_repo is not null then
    select id into v_project_id
    from public.projects
    where lower(github_repo) = lower(p_repo)
    limit 1;
  end if;

  -- 2. Find actor by github_username or email
  if p_actor_github is not null then
    select id into v_actor_id
    from public.profiles
    where lower(github_username) = lower(p_actor_github)
    limit 1;
  end if;

  if v_actor_id is null and p_actor_email is not null then
    select id into v_actor_id
    from public.profiles
    where lower(email) = lower(p_actor_email)
    limit 1;
  end if;

  -- 3. If task_key is provided (e.g. 'FLW-12'), locate task
  if p_task_key is not null then
    select id, project_id into v_task_id, v_project_id
    from public.tasks
    where upper(key) = upper(p_task_key);
  end if;

  -- 4. Insert into public.activity
  insert into public.activity (
    project_id,
    actor_id,
    kind,
    entity_type,
    entity_id,
    summary,
    meta
  ) values (
    v_project_id,
    v_actor_id,
    p_kind,
    p_entity_type,
    coalesce(v_task_id::text, p_entity_id),
    p_summary,
    p_meta
  );

  -- 5. If linked to a task, post an audit comment
  if v_task_id is not null and p_kind = 'github.commit' then
    insert into public.task_comments (task_id, author_id, body)
    values (
      v_task_id,
      v_actor_id,
      '🔗 GitHub commit linked: `' || coalesce(p_meta->>'sha', 'commit') || '` — ' || p_summary
    );
  elsif v_task_id is not null and p_kind like 'github.pr%' then
    insert into public.task_comments (task_id, author_id, body)
    values (
      v_task_id,
      v_actor_id,
      '🔀 GitHub PR linked: #' || coalesce(p_meta->>'pr_number', '') || ' — ' || p_summary
    );
  end if;

  return jsonb_build_object(
    'ok', true,
    'project_id', v_project_id,
    'actor_id', v_actor_id,
    'task_id', v_task_id
  );
end;
$$;

revoke all on function public.log_github_activity(text, text, text, text, text, text, text, jsonb, text) from public;
grant execute on function public.log_github_activity(text, text, text, text, text, text, text, jsonb, text) to authenticated;

commit;
