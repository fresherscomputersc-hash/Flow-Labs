-- ============================================================
-- The Flow Labs — Migration 0012: is_admin() fallback removal
--
-- Removes the `admin_users` fallback from `is_admin()` so that
-- only a real, active profile can grant admin access.
-- The `admin_users` table is kept but no longer consulted;
-- it will be cleaned up in a later migration once the seed is verified.
-- ============================================================

drop function if exists public.is_admin() cascade;
create or replace function public.is_admin()
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
        and p.role in ('owner', 'admin')
        and p.status = 'active'
    );
$$;