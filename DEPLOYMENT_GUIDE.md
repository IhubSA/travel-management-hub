# Deployment Guide

**Status:** Phase 3 (Frontend)  
**Target Platforms:** Supabase (database), Vercel (frontend)  
**Last Updated:** 2026-09-09

---

## Deployment Architecture

```
┌─────────────────────────────────────────────────┐
│         User's Browser / Mobile App             │
└────────────────────┬────────────────────────────┘
                     │ HTTPS
         ┌───────────▼──────────┐
         │   Vercel (Next.js)   │
         │   Edge Network       │
         └───────────┬──────────┘
                     │
         ┌───────────┴──────────────────┐
         │                              │
    ┌────▼──────┐            ┌─────────▼────┐
    │ Supabase  │            │ Resend Email │
    │ Database  │            │   Service    │
    └───────────┘            └──────────────┘
```

---

## Phase 1: Prepare Supabase Database

### Prerequisites
- Supabase account created
- Admin access to project
- PostgreSQL database ready

### Steps

1. **Get Supabase Credentials**
   - Go to project Settings → API
   - Copy: Project URL, Anon Key, Service Role Key
   - Save securely (e.g., password manager)

2. **Deploy Phase 2 Database**
   - Follow `DATABASE_SETUP_GUIDE.md`
   - Run 3 migrations in order:
     1. `001_initial_schema.sql` (tables & functions)
     2. `002_rls_policies.sql` (security layer)
     3. `003_seed_data.sql` (test data)

3. **Verify Deployment**
   ```sql
   -- Run in SQL Editor to confirm
   SELECT COUNT(*) as table_count FROM information_schema.tables 
   WHERE table_schema = 'public';
   -- Should return: 16
   
   SELECT COUNT(*) as policy_count FROM pg_policies 
   WHERE schemaname = 'public';
   -- Should return: 50+
   ```

4. **Enable Auth Provider**
   - Go to Authentication → Providers
   - Enable Email provider
   - Configure email templates if needed

5. **Create Storage Bucket**
   - Go to Storage
   - Create new bucket: `travel-attachments`
   - Make it PRIVATE (uncheck "Public bucket")
   - Add RLS policies (see `DATABASE_SETUP_GUIDE.md`)

### Outcome
✅ Database ready with all tables, security policies, and test data

---

## Phase 2: Prepare Frontend Code

### Prerequisites
- Node.js 18+ installed
- Code cloned to local machine
- Environment variables ready

### Steps

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Generate Database Types**
   ```bash
   npm run db:types
   ```
   This creates `src/types/database.ts` from your Supabase schema.

3. **Test Locally**
   ```bash
   npm run dev
   ```
   - Navigate to http://localhost:3000
   - Should redirect to /login
   - Try login with test credentials from Phase 2

4. **Run Linting & Type Checks**
   ```bash
   npm run lint
   npm run type-check
   ```

### Outcome
✅ Frontend code tested locally and ready for deployment

---

## Phase 3: Deploy to Vercel

### Prerequisites
- GitHub account with repository
- Vercel account
- Repository pushed to GitHub

### Step 1: Push to GitHub

```bash
# Initialize Git (if not already)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit: Phase 3 authentication & frontend

Co-Authored-By: Claude <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session"

# Add remote (replace with your repo)
git remote add origin https://github.com/[YOUR_ORG]/travel-management-hub.git

# Push to main
git branch -M main
git push -u origin main
```

### Step 2: Create Vercel Project

1. Go to https://vercel.com/dashboard
2. Click "Add New..." → "Project"
3. Select GitHub repository: `travel-management-hub`
4. Click "Import"

### Step 3: Configure Environment Variables

In Vercel project settings → Environment Variables:

**Production Variables:**
```
NEXT_PUBLIC_SUPABASE_URL = https://[project].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY = [your-anon-key]
SUPABASE_SERVICE_ROLE_KEY = [your-service-role-key]  (Mark as SECRET)
RESEND_API_KEY = [your-resend-api-key]  (Mark as SECRET)
EMAIL_FROM = noreply@angels-travel.example.com
APP_URL = https://travel-hub.angels.org.za
```

**Preview Variables** (same as production for now):
- Replicate all environment variables above

### Step 4: Configure Domains

1. In Vercel project settings → Domains
2. Add custom domain: `travel-hub.angels.org.za`
3. Follow DNS configuration steps from Vercel
4. Wait for DNS propagation (typically 24-48 hours)

### Step 5: Deploy

Click "Deploy" on Vercel dashboard. Monitor:
- Build log (should complete in 1-2 minutes)
- Deployment status
- Preview URL generation

### Outcome
✅ Frontend deployed to Vercel and accessible at your domain

---

## Phase 4: Test Production Environment

### Login Testing
```bash
# Use test credentials from Phase 2 seed data
Email: jane.smith@angels-travel.example.com
Password: [test-password-you-set-in-Supabase-Auth]
```

### Test Flows

1. **Authentication**
   - ✅ Login with email/password
   - ✅ Forgot password (check Resend dashboard)
   - ✅ Reset password (from email link)
   - ✅ Logout redirects to /login

2. **Protected Routes**
   - ✅ Unauthenticated access to /dashboard redirects to /login
   - ✅ Authenticated access to /dashboard shows content
   - ✅ Session persists on page refresh

3. **User Profiles**
   - ✅ User profile loads with correct name/role
   - ✅ Role-based dashboard displays correctly
   - ✅ Sidebar shows role-appropriate menu items

4. **Error Handling**
   - ✅ Invalid credentials show error message
   - ✅ Network errors handled gracefully
   - ✅ No sensitive data in error messages or console

### Monitoring

Set up in Vercel:
- Error tracking (Sentry integration recommended)
- Performance monitoring
- Analytics

---

## Ongoing: Real Users & Actual Data

### Step 1: Import Production Users

In Supabase, create actual users:
1. Authentication → Users
2. For each team member, click "Invite"
3. Send to their actual email address
4. They confirm email and set password

### Step 2: Populate Real Data

**Departments:** 
- Update department information if different from seed data

**Projects:**
- Create actual projects with real budgets
- Assign real project managers

**Users:**
- Update staff records with actual employment data

### Step 3: Verify RLS Policies

Test that users can only see their own data:
- Staff can't view other staff's requests
- HOD can only view department requests
- Travel Officer only sees processing requests
- Finance only sees finance review requests
- CEO only sees exception requests

---

## Troubleshooting Deployment

### Build Fails: "Missing dependencies"
```bash
# Run locally first
npm install
npm run build
# Fix any errors, then push again
```

### Environment Variable Errors
- Verify all variables set in Vercel
- Check for typos in variable names
- Ensure SECRET variables are marked as SECRET
- Note: `NEXT_PUBLIC_*` variables are public, not SECRET

### Database Connection Errors
- Verify Supabase credentials are correct
- Check firewall rules allow Vercel's IP
- Test connection: `npm run dev` and login locally first

### Auth Token Expiration
- Supabase auto-refreshes tokens
- HTTP-only cookies prevent token theft
- Logout and re-login if issues persist

### Email Not Sending
- Verify Resend API key is correct
- Check Resend dashboard for failed emails
- Verify `EMAIL_FROM` matches Resend domain
- Check spam folder for test emails

---

## Security Checklist Before Go-Live

- [ ] Service role key stored as SECRET in Vercel
- [ ] No secrets committed to Git
- [ ] Vercel branch protection configured
- [ ] HTTPS enabled (automatic with Vercel)
- [ ] Security headers set (configured in next.config.js)
- [ ] RLS policies verified
- [ ] Test data removed from production database
- [ ] Admin user created in production
- [ ] Resend email templates configured
- [ ] Backup procedures documented
- [ ] Monitoring/alerting enabled

---

## Scaling Considerations

### Database
- Current schema supports 500+ concurrent users
- RLS policies enforce role-based access
- 40+ indexes on frequently queried columns
- Connection pooling recommended at scale (Supabase Pro)

### Frontend
- Vercel auto-scales with demand
- CDN caches static assets globally
- No database query performance needed for rendering

### Email
- Resend Pro Plan supports high volume
- Consider queue for bulk operations

### Backups
- Supabase automatic backups (configure in dashboard)
- Export regularly for critical data

---

## Post-Deployment Operations

### Daily
- Monitor Vercel error logs
- Check Resend email delivery
- Review user reports

### Weekly
- Check Supabase performance metrics
- Review security logs
- Backup database manually

### Monthly
- Analyze usage patterns
- Plan for feature additions
- Update dependencies (npm updates)

### Quarterly
- Load test application
- Review and update security policies
- Plan for scaling if needed

---

## Rollback Procedure

### If Critical Issues Occur

1. **Immediate (5 minutes)**
   ```bash
   # On Vercel dashboard
   - Click "Deployments"
   - Find previous stable deployment
   - Click "Redeploy"
   ```

2. **Notify Users** (if outage)
   - Send email via Resend
   - Update status page (if available)

3. **Investigate**
   - Check error logs in Vercel
   - Check database logs in Supabase
   - Check Resend email logs

4. **Fix & Redeploy**
   - Fix issue locally
   - Commit to main branch
   - Vercel auto-redeploys

---

## Handoff Checklist

Before handing off to client:

- [ ] Deployment guide provided
- [ ] Environment variables documented (securely)
- [ ] Backup procedures documented
- [ ] Monitoring dashboard access granted
- [ ] Support contact information provided
- [ ] Training conducted on admin interface
- [ ] Test data and real users set up
- [ ] All team members have access
- [ ] Documentation for common tasks
- [ ] Emergency contacts list created

---

## Support Resources

**Vercel:**
- Docs: https://vercel.com/docs
- Deployments: https://vercel.com/dashboard
- Support: support@vercel.com

**Supabase:**
- Docs: https://supabase.com/docs
- Dashboard: https://app.supabase.com
- Support: https://supabase.com/support

**Resend:**
- Docs: https://resend.com/docs
- Dashboard: https://app.resend.com
- Support: https://resend.com/support

**Application:**
- See README.md for development
- See PHASE3_IMPLEMENTATION_PLAN.md for features
- See WORKFLOW_STATE_MACHINE.md for business logic

---

## Timeline

**Week 1:** Database deployment + testing  
**Week 2:** Frontend deployment + testing  
**Week 3:** User training + data setup  
**Week 4:** Go-live + monitoring  

---

**Total Estimated Time:** 4 weeks from start to production go-live

**Created:** 2026-09-09  
**Next Review:** After Phase 3 completion
