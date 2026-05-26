-- Run this in your Supabase SQL editor to add the admin_response column
ALTER TABLE reports ADD COLUMN IF NOT EXISTS admin_response text;
