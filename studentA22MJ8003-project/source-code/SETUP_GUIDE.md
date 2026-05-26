# Setup Guide - Incident Reporting System

## Prerequisites

Before getting started, ensure you have:
- Node.js (v20.16.0 or higher)
- npm or yarn package manager
- A Supabase account ([Sign up here](https://supabase.com))
- Git for version control

---

## Step 1: Environment Configuration

### 1.1 Create Environment File
```bash
# Copy the example environment file
cp .env.example .env.local
```

### 1.2 Get Supabase Credentials
1. Go to [Supabase Console](https://app.supabase.com)
2. Create a new project or select existing one
3. Navigate to **Settings → API**
4. Copy:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **Anon Public Key** → `VITE_SUPABASE_ANON_KEY`

### 1.3 Update .env.local
```env
VITE_SUPABASE_URL=https://[your-project].supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
VITE_APP_NAME=Incident Reporting System
```

---

## Step 2: Database Setup

### 2.1 Create Tables in Supabase
In Supabase Console → **SQL Editor**, run these migrations:

```sql
-- Create user_profiles table
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  role TEXT CHECK (role IN ('editor', 'reviewer', 'admin')) DEFAULT 'editor',
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create incidents table
CREATE TABLE incidents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  status TEXT CHECK (status IN ('draft', 'reviewed', 'published')) DEFAULT 'draft',
  priority TEXT CHECK (priority IN ('low', 'medium', 'high', 'critical')) DEFAULT 'medium',
  tags TEXT[] DEFAULT '{}',
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  reviewed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  content_hash TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  published_at TIMESTAMP WITH TIME ZONE
);

-- Create incident_files table
CREATE TABLE incident_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  incident_id UUID REFERENCES incidents(id) ON DELETE CASCADE,
  file_path TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size INTEGER,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create incident_versions table
CREATE TABLE incident_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  incident_id UUID REFERENCES incidents(id) ON DELETE CASCADE,
  old_data JSONB,
  new_data JSONB NOT NULL,
  changed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  status_before TEXT,
  status_after TEXT,
  change_reason TEXT,
  changed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create incident_audit_log table
CREATE TABLE incident_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  action TEXT CHECK (action IN ('create', 'update', 'delete', 'publish', 'review')),
  incident_id UUID REFERENCES incidents(id) ON DELETE SET NULL,
  actor TEXT,
  details JSONB,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create storage bucket for incident files
-- (This is done in Supabase UI: Storage → Create Bucket → incident-files)
```

### 2.2 Create Storage Bucket
1. Go to **Storage** in Supabase Console
2. Click **Create Bucket**
3. Name it `incident-files`
4. Make it **Public** for file retrieval
5. Set upload size limit to 50MB

### 2.3 Enable Row-Level Security (RLS)
For production security:

```sql
-- Enable RLS on all tables
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE incident_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE incident_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE incident_audit_log ENABLE ROW LEVEL SECURITY;

-- Create policies (simplified for development)
-- Allow users to read their own data
CREATE POLICY "Users can read own profile"
  ON user_profiles FOR SELECT
  USING (auth.uid() = id);

-- Allow users to read incidents
CREATE POLICY "Users can read incidents"
  ON incidents FOR SELECT
  USING (true);

-- Allow authenticated users to create incidents
CREATE POLICY "Authenticated users can create incidents"
  ON incidents FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');
```

---

## Step 3: Install Dependencies

```bash
# Install all required packages
npm install

# This will install:
# - React 18 & React DOM
# - Supabase JS client
# - React Query for data fetching
# - React Hook Form for form handling
# - Zod for validation
# - Tailwind CSS for styling
# - And more...
```

---

## Step 4: Project Structure Overview

```
incident-reporting-system/
├── src/
│   ├── types/               # TypeScript interfaces
│   ├── services/            # API & business logic
│   │   ├── supabaseClient.ts
│   │   ├── incidentService.ts
│   │   ├── fileService.ts
│   │   └── authService.ts
│   ├── hooks/               # Custom React hooks
│   │   └── useAuth.ts
│   ├── context/             # React Context
│   │   └── AuthContext.tsx
│   ├── components/          # UI Components
│   │   ├── Auth/
│   │   ├── UploadConsole/
│   │   ├── IncidentForm/
│   │   ├── IncidentViewer/
│   │   └── VersionHistory/
│   ├── pages/               # Page components
│   ├── utils/               # Helper functions
│   ├── styles/              # CSS files
│   ├── App.tsx             # Root component
│   └── main.tsx            # Entry point
├── MODULE_STRUCTURE.md      # Module documentation
├── .env.example             # Environment template
├── package.json
└── vite.config.ts
```

See [MODULE_STRUCTURE.md](./MODULE_STRUCTURE.md) for detailed module information.

---

## Step 5: Run the Application

### Development Mode
```bash
# Start dev server with hot reload
npm run dev

# Server will start at http://localhost:5173
```

### Build for Production
```bash
# Build optimized production bundle
npm run build

# Preview production build locally
npm run preview
```

### Linting
```bash
# Check code for errors and style issues
npm run lint
```

---

## Step 6: Deployment on Vercel

### 6.1 Prepare for Deployment
```bash
# Ensure everything builds correctly
npm run build

# Check for errors
npm run lint
```

### 6.2 Deploy to Vercel
1. Push code to GitHub
2. Go to [Vercel Dashboard](https://vercel.com)
3. Click **Add New Project**
4. Import your GitHub repository
5. Configure environment variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
6. Click **Deploy**

### 6.3 Continuous Deployment
Every push to `main` branch will trigger automatic deployment

---

## Step 7: Common Development Tasks

### Create a New Component
```typescript
// src/components/NewComponent/NewComponent.tsx
import React from 'react';

interface Props {
  // Component props
}

/**
 * NewComponent Description
 */
export function NewComponent({ ...props }: Props) {
  return (
    <div>
      {/* Component JSX */}
    </div>
  );
}
```

### Add a New API Service
```typescript
// src/services/newService.ts
import { supabase } from './supabaseClient';

export async function fetchData() {
  const { data, error } = await supabase
    .from('table_name')
    .select('*');
  
  if (error) throw error;
  return data;
}
```

### Create a Custom Hook
```typescript
// src/hooks/useNewFeature.ts
import { useState, useEffect } from 'react';

export function useNewFeature() {
  const [state, setState] = useState(null);
  
  useEffect(() => {
    // Hook logic
  }, []);
  
  return state;
}
```

---

## Troubleshooting

### Node.js Version Error
```bash
# Update Node.js to 20.19.0 or higher
# Using nvm:
nvm install 20.19.0
nvm use 20.19.0
```

### Supabase Connection Issues
1. Verify `.env.local` has correct credentials
2. Check internet connection
3. Ensure Supabase project is active
4. Check browser console for detailed error messages

### Port Already in Use
```bash
# Use a different port
npm run dev -- --port 3000
```

### Module Not Found
```bash
# Clear node_modules and reinstall
rm -rf node_modules
npm install
```

---

## Code Quality Checklist

Before committing code:
- ✅ All components have JSDoc comments
- ✅ All functions have parameter documentation
- ✅ No console errors or warnings
- ✅ TypeScript compiles without errors
- ✅ Code passes linting: `npm run lint`
- ✅ Components are responsive (tested on mobile)
- ✅ Proper error handling with try/catch

---

## Architecture Best Practices

1. **Service Layer**: All API calls go through services
2. **Custom Hooks**: Business logic in hooks, not components
3. **Type Safety**: Use TypeScript interfaces from types module
4. **Error Handling**: Always wrap async calls in try/catch
5. **Comments**: Document complex logic inline
6. **Modularity**: Keep components small and focused

---

## Next Steps

1. ✅ Configure environment variables
2. ✅ Set up Supabase database
3. ✅ Install dependencies
4. ✅ Run development server
5. Next: Build components (LoginForm, UploadConsole, etc.)
6. Integrate with RPA (UiPath automation)
7. Deploy to Vercel

---

## Documentation References

- [Supabase Documentation](https://supabase.com/docs)
- [React Documentation](https://react.dev)
- [Vite Documentation](https://vitejs.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs)
- [Tailwind CSS](https://tailwindcss.com)

---

## Support

For issues or questions:
1. Check the MODULE_STRUCTURE.md for architecture overview
2. Review code comments in relevant modules
3. Check Supabase console for database errors
4. Review browser developer console for client-side errors

---

**Last Updated**: May 2026
**Version**: 1.0.0
