# Flow Labs Studio OS — Engineering Guardrails

Permanent rules to prevent regressions across `/flow-hq` (Admin/Team) and `/client` (Client Portal):

1. **Projects (`public.projects`)**:
   - `slug` is `NOT NULL` and `key` must match `^[A-Z][A-Z0-9]{1,7}$`. Always generate a valid `slug` and `key` on insert.
   - `project_members.role` is an enum (`'manager' | 'member'`) — never pass `'lead'`.
2. **Tasks & Team Visibility (`public.tasks`, `public.project_members`)**:
   - Always persist tasks to Supabase `tasks` with `assignee_id` (user UUID, never initials) and `reporter_id`.
   - Whenever assigning or handing off a task to a team member, upsert `(project_id, user_id)` into `public.project_members` so `can_access_project` RLS grants them access.
3. **Client Portal (`public.project_clients`, `project_progress` RPC)**:
   - `public.project_clients` has `(project_id, user_id, created_at)` only — never select `company_name` from `project_clients`.
   - Clients cannot `SELECT` `public.tasks` directly due to RLS. Always use `supabase.rpc('project_progress', { p_project })` for client completion `%`.
   - Never expose internal `github.com` repository URLs on `/client`; map live deployment URLs instead.
   - Always include `client_id` (`auth.uid()`) when inserting into `public.tickets` or `public.testimonials`.
4. **Currency & Data Integrity**:
   - Default all studio finance, invoices, expenses, payouts, and proposals to **INR (`₹`)** with `en-IN` formatting.
   - Never seed hardcoded demo arrays (`DEFAULT_*` must remain `[]`) or rely on `localStorage` as the source of truth.
5. **Navigation & Layout**:
   - Desktop uses a sticky vertical sidebar (`lg:block`); mobile (`< lg`) uses a slide-over side-panel drawer triggered from the header.
