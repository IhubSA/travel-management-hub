# Deploy to See the Layout - Quick Guide

**Time required:** 10 minutes  
**Result:** Live login page at https://travel-management-hub.vercel.app

---

## What You Need

1. ✅ GitHub account (free at github.com)
2. ✅ Vercel account (free at vercel.com - can use GitHub login)
3. ✅ Supabase project with Phase 2 database deployed
4. ✅ Supabase credentials (from Settings → API)

---

## 5-Step Deployment

### Step 1: Create GitHub Repository (2 min)

Go to https://github.com/new

```
Repository name: travel-management-hub
Description: Travel Management Hub for Angels Resource Centres NPO
Visibility: Private
```

Click "Create repository"

### Step 2: Push Code to GitHub (2 min)

```bash
cd travel-management-hub

git init
git add .
git commit -m "Initial commit: Phase 3 authentication"
git remote add origin https://github.com/ihubsa/travel-management-hub.git
git branch -M main
git push -u origin main
```

**Replace `ihubsa` with your GitHub username**

### Step 3: Import to Vercel (1 min)

1. Go to https://vercel.com/dashboard
2. Click "Add New..." → "Project"
3. Click "Import" next to your GitHub repository
4. Select repository: `travel-management-hub`

### Step 4: Add Environment Variables (2 min)

On the Vercel import screen, add these variables:

```
NEXT_PUBLIC_SUPABASE_URL = https://[your-project].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY = [paste your anon key]
SUPABASE_SERVICE_ROLE_KEY = [paste your service role key] ← Mark as SECRET
RESEND_API_KEY = [optional for now]
EMAIL_FROM = noreply@angels-travel.example.com
APP_URL = https://travel-management-hub.vercel.app
NEXT_PUBLIC_APP_NAME = Travel Management Hub
```

**Get these from:**
- Supabase Dashboard → Settings → API → Copy the values

### Step 5: Deploy (3 min)

Click "Deploy" button

Wait for green checkmark ✅

You'll get a URL like: `https://travel-management-hub.vercel.app`

---

## You're Done! 🎉

Visit your URL and you'll see:

1. **Login Page** - Beautiful, centered login form
2. **Test it:** 
   - Email: `jane.smith@angels-travel.example.com`
   - Password: (from Phase 2 seed data)
   - Click "Sign In"
3. **Dashboard** - Shows your name and role after login

---

## What You'll See

### Login Page
- Email input field
- Password input field with show/hide toggle
- "Sign In" button
- "Forgot password?" link
- Responsive design (works on mobile too)

### Dashboard (after login)
- Greeting with user's name
- Role display (e.g., "STAFF")
- Placeholder cards for upcoming features
- "Sign Out" will be added in the menu

---

## Troubleshooting

**"Build failed"**
- Check build logs in Vercel
- Make sure all files uploaded to GitHub
- Verify no .env files committed (they shouldn't be)

**"Cannot connect to Supabase"**
- Verify Supabase URL and keys in Vercel environment variables
- Check database is deployed to Supabase
- Test locally first: `npm run dev`

**"Invalid email or password"**
- Make sure test user created in Supabase Auth
- Use exact email from Phase 2 seed data
- Check password is correct

**Styling looks broken**
- Clear browser cache
- Hard refresh (Ctrl+Shift+Delete)
- Wait 30 seconds for deployment to fully complete

---

## After Seeing the Layout

Once you can see the login working:

1. ✅ Confirm authentication is working
2. ✅ Test forgot password flow
3. ✅ Test logout redirects to login
4. 📋 Next: Build Phase 3 features
   - Dashboard variants
   - Sidebar navigation
   - Admin pages

---

## Files Already Prepared

All these files are in `/mnt/user-data/outputs/`:

```
✅ All source code (src/ folder)
✅ Configuration files
✅ Environment template (.env.example)
✅ GitHub ignore (.gitignore)
✅ Vercel config (vercel.json)
✅ ESLint & Prettier configs
✅ Complete documentation
```

**Everything is ready to go.**

---

## Share with Team

Once deployed, get the URL and share:
- https://travel-management-hub.vercel.app
- Anyone can see the login page
- Only team members with credentials can access dashboard

---

**You're all set. Create the GitHub repo and let me know when you need the next features!**

See `GITHUB_DEPLOYMENT.md` for detailed steps.
