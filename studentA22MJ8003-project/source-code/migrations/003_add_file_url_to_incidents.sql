-- Migration: Add file_url column to incidents table
-- Purpose: Store direct links from connectors (Google Drive, etc.)
-- Date: May 15, 2026

ALTER TABLE incidents ADD COLUMN IF NOT EXISTS file_url TEXT;

-- Optional index for queries by file_url (nullable)
CREATE INDEX IF NOT EXISTS idx_incidents_file_url ON incidents((file_url));
