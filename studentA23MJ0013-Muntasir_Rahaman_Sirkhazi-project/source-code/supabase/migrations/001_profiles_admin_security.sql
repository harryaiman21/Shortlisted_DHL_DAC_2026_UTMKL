-- Phase 1: ensure profiles table + is_admin flag exist with safe RLS.
-- Idempotent — safe to re-run. Run in Supabase SQL Editor.

-- 1. Profiles table (one row per auth user).
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  is_admin boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 2. Make sure the column exists even if the table was created earlier
--    without it (e.g. via add_tags_and_admin_role.sql).
alter table public.profiles
  add column if not exists is_admin boolean not null default false;

-- 3. Auto-create a profile row when a user signs up.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', '')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 4. RLS: a user can read/update only their own profile.
--    is_admin is intentionally NOT writable by users — only the service role
--    (backend) or the Supabase dashboard can flip the admin bit.
alter table public.profiles enable row level security;

drop policy if exists "users read own profile" on public.profiles;
create policy "users read own profile"
  on public.profiles
  for select
  to authenticated
  using (auth.uid() = id);

drop policy if exists "users update own profile" on public.profiles;
create policy "users update own profile"
  on public.profiles
  for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id and is_admin = (select is_admin from public.profiles where id = auth.uid()));

-- 5. Backfill profile rows for any existing auth users who don't have one.
insert into public.profiles (id, email)
select u.id, u.email
from auth.users u
left join public.profiles p on p.id = u.id
where p.id is null;

-- 6. To grant admin to a specific account, run (in the SQL editor or via
--    the dashboard, NOT from the frontend):
--      update public.profiles set is_admin = true where email = 'you@example.com';
