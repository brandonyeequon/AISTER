-- Phase 2 storage: private bucket for evaluation file uploads, scoped to user by path.
-- Object path convention:  <evaluator_id>/<evaluation_id>/<category>/<timestamp>-<filename>

insert into storage.buckets (id, name, public)
values ('evaluation-files', 'evaluation-files', false)
on conflict (id) do nothing;

-- RLS policies on storage.objects are owned by the "storage" schema and must be
-- created with the same role used by Supabase migrations.

drop policy if exists "evaluation-files select own" on storage.objects;
drop policy if exists "evaluation-files insert own" on storage.objects;
drop policy if exists "evaluation-files update own" on storage.objects;
drop policy if exists "evaluation-files delete own" on storage.objects;
drop policy if exists "evaluation-files admin select" on storage.objects;

create policy "evaluation-files select own"
  on storage.objects for select
  using (
    bucket_id = 'evaluation-files'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "evaluation-files insert own"
  on storage.objects for insert
  with check (
    bucket_id = 'evaluation-files'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "evaluation-files update own"
  on storage.objects for update
  using (
    bucket_id = 'evaluation-files'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "evaluation-files delete own"
  on storage.objects for delete
  using (
    bucket_id = 'evaluation-files'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "evaluation-files admin select"
  on storage.objects for select
  using (
    bucket_id = 'evaluation-files'
    and exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );
