-- Migration: Add resolution comments to incidents table
-- Purpose: Store resolution notes from the incident review page

ALTER TABLE incidents ADD COLUMN IF NOT EXISTS resolution_comments TEXT;