-- ============================================================
-- The Flow Labs — Migration 0005: Supabase Storage Buckets
--
-- Configures storage buckets for public media and private
-- client deliverables/attachments with appropriate RLS policies.
-- ============================================================

-- 1. Create storage buckets
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('media', 'media', true, 10485760, array['image/png', 'image/jpeg', 'image/gif', 'image/webp', 'image/svg+xml']),
  ('attachments', 'attachments', false, 52428800, null)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- 2. Storage policies for 'media' (public assets & blog images)
drop policy if exists "media public read" on storage.objects;
create policy "media public read"
  on storage.objects for select
  to public
  using (bucket_id = 'media');

drop policy if exists "media admin upload" on storage.objects;
create policy "media admin upload"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'media' and (public.is_admin() or public.is_member()));

drop policy if exists "media admin update" on storage.objects;
create policy "media admin update"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'media' and (public.is_admin() or public.is_member()));

drop policy if exists "media admin delete" on storage.objects;
create policy "media admin delete"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'media' and (public.is_admin() or public.is_member()));

-- 3. Storage policies for 'attachments' (project files & deliverables)
drop policy if exists "attachments auth read" on storage.objects;
create policy "attachments auth read"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'attachments'
    and (
      public.is_admin()
      or public.is_member()
      or exists (
        select 1 from public.attachments a
        where a.storage_path = storage.objects.name
          and a.client_visible = true
          and public.is_client_of(a.project_id)
      )
    )
  );

drop policy if exists "attachments auth upload" on storage.objects;
create policy "attachments auth upload"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'attachments' and (public.is_admin() or public.is_member()));

drop policy if exists "attachments auth delete" on storage.objects;
create policy "attachments auth delete"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'attachments' and public.is_admin());
