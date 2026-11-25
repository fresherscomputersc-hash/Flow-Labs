-- ============================================================
-- The Flow Labs — Migration 0001 (fix): Trust no client-supplied role
--
-- The handle_new_user() trigger previously read `role` from
-- raw_user_meta_data, allowing anyone who signs up with
-- {"role": "owner"} to become an owner. This migration removes
-- that path; the role is always set to 'member' at signup,
-- and can only be changed by an admin RPC afterwards.
-- ============================================================

-- Fix the handle_new_user() trigger: always set role='member',
-- never read it from raw_user_meta_data.
drop function if exists public.handle_new_user() cascade;
create or replace function public.handle_new_user()
  returns trigger
  language plpgsql
  security definer
  set search_path = public
  as $$
  begin
    -- Always set role to member; client-supplied role in
    -- raw_user_meta_data is ignored to prevent self-promotion.
    -- The role can only be changed by an admin RPC afterwards.
    new.role := 'member'::public.app_role;

    insert into public.profiles (id, email, full_name, role, status)
    values (
      new.id,
      lower(new.email),
      coalesce(new.raw_user_meta_data ->> 'full_name', ''),
      new.role,
      case when new.email_confirmed_at is null
          then 'invited'::public.member_status
          else 'active'::public.member_status
      end
    );
    return new;
  end;
$$;

-- Also fix is_admin() to require status='active' for the profile path,
-- removing the admin_users fallback once a real owner exists.
-- (The fallback is kept temporarily for safety; remove in a later migration.)
-- Note: is_admin() currently has the fallback; we just fix the trigger
-- so that new users are always 'member' / 'invited'.

-- Verify after running:
--   1. Sign up with {"role": "owner"} → profile.role = 'member', profile.status = 'invited' or 'active'
--   2. Only an admin RPC can promote a member to owner.