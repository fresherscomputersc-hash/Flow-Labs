-- ============================================================
-- Flow HQ / blog
-- Run this once in the Supabase SQL editor.
-- Adds the post table the admin panel writes to and the static
-- build reads from. Safe to re-run.
-- ============================================================

create table if not exists public.site_blog_posts (
  id            uuid primary key default gen_random_uuid(),
  slug          text not null unique,
  title         text not null,
  description   text default '',
  body          text not null default '',
  h1            text default '',
  subtitle      text default '',
  pill          text default '',
  crumb         text default '',
  cta_h2        text default '',
  cta_p         text default '',
  cover_image   text default '',
  tags          text[] default '{}',
  status        text not null default 'draft'
                check (status in ('draft', 'published')),
  published_at  timestamptz,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

comment on table public.site_blog_posts is
  'Blog posts edited in Flow HQ. The static build renders published rows to /blog/<slug>/.';

create index if not exists site_blog_posts_status_idx
  on public.site_blog_posts (status, published_at desc);

-- Keep updated_at honest on every write, from the panel or SQL.
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists site_blog_posts_touch on public.site_blog_posts;
create trigger site_blog_posts_touch
  before update on public.site_blog_posts
  for each row execute function public.touch_updated_at();

alter table public.site_blog_posts enable row level security;

-- Anyone may read published posts. Drafts are invisible to the public
-- role even if a client asks for them explicitly.
drop policy if exists "posts public read" on public.site_blog_posts;
create policy "posts public read"
  on public.site_blog_posts
  for select
  to anon, authenticated
  using (status = 'published');

drop policy if exists "posts admin read" on public.site_blog_posts;
create policy "posts admin read"
  on public.site_blog_posts
  for select
  to authenticated
  using (public.is_admin());

drop policy if exists "posts admin insert" on public.site_blog_posts;
create policy "posts admin insert"
  on public.site_blog_posts
  for insert
  to authenticated
  with check (public.is_admin());

drop policy if exists "posts admin update" on public.site_blog_posts;
create policy "posts admin update"
  on public.site_blog_posts
  for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "posts admin delete" on public.site_blog_posts;
create policy "posts admin delete"
  on public.site_blog_posts
  for delete
  to authenticated
  using (public.is_admin());
