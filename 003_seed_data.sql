-- Angels Resource Centres NPO - Travel Management Hub
-- PHASE 2: Seed Data & Initial Setup
-- Version: 1.0
-- Created: 2026-09-09

-- ============================================================================
-- IMPORTANT: MANUAL STEPS REQUIRED
-- ============================================================================
--
-- 1. Create the Super Admin user via Supabase Auth Dashboard:
--    - Email: [SUPER_ADMIN_EMAIL]
--    - Password: [STRONG_PASSWORD]
--    - Note the auth_user_id from Supabase
--
-- 2. Replace [SUPER_ADMIN_AUTH_ID] in this script with the actual user ID
--
-- 3. Update department information as needed
--
-- 4. Create test/initial users in Supabase Auth, then add their auth_user_ids
--
-- ============================================================================

-- ============================================================================
-- DEPARTMENTS
-- ============================================================================

-- Insert core departments
INSERT INTO departments (name, code, hod_user_id, active) VALUES
('Operations', 'OPS', NULL, true),
('Finance', 'FIN', NULL, true),
('Administration', 'ADM', NULL, true),
('Programmes', 'PROG', NULL, true),
('Management', 'MGMT', NULL, true)
ON CONFLICT (code) DO NOTHING;

-- Get department IDs for reference in subsequent inserts
-- You may need to run these separately after verifying department creation

-- ============================================================================
-- INITIAL SUPER ADMIN USER PROFILE
-- ============================================================================
--
-- After creating the auth user in Supabase, link it here:
-- Replace [SUPER_ADMIN_AUTH_ID] with the actual UUID from auth.users

INSERT INTO profiles (
  auth_user_id,
  first_name,
  last_name,
  email,
  phone,
  department_id,
  job_title,
  role,
  active,
  employee_ref
)
SELECT
  '[SUPER_ADMIN_AUTH_ID]'::UUID,
  'System',
  'Administrator',
  '[SUPER_ADMIN_EMAIL]',
  NULL,
  NULL,
  'System Administrator',
  'SUPER_ADMIN'::user_role,
  true,
  'SYS-001'
WHERE NOT EXISTS (
  SELECT 1 FROM profiles WHERE role = 'SUPER_ADMIN'
);

-- ============================================================================
-- TEST DATA - OPTIONAL (Comment out if not needed)
-- ============================================================================
--
-- Only use this for development/testing
-- Remove before production deployment

-- Test Staff User
INSERT INTO profiles (
  auth_user_id,
  first_name,
  last_name,
  email,
  phone,
  department_id,
  job_title,
  role,
  active,
  employee_ref
)
SELECT
  '11111111-1111-1111-1111-111111111111'::UUID,
  'Jane',
  'Smith',
  'jane.smith@angels-travel.example.com',
  '+27 21 555 0001',
  d.id,
  'Programme Officer',
  'STAFF'::user_role,
  true,
  'EMP-001'
FROM departments d WHERE d.code = 'PROG'
WHERE NOT EXISTS (
  SELECT 1 FROM profiles WHERE email = 'jane.smith@angels-travel.example.com'
)
ON CONFLICT (email) DO NOTHING;

-- Test HOD User
INSERT INTO profiles (
  auth_user_id,
  first_name,
  last_name,
  email,
  phone,
  department_id,
  job_title,
  role,
  active,
  employee_ref
)
SELECT
  '22222222-2222-2222-2222-222222222222'::UUID,
  'John',
  'Robertson',
  'john.robertson@angels-travel.example.com',
  '+27 21 555 0002',
  d.id,
  'Head of Operations',
  'HOD'::user_role,
  true,
  'HOD-001'
FROM departments d WHERE d.code = 'OPS'
WHERE NOT EXISTS (
  SELECT 1 FROM profiles WHERE email = 'john.robertson@angels-travel.example.com'
)
ON CONFLICT (email) DO NOTHING;

-- Test Travel Officer User
INSERT INTO profiles (
  auth_user_id,
  first_name,
  last_name,
  email,
  phone,
  department_id,
  job_title,
  role,
  active,
  employee_ref
)
SELECT
  '33333333-3333-3333-3333-333333333333'::UUID,
  'Maria',
  'Garcia',
  'maria.garcia@angels-travel.example.com',
  '+27 21 555 0003',
  d.id,
  'Travel Coordinator',
  'TRAVEL_OFFICER'::user_role,
  true,
  'TRAVEL-001'
FROM departments d WHERE d.code = 'ADM'
WHERE NOT EXISTS (
  SELECT 1 FROM profiles WHERE email = 'maria.garcia@angels-travel.example.com'
)
ON CONFLICT (email) DO NOTHING;

-- Test Finance Manager User
INSERT INTO profiles (
  auth_user_id,
  first_name,
  last_name,
  email,
  phone,
  department_id,
  job_title,
  role,
  active,
  employee_ref
)
SELECT
  '44444444-4444-4444-4444-444444444444'::UUID,
  'David',
  'Nkosi',
  'david.nkosi@angels-travel.example.com',
  '+27 21 555 0004',
  d.id,
  'Finance Manager',
  'FINANCE'::user_role,
  true,
  'FIN-001'
FROM departments d WHERE d.code = 'FIN'
WHERE NOT EXISTS (
  SELECT 1 FROM profiles WHERE email = 'david.nkosi@angels-travel.example.com'
)
ON CONFLICT (email) DO NOTHING;

-- Test CEO User
INSERT INTO profiles (
  auth_user_id,
  first_name,
  last_name,
  email,
  phone,
  department_id,
  job_title,
  role,
  active,
  employee_ref
)
SELECT
  '55555555-5555-5555-5555-555555555555'::UUID,
  'Nelson',
  'Mandela',
  'nelson.mandela@angels-travel.example.com',
  '+27 21 555 0005',
  d.id,
  'Executive Director',
  'CEO'::user_role,
  true,
  'CEO-001'
FROM departments d WHERE d.code = 'MGMT'
WHERE NOT EXISTS (
  SELECT 1 FROM profiles WHERE email = 'nelson.mandela@angels-travel.example.com'
)
ON CONFLICT (email) DO NOTHING;

-- ============================================================================
-- PROJECTS WITH BUDGETS
-- ============================================================================

-- Insert test projects
INSERT INTO projects (
  project_code,
  project_name,
  description,
  project_manager_id,
  budget,
  travel_budget,
  start_date,
  end_date,
  active
)
SELECT
  'PROJ-001',
  'Rural Capacity Building Initiative',
  'Building local capacity in rural areas',
  p.id,
  2500000.00,
  150000.00,
  '2026-01-01'::DATE,
  '2026-12-31'::DATE,
  true
FROM profiles p
WHERE p.employee_ref = 'HOD-001'
AND NOT EXISTS (
  SELECT 1 FROM projects WHERE project_code = 'PROJ-001'
)
ON CONFLICT (project_code) DO NOTHING;

INSERT INTO projects (
  project_code,
  project_name,
  description,
  project_manager_id,
  budget,
  travel_budget,
  start_date,
  end_date,
  active
)
SELECT
  'PROJ-002',
  'Community Development Programme',
  'Community engagement and development',
  p.id,
  1800000.00,
  100000.00,
  '2026-01-01'::DATE,
  '2026-12-31'::DATE,
  true
FROM profiles p
WHERE p.employee_ref = 'HOD-001'
AND NOT EXISTS (
  SELECT 1 FROM projects WHERE project_code = 'PROJ-002'
)
ON CONFLICT (project_code) DO NOTHING;

INSERT INTO projects (
  project_code,
  project_name,
  description,
  project_manager_id,
  budget,
  travel_budget,
  start_date,
  end_date,
  active
)
SELECT
  'PROJ-003',
  'Monitoring & Evaluation',
  'M&E activities across all programmes',
  p.id,
  800000.00,
  80000.00,
  '2026-01-01'::DATE,
  '2026-12-31'::DATE,
  true
FROM profiles p
WHERE p.employee_ref = 'HOD-001'
AND NOT EXISTS (
  SELECT 1 FROM projects WHERE project_code = 'PROJ-003'
)
ON CONFLICT (project_code) DO NOTHING;

-- ============================================================================
-- UPDATE DEPARTMENT HOD ASSIGNMENTS
-- ============================================================================

-- Assign HOD to Operations
UPDATE departments
SET hod_user_id = (
  SELECT id FROM profiles WHERE employee_ref = 'HOD-001'
)
WHERE code = 'OPS' AND hod_user_id IS NULL;

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE departments IS 'Updated with test departments';
COMMENT ON TABLE profiles IS 'Seeded with initial admin and test users';
COMMENT ON TABLE projects IS 'Created with sample projects and budgets';

-- ============================================================================
-- END OF SEED DATA
-- ============================================================================
