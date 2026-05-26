# Project Module Structure - Incident Reporting System

## Overview
This document describes the modular structure of the DHL Incident Reporting System. The project is organized into logical modules for maintainability, scalability, and code reusability.

---

## Core Module Organization

### 1. **Types Module** (`src/types/index.ts`)
**Purpose**: Define all TypeScript interfaces and types used throughout the application

**Key Exports**:
- `Incident` - Main incident data structure
- `IncidentFile` - File attachment structure
- `IncidentVersion` - Version history tracking
- `AuditLog` - Audit logging
- `UserProfile` - User information
- `ApiResponse<T>` - Standard API response wrapper
- `SearchFilters` - Search and filtering parameters

**Why Modular**: Centralized type definitions ensure consistency and type safety across all components

---

### 2. **Services Module** (`src/services/`)
**Purpose**: Handle all business logic and API communication with Supabase

#### 2.1 **Supabase Client** (`supabaseClient.ts`)
- Initializes and configures Supabase connection
- Handles authentication token management
- Sets up real-time subscriptions

**Key Exports**:
- `supabase` - Configured Supabase client instance

#### 2.2 **Incident Service** (`incidentService.ts`)
- CRUD operations for incidents
- Search and filtering logic
- Version history retrieval
- Duplicate detection

**Key Functions**:
- `createIncident()` - Create new incident
- `getIncidents()` - Fetch with filters and pagination
- `updateIncident()` - Update incident data
- `updateIncidentStatus()` - Manage status workflow
- `checkForDuplicate()` - 14-day hash-based deduplication

#### 2.3 **File Service** (`fileService.ts`)
- File upload and storage management
- File validation (size, type)
- Public URL generation
- Hash calculation for duplicate detection

**Key Functions**:
- `uploadFile()` - Upload single file
- `uploadMultipleFiles()` - Batch upload
- `deleteFile()` - Remove file from storage
- `calculateFileHash()` - SHA-256 hashing for deduplication

#### 2.4 **Auth Service** (`authService.ts`)
- User authentication and session management
- Profile management
- Role-based access control

**Key Functions**:
- `signIn()` - User login
- `signUp()` - User registration
- `signOut()` - Logout
- `getCurrentUser()` - Get authenticated user
- `getUserProfile()` - Fetch user profile
- `hasRole()` - Check user permissions

**Why Modular**: 
- Separation of concerns (each service handles one domain)
- Easy to test and mock
- Reusable across components
- Centralized error handling

---

### 3. **Custom Hooks** (`src/hooks/`)
**Purpose**: Encapsulate React logic for state management and side effects

#### 3.1 **useAuth Hook** (`useAuth.ts`)
- Manages authentication state
- Provides login/logout functionality
- Handles session persistence
- Subscribes to auth state changes

**Exported**:
- `useAuth()` hook for authentication operations

**Why Modular**: 
- Reusable auth logic across all components
- Decouples React hooks from services
- Single responsibility principle

**Future Hooks to Add**:
- `useIncidents()` - Fetch and manage incidents
- `useFileUpload()` - Handle file uploads
- `useSearch()` - Search and filtering
- `usePagination()` - Pagination logic

---

### 4. **Context Module** (`src/context/`)
**Purpose**: Global state management using React Context API

#### 4.1 **Auth Context** (`AuthContext.tsx`)
- Provides authentication state globally
- Wraps entire app via `<AuthProvider>`
- Accessible via `useAuthContext()` hook

**Exported**:
- `AuthProvider` - Context provider component
- `useAuthContext()` - Custom hook to access auth context

**Why Modular**:
- Avoids prop drilling
- Global accessibility without Redux
- Performance optimized with React.memo

**Future Contexts to Add**:
- `IncidentContext` - Global incident state
- `NotificationContext` - Toast/alert management
- `ThemeContext` - Dark/light mode

---

### 5. **Components Module** (`src/components/`)
**Purpose**: Reusable UI components organized by feature

#### Component Structure:
```
components/
├── Auth/                     # Authentication components
│   ├── LoginForm.tsx        # Login form
│   ├── SignupForm.tsx       # Registration form
│   └── AuthGuard.tsx        # Route protection
├── UploadConsole/           # File upload
│   ├── UploadBox.tsx        # Drag-drop upload
│   ├── FilePreview.tsx      # File preview
│   └── UploadProgress.tsx   # Upload status
├── IncidentForm/            # Create/edit incidents
│   ├── IncidentForm.tsx     # Main form component
│   ├── FormFields.tsx       # Form input fields
│   └── FormValidation.ts    # Validation logic
├── IncidentViewer/          # Browse incidents
│   ├── IncidentList.tsx     # List view
│   ├── IncidentCard.tsx     # Card component
│   ├── SearchBar.tsx        # Search functionality
│   └── FilterPanel.tsx      # Filter options
├── VersionHistory/          # Status tracking
│   ├── StatusTimeline.tsx   # Timeline view
│   ├── VersionItem.tsx      # Single version
│   └── StatusBadge.tsx      # Status display
└── Common/                  # Shared components
    ├── Header.tsx           # App header
    ├── Navigation.tsx       # Navigation menu
    ├── Footer.tsx           # App footer
    ├── Loading.tsx          # Loading spinner
    └── ErrorBoundary.tsx    # Error handling
```

**Why Modular**:
- Each component has single responsibility
- Easy to reuse and compose
- Isolated styling per component
- Simple to test in isolation

---

### 6. **Pages Module** (`src/pages/`)
**Purpose**: Full-page components combining multiple smaller components

**Future Pages**:
- `Dashboard.tsx` - Overview/home page
- `IncidentDetail.tsx` - Single incident view
- `Admin.tsx` - Admin dashboard
- `NotFound.tsx` - 404 page
- `Settings.tsx` - User settings

**Why Modular**: 
- Page-level logic separated from components
- Easier routing setup
- Clear app structure

---

### 7. **Utils Module** (`src/utils/`)
**Purpose**: Shared utility and helper functions

#### 7.1 **Helpers** (`helpers.ts`)
- Date formatting
- File size formatting
- Text truncation
- Email/password validation
- Status/priority color mapping
- Error handling
- Object utilities (clone, merge)

**Why Modular**:
- Reusable across entire app
- Pure functions (easy to test)
- No dependencies on React/components

**Future Utilities**:
- `localStorage.ts` - Local storage management
- `validators.ts` - Advanced validation
- `transformers.ts` - Data transformation
- `constants.ts` - App constants

---

### 8. **Styles Module** (`src/styles/`)
**Purpose**: Global and component-scoped CSS

**Files**:
- `App.css` - Main app styles
- `global.css` - Global styles (fonts, resets)
- `variables.css` - CSS variables (colors, spacing)

**Why Modular**:
- Organized by scope
- Easy to maintain and update
- Responsive design in one place

---

## Data Flow Architecture

```
User Interaction
    ↓
Components (UI)
    ↓
Hooks (useAuth, custom hooks)
    ↓
Services (incidentService, fileService, authService)
    ↓
Supabase Client
    ↓
Database / Storage
```

---

## State Management Flow

```
Component
    ↓
useAuthContext() ← AuthContext ← useAuth() ← authService
    ↓
Custom Hooks ← Services ← supabaseClient
    ↓
Display Data
```

---

## Module Dependencies

```
Components
├── Depends on: Hooks, Types, Utils
├── Uses: useAuthContext, custom hooks

Hooks
├── Depends on: Services, Types
├── Provides state to: Components, Context

Context
├── Depends on: Hooks, Types
├── Provides to: Components

Services
├── Depends on: supabaseClient, Types
├── No dependencies on UI

Utils
├── No dependencies (pure functions)
├── Used by: Everywhere
```

---

## Optimization Strategies

### 1. **Code Splitting**
- Each service is independent
- Components lazy-loaded with React.lazy()
- Routes code-split automatically

### 2. **Performance**
- Memoization in components
- Efficient queries in services
- Debounced search and filters

### 3. **Memory Management**
- Cleanup in useEffect (unsubscribe)
- No memory leaks in services
- Proper error handling

### 4. **Type Safety**
- 100% TypeScript coverage
- Type exports from types module
- Catch errors at compile time

---

## Adding New Features

### Step 1: Define Types
```typescript
// src/types/index.ts
export interface NewFeature {
  // ...
}
```

### Step 2: Create Service
```typescript
// src/services/newFeatureService.ts
export async function getNewFeatures() {
  // API call logic
}
```

### Step 3: Create Hook (Optional)
```typescript
// src/hooks/useNewFeature.ts
export function useNewFeature() {
  // Hook logic
}
```

### Step 4: Create Components
```typescript
// src/components/NewFeature/
```

### Step 5: Use in Pages
```typescript
// src/pages/NewPage.tsx
// Combine components here
```

---

## Comments and Documentation

**Every module includes**:
1. File-level documentation (purpose and exports)
2. Function-level documentation (JSDoc comments)
3. Inline comments for complex logic
4. Parameter and return type documentation

**Example**:
```typescript
/**
 * Get incidents with filtering
 * @param filters - Search filters
 * @returns Paginated incidents
 */
export async function getIncidents(filters?: SearchFilters): Promise<PaginatedResponse<Incident>> {
  // Implementation with inline comments
}
```

---

## Testing Structure (Future)

```
__tests__/
├── services/
│   ├── incidentService.test.ts
│   ├── fileService.test.ts
│   └── authService.test.ts
├── hooks/
│   └── useAuth.test.ts
├── components/
│   └── IncidentForm.test.tsx
└── utils/
    └── helpers.test.ts
```

---

## Build and Deployment

- **Build**: `npm run build` → Vite compresses all modules
- **Preview**: `npm run preview` → Local production build preview
- **Deploy**: Deploy to Vercel → Automatic from git

---

## Summary

**Core Principles**:
1. ✅ **Separation of Concerns** - Each module has one job
2. ✅ **Reusability** - Services, hooks, utils reused everywhere
3. ✅ **Type Safety** - Full TypeScript coverage
4. ✅ **Performance** - Optimized data flow
5. ✅ **Maintainability** - Clear structure and documentation
6. ✅ **Testability** - Easy to isolate and test
7. ✅ **Scalability** - Add new features without breaking existing code

This modular structure ensures the application remains efficient, easy to understand, and simple to extend as requirements evolve.
