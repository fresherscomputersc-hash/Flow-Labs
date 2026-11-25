-- ============================================================
-- The Flow Labs — Migration 0009: RPC Grants Hardening
--
-- Revokes execute on over-granted SECURITY DEFINER RPCs from `authenticated`
-- and grants them only to `service_role`. Webhook writes go through
-- the service key exclusively.
-- ============================================================

-- Revoke execute from authenticated on the three RPCs
revoke execute on function public.create_notification(uuid, uuid, text, text, text, text) from authenticated;
revoke execute on function public.record_github_delivery(uuid, text, text, text, text, text) from authenticated;
revoke execute on function public.log_github_activity(uuid, text, text, text, text, text, text) from authenticated;

-- Grant execute only to service_role
grant execute on function public.create_notification(uuid, uuid, text, text, text, text) to service_role;
grant execute on function public.record_github_delivery(uuid, text, text, text, text, text) to service_role;
grant execute on function public.log_github_activity(uuid, text, text, text, text, text) to service_role;

-- Optional: also revoke from public (if previously granted)
revoke all on function public.create_notification from public;
revoke all on function public.record_github_delivery from public;
revoke all on function public.log_github_activity from public;