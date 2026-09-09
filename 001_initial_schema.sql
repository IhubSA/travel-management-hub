-- Angels Resource Centres NPO - Travel Management Hub
-- PHASE 2: Initial Database Schema
-- Version: 1.0
-- Created: 2026-09-09

-- ============================================================================
-- ENUMS & CUSTOM TYPES
-- ============================================================================

CREATE TYPE user_role AS ENUM (
  'SUPER_ADMIN',
  'STAFF',
  'HOD',
  'TRAVEL_OFFICER',
  'FINANCE',
  'CEO'
);

CREATE TYPE travel_status AS ENUM (
  'DRAFT',
  'AWAITING_ITINERARY',
  'SUBMITTED',
  'HOD_REVIEW',
  'HOD_APPROVED',
  'TRAVEL_OFFICER_REVIEW',
  'TRAVEL_PROCESSING',
  'FINANCE_REVIEW',
  'BUDGET_EXCEPTION',
  'CEO_APPROVAL',
  'FULLY_APPROVED',
  'BOOKING_COMPLETE',
  'TRAVEL_COMPLETED',
  'CANCELLED',
  'REJECTED'
);

CREATE TYPE travel_type AS ENUM (
  'AIR',
  'ROAD',
  'AIR_AND_ROAD',
  'ACCOMMODATION'
);

CREATE TYPE transport_mode AS ENUM (
  'AIR',
  'ROAD',
  'COMBINATION'
);

CREATE TYPE booking_responsibility AS ENUM (
  'TRAVEL_OFFICER',
  'SELF_BOOK',
  'NOT_REQUIRED'
);

CREATE TYPE booking_status AS ENUM (
  'NOT_REQUIRED',
  'AWAITING_BOOKING',
  'SELF_BOOKING_REQUIRED',
  'BOOKING_IN_PROGRESS',
  'BOOKED',
  'CONFIRMATION_RECEIVED',
  'COMPLETED',
  'CANCELLED'
);

CREATE TYPE approval_type AS ENUM (
  'HOD',
  'TRAVEL_OFFICER',
  'FINANCE',
  'CEO'
);

CREATE TYPE approval_status AS ENUM (
  'PENDING',
  'APPROVED',
  'REJECTED',
  'CHANGES_REQUESTED'
);

CREATE TYPE vehicle_class AS ENUM (
  'B_CLASS',
  'O_CLASS',
  'NONE'
);

CREATE TYPE notification_type AS ENUM (
  'INVITATION',
  'HOD_APPROVAL_REQUIRED',
  'HOD_APPROVED',
  'HOD_REJECTED',
  'CHANGES_REQUESTED',
  'TRAVEL_OFFICER_ACTION_REQUIRED',
  'FINANCE_REVIEW_REQUIRED',
  'CEO_APPROVAL_REQUIRED',
  'FULLY_APPROVED',
  'BOOKING_COMPLETED',
  'PASSWORD_RESET'
);

CREATE TYPE notification_status AS ENUM (
  'QUEUED',
  'SENDING',
  'SENT',
  'FAILED'
);

CREATE TYPE attachment_type AS ENUM (
  'FLIGHT_CONFIRMATION',
  'ACCOMMODATION_BOOKING',
  'VEHICLE_BOOKING',
  'SUPPORTING_DOC',
  'OTHER'
);

-- ============================================================================
-- TABLES
-- ============================================================================

-- Departments
CREATE TABLE departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL UNIQUE,
  code VARCHAR(50) NOT NULL UNIQUE,
  hod_user_id UUID,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_departments_code ON departments(code);
CREATE INDEX idx_departments_hod_user_id ON departments(hod_user_id);
CREATE INDEX idx_departments_active ON departments(active);

-- Application Profiles
CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name VARCHAR(255) NOT NULL,
  last_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  phone VARCHAR(20),
  department_id UUID REFERENCES departments(id),
  job_title VARCHAR(255),
  role user_role NOT NULL DEFAULT 'STAFF',
  active BOOLEAN NOT NULL DEFAULT true,
  employee_ref VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_profiles_auth_user_id ON profiles(auth_user_id);
CREATE INDEX idx_profiles_email ON profiles(email);
CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_profiles_department_id ON profiles(department_id);
CREATE INDEX idx_profiles_active ON profiles(active);

-- Projects
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_code VARCHAR(50) NOT NULL UNIQUE,
  project_name VARCHAR(255) NOT NULL,
  description TEXT,
  project_manager_id UUID REFERENCES profiles(id),
  budget DECIMAL(12,2) NOT NULL,
  travel_budget DECIMAL(12,2) NOT NULL,
  start_date DATE,
  end_date DATE,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_projects_code ON projects(project_code);
CREATE INDEX idx_projects_project_manager_id ON projects(project_manager_id);
CREATE INDEX idx_projects_active ON projects(active);

-- Travel Requests
CREATE TABLE travel_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_number VARCHAR(50) NOT NULL UNIQUE,
  requester_id UUID NOT NULL REFERENCES profiles(id),
  department_id UUID NOT NULL REFERENCES departments(id),
  project_id UUID NOT NULL REFERENCES projects(id),

  business_activity VARCHAR(255),
  business_purpose TEXT,
  travel_justification TEXT NOT NULL,
  number_of_travellers INTEGER,

  travel_type travel_type NOT NULL,
  is_multiple_itinerary BOOLEAN NOT NULL DEFAULT false,
  round_trip BOOLEAN NOT NULL DEFAULT true,

  st_advance_required BOOLEAN NOT NULL DEFAULT false,
  st_advance_amount DECIMAL(12,2),
  st_advance_reason TEXT,

  status travel_status NOT NULL DEFAULT 'DRAFT',

  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  submitted_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_travel_requests_request_number ON travel_requests(request_number);
CREATE INDEX idx_travel_requests_requester_id ON travel_requests(requester_id);
CREATE INDEX idx_travel_requests_department_id ON travel_requests(department_id);
CREATE INDEX idx_travel_requests_project_id ON travel_requests(project_id);
CREATE INDEX idx_travel_requests_status ON travel_requests(status);
CREATE INDEX idx_travel_requests_created_at ON travel_requests(created_at);

-- Travel Request Travellers
CREATE TABLE travel_request_travellers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  travel_request_id UUID NOT NULL REFERENCES travel_requests(id) ON DELETE CASCADE,
  traveller_id UUID NOT NULL REFERENCES profiles(id),
  sequence_order INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX idx_travel_request_travellers_unique
  ON travel_request_travellers(travel_request_id, traveller_id);
CREATE INDEX idx_travel_request_travellers_travel_request_id
  ON travel_request_travellers(travel_request_id);
CREATE INDEX idx_travel_request_travellers_traveller_id
  ON travel_request_travellers(traveller_id);

-- Itineraries
CREATE TABLE itineraries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  travel_request_id UUID NOT NULL REFERENCES travel_requests(id) ON DELETE CASCADE,
  sequence INTEGER NOT NULL,
  travel_date DATE NOT NULL,
  departure_time TIME,

  origin VARCHAR(255) NOT NULL,
  destination VARCHAR(255) NOT NULL,
  transport_mode transport_mode NOT NULL,
  round_trip BOOLEAN NOT NULL DEFAULT false,

  flight_booking_by booking_responsibility NOT NULL DEFAULT 'NOT_REQUIRED',
  accommodation_required BOOLEAN NOT NULL DEFAULT false,
  accommodation_booking_by booking_responsibility NOT NULL DEFAULT 'NOT_REQUIRED',
  vehicle_required BOOLEAN NOT NULL DEFAULT false,
  vehicle_booking_by booking_responsibility NOT NULL DEFAULT 'NOT_REQUIRED',

  notes TEXT,

  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_itineraries_travel_request_id ON itineraries(travel_request_id);
CREATE INDEX idx_itineraries_sequence ON itineraries(travel_request_id, sequence);

-- Air Travel
CREATE TABLE air_travel (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  travel_request_id UUID NOT NULL REFERENCES travel_requests(id) ON DELETE CASCADE,
  itinerary_id UUID REFERENCES itineraries(id),

  departure_airport VARCHAR(10) NOT NULL,
  destination_airport VARCHAR(10) NOT NULL,
  departure_date DATE NOT NULL,
  departure_time TIME,
  preferred_flight_time VARCHAR(50),

  return_airport VARCHAR(10),
  return_date DATE,
  return_time TIME,

  baggage_requirements TEXT,
  special_requirements TEXT,
  notes TEXT,

  booking_by booking_responsibility NOT NULL DEFAULT 'TRAVEL_OFFICER',
  booking_status booking_status NOT NULL DEFAULT 'AWAITING_BOOKING',

  airline_name VARCHAR(255),
  flight_number VARCHAR(20),
  confirmation_reference VARCHAR(100),
  ticket_cost DECIMAL(12,2),
  booking_date DATE,
  confirmation_uploaded BOOLEAN NOT NULL DEFAULT false,

  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_air_travel_travel_request_id ON air_travel(travel_request_id);
CREATE INDEX idx_air_travel_itinerary_id ON air_travel(itinerary_id);
CREATE INDEX idx_air_travel_booking_status ON air_travel(booking_status);

-- Road Travel
CREATE TABLE road_travel (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  travel_request_id UUID NOT NULL REFERENCES travel_requests(id) ON DELETE CASCADE,
  itinerary_id UUID REFERENCES itineraries(id),

  origin VARCHAR(255) NOT NULL,
  destination VARCHAR(255) NOT NULL,
  departure_date DATE NOT NULL,
  departure_time TIME,
  return_date DATE,
  return_time TIME,

  vehicle_required BOOLEAN NOT NULL DEFAULT false,
  vehicle_class vehicle_class,
  own_vehicle BOOLEAN,

  second_driver_required BOOLEAN NOT NULL DEFAULT false,
  second_driver_id UUID REFERENCES profiles(id),

  notes TEXT,

  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_road_travel_travel_request_id ON road_travel(travel_request_id);
CREATE INDEX idx_road_travel_itinerary_id ON road_travel(itinerary_id);
CREATE INDEX idx_road_travel_second_driver_id ON road_travel(second_driver_id);

-- Accommodation
CREATE TABLE accommodation (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  travel_request_id UUID NOT NULL REFERENCES travel_requests(id) ON DELETE CASCADE,
  itinerary_id UUID REFERENCES itineraries(id),

  check_in_date DATE NOT NULL,
  check_out_date DATE NOT NULL,
  nights_count INTEGER,
  location VARCHAR(255) NOT NULL,
  preferred_type VARCHAR(100),
  rooms_required INTEGER NOT NULL DEFAULT 1,
  occupants_count INTEGER,
  special_requirements TEXT,

  booking_by booking_responsibility NOT NULL DEFAULT 'TRAVEL_OFFICER',
  booking_status booking_status NOT NULL DEFAULT 'AWAITING_BOOKING',

  provider_name VARCHAR(255),
  booking_reference VARCHAR(100),
  booking_date DATE,
  estimated_cost DECIMAL(12,2),
  actual_cost DECIMAL(12,2),
  confirmation_uploaded BOOLEAN NOT NULL DEFAULT false,

  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_accommodation_travel_request_id ON accommodation(travel_request_id);
CREATE INDEX idx_accommodation_itinerary_id ON accommodation(itinerary_id);
CREATE INDEX idx_accommodation_booking_status ON accommodation(booking_status);

-- Rental Vehicles
CREATE TABLE rental_vehicles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  travel_request_id UUID NOT NULL REFERENCES travel_requests(id) ON DELETE CASCADE,
  itinerary_id UUID REFERENCES itineraries(id),

  vehicle_class vehicle_class NOT NULL,

  booking_by booking_responsibility NOT NULL DEFAULT 'TRAVEL_OFFICER',
  booking_status booking_status NOT NULL DEFAULT 'AWAITING_BOOKING',

  second_driver_required BOOLEAN NOT NULL DEFAULT false,
  second_driver_id UUID REFERENCES profiles(id),

  collection_location VARCHAR(255),
  collection_date DATE,
  collection_time TIME,
  return_location VARCHAR(255),
  return_date DATE,
  return_time TIME,

  rental_company VARCHAR(255),
  vehicle_type VARCHAR(100),
  booking_reference VARCHAR(100),
  estimated_cost DECIMAL(12,2),
  actual_cost DECIMAL(12,2),
  notes TEXT,

  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_rental_vehicles_travel_request_id ON rental_vehicles(travel_request_id);
CREATE INDEX idx_rental_vehicles_itinerary_id ON rental_vehicles(itinerary_id);
CREATE INDEX idx_rental_vehicles_booking_status ON rental_vehicles(booking_status);

-- Project Travel Commitments
CREATE TABLE project_travel_commitments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id),
  travel_request_id UUID NOT NULL REFERENCES travel_requests(id),

  committed_amount DECIMAL(12,2) NOT NULL,
  actual_amount DECIMAL(12,2),
  status VARCHAR(50) NOT NULL DEFAULT 'ESTIMATED',

  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_project_travel_commitments_project_id
  ON project_travel_commitments(project_id);
CREATE INDEX idx_project_travel_commitments_travel_request_id
  ON project_travel_commitments(travel_request_id);

-- Approvals
CREATE TABLE approvals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  travel_request_id UUID NOT NULL REFERENCES travel_requests(id) ON DELETE CASCADE,
  approver_id UUID NOT NULL REFERENCES profiles(id),
  approval_type approval_type NOT NULL,

  status approval_status NOT NULL DEFAULT 'PENDING',
  comments TEXT,

  approved_at TIMESTAMP WITH TIME ZONE,
  response_at TIMESTAMP WITH TIME ZONE,

  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX idx_approvals_unique
  ON approvals(travel_request_id, approval_type)
  WHERE status = 'PENDING';
CREATE INDEX idx_approvals_travel_request_id ON approvals(travel_request_id);
CREATE INDEX idx_approvals_approver_id ON approvals(approver_id);
CREATE INDEX idx_approvals_approval_type ON approvals(approval_type);
CREATE INDEX idx_approvals_status ON approvals(status);

-- Budget Checks
CREATE TABLE budget_checks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  travel_request_id UUID NOT NULL REFERENCES travel_requests(id),
  project_id UUID NOT NULL REFERENCES projects(id),

  project_travel_budget DECIMAL(12,2) NOT NULL,
  existing_commitments DECIMAL(12,2) NOT NULL,
  current_request_cost DECIMAL(12,2) NOT NULL,

  remaining_before_request DECIMAL(12,2),
  amount_over_budget DECIMAL(12,2),

  is_budget_exception BOOLEAN NOT NULL DEFAULT false,

  checked_by UUID REFERENCES profiles(id),
  checked_at TIMESTAMP WITH TIME ZONE,

  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_budget_checks_travel_request_id ON budget_checks(travel_request_id);
CREATE INDEX idx_budget_checks_project_id ON budget_checks(project_id);
CREATE INDEX idx_budget_checks_is_budget_exception ON budget_checks(is_budget_exception);

-- Attachments
CREATE TABLE attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  travel_request_id UUID NOT NULL REFERENCES travel_requests(id) ON DELETE CASCADE,

  file_name VARCHAR(500) NOT NULL,
  file_size INTEGER NOT NULL,
  mime_type VARCHAR(100),
  storage_path VARCHAR(500) NOT NULL,

  uploaded_by UUID NOT NULL REFERENCES profiles(id),
  uploaded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),

  attachment_type attachment_type DEFAULT 'OTHER',

  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_attachments_travel_request_id ON attachments(travel_request_id);
CREATE INDEX idx_attachments_uploaded_by ON attachments(uploaded_by);

-- Notifications
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  travel_request_id UUID REFERENCES travel_requests(id) ON DELETE CASCADE,
  recipient_id UUID NOT NULL REFERENCES profiles(id),

  email_type notification_type NOT NULL,
  status notification_status NOT NULL DEFAULT 'QUEUED',

  provider_message_id VARCHAR(255),
  error_message TEXT,

  sent_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_notifications_travel_request_id ON notifications(travel_request_id);
CREATE INDEX idx_notifications_recipient_id ON notifications(recipient_id);
CREATE INDEX idx_notifications_email_type ON notifications(email_type);
CREATE INDEX idx_notifications_status ON notifications(status);
CREATE INDEX idx_notifications_sent_at ON notifications(sent_at);

-- Audit Logs
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id),
  travel_request_id UUID REFERENCES travel_requests(id) ON DELETE CASCADE,

  action VARCHAR(255) NOT NULL,
  previous_status travel_status,
  new_status travel_status,

  comments TEXT,
  metadata JSONB,

  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_audit_logs_travel_request_id ON audit_logs(travel_request_id);
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);
CREATE INDEX idx_audit_logs_request_timeline
  ON audit_logs(travel_request_id, created_at);

-- ============================================================================
-- HELPER FUNCTION: Generate Request Number
-- ============================================================================

CREATE OR REPLACE FUNCTION generate_travel_request_number()
RETURNS VARCHAR AS $$
DECLARE
  v_year INTEGER;
  v_sequence INTEGER;
  v_request_number VARCHAR;
BEGIN
  v_year := EXTRACT(YEAR FROM NOW());

  -- Get the next sequence number for this year
  SELECT COUNT(*) + 1 INTO v_sequence
  FROM travel_requests
  WHERE EXTRACT(YEAR FROM created_at) = v_year;

  -- Format as ARC-TR-YYYY-000001
  v_request_number := 'ARC-TR-' || v_year || '-' || LPAD(v_sequence::TEXT, 6, '0');

  RETURN v_request_number;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- HELPER FUNCTION: Calculate Nights
-- ============================================================================

CREATE OR REPLACE FUNCTION calculate_nights()
RETURNS TRIGGER AS $$
BEGIN
  NEW.nights_count := (NEW.check_out_date - NEW.check_in_date);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER accommodation_calculate_nights
BEFORE INSERT OR UPDATE ON accommodation
FOR EACH ROW
EXECUTE FUNCTION calculate_nights();

-- ============================================================================
-- HELPER FUNCTION: Update Timestamps
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables with updated_at
CREATE TRIGGER update_departments_updated_at
BEFORE UPDATE ON departments
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON profiles
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at
BEFORE UPDATE ON projects
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_travel_requests_updated_at
BEFORE UPDATE ON travel_requests
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_itineraries_updated_at
BEFORE UPDATE ON itineraries
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_air_travel_updated_at
BEFORE UPDATE ON air_travel
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_road_travel_updated_at
BEFORE UPDATE ON road_travel
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_accommodation_updated_at
BEFORE UPDATE ON accommodation
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_rental_vehicles_updated_at
BEFORE UPDATE ON rental_vehicles
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_approvals_updated_at
BEFORE UPDATE ON approvals
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- COMMENTS (Documentation)
-- ============================================================================

COMMENT ON TABLE departments IS 'Organization departments with HOD assignments';
COMMENT ON TABLE profiles IS 'Application user profiles linked to Supabase auth';
COMMENT ON TABLE projects IS 'Projects with associated budgets and travel budgets';
COMMENT ON TABLE travel_requests IS 'Core travel request records';
COMMENT ON TABLE itineraries IS 'Multi-leg travel itineraries within a request';
COMMENT ON TABLE air_travel IS 'Flight travel details with booking responsibility';
COMMENT ON TABLE road_travel IS 'Road travel details with second driver options';
COMMENT ON TABLE accommodation IS 'Accommodation requirements and booking details';
COMMENT ON TABLE rental_vehicles IS 'Rental vehicle bookings with responsibility tracking';
COMMENT ON TABLE approvals IS 'Workflow approval records by role';
COMMENT ON TABLE budget_checks IS 'Budget validation results for finance review';
COMMENT ON TABLE audit_logs IS 'Complete audit trail of all actions';

COMMENT ON COLUMN air_travel.booking_by IS 'Who is responsible: TRAVEL_OFFICER or SELF_BOOK';
COMMENT ON COLUMN accommodation.booking_by IS 'Who is responsible: TRAVEL_OFFICER or SELF_BOOK';
COMMENT ON COLUMN rental_vehicles.booking_by IS 'Who is responsible: TRAVEL_OFFICER or SELF_BOOK';

-- ============================================================================
-- END OF SCHEMA
-- ============================================================================
