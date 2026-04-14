-- Phase 1 schema: profiles + evaluations with RLS.
-- Run this BEFORE the older 20260410130107_rls_alignment_patch.sql if you are starting fresh.
-- The earlier migration targets a normalized schema we do not use in Phase 1 and can be ignored
-- (or deleted) until Phase 2 reintroduces normalized tables.

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- profiles: one row per auth user, holds role + display name
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users on delete cascade,
  email text not null,
  full_name text,
  role text not null default 'evaluator'
    check (role in ('teacher', 'evaluator', 'admin')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop policy if exists "profiles select own" on public.profiles;
drop policy if exists "profiles update own" on public.profiles;
drop policy if exists "profiles admin select all" on public.profiles;
drop policy if exists "profiles insert own" on public.profiles;

create policy "profiles select own"
  on public.profiles for select
  using (auth.uid() = id);

create policy "profiles admin select all"
  on public.profiles for select
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

create policy "profiles update own"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Allow the trigger + the owner to insert their own profile row.
create policy "profiles insert own"
  on public.profiles for insert
  with check (auth.uid() = id);

-- ---------------------------------------------------------------------------
-- evaluations: one row per evaluation draft/submission, jsonb for nested data
-- ---------------------------------------------------------------------------
create table if not exists public.evaluations (
  id uuid primary key default gen_random_uuid(),
  evaluator_id uuid not null references public.profiles(id) on delete cascade,
  status text not null
    check (status in ('in-progress', 'completed')),
  current_step text not null default 'timer',
  timer_seconds int not null default 0,
  details jsonb not null default '{}'::jsonb,
  observation_notes text not null default '',
  category_final_notes jsonb not null default '{}'::jsonb,
  ster_scores jsonb not null default '{}'::jsonb,
  selected_ster_category text not null default 'LL',
  lesson_plan_file_name text,
  notes_file_name text,
  lesson_plan_file_path text,
  notes_file_path text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  submitted_at timestamptz
);

create index if not exists evaluations_evaluator_id_idx on public.evaluations (evaluator_id);
create index if not exists evaluations_updated_at_idx on public.evaluations (updated_at desc);

alter table public.evaluations enable row level security;

drop policy if exists "evaluations select own" on public.evaluations;
drop policy if exists "evaluations insert own" on public.evaluations;
drop policy if exists "evaluations update own" on public.evaluations;
drop policy if exists "evaluations delete own" on public.evaluations;
drop policy if exists "evaluations admin select all" on public.evaluations;

create policy "evaluations select own"
  on public.evaluations for select
  using (evaluator_id = auth.uid());

create policy "evaluations admin select all"
  on public.evaluations for select
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

create policy "evaluations insert own"
  on public.evaluations for insert
  with check (evaluator_id = auth.uid());

create policy "evaluations update own"
  on public.evaluations for update
  using (evaluator_id = auth.uid())
  with check (evaluator_id = auth.uid());

create policy "evaluations delete own"
  on public.evaluations for delete
  using (evaluator_id = auth.uid());

-- ---------------------------------------------------------------------------
-- updated_at trigger (shared)
-- ---------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute procedure public.set_updated_at();

drop trigger if exists evaluations_set_updated_at on public.evaluations;
create trigger evaluations_set_updated_at
  before update on public.evaluations
  for each row execute procedure public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Auto-create profile row on signup
-- ---------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'role', 'evaluator')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
