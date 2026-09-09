-- Angels Resource Centres NPO - Travel Management Hub
-- PHASE 2: Row Level Security (RLS) Policies
-- Version: 1.0
-- Created: 2026-09-09

-- ============================================================================
-- ENABLE RLS ON ALL TABLES
-- ============================================================================

ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE travel_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE travel_request_travellers ENABLE ROW LEVEL SECURITY;
ALTER TABLE itineraries ENABLE ROW LEVEL SECURITY;
ALTER TABLE air_travel ENABLE ROW LEVEL SECURITY;
ALTER TABLE road_travel ENABLE ROW LEVEL SECURITY;
ALTER TABLE accommodation ENABLE ROW LEVEL SECURITY;
ALTER TABLE rental_vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_travel_commitments ENABLE ROW LEVEL SECURITY;
ALTER TABLE approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget_checks ENABLE ROW LEVEL SECURITY;
ALTER TABLE attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- HELPER FUNCTION: Get Current User Role
-- ============================================================================

CREATE OR REPLACE FUNCTION get_user_role()
RETURNS user_role AS $$
  SELECT role FROM profiles WHERE auth_user_id = auth.uid()
$$ LANGUAGE sql STABLE;

CREATE OR REPLACE FUNCTION get_user_profile_id()
RETURNS UUID AS $$
  SELECT id FROM profiles WHERE auth_user_id = auth.uid()
$$ LANGUAGE sql STABLE;

CREATE OR REPLACE FUNCTION is_super_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE auth_user_id = auth.uid()
    AND role = 'SUPER_ADMIN'
    AND active = true
  )
$$ LANGUAGE sql STABLE;

CREATE OR REPLACE FUNCTION get_user_department_id()
RETURNS UUID AS $$
  SELECT department_id FROM profiles WHERE auth_user_id = auth.uid()
$$ LANGUAGE sql STABLE;

CREATE OR REPLACE FUNCTION get_hod_id_for_department(dept_id UUID)
RETURNS UUID AS $$
  SELECT hod_user_id FROM departments WHERE id = dept_id
$$ LANGUAGE sql STABLE;

-- ============================================================================
-- PROFILES TABLE POLICIES
-- ============================================================================

-- Super Admin: Full access
CREATE POLICY "super_admin_all_profiles"
  ON profiles
  FOR ALL
  USING (is_super_admin());

-- Users can view their own profile
CREATE POLICY "users_view_own_profile"
  ON profiles
  FOR SELECT
  USING (auth_user_id = auth.uid());

-- Users can update their own profile (limited fields)
CREATE POLICY "users_update_own_profile"
  ON profiles
  FOR UPDATE
  USING (auth_user_id = auth.uid())
  WITH CHECK (auth_user_id = auth.uid());

-- Staff/HOD can view other active users in their department
CREATE POLICY "view_department_users"
  ON profiles
  FOR SELECT
  USING (
    active = true
    AND (
      is_super_admin()
      OR department_id = get_user_department_id()
      OR get_user_role() IN ('TRAVEL_OFFICER', 'FINANCE')
    )
  );

-- Travel Officer & Finance can view all active users (to select travellers)
CREATE POLICY "travel_officer_view_all_active_users"
  ON profiles
  FOR SELECT
  USING (
    active = true AND (
      get_user_role() IN ('TRAVEL_OFFICER', 'FINANCE', 'SUPER_ADMIN')
    )
  );

-- ============================================================================
-- DEPARTMENTS TABLE POLICIES
-- ============================================================================

-- Super Admin: Full access
CREATE POLICY "super_admin_all_departments"
  ON departments
  FOR ALL
  USING (is_super_admin());

-- All authenticated users can view active departments
CREATE POLICY "view_active_departments"
  ON departments
  FOR SELECT
  USING (active = true);

-- ============================================================================
-- PROJECTS TABLE POLICIES
-- ============================================================================

-- Super Admin: Full access
CREATE POLICY "super_admin_all_projects"
  ON projects
  FOR ALL
  USING (is_super_admin());

-- All authenticated users can view active projects (for selection)
CREATE POLICY "view_active_projects"
  ON projects
  FOR SELECT
  USING (active = true);

-- ============================================================================
-- TRAVEL REQUESTS TABLE POLICIES
-- ============================================================================

-- Super Admin: Full access to all requests
CREATE POLICY "super_admin_all_travel_requests"
  ON travel_requests
  FOR ALL
  USING (is_super_admin());

-- STAFF: View their own travel requests
CREATE POLICY "staff_view_own_requests"
  ON travel_requests
  FOR SELECT
  USING (
    get_user_role() = 'STAFF'
    AND requester_id = get_user_profile_id()
  );

-- STAFF: Can create requests
CREATE POLICY "staff_create_requests"
  ON travel_requests
  FOR INSERT
  WITH CHECK (
    get_user_role() IN ('STAFF', 'SUPER_ADMIN')
    AND requester_id = get_user_profile_id()
  );

-- STAFF: Can update their own DRAFT requests
CREATE POLICY "staff_update_own_draft"
  ON travel_requests
  FOR UPDATE
  USING (
    get_user_role() = 'STAFF'
    AND requester_id = get_user_profile_id()
    AND status IN ('DRAFT', 'AWAITING_ITINERARY')
  )
  WITH CHECK (
    requester_id = get_user_profile_id()
    AND status IN ('DRAFT', 'AWAITING_ITINERARY', 'SUBMITTED')
  );

-- HOD: View requests from their department awaiting approval
CREATE POLICY "hod_view_department_requests"
  ON travel_requests
  FOR SELECT
  USING (
    get_user_role() = 'HOD'
    AND department_id = get_user_department_id()
    AND status IN (
      'HOD_REVIEW', 'HOD_APPROVED', 'REJECTED'
    )
  );

-- HOD: Can also view their approved requests for reference
CREATE POLICY "hod_view_all_dept_submitted"
  ON travel_requests
  FOR SELECT
  USING (
    get_user_role() = 'HOD'
    AND department_id = get_user_department_id()
    AND status IN ('SUBMITTED', 'HOD_REVIEW', 'HOD_APPROVED', 'HOD_REJECTED', 'CHANGES_REQUESTED')
  );

-- TRAVEL OFFICER: View requests requiring their processing
CREATE POLICY "travel_officer_view_processing_requests"
  ON travel_requests
  FOR SELECT
  USING (
    get_user_role() = 'TRAVEL_OFFICER'
    AND status IN (
      'HOD_APPROVED', 'TRAVEL_OFFICER_REVIEW', 'TRAVEL_PROCESSING'
    )
  );

-- TRAVEL OFFICER: Update requests they're processing
CREATE POLICY "travel_officer_update_processing"
  ON travel_requests
  FOR UPDATE
  USING (
    get_user_role() = 'TRAVEL_OFFICER'
    AND status IN ('TRAVEL_OFFICER_REVIEW', 'TRAVEL_PROCESSING')
  )
  WITH CHECK (
    status IN ('TRAVEL_OFFICER_REVIEW', 'TRAVEL_PROCESSING', 'FINANCE_REVIEW')
  );

-- FINANCE: View requests requiring finance review
CREATE POLICY "finance_view_finance_requests"
  ON travel_requests
  FOR SELECT
  USING (
    get_user_role() = 'FINANCE'
    AND status IN (
      'FINANCE_REVIEW', 'BUDGET_EXCEPTION', 'FULLY_APPROVED'
    )
  );

-- FINANCE: Update budget exception status
CREATE POLICY "finance_update_budget_review"
  ON travel_requests
  FOR UPDATE
  USING (
    get_user_role() = 'FINANCE'
    AND status IN ('FINANCE_REVIEW', 'BUDGET_EXCEPTION')
  )
  WITH CHECK (
    status IN ('FINANCE_REVIEW', 'BUDGET_EXCEPTION', 'CEO_APPROVAL', 'FULLY_APPROVED')
  );

-- CEO: View only budget exception requests requiring their approval
CREATE POLICY "ceo_view_budget_exceptions"
  ON travel_requests
  FOR SELECT
  USING (
    get_user_role() = 'CEO'
    AND status = 'CEO_APPROVAL'
  );

-- CEO: Update budget exception approvals
CREATE POLICY "ceo_update_exceptions"
  ON travel_requests
  FOR UPDATE
  USING (
    get_user_role() = 'CEO'
    AND status = 'CEO_APPROVAL'
  )
  WITH CHECK (
    status IN ('CEO_APPROVAL', 'FULLY_APPROVED', 'REJECTED')
  );

-- Requester can view their submitted requests
CREATE POLICY "requester_view_submitted"
  ON travel_requests
  FOR SELECT
  USING (
    requester_id = get_user_profile_id()
    AND status NOT IN ('DRAFT')
  );

-- ============================================================================
-- TRAVEL REQUEST TRAVELLERS TABLE POLICIES
-- ============================================================================

-- Super Admin: Full access
CREATE POLICY "super_admin_all_travellers"
  ON travel_request_travellers
  FOR ALL
  USING (is_super_admin());

-- Requester can manage travellers on their draft/awaiting requests
CREATE POLICY "requester_manage_travellers"
  ON travel_request_travellers
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM travel_requests tr
      WHERE tr.id = travel_request_travellers.travel_request_id
      AND tr.requester_id = get_user_profile_id()
      AND tr.status IN ('DRAFT', 'AWAITING_ITINERARY')
    )
  );

-- View travellers on requests user has access to
CREATE POLICY "view_travellers_on_visible_requests"
  ON travel_request_travellers
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM travel_requests tr
      WHERE tr.id = travel_request_travellers.travel_request_id
      AND (
        tr.requester_id = get_user_profile_id()
        OR (get_user_role() = 'HOD' AND tr.department_id = get_user_department_id())
        OR get_user_role() IN ('TRAVEL_OFFICER', 'FINANCE', 'SUPER_ADMIN')
        OR (get_user_role() = 'CEO' AND tr.status = 'CEO_APPROVAL')
      )
    )
  );

-- ============================================================================
-- ITINERARIES & RELATED TABLES POLICIES
-- ============================================================================

-- Super Admin: Full access to all itineraries
CREATE POLICY "super_admin_all_itineraries"
  ON itineraries
  FOR ALL
  USING (is_super_admin());

-- Requester can manage itineraries on draft requests
CREATE POLICY "requester_manage_itineraries"
  ON itineraries
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM travel_requests tr
      WHERE tr.id = itineraries.travel_request_id
      AND tr.requester_id = get_user_profile_id()
      AND tr.status IN ('DRAFT', 'AWAITING_ITINERARY')
    )
  );

-- View itineraries on visible requests
CREATE POLICY "view_itineraries_on_visible_requests"
  ON itineraries
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM travel_requests tr
      WHERE tr.id = itineraries.travel_request_id
      AND (
        tr.requester_id = get_user_profile_id()
        OR (get_user_role() = 'HOD' AND tr.department_id = get_user_department_id())
        OR get_user_role() IN ('TRAVEL_OFFICER', 'FINANCE', 'SUPER_ADMIN')
        OR (get_user_role() = 'CEO' AND tr.status = 'CEO_APPROVAL')
      )
    )
  );

-- ============================================================================
-- AIR TRAVEL TABLE POLICIES
-- ============================================================================

-- Super Admin: Full access
CREATE POLICY "super_admin_all_air_travel"
  ON air_travel
  FOR ALL
  USING (is_super_admin());

-- Requester can manage on draft requests
CREATE POLICY "requester_manage_air_travel"
  ON air_travel
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM travel_requests tr
      WHERE tr.id = air_travel.travel_request_id
      AND tr.requester_id = get_user_profile_id()
      AND tr.status IN ('DRAFT', 'AWAITING_ITINERARY')
    )
  );

-- Travel Officer can manage bookings
CREATE POLICY "travel_officer_manage_air_travel"
  ON air_travel
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM travel_requests tr
      WHERE tr.id = air_travel.travel_request_id
      AND tr.status IN ('TRAVEL_OFFICER_REVIEW', 'TRAVEL_PROCESSING')
    )
    AND get_user_role() = 'TRAVEL_OFFICER'
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM travel_requests tr
      WHERE tr.id = air_travel.travel_request_id
      AND tr.status IN ('TRAVEL_OFFICER_REVIEW', 'TRAVEL_PROCESSING')
    )
  );

-- View air travel on visible requests
CREATE POLICY "view_air_travel_on_visible_requests"
  ON air_travel
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM travel_requests tr
      WHERE tr.id = air_travel.travel_request_id
      AND (
        tr.requester_id = get_user_profile_id()
        OR (get_user_role() = 'HOD' AND tr.department_id = get_user_department_id())
        OR get_user_role() IN ('TRAVEL_OFFICER', 'FINANCE', 'SUPER_ADMIN')
        OR (get_user_role() = 'CEO' AND tr.status = 'CEO_APPROVAL')
      )
    )
  );

-- ============================================================================
-- ROAD TRAVEL TABLE POLICIES
-- ============================================================================

-- Super Admin: Full access
CREATE POLICY "super_admin_all_road_travel"
  ON road_travel
  FOR ALL
  USING (is_super_admin());

-- Requester can manage on draft requests
CREATE POLICY "requester_manage_road_travel"
  ON road_travel
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM travel_requests tr
      WHERE tr.id = road_travel.travel_request_id
      AND tr.requester_id = get_user_profile_id()
      AND tr.status IN ('DRAFT', 'AWAITING_ITINERARY')
    )
  );

-- Travel Officer can manage bookings
CREATE POLICY "travel_officer_manage_road_travel"
  ON road_travel
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM travel_requests tr
      WHERE tr.id = road_travel.travel_request_id
      AND tr.status IN ('TRAVEL_OFFICER_REVIEW', 'TRAVEL_PROCESSING')
    )
    AND get_user_role() = 'TRAVEL_OFFICER'
  );

-- View on visible requests
CREATE POLICY "view_road_travel_on_visible_requests"
  ON road_travel
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM travel_requests tr
      WHERE tr.id = road_travel.travel_request_id
      AND (
        tr.requester_id = get_user_profile_id()
        OR (get_user_role() = 'HOD' AND tr.department_id = get_user_department_id())
        OR get_user_role() IN ('TRAVEL_OFFICER', 'FINANCE', 'SUPER_ADMIN')
        OR (get_user_role() = 'CEO' AND tr.status = 'CEO_APPROVAL')
      )
    )
  );

-- ============================================================================
-- ACCOMMODATION TABLE POLICIES
-- ============================================================================

-- Super Admin: Full access
CREATE POLICY "super_admin_all_accommodation"
  ON accommodation
  FOR ALL
  USING (is_super_admin());

-- Requester can manage on draft requests
CREATE POLICY "requester_manage_accommodation"
  ON accommodation
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM travel_requests tr
      WHERE tr.id = accommodation.travel_request_id
      AND tr.requester_id = get_user_profile_id()
      AND tr.status IN ('DRAFT', 'AWAITING_ITINERARY')
    )
  );

-- Travel Officer can manage bookings
CREATE POLICY "travel_officer_manage_accommodation"
  ON accommodation
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM travel_requests tr
      WHERE tr.id = accommodation.travel_request_id
      AND tr.status IN ('TRAVEL_OFFICER_REVIEW', 'TRAVEL_PROCESSING')
    )
    AND get_user_role() = 'TRAVEL_OFFICER'
  );

-- View on visible requests
CREATE POLICY "view_accommodation_on_visible_requests"
  ON accommodation
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM travel_requests tr
      WHERE tr.id = accommodation.travel_request_id
      AND (
        tr.requester_id = get_user_profile_id()
        OR (get_user_role() = 'HOD' AND tr.department_id = get_user_department_id())
        OR get_user_role() IN ('TRAVEL_OFFICER', 'FINANCE', 'SUPER_ADMIN')
        OR (get_user_role() = 'CEO' AND tr.status = 'CEO_APPROVAL')
      )
    )
  );

-- ============================================================================
-- RENTAL VEHICLES TABLE POLICIES
-- ============================================================================

-- Super Admin: Full access
CREATE POLICY "super_admin_all_rental_vehicles"
  ON rental_vehicles
  FOR ALL
  USING (is_super_admin());

-- Requester can manage on draft requests
CREATE POLICY "requester_manage_rental_vehicles"
  ON rental_vehicles
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM travel_requests tr
      WHERE tr.id = rental_vehicles.travel_request_id
      AND tr.requester_id = get_user_profile_id()
      AND tr.status IN ('DRAFT', 'AWAITING_ITINERARY')
    )
  );

-- Travel Officer can manage bookings
CREATE POLICY "travel_officer_manage_rental_vehicles"
  ON rental_vehicles
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM travel_requests tr
      WHERE tr.id = rental_vehicles.travel_request_id
      AND tr.status IN ('TRAVEL_OFFICER_REVIEW', 'TRAVEL_PROCESSING')
    )
    AND get_user_role() = 'TRAVEL_OFFICER'
  );

-- View on visible requests
CREATE POLICY "view_rental_vehicles_on_visible_requests"
  ON rental_vehicles
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM travel_requests tr
      WHERE tr.id = rental_vehicles.travel_request_id
      AND (
        tr.requester_id = get_user_profile_id()
        OR (get_user_role() = 'HOD' AND tr.department_id = get_user_department_id())
        OR get_user_role() IN ('TRAVEL_OFFICER', 'FINANCE', 'SUPER_ADMIN')
        OR (get_user_role() = 'CEO' AND tr.status = 'CEO_APPROVAL')
      )
    )
  );

-- ============================================================================
-- APPROVALS TABLE POLICIES
-- ============================================================================

-- Super Admin: Full access
CREATE POLICY "super_admin_all_approvals"
  ON approvals
  FOR ALL
  USING (is_super_admin());

-- HOD can create/update their approval records
CREATE POLICY "hod_manage_approvals"
  ON approvals
  FOR ALL
  USING (
    get_user_role() = 'HOD'
    AND approver_id = get_user_profile_id()
    AND approval_type = 'HOD'
  );

-- Travel Officer can manage their approvals
CREATE POLICY "travel_officer_manage_approvals"
  ON approvals
  FOR ALL
  USING (
    get_user_role() = 'TRAVEL_OFFICER'
    AND approver_id = get_user_profile_id()
    AND approval_type = 'TRAVEL_OFFICER'
  );

-- Finance can manage their approvals
CREATE POLICY "finance_manage_approvals"
  ON approvals
  FOR ALL
  USING (
    get_user_role() = 'FINANCE'
    AND approver_id = get_user_profile_id()
    AND approval_type = 'FINANCE'
  );

-- CEO can manage their approvals
CREATE POLICY "ceo_manage_approvals"
  ON approvals
  FOR ALL
  USING (
    get_user_role() = 'CEO'
    AND approver_id = get_user_profile_id()
    AND approval_type = 'CEO'
  );

-- View approvals on visible requests
CREATE POLICY "view_approvals_on_visible_requests"
  ON approvals
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM travel_requests tr
      WHERE tr.id = approvals.travel_request_id
      AND (
        is_super_admin()
        OR tr.requester_id = get_user_profile_id()
        OR (get_user_role() = 'HOD' AND tr.department_id = get_user_department_id())
        OR get_user_role() IN ('TRAVEL_OFFICER', 'FINANCE')
        OR (get_user_role() = 'CEO' AND tr.status = 'CEO_APPROVAL')
      )
    )
  );

-- ============================================================================
-- BUDGET CHECKS TABLE POLICIES
-- ============================================================================

-- Super Admin: Full access
CREATE POLICY "super_admin_all_budget_checks"
  ON budget_checks
  FOR ALL
  USING (is_super_admin());

-- Finance can view and create budget checks
CREATE POLICY "finance_manage_budget_checks"
  ON budget_checks
  FOR ALL
  USING (get_user_role() = 'FINANCE');

-- View on requests user has access to
CREATE POLICY "view_budget_checks_on_visible_requests"
  ON budget_checks
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM travel_requests tr
      WHERE tr.id = budget_checks.travel_request_id
      AND (
        is_super_admin()
        OR tr.requester_id = get_user_profile_id()
        OR (get_user_role() = 'HOD' AND tr.department_id = get_user_department_id())
        OR get_user_role() IN ('TRAVEL_OFFICER', 'FINANCE')
        OR (get_user_role() = 'CEO' AND tr.status IN ('CEO_APPROVAL', 'BUDGET_EXCEPTION'))
      )
    )
  );

-- ============================================================================
-- ATTACHMENTS TABLE POLICIES
-- ============================================================================

-- Super Admin: Full access
CREATE POLICY "super_admin_all_attachments"
  ON attachments
  FOR ALL
  USING (is_super_admin());

-- Requester can manage attachments on their requests
CREATE POLICY "requester_manage_attachments"
  ON attachments
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM travel_requests tr
      WHERE tr.id = attachments.travel_request_id
      AND (
        tr.requester_id = get_user_profile_id()
        OR get_user_role() IN ('TRAVEL_OFFICER', 'FINANCE')
      )
    )
  );

-- View attachments on visible requests
CREATE POLICY "view_attachments_on_visible_requests"
  ON attachments
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM travel_requests tr
      WHERE tr.id = attachments.travel_request_id
      AND (
        is_super_admin()
        OR tr.requester_id = get_user_profile_id()
        OR (get_user_role() = 'HOD' AND tr.department_id = get_user_department_id())
        OR get_user_role() IN ('TRAVEL_OFFICER', 'FINANCE')
        OR (get_user_role() = 'CEO' AND tr.status = 'CEO_APPROVAL')
      )
    )
  );

-- ============================================================================
-- NOTIFICATIONS TABLE POLICIES
-- ============================================================================

-- Super Admin: Full access
CREATE POLICY "super_admin_all_notifications"
  ON notifications
  FOR ALL
  USING (is_super_admin());

-- Users can view notifications sent to them
CREATE POLICY "user_view_own_notifications"
  ON notifications
  FOR SELECT
  USING (recipient_id = get_user_profile_id());

-- System/server creates notifications (via API)
-- No insert/update policy for users - only API routes can create

-- ============================================================================
-- AUDIT LOGS TABLE POLICIES
-- ============================================================================

-- Super Admin: Full access
CREATE POLICY "super_admin_all_audit_logs"
  ON audit_logs
  FOR ALL
  USING (is_super_admin());

-- View audit logs on own requests or department requests
CREATE POLICY "view_audit_logs_on_visible_requests"
  ON audit_logs
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM travel_requests tr
      WHERE tr.id = audit_logs.travel_request_id
      AND (
        is_super_admin()
        OR tr.requester_id = get_user_profile_id()
        OR (get_user_role() = 'HOD' AND tr.department_id = get_user_department_id())
        OR get_user_role() IN ('TRAVEL_OFFICER', 'FINANCE')
        OR (get_user_role() = 'CEO' AND tr.status = 'CEO_APPROVAL')
      )
    )
  );

-- ============================================================================
-- PROJECT TRAVEL COMMITMENTS TABLE POLICIES
-- ============================================================================

-- Super Admin: Full access
CREATE POLICY "super_admin_all_commitments"
  ON project_travel_commitments
  FOR ALL
  USING (is_super_admin());

-- Finance can view all commitments
CREATE POLICY "finance_view_commitments"
  ON project_travel_commitments
  FOR SELECT
  USING (get_user_role() IN ('FINANCE', 'SUPER_ADMIN'));

-- ============================================================================
-- END OF RLS POLICIES
-- ============================================================================
