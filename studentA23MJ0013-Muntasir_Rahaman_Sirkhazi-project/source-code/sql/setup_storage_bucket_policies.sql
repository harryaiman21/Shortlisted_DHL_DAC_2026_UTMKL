-- Run this in your Supabase SQL Editor.
-- STEP 1: Create the storage bucket (skip if it already exists in the Storage dashboard).
INSERT INTO storage.buckets (id, name, public)
VALUES ('reports', 'reports', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- STEP 2: Drop old policies if they exist to avoid duplicates.
DROP POLICY IF EXISTS "authenticated users can upload reports" ON storage.objects;
DROP POLICY IF EXISTS "public can read reports" ON storage.objects;
DROP POLICY IF EXISTS "authenticated users can delete reports" ON storage.objects;
DROP POLICY IF EXISTS "authenticated users can update reports" ON storage.objects;

-- STEP 3: Allow authenticated (logged-in) users to upload files.
CREATE POLICY "authenticated users can upload reports"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'reports');

-- STEP 4: Allow anyone to read/download files (public bucket).
CREATE POLICY "public can read reports"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'reports');

-- STEP 5: Allow authenticated users to delete files.
CREATE POLICY "authenticated users can delete reports"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'reports');

-- STEP 6: Allow authenticated users to update (replace) files.
CREATE POLICY "authenticated users can update reports"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'reports');
