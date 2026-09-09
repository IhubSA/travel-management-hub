// ============================================================================
// Travel request service
//
// The only module (besides reference.service) that reads or writes travel
// request data. Every function is async and returns plain rows/composites, so
// the bodies can be swapped for Supabase queries without touching the UI.
// ============================================================================

import { db, newId, nextRequestNumber, nowIso, saveDb } from '@/lib/mock-db'
import { estimateDraftCost, nightsBetween, toAmount } from '@/lib/draft'
import { fullName } from './reference.service'
import type {
  AccommodationRow,
  AirTravelRow,
  RentalVehicleRow,
  RoadTravelRow,
  TravelRequestRow,
  TravelStatus,
  UserRole,
} from '@/types/database'
import type {
  DraftItinerary,
  ItineraryWithBookings,
  TravelRequestDetail,
  TravelRequestDraft,
  TravelRequestSummary,
} from '@/types/travel-request'

const LATENCY_MS = 150

function delay<T>(value: T): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), LATENCY_MS))
}

// ----------------------------------------------------------------------------
// VIEWER / VISIBILITY
// ----------------------------------------------------------------------------

export interface Viewer {
  profileId: string
  role: UserRole
  departmentId: string | null
}

/** Statuses that sit in each approver role's action queue. */
export const QUEUE_STATUSES: Partial<Record<UserRole, TravelStatus[]>> = {
  HOD: ['HOD_REVIEW'],
  TRAVEL_OFFICER: ['TRAVEL_OFFICER_REVIEW', 'TRAVEL_PROCESSING'],
  FINANCE: ['FINANCE_REVIEW'],
  CEO: ['BUDGET_EXCEPTION', 'CEO_APPROVAL'],
  // The Super Admin has no stage of their own, so their "queue" is everything
  // currently in flight. Keeping it here means the dashboard count and the
  // list below it always agree.
  SUPER_ADMIN: [
    'HOD_REVIEW',
    'TRAVEL_OFFICER_REVIEW',
    'TRAVEL_PROCESSING',
    'FINANCE_REVIEW',
    'BUDGET_EXCEPTION',
    'CEO_APPROVAL',
  ],
}

/**
 * Mirrors the RLS policies in 002_rls_policies.sql. When Supabase is live,
 * the database enforces this and the client-side filter becomes belt-and-braces.
 */
function canView(request: TravelRequestRow, viewer: Viewer): boolean {
  if (viewer.role === 'SUPER_ADMIN') return true

  // Own requests, and requests you are travelling on
  if (request.requester_id === viewer.profileId) return true
  const isTraveller = db.travel_request_travellers.some(
    (t) => t.travel_request_id === request.id && t.traveller_id === viewer.profileId
  )
  if (isTraveller) return true

  // Anything you have already actioned stays visible
  const hasActioned = db.approvals.some(
    (a) => a.travel_request_id === request.id && a.approver_id === viewer.profileId
  )
  if (hasActioned) return true

  switch (viewer.role) {
    case 'HOD':
      return (
        request.department_id === viewer.departmentId &&
        request.status !== 'DRAFT'
      )
    case 'TRAVEL_OFFICER':
      return [
        'TRAVEL_OFFICER_REVIEW',
        'TRAVEL_PROCESSING',
        'FINANCE_REVIEW',
        'BUDGET_EXCEPTION',
        'CEO_APPROVAL',
        'FULLY_APPROVED',
        'BOOKING_COMPLETE',
        'TRAVEL_COMPLETED',
      ].includes(request.status)
    case 'FINANCE':
      return [
        'FINANCE_REVIEW',
        'BUDGET_EXCEPTION',
        'CEO_APPROVAL',
        'FULLY_APPROVED',
        'BOOKING_COMPLETE',
        'TRAVEL_COMPLETED',
      ].includes(request.status)
    case 'CEO':
      return [
        'BUDGET_EXCEPTION',
        'CEO_APPROVAL',
        'FULLY_APPROVED',
        'TRAVEL_COMPLETED',
      ].includes(request.status)
    default:
      return false
  }
}

// ----------------------------------------------------------------------------
// COSTING
// ----------------------------------------------------------------------------

/** Sum of all costed components on a saved request. */
export function estimatedCostOf(requestId: string): number {
  const air = db.air_travel
    .filter((r) => r.travel_request_id === requestId)
    .reduce((s, r) => s + (r.ticket_cost ?? 0), 0)
  const acc = db.accommodation
    .filter((r) => r.travel_request_id === requestId)
    .reduce((s, r) => s + (r.actual_cost ?? r.estimated_cost ?? 0), 0)
  const veh = db.rental_vehicles
    .filter((r) => r.travel_request_id === requestId)
    .reduce((s, r) => s + (r.actual_cost ?? r.estimated_cost ?? 0), 0)
  const request = db.travel_requests.find((r) => r.id === requestId)
  const adv = request?.st_advance_required ? (request.st_advance_amount ?? 0) : 0
  return air + acc + veh + adv
}

// ----------------------------------------------------------------------------
// READ
// ----------------------------------------------------------------------------

function toSummary(request: TravelRequestRow): TravelRequestSummary {
  const requester = db.profiles.find((p) => p.id === request.requester_id) ?? null
  const department = db.departments.find((d) => d.id === request.department_id)
  const project = db.projects.find((p) => p.id === request.project_id)
  const legs = db.itineraries
    .filter((i) => i.travel_request_id === request.id)
    .sort((a, b) => a.sequence - b.sequence)

  return {
    id: request.id,
    request_number: request.request_number,
    status: request.status,
    travel_type: request.travel_type,
    requester_name: fullName(requester),
    department_name: department?.name ?? '—',
    project_code: project?.project_code ?? '—',
    destination:
      legs.length === 0
        ? '—'
        : legs.length === 1
          ? legs[0].destination
          : `${legs[0].destination} +${legs.length - 1} more`,
    first_travel_date: legs[0]?.travel_date ?? null,
    number_of_travellers: request.number_of_travellers ?? 1,
    estimated_cost: estimatedCostOf(request.id),
    created_at: request.created_at,
    submitted_at: request.submitted_at,
  }
}

export interface ListOptions {
  /** Restrict to the viewer's own requests regardless of role. */
  onlyMine?: boolean
  /** Restrict to the statuses in this role's action queue. */
  onlyQueue?: boolean
  statuses?: TravelStatus[]
  search?: string
}

export async function listRequests(
  viewer: Viewer,
  options: ListOptions = {}
): Promise<TravelRequestSummary[]> {
  let rows = db.travel_requests.filter((r) => canView(r, viewer))

  if (options.onlyMine) {
    rows = rows.filter((r) => r.requester_id === viewer.profileId)
  }

  if (options.onlyQueue) {
    const queue = QUEUE_STATUSES[viewer.role] ?? []
    rows = rows.filter((r) => queue.includes(r.status))
  }

  if (options.statuses && options.statuses.length > 0) {
    rows = rows.filter((r) => options.statuses!.includes(r.status))
  }

  const summaries = rows
    .map(toSummary)
    .sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )

  if (options.search && options.search.trim()) {
    const q = options.search.trim().toLowerCase()
    return delay(
      summaries.filter(
        (s) =>
          s.request_number.toLowerCase().includes(q) ||
          s.requester_name.toLowerCase().includes(q) ||
          s.destination.toLowerCase().includes(q) ||
          s.project_code.toLowerCase().includes(q) ||
          s.department_name.toLowerCase().includes(q)
      )
    )
  }

  return delay(summaries)
}

export async function getRequest(
  id: string,
  viewer: Viewer
): Promise<TravelRequestDetail | null> {
  const request = db.travel_requests.find((r) => r.id === id)
  if (!request || !canView(request, viewer)) return delay(null)

  const travellerLinks = db.travel_request_travellers
    .filter((t) => t.travel_request_id === id)
    .sort((a, b) => (a.sequence_order ?? 0) - (b.sequence_order ?? 0))

  const itineraries: ItineraryWithBookings[] = db.itineraries
    .filter((i) => i.travel_request_id === id)
    .sort((a, b) => a.sequence - b.sequence)
    .map((leg) => ({
      ...leg,
      air_travel: db.air_travel.filter((r) => r.itinerary_id === leg.id),
      road_travel: db.road_travel.filter((r) => r.itinerary_id === leg.id),
      accommodation: db.accommodation.filter((r) => r.itinerary_id === leg.id),
      rental_vehicles: db.rental_vehicles.filter((r) => r.itinerary_id === leg.id),
    }))

  const detail: TravelRequestDetail = {
    ...request,
    requester: db.profiles.find((p) => p.id === request.requester_id) ?? null,
    department: db.departments.find((d) => d.id === request.department_id) ?? null,
    project: db.projects.find((p) => p.id === request.project_id) ?? null,
    travellers: travellerLinks
      .map((t) => db.profiles.find((p) => p.id === t.traveller_id))
      .filter((p): p is NonNullable<typeof p> => Boolean(p)),
    itineraries,
    approvals: db.approvals
      .filter((a) => a.travel_request_id === id)
      .sort(
        (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      ),
    budget_check: db.budget_checks.find((b) => b.travel_request_id === id) ?? null,
    audit_logs: db.audit_logs
      .filter((l) => l.travel_request_id === id)
      .sort(
        (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      ),
    estimated_cost: estimatedCostOf(id),
  }

  return delay(detail)
}

/** Rehydrate a saved request back into the wizard's draft shape. */
export async function getDraft(
  id: string,
  viewer: Viewer
): Promise<TravelRequestDraft | null> {
  const detail = await getRequest(id, viewer)
  if (!detail) return null

  const itineraries: DraftItinerary[] = detail.itineraries.map((leg) => {
    const air = leg.air_travel[0]
    const road = leg.road_travel[0]
    const acc = leg.accommodation[0]
    const veh = leg.rental_vehicles[0]

    return {
      key: leg.id,
      sequence: leg.sequence,
      travel_date: leg.travel_date,
      departure_time: leg.departure_time ?? '',
      origin: leg.origin,
      destination: leg.destination,
      transport_mode: leg.transport_mode,
      round_trip: leg.round_trip,
      return_date: air?.return_date ?? road?.return_date ?? '',

      flight_booking_by: leg.flight_booking_by,
      departure_airport: air?.departure_airport ?? '',
      destination_airport: air?.destination_airport ?? '',
      preferred_flight_time: air?.preferred_flight_time ?? '',
      baggage_requirements: air?.baggage_requirements ?? '',
      flight_estimated_cost: air?.ticket_cost != null ? String(air.ticket_cost) : '',

      accommodation_required: leg.accommodation_required,
      accommodation_booking_by: leg.accommodation_booking_by,
      check_in_date: acc?.check_in_date ?? '',
      check_out_date: acc?.check_out_date ?? '',
      accommodation_location: acc?.location ?? '',
      preferred_type: acc?.preferred_type ?? '',
      rooms_required: acc?.rooms_required ?? 1,
      accommodation_special_requirements: acc?.special_requirements ?? '',
      accommodation_estimated_cost:
        acc?.estimated_cost != null ? String(acc.estimated_cost) : '',

      vehicle_required: leg.vehicle_required,
      vehicle_booking_by: leg.vehicle_booking_by,
      vehicle_class: veh?.vehicle_class ?? road?.vehicle_class ?? 'NONE',
      own_vehicle: road?.own_vehicle ?? false,
      second_driver_required: veh?.second_driver_required ?? false,
      second_driver_id: veh?.second_driver_id ?? '',
      collection_location: veh?.collection_location ?? '',
      return_location: veh?.return_location ?? '',
      vehicle_estimated_cost:
        veh?.estimated_cost != null ? String(veh.estimated_cost) : '',

      notes: leg.notes ?? '',
    }
  })

  return {
    id: detail.id,
    request_number: detail.request_number,
    travel_type: detail.travel_type,
    project_id: detail.project_id,
    department_id: detail.department_id,
    is_multiple_itinerary: detail.is_multiple_itinerary,
    round_trip: detail.round_trip,
    traveller_ids: detail.travellers.map((t) => t.id),
    itineraries,
    business_activity: detail.business_activity ?? '',
    business_purpose: detail.business_purpose ?? '',
    travel_justification: detail.travel_justification,
    st_advance_required: detail.st_advance_required,
    st_advance_amount:
      detail.st_advance_amount != null ? String(detail.st_advance_amount) : '',
    st_advance_reason: detail.st_advance_reason ?? '',
    status: detail.status,
  }
}

// ----------------------------------------------------------------------------
// WRITE
// ----------------------------------------------------------------------------

/** Remove every child row belonging to a request, before rewriting them. */
function clearChildRows(requestId: string): void {
  const drop = <T extends { travel_request_id: string }>(rows: T[]): T[] =>
    rows.filter((r) => r.travel_request_id !== requestId)

  db.travel_request_travellers = drop(db.travel_request_travellers)
  db.itineraries = drop(db.itineraries)
  db.air_travel = drop(db.air_travel)
  db.road_travel = drop(db.road_travel)
  db.accommodation = drop(db.accommodation)
  db.rental_vehicles = drop(db.rental_vehicles)
}

/** Flatten the wizard draft into the normalised tables. */
function writeChildRows(requestId: string, draft: TravelRequestDraft): void {
  const ts = nowIso()

  draft.traveller_ids.forEach((travellerId, i) => {
    db.travel_request_travellers.push({
      id: newId(),
      travel_request_id: requestId,
      traveller_id: travellerId,
      sequence_order: i + 1,
      created_at: ts,
    })
  })

  draft.itineraries.forEach((leg, index) => {
    const itineraryId = newId()
    const needsAir =
      (leg.transport_mode === 'AIR' || leg.transport_mode === 'COMBINATION') &&
      leg.flight_booking_by !== 'NOT_REQUIRED'
    const needsRoad =
      leg.transport_mode === 'ROAD' || leg.transport_mode === 'COMBINATION'

    db.itineraries.push({
      id: itineraryId,
      travel_request_id: requestId,
      sequence: index + 1,
      travel_date: leg.travel_date,
      departure_time: leg.departure_time || null,
      origin: leg.origin.trim(),
      destination: leg.destination.trim(),
      transport_mode: leg.transport_mode,
      round_trip: leg.round_trip,
      flight_booking_by: leg.flight_booking_by,
      accommodation_required: leg.accommodation_required,
      accommodation_booking_by: leg.accommodation_booking_by,
      vehicle_required: leg.vehicle_required,
      vehicle_booking_by: leg.vehicle_booking_by,
      notes: leg.notes.trim() || null,
      created_at: ts,
      updated_at: ts,
    })

    if (needsAir) {
      const row: AirTravelRow = {
        id: newId(),
        travel_request_id: requestId,
        itinerary_id: itineraryId,
        departure_airport: leg.departure_airport.trim().toUpperCase(),
        destination_airport: leg.destination_airport.trim().toUpperCase(),
        departure_date: leg.travel_date,
        departure_time: leg.departure_time || null,
        preferred_flight_time: leg.preferred_flight_time || null,
        return_airport: leg.round_trip
          ? leg.departure_airport.trim().toUpperCase()
          : null,
        return_date: leg.round_trip ? leg.return_date || null : null,
        return_time: null,
        baggage_requirements: leg.baggage_requirements || null,
        special_requirements: null,
        notes: null,
        booking_by:
          leg.flight_booking_by === 'NOT_REQUIRED'
            ? 'TRAVEL_OFFICER'
            : leg.flight_booking_by,
        booking_status:
          leg.flight_booking_by === 'SELF_BOOK'
            ? 'SELF_BOOKING_REQUIRED'
            : 'AWAITING_BOOKING',
        airline_name: null,
        flight_number: null,
        confirmation_reference: null,
        // Pre-booking this holds the requester's estimate; the Travel Officer
        // overwrites it with the actual fare once booked.
        ticket_cost: toAmount(leg.flight_estimated_cost) || null,
        booking_date: null,
        confirmation_uploaded: false,
        created_at: ts,
        updated_at: ts,
      }
      db.air_travel.push(row)
    }

    if (needsRoad) {
      const row: RoadTravelRow = {
        id: newId(),
        travel_request_id: requestId,
        itinerary_id: itineraryId,
        origin: leg.origin.trim(),
        destination: leg.destination.trim(),
        departure_date: leg.travel_date,
        departure_time: leg.departure_time || null,
        return_date: leg.round_trip ? leg.return_date || null : null,
        return_time: null,
        vehicle_required: leg.vehicle_required,
        vehicle_class: leg.vehicle_required ? leg.vehicle_class : null,
        own_vehicle: leg.own_vehicle,
        second_driver_required: leg.second_driver_required,
        second_driver_id: leg.second_driver_id || null,
        notes: null,
        created_at: ts,
        updated_at: ts,
      }
      db.road_travel.push(row)
    }

    if (leg.accommodation_required) {
      const row: AccommodationRow = {
        id: newId(),
        travel_request_id: requestId,
        itinerary_id: itineraryId,
        check_in_date: leg.check_in_date,
        check_out_date: leg.check_out_date,
        nights_count: nightsBetween(leg.check_in_date, leg.check_out_date),
        location: leg.accommodation_location.trim(),
        preferred_type: leg.preferred_type || null,
        rooms_required: leg.rooms_required || 1,
        occupants_count: draft.traveller_ids.length,
        special_requirements: leg.accommodation_special_requirements || null,
        booking_by:
          leg.accommodation_booking_by === 'NOT_REQUIRED'
            ? 'TRAVEL_OFFICER'
            : leg.accommodation_booking_by,
        booking_status:
          leg.accommodation_booking_by === 'SELF_BOOK'
            ? 'SELF_BOOKING_REQUIRED'
            : 'AWAITING_BOOKING',
        provider_name: null,
        booking_reference: null,
        booking_date: null,
        estimated_cost: toAmount(leg.accommodation_estimated_cost) || null,
        actual_cost: null,
        confirmation_uploaded: false,
        created_at: ts,
        updated_at: ts,
      }
      db.accommodation.push(row)
    }

    if (leg.vehicle_required && !leg.own_vehicle) {
      const row: RentalVehicleRow = {
        id: newId(),
        travel_request_id: requestId,
        itinerary_id: itineraryId,
        vehicle_class: leg.vehicle_class === 'NONE' ? 'B_CLASS' : leg.vehicle_class,
        booking_by:
          leg.vehicle_booking_by === 'NOT_REQUIRED'
            ? 'TRAVEL_OFFICER'
            : leg.vehicle_booking_by,
        booking_status:
          leg.vehicle_booking_by === 'SELF_BOOK'
            ? 'SELF_BOOKING_REQUIRED'
            : 'AWAITING_BOOKING',
        second_driver_required: leg.second_driver_required,
        second_driver_id: leg.second_driver_id || null,
        collection_location: leg.collection_location || leg.destination.trim(),
        collection_date: leg.travel_date,
        collection_time: null,
        return_location: leg.return_location || leg.destination.trim(),
        return_date: leg.round_trip ? leg.return_date || null : null,
        return_time: null,
        rental_company: null,
        vehicle_type: null,
        booking_reference: null,
        estimated_cost: toAmount(leg.vehicle_estimated_cost) || null,
        actual_cost: null,
        notes: null,
        created_at: ts,
        updated_at: ts,
      }
      db.rental_vehicles.push(row)
    }
  })
}

export interface SaveResult {
  id: string
  request_number: string
}

/** Create or update a draft. Returns the persisted id and request number. */
export async function saveDraft(
  draft: TravelRequestDraft,
  requesterId: string
): Promise<SaveResult> {
  const ts = nowIso()
  let requestId = draft.id
  let requestNumber = draft.request_number

  if (requestId) {
    const existing = db.travel_requests.find((r) => r.id === requestId)
    if (!existing) throw new Error('Travel request not found')

    Object.assign(existing, {
      department_id: draft.department_id,
      project_id: draft.project_id,
      business_activity: draft.business_activity.trim() || null,
      business_purpose: draft.business_purpose.trim() || null,
      travel_justification: draft.travel_justification.trim(),
      number_of_travellers: draft.traveller_ids.length,
      travel_type: draft.travel_type,
      is_multiple_itinerary: draft.itineraries.length > 1,
      round_trip: draft.round_trip,
      st_advance_required: draft.st_advance_required,
      st_advance_amount: draft.st_advance_required
        ? toAmount(draft.st_advance_amount)
        : null,
      st_advance_reason: draft.st_advance_required
        ? draft.st_advance_reason.trim() || null
        : null,
      updated_at: ts,
    } satisfies Partial<TravelRequestRow>)

    requestNumber = existing.request_number
    clearChildRows(requestId)
  } else {
    requestId = newId()
    requestNumber = nextRequestNumber()
    const requester = db.profiles.find((p) => p.id === requesterId)

    db.travel_requests.push({
      id: requestId,
      request_number: requestNumber,
      requester_id: requesterId,
      department_id: draft.department_id || requester?.department_id || '',
      project_id: draft.project_id,
      business_activity: draft.business_activity.trim() || null,
      business_purpose: draft.business_purpose.trim() || null,
      travel_justification: draft.travel_justification.trim(),
      number_of_travellers: draft.traveller_ids.length,
      travel_type: draft.travel_type,
      is_multiple_itinerary: draft.itineraries.length > 1,
      round_trip: draft.round_trip,
      st_advance_required: draft.st_advance_required,
      st_advance_amount: draft.st_advance_required
        ? toAmount(draft.st_advance_amount)
        : null,
      st_advance_reason: draft.st_advance_required
        ? draft.st_advance_reason.trim() || null
        : null,
      status: 'DRAFT',
      created_at: ts,
      updated_at: ts,
      submitted_at: null,
    })

    db.audit_logs.push({
      id: newId(),
      user_id: requesterId,
      travel_request_id: requestId,
      action: 'CREATED',
      previous_status: null,
      new_status: 'DRAFT',
      comments: 'Travel request created.',
      metadata: null,
      created_at: ts,
    })
  }

  writeChildRows(requestId, draft)
  saveDb()

  return delay({ id: requestId, request_number: requestNumber! })
}

/**
 * Submit a draft for approval. Moves the request into HOD_REVIEW, opens a
 * pending HOD approval, records the commitment and writes the audit entry.
 *
 * Mirrors the transition rules in WORKFLOW_STATE_MACHINE.md.
 */
export async function submitRequest(
  requestId: string,
  actorId: string
): Promise<void> {
  const request = db.travel_requests.find((r) => r.id === requestId)
  if (!request) throw new Error('Travel request not found')
  if (!['DRAFT', 'AWAITING_ITINERARY'].includes(request.status)) {
    throw new Error(`Cannot submit a request with status ${request.status}`)
  }

  const ts = nowIso()
  const previous = request.status
  request.status = 'HOD_REVIEW'
  request.submitted_at = ts
  request.updated_at = ts

  // Route to the department's HOD; fall back to any HOD if unset.
  const department = db.departments.find((d) => d.id === request.department_id)
  const hodId =
    department?.hod_user_id ??
    db.profiles.find((p) => p.role === 'HOD' && p.department_id === request.department_id)
      ?.id ??
    db.profiles.find((p) => p.role === 'HOD')?.id

  if (hodId) {
    db.approvals.push({
      id: newId(),
      travel_request_id: requestId,
      approver_id: hodId,
      approval_type: 'HOD',
      status: 'PENDING',
      comments: null,
      approved_at: null,
      response_at: null,
      created_at: ts,
      updated_at: ts,
    })

    db.notifications.push({
      id: newId(),
      travel_request_id: requestId,
      recipient_id: hodId,
      email_type: 'HOD_APPROVAL_REQUIRED',
      status: 'QUEUED',
      provider_message_id: null,
      error_message: null,
      sent_at: null,
      created_at: ts,
    })
  }

  const cost = estimatedCostOf(requestId)
  const existingCommitment = db.project_travel_commitments.find(
    (c) => c.travel_request_id === requestId
  )
  if (existingCommitment) {
    existingCommitment.committed_amount = cost
    existingCommitment.updated_at = ts
  } else {
    db.project_travel_commitments.push({
      id: newId(),
      project_id: request.project_id,
      travel_request_id: requestId,
      committed_amount: cost,
      actual_amount: null,
      status: 'ESTIMATED',
      created_at: ts,
      updated_at: ts,
    })
  }

  db.audit_logs.push({
    id: newId(),
    user_id: actorId,
    travel_request_id: requestId,
    action: 'SUBMITTED',
    previous_status: previous,
    new_status: 'HOD_REVIEW',
    comments: 'Submitted for HOD approval.',
    metadata: null,
    created_at: ts,
  })

  saveDb()
  await delay(null)
}

/** Delete a draft. Only DRAFT requests can be deleted. */
export async function deleteDraft(requestId: string): Promise<void> {
  const request = db.travel_requests.find((r) => r.id === requestId)
  if (!request) throw new Error('Travel request not found')
  if (request.status !== 'DRAFT') {
    throw new Error('Only drafts can be deleted')
  }
  clearChildRows(requestId)
  db.travel_requests = db.travel_requests.filter((r) => r.id !== requestId)
  db.audit_logs = db.audit_logs.filter((l) => l.travel_request_id !== requestId)
  db.project_travel_commitments = db.project_travel_commitments.filter(
    (c) => c.travel_request_id !== requestId
  )
  saveDb()
  await delay(null)
}

// ----------------------------------------------------------------------------
// BUDGET
// ----------------------------------------------------------------------------

export interface BudgetPosition {
  project_travel_budget: number
  existing_commitments: number
  current_request_cost: number
  remaining_before_request: number
  remaining_after_request: number
  is_budget_exception: boolean
  amount_over_budget: number
}

/**
 * Work out where a request sits against its project's travel budget.
 * Used by the wizard's review step and, later, by the Finance review panel.
 */
export async function checkBudget(
  projectId: string,
  cost: number,
  excludeRequestId?: string
): Promise<BudgetPosition | null> {
  const project = db.projects.find((p) => p.id === projectId)
  if (!project) return delay(null)

  const existing = db.project_travel_commitments
    .filter(
      (c) =>
        c.project_id === projectId &&
        c.travel_request_id !== excludeRequestId &&
        c.status !== 'CANCELLED'
    )
    .reduce((s, c) => s + (c.actual_amount ?? c.committed_amount), 0)

  const remainingBefore = project.travel_budget - existing
  const remainingAfter = remainingBefore - cost

  return delay({
    project_travel_budget: project.travel_budget,
    existing_commitments: existing,
    current_request_cost: cost,
    remaining_before_request: remainingBefore,
    remaining_after_request: remainingAfter,
    is_budget_exception: remainingAfter < 0,
    amount_over_budget: remainingAfter < 0 ? Math.abs(remainingAfter) : 0,
  })
}

/** Convenience wrapper for the wizard, which works from an unsaved draft. */
export async function checkDraftBudget(
  draft: TravelRequestDraft
): Promise<BudgetPosition | null> {
  if (!draft.project_id) return null
  return checkBudget(draft.project_id, estimateDraftCost(draft), draft.id)
}

// ----------------------------------------------------------------------------
// DASHBOARD STATS
// ----------------------------------------------------------------------------

export interface DashboardStats {
  myRequests: number
  myDrafts: number
  pendingMyApproval: number
  inFlight: number
  fullyApproved: number
  totalCommitted: number
  totalTravelBudget: number
  budgetExceptions: number
  visibleTotal: number
}

export async function getDashboardStats(viewer: Viewer): Promise<DashboardStats> {
  const visible = db.travel_requests.filter((r) => canView(r, viewer))
  const mine = db.travel_requests.filter((r) => r.requester_id === viewer.profileId)
  const queue = QUEUE_STATUSES[viewer.role] ?? []

  const activeCommitments = db.project_travel_commitments.filter(
    (c) => c.status !== 'CANCELLED'
  )

  return delay({
    myRequests: mine.length,
    myDrafts: mine.filter((r) => r.status === 'DRAFT').length,
    pendingMyApproval: visible.filter((r) => queue.includes(r.status)).length,
    inFlight: visible.filter((r) =>
      [
        'SUBMITTED',
        'HOD_REVIEW',
        'HOD_APPROVED',
        'TRAVEL_OFFICER_REVIEW',
        'TRAVEL_PROCESSING',
        'FINANCE_REVIEW',
        'BUDGET_EXCEPTION',
        'CEO_APPROVAL',
      ].includes(r.status)
    ).length,
    fullyApproved: visible.filter((r) =>
      ['FULLY_APPROVED', 'BOOKING_COMPLETE', 'TRAVEL_COMPLETED'].includes(r.status)
    ).length,
    totalCommitted: activeCommitments.reduce(
      (s, c) => s + (c.actual_amount ?? c.committed_amount),
      0
    ),
    totalTravelBudget: db.projects
      .filter((p) => p.active)
      .reduce((s, p) => s + p.travel_budget, 0),
    budgetExceptions: visible.filter(
      (r) => r.status === 'BUDGET_EXCEPTION' || r.status === 'CEO_APPROVAL'
    ).length,
    visibleTotal: visible.length,
  })
}
