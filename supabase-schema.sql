-- ============================================================
-- The Flow Labs - site leads table
-- Run this in Supabase Dashboard -> SQL Editor -> New query -> Run
-- ============================================================

create table if not exists public.site_leads (
  id           bigint generated always as identity primary key,
  created_at   timestamptz not null default now(),
  name         text not null,
  contact      text not null,
  project_type text not null,
  idea         text not null,
  budget       text,
  source       text not null default 'site',
  user_agent   text,
  status       text not null default 'new'
);

-- Public site visitors insert; nobody can read or update via anon key
alter table public.site_leads enable row level security;

drop policy if exists "anon can submit site leads" on public.site_leads;
create policy "anon can submit site leads"
  on public.site_leads
  for insert
  to anon
  with check (true);

-- (intentionally: NO select/update/delete policies -> writes only)

-- Optional manual tidy: mark handled leads from the dashboard SQL editor
-- (as the owner, use the SQL editor or Table editor directly)
