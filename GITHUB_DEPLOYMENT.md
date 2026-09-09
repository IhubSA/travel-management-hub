# GitHub & Vercel Deployment Guide

**Quick deployment to see the layout in action**

---

## Step 1: Create GitHub Repository

### Option A: Create on GitHub.com
1. Go to https://github.com/new
2. Repository name: `travel-management-hub`
3. Description: `Travel Management Hub for Angels Resource Centres NPO`
4. Make it **Private** (keep data secure)
5. ✅ Initialize with .gitignore (already have one)
6. Click "Create repository"

### Option B: Command Line (if you have GitHub CLI)
```bash
gh repo create travel-management-hub --private --source=. --remote=origin --push
```

---

## Step 2: Push Code to GitHub

```bash
# Navigate to project directory
cd travel-management-hub

# Initialize git (if not already done)
git init

# Add all files
git add .

# Create initial commit
git commit -m "Initial commit: Phase 3 authentication & frontend

- Authentication system with email/password login
- Protected routes with role-based access
- Session management with auto-refresh
- Supabase integration
- Tailwind CSS styling
- TypeScript for type safety

Co-Authored-By: Claude <noreply@anthropic.com>"

# Add GitHub remote (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/ihubsa/travel-management-hub.git

# Rename branch to main (if needed)
git branch -M main

# Push to GitHub
git push -u origin main
```

---

## Step 3: Set Up Vercel Deployment

### 3.1 Create Vercel Account
- Go to https://vercel.com
- Sign up (can use GitHub account)
- Authorize GitHub integration

### 3.2 Import Project

1. Go to https://vercel.com/dashboard
2. Click "Add New..." → "Project"
3. Select GitHub and authorize if needed
4. Find `travel-management-hub` repository
5. Click "Import"

### 3.3 Configure Environment Variables

On the Vercel import screen, you'll see "Environment Variables" section.

**Add these variables:**

```
NEXT_PUBLIC_SUPABASE_URL = https://[your-project].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY = [your-anon-key]
SUPABASE_SERVICE_ROLE_KEY = [your-service-role-key] ← Mark as SECRET
RESEND_API_KEY = [your-resend-key] ← Mark as SECRET
EMAIL_FROM = noreply@angels-travel.example.com
APP_URL = https://travel-management-hub.vercel.app
NEXT_PUBLIC_APP_NAME = Travel Management Hub
```

**How to get these values:**
- `NEXT_PUBLIC_SUPABASE_URL` and keys → Supabase project Settings → API
- `RESEND_API_KEY` → Resend dashboard (if setting up email)
- `APP_URL` → Will be https://[your-project].vercel.app

### 3.4 Deploy

Click "Deploy" button. Vercel will:
1. Clone your repository
2. Install dependencies
3. Build the Next.js app
4. Deploy to their edge network

**Expected build time:** 1-2 minutes

---

## Step 4: View Your Deployment

Once deployed:
1. Vercel shows a success message with your URL
2. Visit: `https://travel-management-hub.vercel.app`
3. You'll see login page
4. This is the live version of your app!

---

## Testing the Deployment

### Test Login
1. Click "Sign In"
2. Enter test email: `jane.smith@angels-travel.example.com`
3. Enter password: (from Phase 2 seed data)
4. Should redirect to dashboard
5. Should show your name and role

### Test Protected Routes
1. Open new browser tab
2. Try to visit: `/dashboard` directly
3. Should redirect back to `/login`
4. Sign in again
5. Now can access `/dashboard`

### Test Forgot Password
1. On login page, click "Forgot your password?"
2. Enter email
3. Should show: "Check Your Email" message
4. Email should arrive via Resend (check spam folder)

---

## Set Up Custom Domain (Optional)

Once everything is working:

1. In Vercel dashboard, go to your project
2. Settings → Domains
3. Add domain: `travel-hub.angels.org.za`
4. Follow DNS configuration steps
5. Wait 24-48 hours for DNS to propagate

---

## Continuous Deployment

After first deployment:
1. Make code changes locally
2. Commit to git: `git commit -am "message"`
3. Push to GitHub: `git push origin main`
4. Vercel automatically detects the push
5. Vercel rebuilds and redeploys automatically

This means you can update the app without manually deploying!

---

## Important Notes

### Before First Deployment
- ✅ Phase 2 database deployed to Supabase
- ✅ Test users created in Supabase Auth
- ✅ Supabase credentials copied
- ✅ `.env.local` has values (won't be pushed to GitHub)
- ✅ `.gitignore` includes `.env*` (secrets stay private)

### After First Deployment
- ✅ Test login works
- ✅ Check Vercel logs for errors
- ✅ Monitor Supabase connection
- ✅ Check email delivery (if using Resend)

### Environment Variables
- `NEXT_PUBLIC_*` variables → safe to be public (embedded in frontend)
- Other variables → kept secret on Vercel
- Never commit `.env.local` to Git
- Use `.env.example` as template

---

## Troubleshooting Deployment

### Build Fails: "Cannot find module"
```bash
# Make sure dependencies are in package.json
npm list # see all installed packages

# Reinstall if needed
rm -rf node_modules package-lock.json
npm install
```

### "Supabase connection failed"
- Check environment variables are set in Vercel
- Verify Supabase credentials are correct
- Test locally first: `npm run dev`

### Login shows "Invalid email or password"
- Verify test user exists in Supabase Auth
- Check password is correct
- Ensure Phase 2 database deployed
- Create new test user if needed

### Page shows 404 error
- Check URL in browser (might be wrong URL)
- Verify Vercel deployment completed successfully
- Check Vercel logs for build errors

### Styling looks broken
- Clear browser cache (Ctrl+Shift+Delete)
- Hard refresh page (Ctrl+F5)
- Check CSS loaded in Network tab

---

## Access Control

Set up in Vercel for team collaboration:

1. Project Settings → Members
2. Add team members with email
3. Set role: Admin, Editor, or Viewer
4. They can now access deployments

---

## Monitoring

After deployment, monitor:

**Vercel Dashboard:**
- Check "Deployments" tab
- Monitor "Analytics" for performance
- Watch "Error logs" for issues

**Supabase Dashboard:**
- Database performance metrics
- Auth usage statistics
- Storage usage

**Resend Dashboard** (if using):
- Email delivery status
- Bounce rates
- Email analytics

---

## Next After Seeing Layout

Once you can see the login page live:

1. ✅ Verify authentication flow works
2. ✅ Confirm dashboard loads after login
3. ✅ Test role display
4. ✅ Test protected routes
5. 📋 Build Phase 3 features:
   - Dashboards for each role
   - Sidebar navigation
   - Admin pages
   - Travel request forms

---

## Quick Reference

```bash
# Clone locally later (for someone else)
git clone https://github.com/ihubsa/travel-management-hub.git
cd travel-management-hub
npm install
npm run dev

# Update and redeploy
git add .
git commit -m "feature: add new component"
git push origin main
# → Vercel automatically redeploys
```

---

## Support

- **Vercel docs:** https://vercel.com/docs
- **Next.js docs:** https://nextjs.org/docs
- **GitHub docs:** https://docs.github.com

See `README.md` for local development.  
See `DEPLOYMENT_GUIDE.md` for production setup.

---

**Status:** Ready to Deploy  
**Estimated Deploy Time:** 5-10 minutes  
**Time to See Layout:** ~10 minutes total
