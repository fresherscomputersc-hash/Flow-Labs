-- ============================================================
-- The Flow Labs — Migration 0009: RPC Grants Hardening
--
-- Revokes execute on over-granted SECURITY DEFINER RPCs from `authenticated`
-- and grants them only to `service_role`. Webhook writes go through
-- the service key exclusively.
-- ============================================================

-- Revoke execute from authenticated, anon, public on the three RPCs
revoke execute on function public.create_notification(uuid, uuid, text, text, text, text) from authenticated, anon, public;
revoke execute on function public.record_github_delivery(text, text, text, text, text) from authenticated, anon, public;
revoke execute on function public.log_github_activity(text, text, text, text, text, text, text, jsonb, text) from authenticated, anon, public;

-- Grant execute only to service_role
grant execute on function public.create_notification(uuid, uuid, text, text, text, text) to service_role;
grant execute on function public.record_github_delivery(text, text, text, text, text) to service_role;
grant execute on function public.log_github_activity(text, text, text, text, text, text, text, jsonb, text) to service_role;