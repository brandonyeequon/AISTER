-- Fix infinite recursion in profiles RLS policies.
-- The original admin policies ran `EXISTS (SELECT FROM public.profiles WHERE role='admin')`
-- inside a policy on `public.profiles`, which re-triggered the same policy.
-- Any table whose policy referenced profiles (e.g. evaluations admin select) hit the same loop.
--
-- Fix: route the admin check through a SECURITY DEFINER helper that bypasses RLS.

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated;

drop policy if exists "profiles admin select all" on public.profiles;
create policy "profiles admin select all"
  on public.profiles for select
  using (public.is_admin());

drop policy if exists "profiles admin update all" on public.profiles;
create policy "profiles admin update all"
  on public.profiles for update
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "evaluations admin select all" on public.evaluations;
create policy "evaluations admin select all"
  on public.evaluations for select
  using (public.is_admin());
