-- Feature 4: Add tags column to reports
alter table public.reports
  add column if not exists tags text default null;

-- Feature 11: Add is_admin flag to profiles table
-- Run this, then set is_admin = true for your admin account in the Supabase dashboard
alter table public.profiles
  add column if not exists is_admin boolean default false;

-- Optional: make your admin account an admin (replace with your admin user's UUID)
-- update public.profiles set is_admin = true where email = 'admin@gmail.com';
