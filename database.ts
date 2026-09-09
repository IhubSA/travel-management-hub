// ============================================================================
// Angels Resource Centres - Travel Management Hub
// Database types
//
// These types mirror supabase/migrations/001_initial_schema.sql EXACTLY.
// Column names, nullability and enum members match the Postgres schema, so
// swapping the mock data layer for a real Supabase client requires no changes
// to any component.
//
// When Supabase is live, this file can be regenerated with:
//   npm run db:types
// ============================================================================

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

// ----------------------------------------------------------------------------
// ENUMS (mirrors CREATE TYPE ... AS ENUM)
// ----------------------------------------------------------------------------

export type UserRole =
  | 'SUPER_ADMIN'
  | 'STAFF'
  | 'HOD'
  | 'TRAVEL_OFFICER'
  | 'FINANCE'
  | 'CEO'

export type TravelStatus =
  | 'DRAFT'
  | 'AWAITING_ITINERARY'
  | 'SUBMITTED'
  | 'HOD_REVIEW'
  | 'HOD_APPROVED'
  | 'TRAVEL_OFFICER_REVIEW'
  | 'TRAVEL_PROCESSING'
  | 'FINANCE_REVIEW'
  | 'BUDGET_EXCEPTION'
  | 'CEO_APPROVAL'
  | 'FULLY_APPROVED'
  | 'BOOKING_COMPLETE'
  | 'TRAVEL_COMPLETED'
  | 'CANCELLED'
  | 'REJECTED'

export type TravelType = 'AIR' | 'ROAD' | 'AIR_AND_ROAD' | 'ACCOMMODATION'

export type TransportMode = 'AIR' | 'ROAD' | 'COMBINATION'

export type BookingResponsibility =
  | 'TRAVEL_OFFICER'
  | 'SELF_BOOK'
  | 'NOT_REQUIRED'

export type BookingStatus =
  | 'NOT_REQUIRED'
  | 'AWAITING_BOOKING'
  | 'SELF_BOOKING_REQUIRED'
  | 'BOOKING_IN_PROGRESS'
  | 'BOOKED'
  | 'CONFIRMATION_RECEIVED'
  | 'COMPLETED'
  | 'CANCELLED'

export type ApprovalType = 'HOD' | 'TRAVEL_OFFICER' | 'FINANCE' | 'CEO'

export type ApprovalStatus =
  | 'PENDING'
  | 'APPROVED'
  | 'REJECTED'
  | 'CHANGES_REQUESTED'

export type VehicleClass = 'B_CLASS' | 'O_CLASS' | 'NONE'

export type NotificationType =
  | 'INVITATION'
  | 'HOD_APPROVAL_REQUIRED'
  | 'HOD_APPROVED'
  | 'HOD_REJECTED'
  | 'CHANGES_REQUESTED'
  | 'TRAVEL_OFFICER_ACTION_REQUIRED'
  | 'FINANCE_REVIEW_REQUIRED'
  | 'CEO_APPROVAL_REQUIRED'
  | 'FULLY_APPROVED'
  | 'BOOKING_COMPLETED'
  | 'PASSWORD_RESET'

export type NotificationStatus = 'QUEUED' | 'SENDING' | 'SENT' | 'FAILED'

export type AttachmentType =
  | 'FLIGHT_CONFIRMATION'
  | 'ACCOMMODATION_BOOKING'
  | 'VEHICLE_BOOKING'
  | 'SUPPORTING_DOC'
  | 'OTHER'

export type CommitmentStatus = 'ESTIMATED' | 'BOOKED' | 'COMPLETED' | 'CANCELLED'

// ----------------------------------------------------------------------------
// TABLE ROWS
// ----------------------------------------------------------------------------

export interface DepartmentRow {
  id: string
  name: string
  code: string
  hod_user_id: string | null
  active: boolean
  created_at: string
  updated_at: string
}

export interface ProfileRow {
  id: string
  auth_user_id: string
  first_name: string
  last_name: string
  email: string
  phone: string | null
  department_id: string | null
  job_title: string | null
  role: UserRole
  active: boolean
  employee_ref: string | null
  created_at: string
  updated_at: string
}

export interface ProjectRow {
  id: string
  project_code: string
  project_name: string
  description: string | null
  project_manager_id: string | null
  budget: number
  travel_budget: number
  start_date: string | null
  end_date: string | null
  active: boolean
  created_at: string
  updated_at: string
}

export interface TravelRequestRow {
  id: string
  request_number: string
  requester_id: string
  department_id: string
  project_id: string

  business_activity: string | null
  business_purpose: string | null
  travel_justification: string
  number_of_travellers: number | null

  travel_type: TravelType
  is_multiple_itinerary: boolean
  round_trip: boolean

  st_advance_required: boolean
  st_advance_amount: number | null
  st_advance_reason: string | null

  status: TravelStatus

  created_at: string
  updated_at: string
  submitted_at: string | null
}

export interface TravelRequestTravellerRow {
  id: string
  travel_request_id: string
  traveller_id: string
  sequence_order: number | null
  created_at: string
}

export interface ItineraryRow {
  id: string
  travel_request_id: string
  sequence: number
  travel_date: string
  departure_time: string | null

  origin: string
  destination: string
  transport_mode: TransportMode
  round_trip: boolean

  flight_booking_by: BookingResponsibility
  accommodation_required: boolean
  accommodation_booking_by: BookingResponsibility
  vehicle_required: boolean
  vehicle_booking_by: BookingResponsibility

  notes: string | null

  created_at: string
  updated_at: string
}

export interface AirTravelRow {
  id: string
  travel_request_id: string
  itinerary_id: string | null

  departure_airport: string
  destination_airport: string
  departure_date: string
  departure_time: string | null
  preferred_flight_time: string | null

  return_airport: string | null
  return_date: string | null
  return_time: string | null

  baggage_requirements: string | null
  special_requirements: string | null
  notes: string | null

  booking_by: BookingResponsibility
  booking_status: BookingStatus

  airline_name: string | null
  flight_number: string | null
  confirmation_reference: string | null
  ticket_cost: number | null
  booking_date: string | null
  confirmation_uploaded: boolean

  created_at: string
  updated_at: string
}

export interface RoadTravelRow {
  id: string
  travel_request_id: string
  itinerary_id: string | null

  origin: string
  destination: string
  departure_date: string
  departure_time: string | null
  return_date: string | null
  return_time: string | null

  vehicle_required: boolean
  vehicle_class: VehicleClass | null
  own_vehicle: boolean | null

  second_driver_required: boolean
  second_driver_id: string | null

  notes: string | null

  created_at: string
  updated_at: string
}

export interface AccommodationRow {
  id: string
  travel_request_id: string
  itinerary_id: string | null

  check_in_date: string
  check_out_date: string
  nights_count: number | null
  location: string
  preferred_type: string | null
  rooms_required: number
  occupants_count: number | null
  special_requirements: string | null

  booking_by: BookingResponsibility
  booking_status: BookingStatus

  provider_name: string | null
  booking_reference: string | null
  booking_date: string | null
  estimated_cost: number | null
  actual_cost: number | null
  confirmation_uploaded: boolean

  created_at: string
  updated_at: string
}

export interface RentalVehicleRow {
  id: string
  travel_request_id: string
  itinerary_id: string | null

  vehicle_class: VehicleClass

  booking_by: BookingResponsibility
  booking_status: BookingStatus

  second_driver_required: boolean
  second_driver_id: string | null

  collection_location: string | null
  collection_date: string | null
  collection_time: string | null
  return_location: string | null
  return_date: string | null
  return_time: string | null

  rental_company: string | null
  vehicle_type: string | null
  booking_reference: string | null
  estimated_cost: number | null
  actual_cost: number | null
  notes: string | null

  created_at: string
  updated_at: string
}

export interface ProjectTravelCommitmentRow {
  id: string
  project_id: string
  travel_request_id: string
  committed_amount: number
  actual_amount: number | null
  status: CommitmentStatus
  created_at: string
  updated_at: string
}

export interface ApprovalRow {
  id: string
  travel_request_id: string
  approver_id: string
  approval_type: ApprovalType
  status: ApprovalStatus
  comments: string | null
  approved_at: string | null
  response_at: string | null
  created_at: string
  updated_at: string
}

export interface BudgetCheckRow {
  id: string
  travel_request_id: string
  project_id: string
  project_travel_budget: number
  existing_commitments: number
  current_request_cost: number
  remaining_before_request: number
  amount_over_budget: number | null
  is_budget_exception: boolean
  checked_by: string | null
  checked_at: string
}

export interface AttachmentRow {
  id: string
  travel_request_id: string
  file_name: string
  file_size: number
  mime_type: string
  storage_path: string
  uploaded_by: string
  uploaded_at: string
  attachment_type: AttachmentType
  created_at: string
}

export interface NotificationRow {
  id: string
  travel_request_id: string | null
  recipient_id: string
  email_type: NotificationType
  status: NotificationStatus
  provider_message_id: string | null
  error_message: string | null
  sent_at: string | null
  created_at: string
}

export interface AuditLogRow {
  id: string
  user_id: string | null
  travel_request_id: string | null
  action: string
  previous_status: TravelStatus | null
  new_status: TravelStatus | null
  comments: string | null
  metadata: Json | null
  created_at: string
}

// ----------------------------------------------------------------------------
// INSERT / UPDATE HELPERS
// Database-generated columns are optional on insert.
// ----------------------------------------------------------------------------

type GeneratedColumn = 'id' | 'created_at' | 'updated_at'

export type InsertOf<Row> = Omit<Row, GeneratedColumn & keyof Row> &
  Partial<Pick<Row, GeneratedColumn & keyof Row>>

export type UpdateOf<Row> = Partial<Row>

type TableDef<Row> = {
  Row: Row
  Insert: InsertOf<Row>
  Update: UpdateOf<Row>
}

// ----------------------------------------------------------------------------
// SUPABASE-COMPATIBLE DATABASE TYPE
// ----------------------------------------------------------------------------

export type Database = {
  public: {
    Tables: {
      departments: TableDef<DepartmentRow>
      profiles: TableDef<ProfileRow>
      projects: TableDef<ProjectRow>
      travel_requests: TableDef<TravelRequestRow>
      travel_request_travellers: TableDef<TravelRequestTravellerRow>
      itineraries: TableDef<ItineraryRow>
      air_travel: TableDef<AirTravelRow>
      road_travel: TableDef<RoadTravelRow>
      accommodation: TableDef<AccommodationRow>
      rental_vehicles: TableDef<RentalVehicleRow>
      project_travel_commitments: TableDef<ProjectTravelCommitmentRow>
      approvals: TableDef<ApprovalRow>
      budget_checks: TableDef<BudgetCheckRow>
      attachments: TableDef<AttachmentRow>
      notifications: TableDef<NotificationRow>
      audit_logs: TableDef<AuditLogRow>
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: {
      user_role: UserRole
      travel_status: TravelStatus
      travel_type: TravelType
      transport_mode: TransportMode
      booking_responsibility: BookingResponsibility
      booking_status: BookingStatus
      approval_type: ApprovalType
      approval_status: ApprovalStatus
      vehicle_class: VehicleClass
      notification_type: NotificationType
      notification_status: NotificationStatus
      attachment_type: AttachmentType
    }
  }
}

// Convenience aliases used across the app
export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row']
export type Enums<T extends keyof Database['public']['Enums']> =
  Database['public']['Enums'][T]
