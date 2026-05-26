alter table public.reports
add column if not exists user_id uuid references auth.users(id) on delete cascade;

alter table public.reports enable row level security;

drop policy if exists "users can read own reports" on public.reports;
drop policy if exists "users can insert own reports" on public.reports;
drop policy if exists "users can delete own reports" on public.reports;
drop policy if exists "users can update own reports" on public.reports;
drop policy if exists "allow anon read reports" on public.reports;
drop policy if exists "allow anon insert reports" on public.reports;
drop policy if exists "allow anon delete reports" on public.reports;

create policy "users can read own reports"
on public.reports
for select
to authenticated
using (auth.uid() = user_id);

create policy "users can insert own reports"
on public.reports
for insert
to authenticated
with check (auth.uid() = user_id);

create policy "users can delete own reports"
on public.reports
for delete
to authenticated
using (auth.uid() = user_id);

create policy "users can update own reports"
on public.reports
for update
to authenticated
using (auth.uid() = user_id);
