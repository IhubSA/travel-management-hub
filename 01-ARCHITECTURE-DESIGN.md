# Angels Resource Centres NPO - Travel Management Hub
## PHASE 1: ARCHITECTURE DESIGN

**Document Version:** 1.0  
**Date:** 2026-09-09  
**Status:** Architecture Review Required

---

## 1. PROJECT OVERVIEW

**Application Name:** Travel Management Hub  
**Client:** Angels Resource Centres NPO (Rural Development Implementation Centre)  
**Type:** Internal/Private Business Application  
**Purpose:** Manage staff travel requests, approvals, bookings, and budget tracking  

**Technology Stack:**
- **Frontend:** React 18 + TypeScript + Tailwind CSS
- **Backend:** Vercel Serverless Functions (API Routes)
- **Database:** Supabase PostgreSQL
- **Authentication:** Supabase Auth
- **Email:** Resend (Pro Plan)
- **Storage:** Supabase Storage (private)
- **Hosting:** Vercel
- **Version Control:** GitHub

---

## 2. APPLICATION ARCHITECTURE

### 2.1 High-Level Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                        FRONTEND (React)                      │
│  ┌────────────┬──────────────┬─────────────┬──────────────┐ │
│  │   Login    │  Dashboard   │ Travel Req  │    Admin     │ │
│  │   Pages    │   (Role-     │   Wizard    │   Section    │ │
│  │            │   based)     │   & Forms   │              │ │
│  └────────────┴──────────────┴─────────────┴──────────────┘ │
└──────────────────────────┬──────────────────────────────────┘
                           │
                    ┌──────▼──────┐
                    │ Supabase    │
                    │ Auth Client │
                    └──────┬──────┘
                           │
    ┌──────────────────────┼──────────────────────┐
    │                      │                      │
┌───▼──────────┐    ┌──────▼──────┐     ┌────────▼─────┐
│  API Routes  │◄──►│   Supabase   │◄───►│  Supabase    │
│ (Serverless) │    │  PostgreSQL  │     │  Storage     │
└───┬──────────┘    └──────┬──────┘     └────────┬─────┘
    │                      │                      │
    │     ┌────────────────┴──────────────────┐   │
    │     │                                   │   │
    └────►│  Row Level Security (RLS)         │   │
          │  - Enforced at DB layer           │   │
          │  - Per-role access control        │   │
          │  - Real-time policies             │   │
          └───────────────────────────────────┘   │
                                                   │
                            ┌──────────────────────┘
                            │
                      ┌─────▼──────┐
                      │   Resend    │
                      │   Email API │
                      └─────────────┘
```

### 2.2 Request Flow Architecture

```
TRAVEL REQUEST LIFECYCLE:

User Creates Request
    ↓
[DRAFT] ─────────────────────────────────────────┐
    ↓                                             │
Save Draft ◄──────────────────────────────────────┘
    ↓
Complete Itinerary (if multiple)
    ↓
[AWAITING ITINERARY]
    ↓
Submit for Approval
    ↓
[HOD REVIEW] ◄─────────────────────────────────────┐
    ├─→ Approved                                   │
    │   ↓                                          │
    ├─→ [HOD APPROVED]                            │
    │   ↓                                          │
    │   Email → Travel Officer                    │
    │   ↓                                          │
    │   [TRAVEL OFFICER REVIEW]                   │
    │   ├─→ Review & Determine Booking Resp.      │
    │   ├─→ Process Travel Officer Bookings       │
    │   ├─→ Request Self-Booking Info             │
    │   ├─→ Gather Confirmation Documents         │
    │   ↓                                          │
    │   [READY FOR FINANCE]                       │
    │   ↓                                          │
    │   Email → Finance Manager                   │
    │   ↓                                          │
    │   [FINANCE REVIEW]                          │
    │   ├─→ Calculate Budget vs Project           │
    │   ├─→ Check for Exceptions                  │
    │   │                                         │
    │   ├─→ WITHIN BUDGET                         │
    │   │   ↓                                      │
    │   │   [FINANCE APPROVED]                    │
    │   │   ↓                                      │
    │   │   [FULLY APPROVED]                      │
    │   │   ↓                                      │
    │   │   Email → Requester                     │
    │   │                                         │
    │   └─→ BUDGET EXCEPTION                      │
    │       ↓                                      │
    │       [CEO APPROVAL REQUIRED]               │
    │       ↓                                      │
    │       Email → CEO                           │
    │       ├─→ Approve → [FULLY APPROVED]        │
    │       ├─→ Reject → [REJECTED]               │
    │       └─→ Request Changes → Back to Phase   │
    │                                             │
    ├─→ Rejected                                  │
    │   ↓                                          │
    │   [REJECTED]                                │
    │   ↓                                          │
    │   Email → Requester (with reason)           │
    │                                             │
    └─→ Changes Requested                         │
        ↓                                          │
        [CHANGES REQUESTED]                       │
        ↓                                          │
        Email → Requester (with comments)         │
        ↓                                          │
        Requester edits & resubmits ──────────────┘
```

---

## 3. USER ROLES & PERMISSIONS MATRIX

### 3.1 Role Definitions

| Role | Purpose | Key Responsibilities |
|------|---------|----------------------|
| **SUPER ADMIN** | System administration | User management, project setup, budgets, audit logs, system configuration |
| **STAFF/REQUESTER** | Travel request creation | Create travel requests, view own requests, select travellers, provide justification |
| **HOD** | Department approval | Review requests from department, approve/reject/request changes |
| **TRAVEL OFFICER** | Booking coordination | Arrange flights, accommodation, vehicles; capture booking details; review travel requests |
| **FINANCE MANAGER** | Cost approval | Review costs, check budgets, approve payments, escalate exceptions |
| **CEO** | Budget exception approval | Review & approve/reject requests exceeding project budget |

### 3.2 Permission Matrix

| Resource | Super Admin | Staff | HOD | Travel Officer | Finance | CEO |
|----------|:-----------:|:-----:|:---:|:--------------:|:-------:|:---:|
| View all users | ✓ | | | | | |
| Invite/manage users | ✓ | | | | | |
| Create/manage projects | ✓ | | | | | |
| Create travel request | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| View own requests | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| View dept requests | ✓ | | ✓ | | | |
| View all requests | ✓ | | | | | |
| Approve (HOD) | ✓ | | ✓ | | | |
| Process bookings | ✓ | | | ✓ | | |
| Review costs | ✓ | | | | ✓ | |
| Approve budget exception | ✓ | | | | | ✓ |
| View audit logs | ✓ | | | | | |
| View email logs | ✓ | | | | | |

---

## 4. DATABASE SCHEMA DESIGN

### 4.1 Core Tables Structure

#### **Users & Profiles**

```sql
-- Authentication via Supabase Auth (auth.users)

-- Application profiles
profiles {
  id UUID PK
  auth_user_id UUID FK → auth.users
  first_name VARCHAR
  last_name VARCHAR
  email VARCHAR (indexed, unique)
  phone VARCHAR
  department_id UUID FK → departments
  job_title VARCHAR
  role role_enum (SUPER_ADMIN, STAFF, HOD, TRAVEL_OFFICER, FINANCE, CEO)
  active BOOLEAN (default: true)
  employee_ref VARCHAR
  created_at TIMESTAMP
  updated_at TIMESTAMP
  
  Indexes:
  - auth_user_id (unique)
  - email
  - role
  - department_id
  - active
}

-- Department hierarchy
departments {
  id UUID PK
  name VARCHAR (unique)
  code VARCHAR (unique)
  hod_user_id UUID FK → profiles (nullable)
  active BOOLEAN (default: true)
  created_at TIMESTAMP
  updated_at TIMESTAMP
}
```

#### **Projects & Budgets**

```sql
projects {
  id UUID PK
  project_code VARCHAR (unique, indexed)
  project_name VARCHAR
  description TEXT
  project_manager_id UUID FK → profiles
  budget DECIMAL(12,2)
  travel_budget DECIMAL(12,2)
  start_date DATE
  end_date DATE
  active BOOLEAN (default: true)
  created_at TIMESTAMP
  updated_at TIMESTAMP
}

-- Track budget commitments
project_travel_commitments {
  id UUID PK
  project_id UUID FK → projects
  travel_request_id UUID FK → travel_requests
  committed_amount DECIMAL(12,2)
  actual_amount DECIMAL(12,2) (nullable)
  status VARCHAR (enum: ESTIMATED, BOOKED, COMPLETED, CANCELLED)
  created_at TIMESTAMP
  updated_at TIMESTAMP
  
  Index:
  - project_id
  - travel_request_id
}
```

#### **Travel Requests (Core)**

```sql
travel_requests {
  id UUID PK
  request_number VARCHAR (unique, indexed) -- ARC-TR-YYYY-000001
  requester_id UUID FK → profiles (indexed)
  department_id UUID FK → departments
  project_id UUID FK → projects
  
  -- Request metadata
  business_activity VARCHAR
  business_purpose TEXT
  travel_justification TEXT (NOT NULL, mandatory)
  number_of_travellers INTEGER
  
  -- Travel type
  travel_type VARCHAR (enum: AIR, ROAD, AIR_AND_ROAD, ACCOMMODATION)
  is_multiple_itinerary BOOLEAN (default: false)
  round_trip BOOLEAN (default: true)
  
  -- S&T Advance
  st_advance_required BOOLEAN
  st_advance_amount DECIMAL(12,2) (nullable)
  st_advance_reason TEXT (nullable)
  
  -- Status
  status VARCHAR (enum: DRAFT, AWAITING_ITINERARY, SUBMITTED, HOD_REVIEW, 
                          HOD_APPROVED, TRAVEL_OFFICER_REVIEW, TRAVEL_PROCESSING,
                          FINANCE_REVIEW, BUDGET_EXCEPTION, CEO_APPROVAL,
                          FULLY_APPROVED, BOOKING_COMPLETE, TRAVEL_COMPLETED,
                          CANCELLED, REJECTED)
  
  created_at TIMESTAMP
  updated_at TIMESTAMP
  submitted_at TIMESTAMP (nullable)
}
```

#### **Travel Request Travellers**

```sql
travel_request_travellers {
  id UUID PK
  travel_request_id UUID FK → travel_requests
  traveller_id UUID FK → profiles
  sequence_order INTEGER
  
  Unique Constraint:
  - travel_request_id + traveller_id
  
  Index:
  - travel_request_id
}
```

#### **Itineraries**

```sql
itineraries {
  id UUID PK
  travel_request_id UUID FK → travel_requests
  sequence INTEGER
  travel_date DATE
  departure_time TIME (nullable)
  
  -- Route
  origin VARCHAR
  destination VARCHAR
  transport_mode VARCHAR (enum: AIR, ROAD, COMBINATION)
  round_trip BOOLEAN
  
  -- Booking responsibility
  flight_booking_by VARCHAR (enum: TRAVEL_OFFICER, SELF_BOOK, NOT_REQUIRED)
  accommodation_required BOOLEAN
  accommodation_booking_by VARCHAR (enum: TRAVEL_OFFICER, SELF_BOOK, NOT_REQUIRED)
  vehicle_required BOOLEAN
  vehicle_booking_by VARCHAR (enum: TRAVEL_OFFICER, SELF_BOOK, NOT_REQUIRED)
  
  -- Notes
  notes TEXT
  
  created_at TIMESTAMP
  updated_at TIMESTAMP
  
  Index:
  - travel_request_id
  - sequence
}
```

#### **Flight/Air Travel Requests**

```sql
air_travel {
  id UUID PK
  travel_request_id UUID FK → travel_requests
  itinerary_id UUID FK → itineraries (nullable - for multi-leg flights)
  
  -- Request
  departure_airport VARCHAR
  destination_airport VARCHAR
  departure_date DATE
  departure_time TIME (nullable)
  preferred_flight_time VARCHAR (e.g., "morning", "afternoon")
  return_airport VARCHAR (nullable)
  return_date DATE (nullable)
  return_time TIME (nullable)
  baggage_requirements TEXT
  special_requirements TEXT
  notes TEXT
  
  -- Booking responsibility
  booking_by VARCHAR (enum: TRAVEL_OFFICER, SELF_BOOK) -- from itinerary
  booking_status VARCHAR (enum: AWAITING_BOOKING, BOOKING_IN_PROGRESS, BOOKED, 
                                  CONFIRMATION_RECEIVED, COMPLETED)
  
  -- Booking details (captured later)
  airline_name VARCHAR (nullable)
  flight_number VARCHAR (nullable)
  confirmation_reference VARCHAR (nullable)
  ticket_cost DECIMAL(12,2) (nullable)
  booking_date DATE (nullable)
  confirmation_uploaded BOOLEAN (default: false)
  
  created_at TIMESTAMP
  updated_at TIMESTAMP
  
  Index:
  - travel_request_id
  - itinerary_id
}
```

#### **Road Travel Requests**

```sql
road_travel {
  id UUID PK
  travel_request_id UUID FK → travel_requests
  itinerary_id UUID FK → itineraries (nullable)
  
  origin VARCHAR
  destination VARCHAR
  departure_date DATE
  departure_time TIME (nullable)
  return_date DATE (nullable)
  return_time TIME (nullable)
  
  vehicle_required BOOLEAN
  vehicle_class VARCHAR (enum: B_CLASS, O_CLASS, NONE) (nullable)
  own_vehicle BOOLEAN (nullable)
  
  -- Second driver
  second_driver_required BOOLEAN (default: false)
  second_driver_id UUID FK → profiles (nullable)
  
  notes TEXT
  
  created_at TIMESTAMP
}
```

#### **Accommodation Requests**

```sql
accommodation {
  id UUID PK
  travel_request_id UUID FK → travel_requests
  itinerary_id UUID FK → itineraries (nullable)
  
  -- Request
  check_in_date DATE
  check_out_date DATE
  nights_count INTEGER (calculated)
  location VARCHAR
  preferred_type VARCHAR (e.g., "hotel", "guest house")
  rooms_required INTEGER
  occupants_count INTEGER
  special_requirements TEXT
  
  -- Booking responsibility
  booking_by VARCHAR (enum: TRAVEL_OFFICER, SELF_BOOK)
  booking_status VARCHAR (enum: AWAITING_BOOKING, BOOKING_IN_PROGRESS, BOOKED,
                                  CONFIRMATION_RECEIVED, COMPLETED)
  
  -- Booking details
  provider_name VARCHAR (nullable)
  booking_reference VARCHAR (nullable)
  booking_date DATE (nullable)
  estimated_cost DECIMAL(12,2) (nullable)
  actual_cost DECIMAL(12,2) (nullable)
  confirmation_uploaded BOOLEAN (default: false)
  
  created_at TIMESTAMP
  updated_at TIMESTAMP
}
```

#### **Rental Vehicles**

```sql
rental_vehicles {
  id UUID PK
  travel_request_id UUID FK → travel_requests
  itinerary_id UUID FK → itineraries (nullable)
  
  vehicle_class VARCHAR (enum: B_CLASS, O_CLASS)
  
  -- Booking responsibility
  booking_by VARCHAR (enum: TRAVEL_OFFICER, SELF_BOOK)
  booking_status VARCHAR (enum: AWAITING_BOOKING, BOOKING_IN_PROGRESS, BOOKED,
                                  CONFIRMATION_RECEIVED, COMPLETED)
  
  -- Request details
  second_driver_required BOOLEAN
  second_driver_id UUID FK → profiles (nullable)
  collection_location VARCHAR (nullable)
  collection_date DATE (nullable)
  collection_time TIME (nullable)
  return_location VARCHAR (nullable)
  return_date DATE (nullable)
  return_time TIME (nullable)
  
  -- Booking details
  rental_company VARCHAR (nullable)
  vehicle_type VARCHAR (nullable)
  booking_reference VARCHAR (nullable)
  estimated_cost DECIMAL(12,2) (nullable)
  actual_cost DECIMAL(12,2) (nullable)
  notes TEXT
  
  created_at TIMESTAMP
  updated_at TIMESTAMP
}
```

#### **Approvals Workflow**

```sql
approvals {
  id UUID PK
  travel_request_id UUID FK → travel_requests
  approver_id UUID FK → profiles
  approval_type VARCHAR (enum: HOD, TRAVEL_OFFICER, FINANCE, CEO) (indexed)
  
  status VARCHAR (enum: PENDING, APPROVED, REJECTED, CHANGES_REQUESTED)
  comments TEXT
  
  approved_at TIMESTAMP (nullable)
  response_at TIMESTAMP (nullable)
  
  created_at TIMESTAMP
  updated_at TIMESTAMP
  
  Unique Constraint:
  - travel_request_id + approval_type (only one pending approval per type)
  
  Indexes:
  - travel_request_id
  - approver_id
  - approval_type
  - status
}
```

#### **Budget Checks**

```sql
budget_checks {
  id UUID PK
  travel_request_id UUID FK → travel_requests
  project_id UUID FK → projects
  
  project_travel_budget DECIMAL(12,2)
  existing_commitments DECIMAL(12,2)
  current_request_cost DECIMAL(12,2)
  
  remaining_before_request DECIMAL(12,2)
  amount_over_budget DECIMAL(12,2) (nullable)
  
  is_budget_exception BOOLEAN
  
  checked_by UUID FK → profiles
  checked_at TIMESTAMP
  
  Index:
  - travel_request_id
}
```

#### **Attachments**

```sql
attachments {
  id UUID PK
  travel_request_id UUID FK → travel_requests
  file_name VARCHAR
  file_size INTEGER (bytes)
  mime_type VARCHAR
  storage_path VARCHAR (path in Supabase Storage)
  
  uploaded_by UUID FK → profiles
  uploaded_at TIMESTAMP
  
  attachment_type VARCHAR (enum: FLIGHT_CONFIRMATION, ACCOMMODATION_BOOKING,
                                  VEHICLE_BOOKING, SUPPORTING_DOC, OTHER)
  
  created_at TIMESTAMP
  
  Index:
  - travel_request_id
}
```

#### **Notifications/Email Log**

```sql
notifications {
  id UUID PK
  travel_request_id UUID FK → travel_requests
  recipient_id UUID FK → profiles
  
  email_type VARCHAR (enum: INVITATION, HOD_APPROVAL_REQUIRED, HOD_APPROVED,
                             HOD_REJECTED, CHANGES_REQUESTED,
                             TRAVEL_OFFICER_ACTION_REQUIRED, FINANCE_REVIEW_REQUIRED,
                             CEO_APPROVAL_REQUIRED, FULLY_APPROVED,
                             BOOKING_COMPLETED, PASSWORD_RESET)
  
  status VARCHAR (enum: QUEUED, SENDING, SENT, FAILED)
  
  provider_message_id VARCHAR (nullable) -- Resend message ID
  error_message TEXT (nullable)
  
  sent_at TIMESTAMP (nullable)
  created_at TIMESTAMP
  
  Indexes:
  - travel_request_id
  - recipient_id
  - email_type
  - status
  - sent_at
}
```

#### **Audit Log**

```sql
audit_logs {
  id UUID PK
  user_id UUID FK → profiles (nullable - for system actions)
  travel_request_id UUID FK → travel_requests
  
  action VARCHAR (e.g., "CREATED", "SUBMITTED", "APPROVED", "BOOKING_ADDED", etc.)
  
  previous_status VARCHAR (nullable)
  new_status VARCHAR (nullable)
  
  comments TEXT
  metadata JSONB (stores any additional context)
  
  created_at TIMESTAMP
  
  Indexes:
  - travel_request_id
  - user_id
  - action
  - created_at
  - (travel_request_id, created_at) for timeline queries
}
```

---

## 5. FOLDER STRUCTURE

```
travel-hub/
├── public/
│   ├── logo.svg                    # Angels Resource Centres logo
│   └── favicon.ico
│
├── src/
│   ├── components/
│   │   ├── auth/
│   │   │   ├── LoginForm.tsx
│   │   │   ├── ForgotPasswordForm.tsx
│   │   │   ├── ResetPasswordForm.tsx
│   │   │   └── ProtectedRoute.tsx
│   │   │
│   │   ├── layout/
│   │   │   ├── Header.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   ├── MainLayout.tsx
│   │   │   └── AdminLayout.tsx
│   │   │
│   │   ├── dashboard/
│   │   │   ├── StaffDashboard.tsx
│   │   │   ├── HODDashboard.tsx
│   │   │   ├── TravelOfficerDashboard.tsx
│   │   │   ├── FinanceDashboard.tsx
│   │   │   ├── CEODashboard.tsx
│   │   │   └── AdminDashboard.tsx
│   │   │
│   │   ├── travel-request/
│   │   │   ├── TravelRequestWizard.tsx
│   │   │   ├── steps/
│   │   │   │   ├── TripDetailsStep.tsx
│   │   │   │   ├── TravelersStep.tsx
│   │   │   │   ├── ItineraryStep.tsx
│   │   │   │   ├── AccommodationStep.tsx
│   │   │   │   ├── BusinessInfoStep.tsx
│   │   │   │   ├── STAdvanceStep.tsx
│   │   │   │   └── ReviewStep.tsx
│   │   │   ├── TravelRequestDetail.tsx
│   │   │   ├── TravelRequestList.tsx
│   │   │   ├── BookingResponsibilityEditor.tsx
│   │   │   └── ApprovalTimeline.tsx
│   │   │
│   │   ├── admin/
│   │   │   ├── UserManagement.tsx
│   │   │   ├── DepartmentManagement.tsx
│   │   │   ├── ProjectManagement.tsx
│   │   │   ├── AuditLogs.tsx
│   │   │   ├── EmailLogs.tsx
│   │   │   └── SystemSettings.tsx
│   │   │
│   │   ├── workflow/
│   │   │   ├── HODApprovalPanel.tsx
│   │   │   ├── TravelOfficerProcessing.tsx
│   │   │   ├── FinanceReview.tsx
│   │   │   ├── CEOApproval.tsx
│   │   │   ├── BudgetExceptionIndicator.tsx
│   │   │   └── ApprovalDialog.tsx
│   │   │
│   │   ├── common/
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Modal.tsx
│   │   │   ├── Toast.tsx
│   │   │   ├── StatusBadge.tsx
│   │   │   ├── Table.tsx
│   │   │   ├── SearchBar.tsx
│   │   │   ├── FilterPanel.tsx
│   │   │   ├── FileUploader.tsx
│   │   │   ├── DatePicker.tsx
│   │   │   └── ConfirmDialog.tsx
│   │   │
│   │   └── errors/
│   │       └── ErrorBoundary.tsx
│   │
│   ├── pages/
│   │   ├── _app.tsx               # Main app component
│   │   ├── _document.tsx          # Document wrapper
│   │   ├── index.tsx              # Home/redirect
│   │   ├── login.tsx
│   │   ├── forgot-password.tsx
│   │   ├── reset-password.tsx
│   │   ├── dashboard.tsx
│   │   ├── travel-requests/
│   │   │   ├── index.tsx          # List travel requests
│   │   │   ├── [id].tsx           # View/edit request
│   │   │   └── new.tsx            # Create new request
│   │   └── admin/
│   │       ├── users.tsx
│   │       ├── departments.tsx
│   │       ├── projects.tsx
│   │       ├── audit-logs.tsx
│   │       └── email-logs.tsx
│   │
│   ├── api/
│   │   ├── auth/
│   │   │   ├── register.ts        # User invitation/signup
│   │   │   ├── logout.ts
│   │   │   └── refresh.ts
│   │   │
│   │   ├── travel-requests/
│   │   │   ├── create.ts
│   │   │   ├── update.ts
│   │   │   ├── [id].ts            # Get specific request
│   │   │   ├── submit.ts          # Submit for approval
│   │   │   ├── draft-save.ts
│   │   │   └── list.ts
│   │   │
│   │   ├── workflow/
│   │   │   ├── approve.ts
│   │   │   ├── reject.ts
│   │   │   ├── request-changes.ts
│   │   │   └── process-booking.ts
│   │   │
│   │   ├── admin/
│   │   │   ├── users/
│   │   │   │   ├── create.ts
│   │   │   │   ├── update.ts
│   │   │   │   └── list.ts
│   │   │   ├── projects/
│   │   │   │   ├── create.ts
│   │   │   │   ├── update.ts
│   │   │   │   └── list.ts
│   │   │   └── departments/
│   │   │       ├── create.ts
│   │   │       └── list.ts
│   │   │
│   │   └── notifications/
│   │       └── send-email.ts      # Server-side email sending
│   │
│   ├── lib/
│   │   ├── supabase.ts            # Supabase client setup
│   │   ├── auth.ts                # Auth utilities
│   │   ├── api.ts                 # API request utilities
│   │   ├── constants.ts           # App constants
│   │   └── validators/
│   │       ├── travel-request.ts
│   │       └── auth.ts
│   │
│   ├── services/
│   │   ├── travel-request.service.ts
│   │   ├── workflow.service.ts
│   │   ├── budget.service.ts
│   │   ├── email.service.ts
│   │   ├── file.service.ts
│   │   └── audit.service.ts
│   │
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── useTravelRequest.ts
│   │   ├── useWorkflow.ts
│   │   ├── useUser.ts
│   │   └── useBudget.ts
│   │
│   ├── types/
│   │   ├── database.ts            # DB types (generated from Supabase)
│   │   ├── travel-request.ts
│   │   ├── workflow.ts
│   │   ├── user.ts
│   │   └── api.ts
│   │
│   ├── utils/
│   │   ├── format.ts              # Formatting utilities
│   │   ├── date.ts                # Date utilities
│   │   ├── validation.ts
│   │   ├── workflow-engine.ts    # State machine for workflows
│   │   └── numbers.ts
│   │
│   ├── styles/
│   │   ├── globals.css
│   │   ├── tailwind.config.js
│   │   └── theme.css              # NPO branding
│   │
│   └── middleware/
│       ├── auth.ts
│       └── rls-check.ts           # Verify RLS enforcement
│
├── supabase/
│   ├── migrations/
│   │   ├── 001_initial_schema.sql
│   │   ├── 002_rls_policies.sql
│   │   ├── 003_functions_triggers.sql
│   │   └── 004_seed_data.sql
│   │
│   └── functions/
│       ├── generate-request-number/
│       │   └── index.ts           # Edge function
│       └── workflow-engine/
│           └── index.ts           # Edge function
│
├── .env.local.example
├── .env.example
├── package.json
├── tsconfig.json
├── tailwind.config.js
├── next.config.js
├── vercel.json
└── README.md
```

---

## 6. SECURITY & RLS STRATEGY

### 6.1 Authentication Flow

```
Login Page
    ↓
[Email + Password]
    ↓
Supabase Auth
    ↓
Auth Token (JWT) stored in secure HTTP-only cookie
    ↓
Session Manager
    ↓
Protected Routes check session
    ↓
Access Granted ↔ Fetch Role from Profiles table
```

### 6.2 Row Level Security (RLS) Policies

**Policy 1: SUPER_ADMIN Full Access**
```sql
-- Super admins can access all records
SELECT/UPDATE/DELETE on profiles, travel_requests, approvals, etc.
WHERE auth.uid() IN (
  SELECT auth_user_id FROM profiles 
  WHERE role = 'SUPER_ADMIN' AND active = true
)
```

**Policy 2: STAFF Own Requests**
```sql
-- Staff can only view/edit their own travel requests
SELECT on travel_requests
WHERE requester_id = auth.uid() OR id IN (
  SELECT travel_request_id FROM travel_request_travellers 
  WHERE traveller_id = auth.uid()
)
```

**Policy 3: HOD Department Requests**
```sql
-- HOD can view requests from their department awaiting their approval
SELECT on travel_requests
WHERE department_id = (
  SELECT department_id FROM profiles 
  WHERE auth_user_id = auth.uid()
) AND status IN ('HOD_REVIEW', 'HOD_APPROVED', ...)
```

**Policy 4: TRAVEL_OFFICER Processing Queue**
```sql
-- Travel Officer can view requests in their queue
SELECT on travel_requests
WHERE status IN ('TRAVEL_OFFICER_REVIEW', 'TRAVEL_PROCESSING')
```

**Policy 5: FINANCE Budget Review**
```sql
-- Finance can view requests requiring finance review
SELECT on travel_requests
WHERE status IN ('FINANCE_REVIEW', 'BUDGET_EXCEPTION')
```

**Policy 6: CEO Budget Exceptions**
```sql
-- CEO can only view budget exception requests
SELECT on travel_requests
WHERE status = 'CEO_APPROVAL' AND id IN (
  SELECT travel_request_id FROM budget_checks 
  WHERE is_budget_exception = true
)
```

### 6.3 Security Checklist

- ✅ No public registration - only invited users
- ✅ Email/password authentication via Supabase Auth
- ✅ Row Level Security enforced at database layer
- ✅ Session expiry with automatic logout
- ✅ No sensitive credentials in frontend code
- ✅ API keys stored in Vercel environment variables
- ✅ Server-side email operations (Resend API)
- ✅ Private file storage with signed URLs only
- ✅ Input validation on both frontend and backend
- ✅ Output sanitization to prevent XSS
- ✅ Password reset via secure token flow
- ✅ Audit logging of all actions
- ✅ Sensitive info not exposed in error messages

---

## 7. APPROVAL WORKFLOW STATE MACHINE

```
States: DRAFT, AWAITING_ITINERARY, SUBMITTED, HOD_REVIEW, HOD_APPROVED,
        TRAVEL_OFFICER_REVIEW, TRAVEL_PROCESSING, FINANCE_REVIEW,
        BUDGET_EXCEPTION, CEO_APPROVAL, FULLY_APPROVED, BOOKING_COMPLETE,
        TRAVEL_COMPLETED, CANCELLED, REJECTED

Valid Transitions:

DRAFT
  ├─→ AWAITING_ITINERARY (if multi-itinerary)
  ├─→ SUBMITTED (if single itinerary + all required fields complete)
  └─→ CANCELLED (user withdrawal)

AWAITING_ITINERARY
  ├─→ SUBMITTED (when itinerary complete)
  └─→ CANCELLED

SUBMITTED
  └─→ HOD_REVIEW (automatic, triggers email)

HOD_REVIEW
  ├─→ HOD_APPROVED (HOD approves, triggers email to Travel Officer)
  ├─→ REJECTED (HOD rejects, triggers email to requester)
  └─→ SUBMITTED (HOD requests changes, triggers email to requester)

HOD_APPROVED
  └─→ TRAVEL_OFFICER_REVIEW (automatic, triggers email)

TRAVEL_OFFICER_REVIEW
  ├─→ TRAVEL_PROCESSING (Travel Officer starts processing)
  └─→ REJECTED (Travel Officer rejects, triggers email)

TRAVEL_PROCESSING
  └─→ FINANCE_REVIEW (when bookings complete or acknowledged)

FINANCE_REVIEW
  ├─→ BUDGET_EXCEPTION (if cost exceeds budget)
  ├─→ FULLY_APPROVED (if within budget, triggers email to requester)
  └─→ REJECTED (Finance rejects)

BUDGET_EXCEPTION
  └─→ CEO_APPROVAL (automatic, triggers email to CEO)

CEO_APPROVAL
  ├─→ FULLY_APPROVED (CEO approves, triggers email to requester)
  ├─→ REJECTED (CEO rejects)
  └─→ SUBMITTED (CEO requests changes, back to HOD)

FULLY_APPROVED
  └─→ BOOKING_COMPLETE (when all bookings finalized)

BOOKING_COMPLETE
  └─→ TRAVEL_COMPLETED (after travel occurs)

CANCELLED
  └─→ (terminal state)

REJECTED
  └─→ (terminal state - but user can create new request)
```

**Workflow Engine Responsibilities:**
1. Validate state transitions
2. Enforce role-based transition permissions
3. Generate automatic status change audit logs
4. Trigger notifications at each step
5. Prevent invalid transitions (security)

---

## 8. API ARCHITECTURE

### 8.1 API Routes Structure

```
/api/auth/*                    -- Authentication
/api/travel-requests/*         -- Travel request CRUD
/api/workflow/*                -- Approval workflow actions
/api/admin/*                   -- Admin operations
/api/notifications/*           -- Email notifications
/api/budgets/*                 -- Budget calculations
/api/storage/*                 -- File uploads/downloads
```

### 8.2 Server-Side Operations (Vercel Functions)

Operations that MUST run server-side:

1. **Resend Email Sending**
   - Never expose Resend API key to frontend
   - All email templates rendered server-side

2. **Workflow State Transitions**
   - Validate permission and state machine rules
   - Generate audit logs
   - Trigger notifications

3. **Budget Calculations**
   - Query project budgets and commitments
   - Determine exception status
   - Create audit trail

4. **Admin Operations**
   - User invitations
   - Role assignments
   - System configuration changes

5. **File Operations**
   - Generate signed URLs for storage access
   - Validate file uploads
   - Manage file access permissions

---

## 9. EMAIL NOTIFICATION STRATEGY

### 9.1 Email Templates (Resend)

1. User Invitation
2. HOD Approval Required
3. HOD Approved/Rejected
4. Changes Requested
5. Travel Officer Action Required
6. Finance Review Required
7. CEO Approval Required
8. Fully Approved
9. Booking Completed
10. Password Reset

### 9.2 Email Delivery

```
Action Triggered
    ↓
API Route validates action
    ↓
Generate email content
    ↓
Send via Resend API
    ↓
Log notification record
    ↓
Handle delivery failures
```

**Resend Pro Plan Benefits:**
- Higher send limits
- Better deliverability
- Advanced tracking

---

## 10. ENVIRONMENT VARIABLES

### .env.local (Development)
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=

SUPABASE_SERVICE_ROLE_KEY=
RESEND_API_KEY=
EMAIL_FROM=noreply@angels-travel.example.com

APP_URL=http://localhost:3000

# Development settings
DEBUG=false
```

### Vercel Production
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=

SUPABASE_SERVICE_ROLE_KEY=        [VERCEL SECRET]
RESEND_API_KEY=                   [VERCEL SECRET]
EMAIL_FROM=

APP_URL=https://travel-hub.angels.org.za
```

---

## 11. DEPLOYMENT ARCHITECTURE

```
GitHub Repository
    ↓
├─ main (production)
├─ testing (development)
└─ feature/* (feature branches)
    ↓
Vercel CI/CD
    ↓
├─ Testing environment (testing branch)
│   ├─ Supabase Preview Branch
│   └─ Automatic deployment
│
└─ Production environment (main branch)
    ├─ Supabase Production
    └─ Automatic deployment (after review)
```

---

## 12. KEY DESIGN DECISIONS & ASSUMPTIONS

### Decisions Made:

1. **React + Next.js** - Full-stack framework, serverless functions, great DX
2. **Tailwind CSS** - Rapid UI development, consistency, responsive
3. **TypeScript** - Type safety, better DX, fewer bugs
4. **Supabase** - PostgreSQL, built-in Auth, RLS, Storage
5. **Resend** - Professional email delivery
6. **Vercel** - Native Next.js hosting, serverless
7. **JWT + HTTP-only cookies** - Secure session management

### Assumptions:

1. **Users are always invited** - No public self-registration
2. **Email delivery is reliable** - Resend Pro handles retry logic
3. **Single budget currency** - All amounts in ZAR (can be made configurable)
4. **NPO operates in South Africa** - Timezone: Africa/Johannesburg
5. **Single instance deployment** - Not multi-tenant SaaS
6. **Moderate user count** - <500 concurrent users
7. **Travel requests are time-insensitive** - Not real-time approval required
8. **File storage limit** - Individual files <100MB

### Missing/Clarification Items:

1. **Email address domain** - Should all emails come from a specific domain?
2. **Logo files** - High-res versions of Angels RC logo?
3. **Color scheme/branding** - Primary/secondary colors for NPO theme?
4. **Initial admin credentials** - How should first Super Admin be created?
5. **Test data scope** - How much test data needed for development?
6. **Reporting requirements** - Which reports are MVP vs future?

---

## 13. NEXT STEPS

### Phase 1 Complete (This Document)
✅ Architecture design
✅ Database schema
✅ Folder structure
✅ Security strategy
✅ API design
✅ Workflow design

### Phase 2 Ready for Implementation
- Database setup in Supabase
- RLS policies creation
- Migration scripts

**PLEASE REVIEW:**

1. Does this architecture align with your vision?
2. Are there any missing requirements?
3. Should we adjust the tech stack?
4. Any clarifications needed on the workflow?
5. Are the assumptions reasonable?

Once approved, we'll proceed to **PHASE 2: DATABASE SETUP & RLS POLICIES**.
