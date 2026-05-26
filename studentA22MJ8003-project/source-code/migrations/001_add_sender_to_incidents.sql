-- Migration: Add sender column to incidents table
-- Purpose: Store email sender information from RPA connectors (Email, Google Drive)
-- Date: May 15, 2026
-- Run this on your Supabase database to persist sender field

ALTER TABLE incidents ADD COLUMN IF NOT EXISTS sender VARCHAR(255);

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_incidents_sender ON incidents(sender);
