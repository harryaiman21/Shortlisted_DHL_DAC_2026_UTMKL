-- Create user_profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY DEFAULT auth.uid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  full_name VARCHAR(255),
  role VARCHAR(50) DEFAULT 'editor',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Create incidents table
CREATE TABLE IF NOT EXISTS incidents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(50) DEFAULT 'draft',
  priority VARCHAR(50) DEFAULT 'medium',
  tags TEXT[] DEFAULT '{}',
  sender VARCHAR(255),
  resolution_comments TEXT,
  created_by UUID NOT NULL,
  reviewed_by UUID,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  reviewed_at TIMESTAMP,
  published_at TIMESTAMP,
  content_hash VARCHAR(64),
  FOREIGN KEY (created_by) REFERENCES user_profiles(id),
  FOREIGN KEY (reviewed_by) REFERENCES user_profiles(id)
);

-- Create incident_files table
CREATE TABLE IF NOT EXISTS incident_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  incident_id UUID NOT NULL,
  file_path VARCHAR(255) NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  file_type VARCHAR(50),
  file_size INTEGER,
  uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (incident_id) REFERENCES incidents(id) ON DELETE CASCADE
);

-- Create incident_versions table
CREATE TABLE IF NOT EXISTS incident_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  incident_id UUID NOT NULL,
  old_data JSONB,
  new_data JSONB,
  changed_by UUID NOT NULL,
  status_before VARCHAR(50),
  status_after VARCHAR(50),
  change_reason TEXT,
  changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (incident_id) REFERENCES incidents(id) ON DELETE CASCADE,
  FOREIGN KEY (changed_by) REFERENCES user_profiles(id)
);

-- Create incident_audit_log table
CREATE TABLE IF NOT EXISTS incident_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  incident_id UUID NOT NULL,
  action VARCHAR(50) NOT NULL,
  actor_id UUID NOT NULL,
  details JSONB,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (incident_id) REFERENCES incidents(id) ON DELETE CASCADE,
  FOREIGN KEY (actor_id) REFERENCES user_profiles(id)
);

-- Enable RLS (Row Level Security)
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE incident_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE incident_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE incident_audit_log ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for user_profiles
CREATE POLICY "Users can view their own profile"
  ON user_profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON user_profiles FOR UPDATE
  USING (auth.uid() = id);

-- Create RLS policies for incidents
CREATE POLICY "Authenticated users can view incidents"
  ON incidents FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Users can create incidents"
  ON incidents FOR INSERT
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update incidents they created"
  ON incidents FOR UPDATE
  USING (auth.uid() = created_by);

-- Create RLS policies for incident_files
CREATE POLICY "Users can view files from incidents they created"
  ON incident_files FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM incidents 
      WHERE incidents.id = incident_files.incident_id 
      AND incidents.created_by = auth.uid()
    )
  );

-- Create RLS policies for incident_versions
CREATE POLICY "Users can view versions of incidents they created"
  ON incident_versions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM incidents 
      WHERE incidents.id = incident_versions.incident_id 
      AND incidents.created_by = auth.uid()
    )
  );

-- Create RLS policies for audit_log
CREATE POLICY "Users can view audit logs of incidents they created"
  ON incident_audit_log FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM incidents 
      WHERE incidents.id = incident_audit_log.incident_id 
      AND incidents.created_by = auth.uid()
    )
  );

-- Create trigger function to auto-create user_profiles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, full_name, role)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name', 'editor');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to call the function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create storage bucket for incident files
INSERT INTO storage.buckets (id, name, public) 
VALUES ('incident-files', 'incident-files', false)
ON CONFLICT DO NOTHING;
