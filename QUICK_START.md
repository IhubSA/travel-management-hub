# Quick Start Guide - Phase 3

**Project:** Travel Management Hub  
**Phase:** 3 (Authentication & Frontend)  
**Date:** 2026-09-09  

---

## 🚀 Getting Started in 5 Minutes

### 1. Clone & Install
```bash
# Clone repository (replace with actual URL)
git clone https://github.com/angels/travel-management-hub.git
cd travel-management-hub

# Install dependencies
npm install
```

### 2. Setup Supabase Database
```
⚠️  BEFORE RUNNING THIS PROJECT:

1. Create new Supabase project at supabase.com
2. Deploy Phase 2 database (see DATABASE_SETUP_GUIDE.md)
3. Copy credentials from project Settings → API
4. Create .env.local file (see step 3)
```

### 3. Configure Environment
```bash
# Copy template
cp .env.example .env.local

# Edit with your Supabase credentials
nano .env.local

# Required values:
# NEXT_PUBLIC_SUPABASE_URL=https://[project].supabase.co
# NEXT_PUBLIC_SUPABASE_ANON_KEY=[copy from Supabase]
# SUPABASE_SERVICE_ROLE_KEY=[copy from Supabase]
# EMAIL_FROM=noreply@angels-travel.example.com
# (RESEND_API_KEY only needed for sending emails)
```

### 4. Generate Database Types
```bash
npm run db:types
```

### 5. Start Development Server
```bash
npm run dev
```

Open http://localhost:3000 in your browser. You'll be redirected to `/login`.

---

## 🔐 Test Login

Use test credentials from Phase 2 seed data:

```
Email:    jane.smith@angels-travel.example.com
Password: [whatever you set in Supabase Auth for this user]
```

**Can't log in?**
1. Check that Phase 2 database is deployed
2. Verify Supabase credentials in .env.local
3. Create test users in Supabase Auth → Users → Invite
4. Check browser console for error messages

---

## 📁 Project Structure

```
src/
├── components/auth/         # Login, password reset, protected routes
├── context/                 # AuthContext for global auth state
├── hooks/                   # useAuth(), useRole()
├── lib/                     # Supabase clients
├── pages/                   # Next.js pages (routes)
│   ├── api/auth/           # API routes for authentication
│   ├── login.tsx           # Login page
│   ├── dashboard.tsx       # Main dashboard (protected)
│   └── _app.tsx            # App wrapper
└── styles/                 # Tailwind CSS
```

---

## 🔄 What's Working Now

✅ User login with email/password  
✅ Forgot password flow (email reset link)  
✅ Reset password (from email)  
✅ Protected routes (redirect if not logged in)  
✅ Session management (auto-refresh, persist on refresh)  
✅ Role-based access (role validation on protected routes)  
✅ Basic dashboard (shows user name and role)  

---

## 🚧 What Still Needs to be Built

- [ ] Dashboard components for each role (Staff, HOD, Travel Officer, etc.)
- [ ] Sidebar navigation with role-specific menu items
- [ ] Header with user menu and logout
- [ ] Admin pages (Users, Projects, Departments)
- [ ] Admin forms (Create/Edit users, projects, departments)
- [ ] Travel request pages and forms
- [ ] Approval workflows UI
- [ ] Budget and finance pages
- [ ] Email notification templates
- [ ] Mobile responsive design polish
- [ ] Testing suite

---

## 📚 Important Documents

| Document | Purpose |
|----------|---------|
| **README.md** | Complete documentation & setup guide |
| **PHASE3_IMPLEMENTATION_PLAN.md** | Detailed feature specifications |
| **PHASE3_IMPLEMENTATION_STARTED.md** | What's been built + next steps |
| **DATABASE_SETUP_GUIDE.md** | How to deploy Phase 2 database |
| **WORKFLOW_STATE_MACHINE.md** | Travel request workflow logic |
| **DEPLOYMENT_GUIDE.md** | Production deployment steps |
| **QUICK_START.md** | This file |

---

## 🛠️ Common Commands

```bash
# Development
npm run dev              # Start dev server (localhost:3000)

# Building
npm run build           # Build for production
npm start              # Run production build

# Code Quality
npm run lint           # Check code style
npm run type-check     # TypeScript type checking
npm run format         # Format code with Prettier

# Database
npm run db:types       # Regenerate types from Supabase
```

---

## 🐛 Troubleshooting

### "Cannot GET /dashboard"
→ Make sure dev server is running: `npm run dev`

### "Cannot connect to Supabase"
→ Check .env.local has correct SUPABASE_URL and keys

### "Login shows error: Invalid email or password"
→ Verify user exists in Supabase Auth and password is correct

### "Database types error"
→ Run `npm run db:types` to regenerate types from Supabase

### "Module not found errors"
→ Delete node_modules and reinstall: `rm -rf node_modules && npm install`

### Port 3000 already in use
→ Use different port: `npm run dev -- -p 3001`

---

## 📋 Next Development Steps

### Session 1: Layout Components (2-3 hours)
1. Build Header component
2. Build Sidebar with role navigation
3. Build MainLayout wrapper
4. Update dashboard to use layouts
5. Test navigation between pages

### Session 2: Dashboard Variants (2-3 hours)
1. Create Staff dashboard
2. Create HOD dashboard
3. Create Travel Officer dashboard
4. Create Finance dashboard
5. Create CEO dashboard
6. Create Admin dashboard

### Session 3: Admin Interface (2-3 hours)
1. Build user management page
2. Build project management page
3. Build forms for CRUD operations
4. Add API routes for admin actions
5. Test admin workflows

### Session 4: Polish & Testing (2-3 hours)
1. Mobile responsive design
2. Form validation with Zod
3. Error handling & user feedback
4. Loading states and skeletons
5. Accessibility improvements

---

## 🔐 Security Reminders

**DO:**
- ✅ Keep .env.local private (in .gitignore)
- ✅ Never commit secrets to Git
- ✅ Use HTTP-only cookies for auth
- ✅ Validate input on forms
- ✅ Check user roles before API calls
- ✅ Use service role key only in API routes

**DON'T:**
- ❌ Expose service role key to frontend
- ❌ Store passwords in code
- ❌ Log sensitive information
- ❌ Disable RLS on database tables
- ❌ Skip role validation on protected routes
- ❌ Disable TypeScript strict mode

---

## 🌐 Deployment Checklist

Ready to deploy? Follow these steps in order:

- [ ] Phase 2 database deployed to Supabase
- [ ] Phase 3 code complete and tested locally
- [ ] Repository pushed to GitHub
- [ ] Vercel project created and connected
- [ ] Environment variables set in Vercel
- [ ] Custom domain configured
- [ ] Test login works on production
- [ ] Email notifications tested
- [ ] Mobile design verified
- [ ] Error tracking configured
- [ ] Backups enabled

See **DEPLOYMENT_GUIDE.md** for detailed instructions.

---

## 📞 Getting Help

**Code Issues:**
1. Check error message in browser console
2. Check error in dev server terminal
3. Read relevant README section
4. Review PHASE3_IMPLEMENTATION_STARTED.md

**Database Issues:**
1. Check DATABASE_SETUP_GUIDE.md
2. Verify tables exist: `SELECT * FROM information_schema.tables`
3. Test RLS policies: `SELECT * FROM pg_policies`

**Feature Questions:**
1. Check PHASE3_IMPLEMENTATION_PLAN.md for specs
2. Review component JSDoc comments
3. Check WORKFLOW_STATE_MACHINE.md for business logic

---

## 🎯 Development Tips

1. **Use TypeScript** - Components are fully typed, let IDE help catch errors
2. **Check useAuth()** - Access current user and profile everywhere
3. **Use useRole()** - Check user role for conditional rendering
4. **Test Protected Routes** - Verify role validation works
5. **Mobile First** - Test on multiple screen sizes
6. **Console Errors** - Check browser console for React warnings
7. **Network Tab** - Use DevTools to inspect API calls
8. **Try Reload** - Sometimes just reload the page

---

## 📊 Architecture Overview

```
User Browser
    ↓
Next.js App (React)
    ↓
Supabase Auth (JWT in HTTP-only cookie)
    ↓
Supabase PostgreSQL (RLS policies enforce access)
    ↓
Database
    
+ Resend (Email notifications)
```

**Key:** All data access is protected by Row Level Security (RLS) at database layer.

---

## 🔔 Important Notes

1. **Test Users** come from Phase 2 seed data
   - Create additional test users in Supabase Auth as needed

2. **Email Sending** requires Resend API key
   - Currently phase 3 doesn't send emails yet (frontend only)
   - Email triggered workflow happens in Phase 4

3. **Database Types** auto-generated from Supabase
   - Run `npm run db:types` after any schema changes
   - TypeScript will catch wrong field/table names

4. **Protected Routes** use ProtectedRoute component
   - Automatically redirect unauthenticated users to /login
   - Optional role checking with `requiredRole` prop

5. **Session Auto-Refresh** happens automatically
   - No need to manually refresh tokens
   - HTTP-only cookies prevent token theft

---

## ✨ What You've Got

- **Complete authentication system** (login, logout, session)
- **Role-based access control** (6 roles with specific permissions)
- **Protected routes** (automatic redirect if not authenticated)
- **Database integration** (Supabase with RLS)
- **Type safety** (Full TypeScript)
- **Styling framework** (Tailwind CSS ready)
- **Error handling** (User-friendly messages)
- **Responsive design foundation** (Mobile-ready CSS)
- **Development tooling** (Prettier, ESLint, type checking)
- **Deployment ready** (Configured for Vercel)

---

**You're ready to start building! Run `npm run dev` and begin from there.**

Questions? Check the detailed guides above.

---

**Created:** 2026-09-09  
**Updated:** Same  
**Status:** Ready to Use
