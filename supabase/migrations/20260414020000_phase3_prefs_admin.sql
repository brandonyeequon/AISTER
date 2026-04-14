-- Phase 3 migration: user preferences column + admin role management.

-- ---------------------------------------------------------------------------
-- profiles.preferences (jsonb) — keeps Settings toggles in sync across devices.
-- ---------------------------------------------------------------------------
alter table public.profiles
  add column if not exists preferences jsonb not null default '{}'::jsonb;

-- ---------------------------------------------------------------------------
-- Admin can update any profile (used by the user management UI to change roles).
-- ---------------------------------------------------------------------------
drop policy if exists "profiles admin update all" on public.profiles;

create policy "profiles admin update all"
  on public.profiles for update
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  )
  with check (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );
