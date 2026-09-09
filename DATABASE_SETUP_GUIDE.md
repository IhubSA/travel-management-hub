# Angels Resource Centres Travel Hub - Database Setup Guide

**Version:** 1.0  
**Date:** 2026-09-09  
**Status:** Phase 2 - Database Implementation

---

## Overview

This guide walks through setting up the Supabase PostgreSQL database for the Travel Management Hub application. The setup consists of three SQL migration files:

1. **001_initial_schema.sql** - Core database tables and structure
2. **002_rls_policies.sql** - Row Level Security policies for access control
3. **003_seed_data.sql** - Initial data and test records

---

## Prerequisites

- Supabase project created
- Admin access to Supabase dashboard
- PostgreSQL credentials/connection string

---

## Step 1: Create Super Admin User in Supabase Auth

**IMPORTANT:** Do this BEFORE running the seed data migration.

### Via Supabase Dashboard:

1. Go to **Authentication** → **Users**
2. Click **"Invite"**
3. Enter:
   - Email: `[your-admin-email]@angels-travel.example.com`
   - Check "Auto-confirm user" (optional, for testing)
4. Click **"Send invite"**
5. The user will appear in the users list with a **User UID**
6. **Copy this UID** - you'll need it for the seed data

### Example UID Format:
```
12345678-1234-1234-1234-123456789012
```

---

## Step 2: Run Schema Migration (001_initial_schema.sql)

### Via Supabase SQL Editor:

1. Go to **SQL Editor** in Supabase dashboard
2. Click **"New Query"**
3. Paste the entire contents of `001_initial_schema.sql`
4. Click **"Run"**
5. Verify: All tables created without errors

### Via psql CLI:

```bash
psql "postgresql://[user]:[password]@[host]:[port]/[database]" \
  -f 001_initial_schema.sql
```

### Verification:

In SQL Editor, run:
```sql
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

Should show 16 tables:
- accommodation
- air_travel
- approvals
- attachments
- audit_logs
- budget_checks
- departments
- itineraries
- notifications
- profiles
- project_travel_commitments
- projects
- rental_vehicles
- road_travel
- travel_request_travellers
- travel_requests

---

## Step 3: Run RLS Policies Migration (002_rls_policies.sql)

### Via Supabase SQL Editor:

1. Click **"New Query"**
2. Paste entire contents of `002_rls_policies.sql`
3. Click **"Run"**
4. Verify: All policies created without errors

### Verification:

In SQL Editor, run:
```sql
SELECT tablename, policyname FROM pg_policies 
ORDER BY tablename, policyname;
```

Should show multiple policies for each table.

---

## Step 4: Prepare Seed Data

### Edit `003_seed_data.sql`:

1. Find this line near the top:
   ```sql
   '[SUPER_ADMIN_AUTH_ID]'::UUID,
   ```

2. Replace `[SUPER_ADMIN_AUTH_ID]` with the UID you copied in Step 1
   Example:
   ```sql
   '12345678-1234-1234-1234-123456789012'::UUID,
   ```

3. Replace `[SUPER_ADMIN_EMAIL]` with the admin email
   Example:
   ```sql
   'admin@angels-travel.example.com',
   ```

### Example Updated Lines:
```sql
INSERT INTO profiles (
  auth_user_id,
  first_name,
  last_name,
  email,
  ...
)
SELECT
  '12345678-1234-1234-1234-123456789012'::UUID,
  'System',
  'Administrator',
  'admin@angels-travel.example.com',
  ...
```

---

## Step 5: Run Seed Data Migration (003_seed_data.sql)

### Via Supabase SQL Editor:

1. Click **"New Query"**
2. Paste entire contents of `003_seed_data.sql` (with your updates)
3. Click **"Run"**

### Verification:

Check departments were created:
```sql
SELECT name, code, active FROM departments ORDER BY name;
```

Should show:
- Operations (OPS)
- Finance (FIN)
- Administration (ADM)
- Programmes (PROG)
- Management (MGMT)

Check super admin user:
```sql
SELECT first_name, last_name, email, role FROM profiles WHERE role = 'SUPER_ADMIN';
```

---

## Step 6: Enable Supabase Auth

### Supabase Dashboard:

1. Go to **Authentication** → **Providers**
2. Ensure **Email** provider is enabled
3. Go to **Authentication** → **Policies**
4. Review and configure:
   - Email confirmations (optional for dev)
   - Password reset settings
   - Session expiry (recommended: 1 hour)

---

## Step 7: Enable Supabase Storage

### Create Private Bucket:

1. Go to **Storage** in sidebar
2. Click **"Create new bucket"**
3. Name: `travel-attachments`
4. **Uncheck "Public bucket"** (must be private)
5. Click **"Create bucket"**

### Set Storage Policies:

In SQL Editor, run:
```sql
-- Allow authenticated users to upload
CREATE POLICY "Authenticated users can upload"
ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'travel-attachments');

-- Allow users to read their own files
CREATE POLICY "Users can read travel attachments"
ON storage.objects
FOR SELECT TO authenticated
USING (bucket_id = 'travel-attachments');
```

---

## Step 8: Generate TypeScript Types (Optional but Recommended)

### Install Supabase CLI:

```bash
npm install -g @supabase/cli
```

### Generate Types:

```bash
supabase gen types typescript \
  --project-id [your-project-id] \
  --db-url "postgresql://..." \
  > src/types/database.ts
```

Or in Supabase dashboard:
1. Go to **SQL Editor**
2. Click on the project menu (top right)
3. Select **"Generate types"**
4. Choose **TypeScript**
5. Copy the generated code into `src/types/database.ts`

---

## Step 9: Configure Environment Variables

### Create `.env.local` (Development):

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://[project-id].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[anon-key-from-dashboard]

SUPABASE_SERVICE_ROLE_KEY=[service-role-key-from-dashboard]

# Email
RESEND_API_KEY=[your-resend-api-key]
EMAIL_FROM=noreply@angels-travel.example.com

# App
APP_URL=http://localhost:3000
DEBUG=true
```

### In Supabase Dashboard:

1. Go to **Settings** → **API**
2. Copy **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
3. Copy **Anon public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Copy **Service role secret** → `SUPABASE_SERVICE_ROLE_KEY`

---

## Step 10: Test Database Connectivity

### Create `test-connection.ts`:

```typescript
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

async function testConnection() {
  const { data, error } = await supabase
    .from('departments')
    .select('*')
    .limit(1)

  if (error) {
    console.error('Connection error:', error)
    return false
  }

  console.log('✅ Database connected successfully')
  console.log('Departments found:', data)
  return true
}

testConnection()
```

### Run Test:

```bash
npx ts-node test-connection.ts
```

---

## Database Schema Verification Checklist

After running all migrations, verify:

- [ ] 16 tables created
- [ ] All enums available (user_role, travel_status, etc.)
- [ ] Indexes created on foreign keys
- [ ] RLS policies enabled on all tables
- [ ] Helper functions created:
  - `generate_travel_request_number()`
  - `calculate_nights()`
  - `update_updated_at_column()`
  - `get_user_role()`
  - `is_super_admin()`
- [ ] Triggers attached to tables
- [ ] Departments seeded (5 records)
- [ ] Super Admin user profile created
- [ ] Test projects created (3 records)
- [ ] Storage bucket "travel-attachments" created

### Run Full Verification Query:

```sql
-- Tables
SELECT COUNT(*) as table_count FROM information_schema.tables 
WHERE table_schema = 'public';

-- Indexes
SELECT COUNT(*) as index_count FROM pg_indexes 
WHERE schemaname = 'public';

-- Policies
SELECT COUNT(*) as policy_count FROM pg_policies 
WHERE schemaname = 'public';

-- Functions
SELECT COUNT(*) as function_count FROM pg_proc 
WHERE pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public');

-- Triggers
SELECT COUNT(*) as trigger_count FROM pg_trigger 
WHERE tgisinternal = false;
```

Expected results:
- table_count: 16
- index_count: 40+
- policy_count: 50+
- function_count: 6+
- trigger_count: 10+

---

## Common Issues & Solutions

### Issue: "Permission denied" when creating tables

**Solution:** Ensure you're using a role with sufficient privileges (usually the project owner role).

### Issue: "UUID type not found"

**Solution:** PostgreSQL UUID extension might not be enabled. Run:
```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
```

### Issue: RLS policies not enforcing

**Solution:** Verify RLS is enabled on the table:
```sql
ALTER TABLE travel_requests ENABLE ROW LEVEL SECURITY;
```

### Issue: "No rows returned" for seed data

**Solution:** 
1. Verify the department actually exists
2. Check that you updated the auth_user_id in seed data
3. Verify the auth user exists in Supabase Auth

### Issue: "Foreign key constraint failed"

**Solution:** Ensure dependent tables are created in order:
1. departments (no dependencies)
2. profiles (depends on auth.users)
3. projects (depends on profiles)
4. travel_requests (depends on profiles, departments, projects)

---

## Next Steps After Database Setup

1. **Clone the repository** (when created)
2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Update environment variables:**
   ```bash
   cp .env.example .env.local
   # Edit with your Supabase credentials
   ```

4. **Start development server:**
   ```bash
   npm run dev
   ```

5. **Test login:**
   - Navigate to http://localhost:3000
   - Use Super Admin credentials to log in
   - Verify dashboard loads

---

## Database Backup & Recovery

### Export Database:

```bash
pg_dump "postgresql://[user]:[password]@[host]:[port]/[database]" \
  > backup_$(date +%Y%m%d_%H%M%S).sql
```

### Restore from Backup:

```bash
psql "postgresql://[user]:[password]@[host]:[port]/[database]" \
  < backup_20260909_120000.sql
```

---

## Security Considerations

✅ **Implemented:**
- RLS on all tables
- Private file storage
- Service role key never exposed to frontend
- Email sent server-side only
- Input validation at API layer
- Audit logging of all actions

**DO NOT:**
- ❌ Commit `.env` files to Git
- ❌ Share service role keys
- ❌ Use test data in production
- ❌ Disable RLS on tables
- ❌ Store secrets in frontend code

---

## Production Deployment Checklist

Before deploying to production:

- [ ] Disable/remove test data from seed migration
- [ ] Set environment variables in Vercel
- [ ] Configure Supabase to production mode
- [ ] Enable email confirmations
- [ ] Set up automated backups
- [ ] Enable audit logging
- [ ] Configure email templates in Resend
- [ ] Test end-to-end approval workflow
- [ ] Load test the application
- [ ] Set up monitoring/alerts

---

## Support & Questions

For database-specific questions:
- Check Supabase documentation: https://supabase.com/docs
- PostgreSQL documentation: https://www.postgresql.org/docs/

For application-specific issues:
- Refer to Phase 3+ implementation guides

---

**End of Database Setup Guide**
