-- ============================================================
-- The Flow Labs - site schema
-- Run this in Supabase Dashboard -> SQL Editor -> New query -> Run
--
-- This file is additive and idempotent. It keeps the original
-- site_leads table and its anon-insert policy intact, then adds:
--   admin_users   founder allowlist
--   site_content  CMS overrides
--   site_visitors cookie-less page-view analytics
--   site_settings accent / section toggles / SEO
--   visitor_stats() aggregate RPC for the admin dashboard
-- ============================================================

create extension if not exists pgcrypto;

-- ------------------------------------------------------------
-- 1. Existing lead capture table (unchanged behaviour)
-- ------------------------------------------------------------
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

alter table public.site_leads enable row level security;

drop policy if exists "anon can submit site leads" on public.site_leads;
create policy "anon can submit site leads"
  on public.site_leads
  for insert
  to anon
  with check (true);

-- Admin-only read/update/delete. The original insert policy above
-- stays in place; these are additional permissive policies.
alter table public.site_leads add column if not exists notes text;
alter table public.site_leads add column if not exists updated_at timestamptz not null default now();

-- ------------------------------------------------------------
-- 2. Founder allowlist
--    No RLS policies are created on purpose: only the service
--    role (or the SQL editor) can read or write this table.
-- ------------------------------------------------------------
create table if not exists public.admin_users (
  email      text primary key,
  created_at timestamptz not null default now()
);

alter table public.admin_users enable row level security;

create unique index if not exists admin_users_email_lower
  on public.admin_users (lower(email));

insert into public.admin_users (email)
values ('theflowlabs01@gmail.com')
on conflict do nothing;

-- Server-side admin check used by every write policy.
-- auth.jwt() is the PostgREST request JWT; lower() makes the
-- match case-insensitive.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.admin_users
    where lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated;

-- Admin policies for the lead table. These are permissive additions
-- to the existing anon-insert policy; RLS still blocks everyone else.
drop policy if exists "leads admin read" on public.site_leads;
create policy "leads admin read"
  on public.site_leads
  for select
  to authenticated
  using (public.is_admin());

drop policy if exists "leads admin update" on public.site_leads;
create policy "leads admin update"
  on public.site_leads
  for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "leads admin delete" on public.site_leads;
create policy "leads admin delete"
  on public.site_leads
  for delete
  to authenticated
  using (public.is_admin());

-- ------------------------------------------------------------
-- 2b. Privileges
--     RLS decides rows; grants decide whether the role may even
--     attempt the operation. Supabase usually defaults these, but
--     being explicit keeps a fresh project working.
-- ------------------------------------------------------------
grant usage, select on sequence public.site_leads_id_seq to anon, authenticated;

grant insert on public.site_leads to anon, authenticated;
grant select, update, delete on public.site_leads to authenticated;

-- ------------------------------------------------------------
-- 3. CMS content overrides
-- ------------------------------------------------------------
create table if not exists public.site_content (
  id          uuid primary key default gen_random_uuid(),
  page        text not null,
  field_key   text not null,
  field_value text not null,
  updated_at  timestamptz not null default now(),
  unique (page, field_key)
);

alter table public.site_content enable row level security;

drop policy if exists "content public read" on public.site_content;
create policy "content public read"
  on public.site_content
  for select
  to anon, authenticated
  using (true);

drop policy if exists "content admin insert" on public.site_content;
create policy "content admin insert"
  on public.site_content
  for insert
  to authenticated
  with check (public.is_admin());

drop policy if exists "content admin update" on public.site_content;
create policy "content admin update"
  on public.site_content
  for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "content admin delete" on public.site_content;
create policy "content admin delete"
  on public.site_content
  for delete
  to authenticated
  using (public.is_admin());

-- ------------------------------------------------------------
-- 4. Visitor analytics
--    Writes happen only through /api/track with the service key.
--    No anon insert policy: the public anon key cannot spam rows.
-- ------------------------------------------------------------
create table if not exists public.site_visitors (
  id          uuid primary key default gen_random_uuid(),
  page_url    text not null,
  referrer    text,
  user_agent  text,
  screen_size text,
  timestamp   timestamptz not null default now()
);

alter table public.site_visitors enable row level security;

drop policy if exists "visitors admin read" on public.site_visitors;
create policy "visitors admin read"
  on public.site_visitors
  for select
  to authenticated
  using (public.is_admin());

-- Documentation-only policy. service_role bypasses RLS, but this
-- makes the intended writer explicit and keeps anon locked out.
drop policy if exists "visitors service insert" on public.site_visitors;
create policy "visitors service insert"
  on public.site_visitors
  for insert
  to service_role
  with check (true);

-- ------------------------------------------------------------
-- 5. Site settings
-- ------------------------------------------------------------
create table if not exists public.site_settings (
  key        text primary key,
  value      text not null,
  updated_at timestamptz not null default now()
);

alter table public.site_settings enable row level security;

drop policy if exists "settings public read" on public.site_settings;
create policy "settings public read"
  on public.site_settings
  for select
  to anon, authenticated
  using (true);

drop policy if exists "settings admin write" on public.site_settings;
create policy "settings admin write"
  on public.site_settings
  for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ------------------------------------------------------------
-- 6. Indexes
-- ------------------------------------------------------------
create index if not exists idx_visitors_timestamp
  on public.site_visitors (timestamp desc);
create index if not exists idx_visitors_page
  on public.site_visitors (page_url);
create index if not exists idx_content_page
  on public.site_content (page);
create index if not exists idx_leads_created
  on public.site_leads (created_at desc);

-- ------------------------------------------------------------
-- 7. Aggregate stats RPC
--    security invoker means the caller's RLS applies. Only
--    authenticated users can execute it, and only admins can
--    actually read site_visitors.
-- ------------------------------------------------------------
create or replace function public.visitor_stats()
returns jsonb
language plpgsql
stable
security invoker
set search_path = public
as $$
declare
  d0 timestamptz := (date_trunc('day',   now() at time zone 'Asia/Kolkata') at time zone 'Asia/Kolkata');
  w0 timestamptz := (date_trunc('week',  now() at time zone 'Asia/Kolkata') at time zone 'Asia/Kolkata');
  m0 timestamptz := (date_trunc('month', now() at time zone 'Asia/Kolkata') at time zone 'Asia/Kolkata');
  result jsonb;
begin
  select jsonb_build_object(
    'today', (select count(*) from public.site_visitors where timestamp >= d0),
    'week',  (select count(*) from public.site_visitors where timestamp >= w0),
    'month', (select count(*) from public.site_visitors where timestamp >= m0),
    'total', (select count(*) from public.site_visitors),
    'top_pages', coalesce((
      select jsonb_agg(t) from (
        select page_url, count(*)::int as views
        from public.site_visitors
        group by page_url
        order by views desc
        limit 10
      ) t
    ), '[]'::jsonb),
    'top_referrers', coalesce((
      select jsonb_agg(t) from (
        select coalesce(nullif(referrer, ''), 'direct') as referrer,
               count(*)::int as views
        from public.site_visitors
        group by 1
        order by views desc
        limit 5
      ) t
    ), '[]'::jsonb),
    'devices', coalesce((
      select jsonb_object_agg(device, views) from (
        select
          case
            when screen_size ~ '^[0-9]+x[0-9]+$'
             and split_part(screen_size, 'x', 1)::int < 768  then 'mobile'
            when screen_size ~ '^[0-9]+x[0-9]+$'
             and split_part(screen_size, 'x', 1)::int < 1025 then 'tablet'
            else 'desktop'
          end as device,
          count(*)::int as views
        from public.site_visitors
        group by 1
      ) d
    ), '{}'::jsonb)
  ) into result;

  return result;
end;
$$;

revoke all on function public.visitor_stats() from public;
grant execute on function public.visitor_stats() to authenticated;

-- ------------------------------------------------------------
-- 8. Default settings (optional; admin upserts the same keys)
-- ------------------------------------------------------------
insert into public.site_settings (key, value) values
  ('accent_color', '#6EA8FF'),
  ('section_home_work', 'on'),
  ('section_home_process', 'on'),
  ('section_home_faq', 'on'),
  ('section_home_team', 'on'),
  ('section_home_testimonials', 'on'),
  ('section_home_cta', 'on'),
  ('slot_month', '2026-12'),
  ('slot_total', '4'),
  ('slot_taken', '2'),
  ('seo_title_home', 'The Flow Labs — Interfaces, Systems & Intelligence'),
  ('seo_description_home', 'A founder-led engineering studio building interfaces, systems and intelligence for growing businesses. Fixed price before code. Four builds a month.'),
  ('seo_title_about', 'About — A Three-Person Engineering Studio | The Flow Labs'),
  ('seo_description_about', 'Meet The Flow Labs: Smruti Ranjan (Founder), Biswash and Arpita (Co-Founders). A three-person studio building interfaces, systems and AI in-house.'),
  ('seo_title_services', 'Services — Interfaces, Systems & Intelligence | The Flow Labs'),
  ('seo_description_services', 'Websites and web apps from ₹25,000, custom software from ₹75,000, AI automation from ₹40,000. One founder-led team, fixed price before code.'),
  ('seo_title_contact', 'Contact — Start a Project | The Flow Labs'),
  ('seo_description_contact', 'Tell The Flow Labs what you are building: a website, a system or an AI workflow. Two December build slots open, honest 48-hour reply from the founders.'),
  ('seo_title_lab_report', 'Free Website Lab Report — Speed, Accessibility & SEO | The Flow Labs'),
  ('seo_description_lab_report', 'Scan any URL and get a plain-English score for speed, accessibility and search readiness. Free, no signup, no email gate.')
on conflict (key) do nothing;

-- ------------------------------------------------------------
-- 9. The Lab Report cache (free tier friendly, 24h TTL)
--    One row per scanned URL. Public read is not granted:
--    only the API (service role) and admins touch this table.
-- ------------------------------------------------------------
create table if not exists public.site_audits (
  url_key     text primary key,
  payload     jsonb not null,
  created_at  timestamptz not null default now()
);

create index if not exists site_audits_created_idx
  on public.site_audits (created_at desc);

alter table public.site_audits enable row level security;

drop policy if exists "audits_admin_read" on public.site_audits;
create policy "audits_admin_read" on public.site_audits
  for select using (public.is_admin());

-- No anon policies on purpose. The function writes with the
-- service role key, which bypasses RLS.

-- ------------------------------------------------------------
-- 10. Privileges for the remaining tables
--     Tables must exist first, so this runs last. RLS still
--     decides which rows each role can touch.
-- ------------------------------------------------------------
grant select on public.site_content to anon, authenticated;
grant select on public.site_settings to anon, authenticated;
grant select on public.site_visitors to authenticated;
grant select on public.site_audits to authenticated;

-- INSERT/UPDATE/DELETE for authenticated is gated by is_admin()
-- in the policies above.
grant select, insert, update, delete on public.site_content to authenticated;
grant select, insert, update, delete on public.site_settings to authenticated;
grant select, insert, update, delete on public.site_audits to authenticated;

-- Housekeeping: the API only reads rows younger than 24 hours,
-- but pruning keeps the free tier flat. Run weekly (pg_cron) or
-- by hand from the SQL editor:
--   delete from public.site_audits where created_at < now() - interval '7 days';
