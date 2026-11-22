-- ============================================================
-- 0001 - Identity: roles, profiles, audit log
--
-- Phase 1a. Safe to re-run. Wrapped in a transaction.
-- Does NOT create project/task tables (that is 0002).
--
-- Run in Supabase -> SQL Editor -> New query -> Run.
-- Before running: take a backup (Dashboard -> Database -> Backups,
-- or a manual pg_dump) if you have anything you cannot recreate.
--
-- Design notes:
--   * profiles is keyed to auth.users, so deleting an auth user
--     removes the profile and nothing else.
--   * is_admin() keeps the old admin_users allowlist as a fallback.
--     That is deliberate: if this migration lands before profiles
--     are seeded, nobody is locked out of Flow HQ. The fallback can
--     be removed in a later migration once the seed is verified.
--   * Role and status can only be changed by an admin or the service
--     role. A member cannot promote themselves through PostgREST.
-- ============================================================

begin;

create extension if not exists pgcrypto;

-- ------------------------------------------------------------
-- 1. Enums
-- ------------------------------------------------------------
do $$
begin
  create type public.app_role as enum
    ('owner', 'admin', 'manager', 'member', 'client');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.member_status as enum
    ('invited', 'active', 'suspended');
exception
  when duplicate_object then null;
end $$;

-- ------------------------------------------------------------
-- 2. Profiles
-- ------------------------------------------------------------
create table if not exists public.profiles (
  id              uuid primary key references auth.users(id) on delete cascade,
  email           text,
  full_name       text,
  avatar_url      text,
  role            public.app_role    not null default 'member',
  status          public.member_status not null default 'invited',
  github_username text,
  timezone        text not null default 'Asia/Kolkata',
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create unique index if not exists profiles_email_lower_idx
  on public.profiles (lower(email))
  where email is not null;

create index if not exists profiles_role_idx
  on public.profiles (role, status);

comment on table public.profiles is
  'One row per auth user. role controls app access; status controls whether that access is live.';

-- ------------------------------------------------------------
-- 3. updated_at helper (also used by later migrations)
-- ------------------------------------------------------------
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_touch on public.profiles;
create trigger profiles_touch
  before update on public.profiles
  for each row execute function public.touch_updated_at();

-- ------------------------------------------------------------
-- 4. Seed from the existing allowlist
--    Only users who actually exist in auth.users can be seeded;
--    an allowlist email with no account could never sign in.
-- ------------------------------------------------------------
insert into public.profiles (id, email, role, status)
select u.id,
       lower(u.email),
       'admin'::public.app_role,
       'active'::public.member_status
from auth.users u
join public.admin_users a
  on lower(a.email) = lower(u.email)
on conflict (id) do update
  set role   = 'admin'::public.app_role,
      status = 'active'::public.member_status,
      email  = excluded.email;

-- ------------------------------------------------------------
-- 5. Server-side role helpers
-- ------------------------------------------------------------
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    exists (
      select 1
      from public.profiles p
      where p.id = auth.uid()
        and p.role in ('owner', 'admin')
        and p.status = 'active'
    )
    -- Temporary fallback so a fresh migration cannot lock admins out.
    or exists (
      select 1
      from public.admin_users a
      where lower(a.email) = lower(coalesce(auth.jwt() ->> 'email', ''))
    );
$$;

create or replace function public.current_role()
returns public.app_role
language sql
stable
security definer
set search_path = public
as $$
  select p.role
  from public.profiles p
  where p.id = auth.uid()
    and p.status = 'active';
$$;

create or replace function public.is_client()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role = 'client'
      and p.status = 'active'
  );
$$;

revoke all on function public.is_admin()     from public;
revoke all on function public.current_role() from public;
revoke all on function public.is_client()    from public;

grant execute on function public.is_admin()     to authenticated;
grant execute on function public.current_role() to authenticated;
grant execute on function public.is_client()    to authenticated;

-- ------------------------------------------------------------
-- 6. RLS on profiles
-- ------------------------------------------------------------
alter table public.profiles enable row level security;

drop policy if exists "profiles self read" on public.profiles;
create policy "profiles self read"
  on public.profiles
  for select
  to authenticated
  using (id = auth.uid() or public.is_admin());

drop policy if exists "profiles self update" on public.profiles;
create policy "profiles self update"
  on public.profiles
  for update
  to authenticated
  using (id = auth.uid() or public.is_admin())
  with check (id = auth.uid() or public.is_admin());

drop policy if exists "profiles admin insert" on public.profiles;
create policy "profiles admin insert"
  on public.profiles
  for insert
  to authenticated
  with check (public.is_admin());

drop policy if exists "profiles admin delete" on public.profiles;
create policy "profiles admin delete"
  on public.profiles
  for delete
  to authenticated
  using (public.is_admin());

grant select, insert, update, delete on public.profiles to authenticated;

-- ------------------------------------------------------------
-- 7. Prevent self-promotion
--    RLS decides which rows; this trigger decides which columns.
--    Without it, "profiles self update" would allow
--    update profiles set role='admin' where id = auth.uid().
-- ------------------------------------------------------------
create or replace function public.guard_profile_fields()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Service role (invites, admin API, migrations) may change anything.
  if coalesce(auth.jwt() ->> 'role', '') = 'service_role' then
    return new;
  end if;

  -- The SQL editor runs as postgres with no JWT. Without this, fixing a
  -- role by hand in the dashboard would trip the guard.
  if current_user in ('postgres', 'supabase_admin') then
    return new;
  end if;

  if public.is_admin() then
    return new;
  end if;

  if new.role is distinct from old.role then
    raise exception 'Only an admin can change a role'
      using errcode = '42501';
  end if;

  if new.status is distinct from old.status then
    raise exception 'Only an admin can change account status'
      using errcode = '42501';
  end if;

  if new.email is distinct from old.email then
    raise exception 'Email is managed by authentication'
      using errcode = '42501';
  end if;

  return new;
end;
$$;

drop trigger if exists profiles_guard on public.profiles;
create trigger profiles_guard
  before update on public.profiles
  for each row execute function public.guard_profile_fields();

-- ------------------------------------------------------------
-- 8. Auto-create a profile for every new auth user
--    Covers admin-issued accounts and any future invite flow.
-- ------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_role public.app_role;
begin
  v_role := case
    when new.raw_user_meta_data ->> 'role'
         in ('owner', 'admin', 'manager', 'member', 'client')
      then (new.raw_user_meta_data ->> 'role')::public.app_role
    else 'member'::public.app_role
  end;

  insert into public.profiles (id, email, full_name, role, status)
  values (
    new.id,
    lower(new.email),
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    v_role,
    case when new.email_confirmed_at is null
         then 'invited'::public.member_status
         else 'active'::public.member_status
    end
  )
  on conflict (id) do update
    set email     = excluded.email,
        full_name = coalesce(nullif(excluded.full_name, ''), public.profiles.full_name);

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ------------------------------------------------------------
-- 9. Audit log
--    Append-only. No FK on actor_id so deleting a user does not
--    erase the history of what they did.
-- ------------------------------------------------------------
create table if not exists public.audit_log (
  id          bigint generated always as identity primary key,
  actor_id    uuid,
  actor_email text,
  action      text not null,
  entity_type text,
  entity_id   text,
  before      jsonb,
  after       jsonb,
  ip          inet,
  user_agent  text,
  created_at  timestamptz not null default now()
);

create index if not exists audit_log_created_idx
  on public.audit_log (created_at desc);

create index if not exists audit_log_entity_idx
  on public.audit_log (entity_type, entity_id);

alter table public.audit_log enable row level security;

drop policy if exists "audit admin read" on public.audit_log;
create policy "audit admin read"
  on public.audit_log
  for select
  to authenticated
  using (public.is_admin());

-- No insert/update/delete policies: only triggers and the service role write here.
revoke all on public.audit_log from anon;
grant select on public.audit_log to authenticated;

create or replace function public.audit_profile_change()
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
    v_action := 'profile.created';
    v_id     := new.id::text;
    v_before := null;
    v_after  := to_jsonb(new);
  elsif tg_op = 'UPDATE' then
    v_action := 'profile.updated';
    v_id     := new.id::text;
    v_before := to_jsonb(old);
    v_after  := to_jsonb(new);
  else
    v_action := 'profile.deleted';
    v_id     := old.id::text;
    v_before := to_jsonb(old);
    v_after  := null;
  end if;

  insert into public.audit_log
    (actor_id, actor_email, action, entity_type, entity_id, before, after)
  values (
    auth.uid(),
    coalesce(auth.jwt() ->> 'email', ''),
    v_action,
    'profile',
    v_id,
    v_before,
    v_after
  );

  return null;
end;
$$;

drop trigger if exists profiles_audit on public.profiles;
create trigger profiles_audit
  after insert or update or delete on public.profiles
  for each row execute function public.audit_profile_change();

commit;

-- ------------------------------------------------------------
-- Verify (run separately after the migration):
--
--   select count(*) as profiles from public.profiles;
--   select email, role, status from public.profiles order by created_at;
--   select public.is_admin();          -- true while signed in as an admin
--
-- Expect: every existing admin appears with role='admin',
-- status='active'. If the count is 0, sign in to Flow HQ once and
-- the fallback allowlist keeps you in; then re-run section 4 only.
-- ------------------------------------------------------------
