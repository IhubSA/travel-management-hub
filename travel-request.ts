// ============================================================================
// Travel request domain types
//
// Composite types (a request joined with its related rows) and the wizard's
// working draft shape. These sit on top of the raw table rows in database.ts.
// ============================================================================

import type {
  AccommodationRow,
  AirTravelRow,
  ApprovalRow,
  AuditLogRow,
  BookingResponsibility,
  BudgetCheckRow,
  DepartmentRow,
  ItineraryRow,
  ProfileRow,
  ProjectRow,
  RentalVehicleRow,
  RoadTravelRow,
  TransportMode,
  TravelRequestRow,
  TravelStatus,
  TravelType,
  VehicleClass,
} from './database'

// ----------------------------------------------------------------------------
// COMPOSITE READ MODELS
// ----------------------------------------------------------------------------

/** An itinerary leg with the booking rows that hang off it. */
export interface ItineraryWithBookings extends ItineraryRow {
  air_travel: AirTravelRow[]
  road_travel: RoadTravelRow[]
  accommodation: AccommodationRow[]
  rental_vehicles: RentalVehicleRow[]
}

/** A travel request with everything needed to render the detail page. */
export interface TravelRequestDetail extends TravelRequestRow {
  requester: ProfileRow | null
  department: DepartmentRow | null
  project: ProjectRow | null
  travellers: ProfileRow[]
  itineraries: ItineraryWithBookings[]
  approvals: ApprovalRow[]
  budget_check: BudgetCheckRow | null
  audit_logs: AuditLogRow[]
  estimated_cost: number
}

/** Lightweight shape for list/table views. */
export interface TravelRequestSummary {
  id: string
  request_number: string
  status: TravelStatus
  travel_type: TravelType
  requester_name: string
  department_name: string
  project_code: string
  destination: string
  first_travel_date: string | null
  number_of_travellers: number
  estimated_cost: number
  created_at: string
  submitted_at: string | null
}

// ----------------------------------------------------------------------------
// WIZARD DRAFT
//
// The wizard collects a nested structure, then the service flattens it into
// the table rows above on save. Fields mirror the schema column names so the
// mapping stays obvious.
// ----------------------------------------------------------------------------

export interface DraftItinerary {
  /** Client-side key only; replaced by a real UUID on save. */
  key: string
  sequence: number
  travel_date: string
  departure_time: string
  origin: string
  destination: string
  transport_mode: TransportMode
  round_trip: boolean
  return_date: string

  // Flights
  flight_booking_by: BookingResponsibility
  departure_airport: string
  destination_airport: string
  preferred_flight_time: string
  baggage_requirements: string

  // Accommodation
  accommodation_required: boolean
  accommodation_booking_by: BookingResponsibility
  check_in_date: string
  check_out_date: string
  accommodation_location: string
  preferred_type: string
  rooms_required: number
  accommodation_special_requirements: string
  accommodation_estimated_cost: string

  // Vehicle
  vehicle_required: boolean
  vehicle_booking_by: BookingResponsibility
  vehicle_class: VehicleClass
  own_vehicle: boolean
  second_driver_required: boolean
  second_driver_id: string
  collection_location: string
  return_location: string
  vehicle_estimated_cost: string

  // Flight cost estimate (per request, captured up front for budget checking)
  flight_estimated_cost: string

  notes: string
}

export interface TravelRequestDraft {
  /** Present once the draft has been persisted at least once. */
  id?: string
  request_number?: string

  // Step 1 - Trip details
  travel_type: TravelType
  project_id: string
  department_id: string
  is_multiple_itinerary: boolean
  round_trip: boolean

  // Step 2 - Travellers
  traveller_ids: string[]

  // Step 3/4 - Itinerary legs (incl. accommodation + vehicles)
  itineraries: DraftItinerary[]

  // Step 5 - Business info
  business_activity: string
  business_purpose: string
  travel_justification: string

  // Step 6 - S&T advance
  st_advance_required: boolean
  st_advance_amount: string
  st_advance_reason: string

  status: TravelStatus
}

// ----------------------------------------------------------------------------
// WIZARD STEPS
// ----------------------------------------------------------------------------

export const WIZARD_STEPS = [
  { id: 'trip', title: 'Trip Details', short: 'Trip' },
  { id: 'travellers', title: 'Travellers', short: 'Travellers' },
  { id: 'itinerary', title: 'Itinerary', short: 'Itinerary' },
  { id: 'logistics', title: 'Accommodation & Vehicles', short: 'Logistics' },
  { id: 'business', title: 'Business Justification', short: 'Business' },
  { id: 'advance', title: 'S&T Advance', short: 'Advance' },
  { id: 'review', title: 'Review & Submit', short: 'Review' },
] as const

export type WizardStepId = (typeof WIZARD_STEPS)[number]['id']

/** Field-level validation errors, keyed by field path. */
export type ValidationErrors = Record<string, string>

// ----------------------------------------------------------------------------
// DISPLAY LABELS
// ----------------------------------------------------------------------------

export const TRAVEL_TYPE_LABELS: Record<TravelType, string> = {
  AIR: 'Air travel',
  ROAD: 'Road travel',
  AIR_AND_ROAD: 'Air and road',
  ACCOMMODATION: 'Accommodation only',
}

export const TRANSPORT_MODE_LABELS: Record<TransportMode, string> = {
  AIR: 'Air',
  ROAD: 'Road',
  COMBINATION: 'Air and road',
}

export const BOOKING_RESPONSIBILITY_LABELS: Record<
  BookingResponsibility,
  string
> = {
  TRAVEL_OFFICER: 'Travel Officer books',
  SELF_BOOK: 'I will book myself',
  NOT_REQUIRED: 'Not required',
}

export const VEHICLE_CLASS_LABELS: Record<VehicleClass, string> = {
  B_CLASS: 'B-Class (compact)',
  O_CLASS: 'O-Class (larger / 4x4)',
  NONE: 'None',
}

export const STATUS_LABELS: Record<TravelStatus, string> = {
  DRAFT: 'Draft',
  AWAITING_ITINERARY: 'Awaiting itinerary',
  SUBMITTED: 'Submitted',
  HOD_REVIEW: 'HOD review',
  HOD_APPROVED: 'HOD approved',
  TRAVEL_OFFICER_REVIEW: 'Travel Officer review',
  TRAVEL_PROCESSING: 'Processing bookings',
  FINANCE_REVIEW: 'Finance review',
  BUDGET_EXCEPTION: 'Budget exception',
  CEO_APPROVAL: 'CEO approval',
  FULLY_APPROVED: 'Fully approved',
  BOOKING_COMPLETE: 'Booking complete',
  TRAVEL_COMPLETED: 'Travel completed',
  CANCELLED: 'Cancelled',
  REJECTED: 'Rejected',
}

/** Tailwind classes per status, used by StatusBadge. */
export const STATUS_STYLES: Record<TravelStatus, string> = {
  DRAFT: 'bg-gray-100 text-gray-700 border-gray-200',
  AWAITING_ITINERARY: 'bg-gray-100 text-gray-700 border-gray-200',
  SUBMITTED: 'bg-blue-50 text-blue-700 border-blue-200',
  HOD_REVIEW: 'bg-amber-50 text-amber-800 border-amber-200',
  HOD_APPROVED: 'bg-teal-50 text-teal-700 border-teal-200',
  TRAVEL_OFFICER_REVIEW: 'bg-amber-50 text-amber-800 border-amber-200',
  TRAVEL_PROCESSING: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  FINANCE_REVIEW: 'bg-amber-50 text-amber-800 border-amber-200',
  BUDGET_EXCEPTION: 'bg-orange-50 text-orange-800 border-orange-200',
  CEO_APPROVAL: 'bg-purple-50 text-purple-700 border-purple-200',
  FULLY_APPROVED: 'bg-green-50 text-green-700 border-green-200',
  BOOKING_COMPLETE: 'bg-green-50 text-green-700 border-green-200',
  TRAVEL_COMPLETED: 'bg-slate-100 text-slate-700 border-slate-200',
  CANCELLED: 'bg-gray-100 text-gray-500 border-gray-200',
  REJECTED: 'bg-red-50 text-red-700 border-red-200',
}
