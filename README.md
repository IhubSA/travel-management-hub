# Travel Management Hub

A professional travel request management system for Angels Resource Centres NPO, featuring approval workflows, booking coordination, budget tracking, and automated email notifications.

**Status:** Phase 3 (Authentication & Frontend) - In Development

## Quick Start

### 1. Prerequisites

- Node.js 18+ and npm 9+
- Supabase account with Phase 2 database deployed
- Resend account for email notifications (Pro Plan)

### 2. Environment Setup

```bash
# Copy environment template
cp .env.example .env.local

# Edit with your credentials
nano .env.local
```

**Required variables:**
```
NEXT_PUBLIC_SUPABASE_URL=https://[project].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[anon-key]
SUPABASE_SERVICE_ROLE_KEY=[service-role-key]
RESEND_API_KEY=[resend-api-key]
EMAIL_FROM=noreply@angels-travel.example.com
APP_URL=http://localhost:3000
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Generate Database Types

```bash
# Get database types from your Supabase project
npm run db:types
```

This creates `src/types/database.ts` with all table and enum definitions.

### 5. Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Phase 3 Implementation Status

### ✅ Completed

**Authentication System:**
- ✅ Supabase client setup (frontend & server)
- ✅ Authentication context with session management
- ✅ Login/Logout/Session API routes
- ✅ Login form with email/password validation
- ✅ Forgot password flow
- ✅ Reset password flow
- ✅ Protected routes with role validation
- ✅ Custom hooks (useAuth, useRole)

**Layout Components:**
- ✅ Basic dashboard page structure
- ✅ Tailwind CSS styling framework
- ✅ Custom component utilities

**Project Configuration:**
- ✅ Next.js setup with TypeScript
- ✅ Tailwind CSS + PostCSS
- ✅ Security headers configured
- ✅ ESLint & Prettier ready
- ✅ Package.json with all dependencies

### 🔄 In Progress

**Dashboard Components:**
- [ ] Role-specific dashboards (Staff, HOD, Travel Officer, Finance, CEO, Admin)
- [ ] Dashboard widgets and cards
- [ ] Sidebar navigation by role
- [ ] Header with user menu

**Admin Pages:**
- [ ] User management (list, create, edit, deactivate)
- [ ] Project management (CRUD)
- [ ] Department management

**API Routes:**
- [ ] User management endpoints
- [ ] Project management endpoints
- [ ] Email notification system

### 📋 Upcoming

**Common Components:**
- [ ] Reusable UI components (Button, Input, Card, Modal, Toast, etc.)
- [ ] Form validation and error handling
- [ ] Loading states and skeletons
- [ ] Responsive mobile design

**Testing:**
- [ ] Unit tests for components and hooks
- [ ] Integration tests for auth flow
- [ ] E2E tests for full workflows

**Deployment:**
- [ ] Vercel configuration
- [ ] Production environment setup
- [ ] Performance optimization

## Project Structure

```
src/
├── components/
│   ├── auth/              # Authentication components
│   │   ├── LoginForm.tsx
│   │   ├── ForgotPasswordForm.tsx
│   │   ├── ResetPasswordForm.tsx
│   │   └── ProtectedRoute.tsx
│   ├── layout/            # Layout components (coming soon)
│   ├── dashboard/         # Dashboard variants (coming soon)
│   ├── admin/             # Admin pages (coming soon)
│   └── common/            # Reusable UI components (coming soon)
│
├── pages/
│   ├── api/auth/          # Authentication API routes
│   ├── login.tsx          # Login page
│   ├── forgot-password.tsx
│   ├── reset-password.tsx
│   ├── dashboard.tsx      # Main dashboard
│   ├── _app.tsx           # App wrapper with AuthProvider
│   └── _document.tsx      # HTML document
│
├── lib/
│   ├── supabase.ts        # Frontend Supabase client
│   └── supabaseServer.ts  # Server-side Supabase client
│
├── hooks/
│   ├── useAuth.ts         # Authentication hook
│   └── useRole.ts         # Role checking hook
│
├── context/
│   └── AuthContext.tsx    # Authentication context provider
│
├── types/
│   └── database.ts        # Generated from Supabase (run: npm run db:types)
│
└── styles/
    └── globals.css        # Tailwind + custom styles
```

## Authentication Flow

### Login
1. User enters email/password on `/login`
2. `LoginForm` submits to `/api/auth/login`
3. Supabase Auth validates credentials
4. Session stored in HTTP-only cookie
5. User redirected to `/dashboard`

### Protected Routes
- `ProtectedRoute` component wraps protected pages
- Checks authentication status on mount
- Validates role if `requiredRole` prop provided
- Redirects unauthenticated users to `/login`
- Redirects unauthorized users to `/dashboard`

### Session Management
- `AuthContext` syncs with Supabase auth state
- Auto-refresh tokens on browser resume
- Profile data fetched on login
- Graceful handling of expired sessions

## Database Access

The application uses two Supabase clients:

**Frontend Client** (`src/lib/supabase.ts`)
- Uses anonymous key
- Respects Row Level Security (RLS) policies
- Suitable for client-side queries

**Server Client** (`src/lib/supabaseServer.ts`)
- Uses service role key
- Bypasses RLS (use only in API routes)
- Never expose to frontend
- For administrative tasks and email triggers

## API Routes

### Authentication Endpoints

**POST /api/auth/login**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**POST /api/auth/logout**
- Signs out current user

**GET /api/auth/session**
- Returns current session and user profile

## Email Configuration

Emails are sent via Resend Pro Plan. Configure in:
- `EMAIL_FROM` environment variable
- Email templates in Phase 4
- Notification triggers in workflow engine

## Security Best Practices

✅ **Implemented:**
- HTTP-only cookies for session storage
- Service role key never exposed to frontend
- Input validation on forms and API routes
- RLS policies on database layer
- Secure CORS headers
- CSRF protection ready
- No sensitive data in console logs

❌ **DO NOT:**
- Commit `.env.local` to Git
- Share service role keys
- Store test data in production
- Disable RLS on tables
- Log sensitive information
- Bypass authentication for admin features

## Troubleshooting

### "Missing Supabase environment variables"
- Check `.env.local` has all required variables
- Verify `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Restart dev server after changing env vars

### "Failed to fetch profile"
- Verify user profile exists in database
- Check RLS policies allow authenticated users to query profiles
- Ensure auth_user_id matches in profiles table

### "Cannot GET /reset-password"
- Ensure reset token is in URL hash (#access_token=...)
- This is automatically handled by Supabase auth redirect

### Database type errors
- Run `npm run db:types` to regenerate types
- This pulls latest schema from Supabase
- Commit `src/types/database.ts` to Git

## Next Steps

1. **Test Authentication**
   - Use seed data credentials from Phase 2
   - Test login/logout flow
   - Verify protected routes redirect correctly

2. **Build Dashboard Components**
   - Role-specific dashboards per Phase 3 plan
   - Widgets showing pending requests/approvals
   - Quick stats cards

3. **Implement Admin Pages**
   - User management interface
   - Project management interface
   - Department configuration

4. **API Route Completion**
   - User CRUD operations
   - Project CRUD operations
   - Email notification triggers

5. **Styling & Polish**
   - Mobile responsive design
   - Accessibility improvements
   - Loading states and transitions

## Phase 2 Reference

Phase 2 database components are deployed to Supabase:
- 16 tables with complete schema
- 50+ RLS policies for role-based access
- Workflow state machine (15 states)
- Seed data with test users

See `DATABASE_SETUP_GUIDE.md` for deployment details.

## Development Commands

```bash
# Development
npm run dev          # Start dev server on :3000

# Production
npm run build        # Build for production
npm start           # Start production server

# Code Quality
npm run lint        # Run ESLint
npm run type-check  # TypeScript type checking
npm run format      # Format code with Prettier

# Database
npm run db:types    # Regenerate Supabase types
```

## Tech Stack

- **Framework:** Next.js 14 + React 18 + TypeScript
- **Styling:** Tailwind CSS 3
- **Database:** Supabase PostgreSQL
- **Authentication:** Supabase Auth
- **Email:** Resend Pro
- **Hosting:** Vercel (recommended)
- **Forms:** React Hook Form + Zod validation
- **HTTP Client:** Axios

## Contributing

1. Create feature branch: `git checkout -b feature/description`
2. Commit changes: `git commit -am "Add feature"`
3. Push to branch: `git push origin feature/description`
4. Submit pull request to `main`

## Support

For database-specific questions, refer to:
- Supabase docs: https://supabase.com/docs
- PostgreSQL docs: https://www.postgresql.org/docs/

For application questions:
- See `PHASE3_IMPLEMENTATION_PLAN.md` for detailed specifications
- Check `WORKFLOW_STATE_MACHINE.md` for business logic

## License

Internal project for Angels Resource Centres NPO

---

**Last Updated:** 2026-09-09  
**Phase:** 3 (Authentication & Frontend)  
**Status:** Active Development
