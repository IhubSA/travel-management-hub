# Phase 3: Authentication & Frontend Implementation Plan

**Status:** Starting Phase 3  
**Date:** 2026-09-09  
**Target:** Complete authentication system + core dashboard components

---

## Phase 3 Scope

### What We'll Build This Phase

#### 1. Authentication System ✅ PLANNED
- Login page with email/password
- Session management with HTTP-only cookies
- Forgot password flow
- Password reset flow
- Protected routes/middleware
- Role-based redirects

#### 2. Core Components ✅ PLANNED
- Page layout with sidebar navigation
- Header with user menu
- Role-specific dashboards
- Common UI components

#### 3. Admin Pages ✅ PLANNED
- User management
- Project management
- Department management

#### 4. API Routes ✅ PLANNED
- Authentication endpoints
- User management endpoints
- Project management endpoints
- Email notification endpoints

#### 5. Utilities & Hooks ✅ PLANNED
- Supabase client setup
- Authentication context
- Custom hooks
- Type definitions

---

## Architecture Overview - Phase 3

```
┌─────────────────────────────────────────────────────────┐
│                    FRONTEND (React)                      │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  Pages:                    Components:                   │
│  ├─ /login                ├─ LoginForm                  │
│  ├─ /reset-password       ├─ Header                     │
│  ├─ /dashboard            ├─ Sidebar                    │
│  ├─ /admin/users          ├─ Dashboard Widgets          │
│  ├─ /admin/projects       ├─ StatusBadge                │
│  └─ /admin/departments    ├─ UserTable                  │
│                           ├─ ProjectForm                │
│                           └─ Modal/Dialog               │
│                                                           │
│  Context & Hooks:                                        │
│  ├─ useAuth()                                           │
│  ├─ useUser()                                           │
│  └─ AuthContext                                         │
│                                                           │
└──────────────────┬──────────────────────────────────────┘
                   │
        ┌──────────▼──────────┐
        │  API Routes         │
        ├─────────────────────┤
        │ /api/auth/*         │
        │ /api/admin/*        │
        │ /api/projects/*     │
        └────────────┬────────┘
                     │
        ┌────────────▼────────────┐
        │   Supabase             │
        ├─────────────────────────┤
        │ Auth (email/password)   │
        │ PostgreSQL (RLS)        │
        │ Storage (files)         │
        └─────────────────────────┘
```

---

## File Structure - Phase 3

```
src/
├── components/
│   ├── auth/
│   │   ├── LoginForm.tsx
│   │   ├── ForgotPasswordForm.tsx
│   │   ├── ResetPasswordForm.tsx
│   │   ├── ProtectedRoute.tsx
│   │   └── AuthGuard.tsx
│   │
│   ├── layout/
│   │   ├── Header.tsx
│   │   ├── Sidebar.tsx
│   │   ├── MainLayout.tsx
│   │   └── AdminLayout.tsx
│   │
│   ├── dashboard/
│   │   ├── StaffDashboard.tsx
│   │   ├── HODDashboard.tsx
│   │   ├── TravelOfficerDashboard.tsx
│   │   ├── FinanceDashboard.tsx
│   │   ├── CEODashboard.tsx
│   │   └── AdminDashboard.tsx
│   │
│   ├── admin/
│   │   ├── UserManagementTable.tsx
│   │   ├── UserForm.tsx
│   │   ├── ProjectManagementTable.tsx
│   │   ├── ProjectForm.tsx
│   │   ├── DepartmentManagementTable.tsx
│   │   └── DepartmentForm.tsx
│   │
│   └── common/
│       ├── Button.tsx
│       ├── Input.tsx
│       ├── Card.tsx
│       ├── Modal.tsx
│       ├── Toast.tsx
│       ├── StatusBadge.tsx
│       └── Loading.tsx
│
├── pages/
│   ├── _app.tsx
│   ├── _document.tsx
│   ├── index.tsx
│   ├── login.tsx
│   ├── forgot-password.tsx
│   ├── reset-password.tsx
│   ├── dashboard.tsx
│   └── admin/
│       ├── users.tsx
│       ├── projects.tsx
│       └── departments.tsx
│
├── api/
│   ├── auth/
│   │   ├── login.ts
│   │   ├── logout.ts
│   │   ├── session.ts
│   │   └── refresh.ts
│   │
│   ├── admin/
│   │   ├── users/
│   │   │   ├── index.ts
│   │   │   ├── [id].ts
│   │   │   └── invite.ts
│   │   ├── projects/
│   │   │   ├── index.ts
│   │   │   └── [id].ts
│   │   └── departments/
│   │       └── index.ts
│   │
│   └── profile/
│       └── index.ts
│
├── lib/
│   ├── supabase.ts
│   ├── supabaseServer.ts
│   ├── auth.ts
│   ├── constants.ts
│   └── validators.ts
│
├── hooks/
│   ├── useAuth.ts
│   ├── useUser.ts
│   ├── useRole.ts
│   └── useFetch.ts
│
├── context/
│   └── AuthContext.tsx
│
├── types/
│   ├── index.ts
│   ├── auth.ts
│   ├── user.ts
│   └── database.ts (generated from Supabase)
│
└── styles/
    ├── globals.css
    └── theme.css
```

---

## Component Specifications

### 1. LoginForm Component
**Purpose:** User authentication  
**Props:**
- onSuccess: (user) => void
- redirectTo?: string

**Features:**
- Email & password fields
- Validation feedback
- Loading state
- Error display
- "Forgot password" link
- Sign-up blocked message

**Behavior:**
- POST to `/api/auth/login`
- Stores JWT in HTTP-only cookie
- Redirects to dashboard on success
- Shows Supabase auth errors

---

### 2. ProtectedRoute Component
**Purpose:** Guard authenticated pages  
**Props:**
- children: ReactNode
- requiredRole?: user_role

**Features:**
- Checks auth session
- Validates role if specified
- Redirects to login if not authenticated
- Shows loading state

**Behavior:**
```typescript
<ProtectedRoute requiredRole="SUPER_ADMIN">
  <AdminPage />
</ProtectedRoute>
```

---

### 3. Header Component
**Purpose:** Top navigation with user menu  
**Features:**
- Angels RC logo
- Application title
- User name display
- Profile menu dropdown
- Logout button
- Role badge

---

### 4. Sidebar Component
**Purpose:** Navigation menu based on role  
**Features:**
- Links specific to user role
- Dashboard link
- Travel request links (if applicable)
- Admin section (if SUPER_ADMIN)
- User profile link
- Logout link
- Collapsible on mobile

**Navigation by Role:**
```
STAFF:
├─ Dashboard
├─ My Requests
├─ Create Request
└─ Profile

HOD:
├─ Dashboard
├─ Approvals
├─ My Department
└─ Profile

TRAVEL_OFFICER:
├─ Dashboard
├─ Booking Queue
├─ My Bookings
└─ Profile

FINANCE:
├─ Dashboard
├─ Finance Review
├─ Budget Reports
└─ Profile

CEO:
├─ Dashboard
├─ Budget Exceptions
└─ Profile

SUPER_ADMIN:
├─ Dashboard
├─ Users
├─ Projects
├─ Departments
├─ Audit Logs
├─ Email Logs
└─ Profile
```

---

### 5. Dashboard Components

**Staff Dashboard:**
- Quick stats (pending, approved, completed)
- Recent requests table
- Create new request button

**HOD Dashboard:**
- Pending approvals count
- Approval queue table
- Department overview

**Travel Officer Dashboard:**
- Booking queue
- In-progress bookings
- Upcoming travel

**Finance Dashboard:**
- Pending finance reviews
- Budget status
- Exception count

**CEO Dashboard:**
- Budget exceptions only
- Approval status

**Admin Dashboard:**
- System overview
- Recent activity
- User count
- Project count

---

### 6. User Management Page

**Features:**
- User list table with search/filter
- Add new user button
- Edit user form
- Deactivate user option
- Bulk actions (future)

**User Form Fields:**
- First name
- Last name
- Email
- Phone
- Department (dropdown)
- Job title
- Role (dropdown)
- Active (toggle)

---

### 7. Project Management Page

**Features:**
- Project list table
- Add new project button
- Edit project form
- Budget management
- Active/inactive toggle

**Project Form Fields:**
- Project code
- Project name
- Description
- Manager (user dropdown)
- Total budget
- Travel budget
- Start date
- End date
- Active (toggle)

---

## API Routes - Phase 3

### Authentication Routes

**POST /api/auth/login**
```javascript
Request: { email, password }
Response: { user, session }
```

**POST /api/auth/logout**
```javascript
Response: { success }
```

**GET /api/auth/session**
```javascript
Response: { user, session } | null
```

**POST /api/auth/forgot-password**
```javascript
Request: { email }
Response: { message }
```

**POST /api/auth/reset-password**
```javascript
Request: { token, password }
Response: { success }
```

### Admin Routes

**GET /api/admin/users**
```javascript
Response: { users[], total, hasMore }
```

**POST /api/admin/users**
```javascript
Request: { first_name, last_name, email, ... }
Response: { user, invitationSent }
```

**PUT /api/admin/users/[id]**
```javascript
Request: { role, active, ... }
Response: { user }
```

**POST /api/admin/users/[id]/invite**
```javascript
Response: { emailSent }
```

**GET /api/admin/projects**
```javascript
Response: { projects[], total }
```

**POST /api/admin/projects**
```javascript
Request: { project_code, project_name, ... }
Response: { project }
```

**PUT /api/admin/projects/[id]**
```javascript
Request: { fields }
Response: { project }
```

---

## Security Implementation

### Session Management
- JWT tokens stored in HTTP-only cookies
- Automatic token refresh
- CSRF protection
- Secure same-site cookie settings

### Route Protection
- All authenticated routes checked
- Role validation on protected routes
- Automatic redirect to login
- Session timeout handling

### API Security
- Service role key server-side only
- Never expose in frontend
- Rate limiting on auth endpoints
- Input validation & sanitization

### Error Handling
- No sensitive info in error messages
- Proper HTTP status codes
- Error logging server-side
- User-friendly messages

---

## Testing Strategy

### Unit Tests
- Component rendering
- Hook behavior
- Validation functions
- Utility functions

### Integration Tests
- Login flow
- Route protection
- Role-based access
- API calls

### E2E Tests (Future)
- Complete login journey
- Full workflow test
- Error scenarios
- Performance baseline

---

## Deployment Checklist

- [ ] Environment variables set
- [ ] Supabase project created
- [ ] Database migrations applied
- [ ] Auth enabled in Supabase
- [ ] Email provider configured
- [ ] Storage bucket created
- [ ] Build passes without errors
- [ ] No console errors
- [ ] Forms validate correctly
- [ ] Protected routes work
- [ ] Role-based access working
- [ ] Mobile responsive
- [ ] Performance acceptable

---

## Phase 3 Timeline

**Day 1:**
- Authentication system (login, logout, session)
- Protected routes & middleware
- Layout components (header, sidebar)

**Day 2:**
- Dashboard components (all roles)
- Common UI components
- Role-based navigation

**Day 3:**
- Admin pages (users, projects, departments)
- API routes
- Error handling & validation

**Day 4:**
- Testing & bug fixes
- Performance optimization
- Documentation

---

## Success Criteria - Phase 3

✅ Users can log in with email/password  
✅ Sessions persist across browser refresh  
✅ Unauthenticated users redirected to login  
✅ Role-based dashboards load correctly  
✅ Admin can create/manage users  
✅ Admin can create/manage projects  
✅ Sidebar navigation works for all roles  
✅ Mobile responsive design  
✅ Error messages user-friendly  
✅ No sensitive info in console/network  

---

## Dependencies to Install

```bash
npm install @supabase/supabase-js
npm install @supabase/auth-helpers-nextjs
npm install @supabase/auth-helpers-react
npm install zustand           # State management (optional)
npm install react-hook-form   # Form handling
npm install zod               # Validation
npm install axios             # HTTP client
npm install date-fns          # Date utilities
```

---

## Environment Variables Needed

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Email
RESEND_API_KEY=
EMAIL_FROM=

# App
APP_URL=
NEXT_PUBLIC_APP_NAME="Travel Management Hub"
```

---

## What's Already Done (Phase 2)

✅ Database schema  
✅ RLS policies  
✅ Seed data  
✅ Type definitions ready  

---

## Ready to Begin Phase 3?

All prerequisites met. Let's build:

1. Authentication system
2. Core components
3. API routes
4. Admin interface

**Proceeding with Phase 3 implementation →**
