// ============================================================================
// Travel request draft helpers
//
// Pure functions: building an empty draft, costing it, and validating each
// wizard step. No data access here — see src/services/.
// ============================================================================

import type {
  DraftItinerary,
  TravelRequestDraft,
  ValidationErrors,
  WizardStepId,
} from '@/types/travel-request'
import { newId } from './mock-db'

/** ISO date 'YYYY-MM-DD' n days from today. */
function dateOffset(days: number): string {
  const d = new Date()
  d.setDate(d.getDate() + days)
  return d.toISOString().slice(0, 10)
}

export function emptyItinerary(sequence: number): DraftItinerary {
  return {
    key: newId(),
    sequence,
    travel_date: dateOffset(14),
    departure_time: '',
    origin: '',
    destination: '',
    transport_mode: 'ROAD',
    round_trip: true,
    return_date: dateOffset(16),

    flight_booking_by: 'NOT_REQUIRED',
    departure_airport: '',
    destination_airport: '',
    preferred_flight_time: '',
    baggage_requirements: '',
    flight_estimated_cost: '',

    accommodation_required: false,
    accommodation_booking_by: 'NOT_REQUIRED',
    check_in_date: '',
    check_out_date: '',
    accommodation_location: '',
    preferred_type: '',
    rooms_required: 1,
    accommodation_special_requirements: '',
    accommodation_estimated_cost: '',

    vehicle_required: false,
    vehicle_booking_by: 'NOT_REQUIRED',
    vehicle_class: 'NONE',
    own_vehicle: false,
    second_driver_required: false,
    second_driver_id: '',
    collection_location: '',
    return_location: '',
    vehicle_estimated_cost: '',

    notes: '',
  }
}

export function emptyDraft(
  requesterDepartmentId: string,
  requesterId: string
): TravelRequestDraft {
  return {
    travel_type: 'ROAD',
    project_id: '',
    department_id: requesterDepartmentId,
    is_multiple_itinerary: false,
    round_trip: true,
    traveller_ids: [requesterId],
    itineraries: [emptyItinerary(1)],
    business_activity: '',
    business_purpose: '',
    travel_justification: '',
    st_advance_required: false,
    st_advance_amount: '',
    st_advance_reason: '',
    status: 'DRAFT',
  }
}

/** Parse a currency-ish text input to a number, treating blanks as 0. */
export function toAmount(value: string | number | null | undefined): number {
  if (value === null || value === undefined || value === '') return 0
  const n = typeof value === 'number' ? value : parseFloat(String(value).replace(/[^0-9.-]/g, ''))
  return Number.isFinite(n) ? n : 0
}

/** Total estimated cost of a draft, used for the budget check. */
export function estimateDraftCost(draft: TravelRequestDraft): number {
  const legs = draft.itineraries.reduce(
    (sum, leg) =>
      sum +
      toAmount(leg.flight_estimated_cost) +
      toAmount(leg.accommodation_estimated_cost) +
      toAmount(leg.vehicle_estimated_cost),
    0
  )
  return legs + (draft.st_advance_required ? toAmount(draft.st_advance_amount) : 0)
}

/** Nights between two ISO dates, floored at 0. */
export function nightsBetween(checkIn: string, checkOut: string): number {
  if (!checkIn || !checkOut) return 0
  const a = new Date(checkIn).getTime()
  const b = new Date(checkOut).getTime()
  if (Number.isNaN(a) || Number.isNaN(b)) return 0
  return Math.max(0, Math.round((b - a) / 86_400_000))
}

const AIRPORT_RE = /^[A-Z]{3}$/

/**
 * Validate one wizard step. Returns a map of field path -> message.
 * Field paths for itinerary fields are `itin.<index>.<field>`.
 */
export function validateStep(
  step: WizardStepId,
  draft: TravelRequestDraft
): ValidationErrors {
  const errors: ValidationErrors = {}

  if (step === 'trip') {
    if (!draft.project_id) errors.project_id = 'Select the project this travel is charged to'
    if (!draft.department_id) errors.department_id = 'Select a department'
  }

  if (step === 'travellers') {
    if (draft.traveller_ids.length === 0) {
      errors.traveller_ids = 'Add at least one traveller'
    }
  }

  if (step === 'itinerary') {
    if (draft.itineraries.length === 0) {
      errors.itineraries = 'Add at least one leg'
    }
    draft.itineraries.forEach((leg, i) => {
      const p = `itin.${i}`
      if (!leg.origin.trim()) errors[`${p}.origin`] = 'Required'
      if (!leg.destination.trim()) errors[`${p}.destination`] = 'Required'
      if (!leg.travel_date) errors[`${p}.travel_date`] = 'Required'
      if (leg.round_trip) {
        if (!leg.return_date) {
          errors[`${p}.return_date`] = 'Required for a return trip'
        } else if (leg.return_date < leg.travel_date) {
          errors[`${p}.return_date`] = 'Return cannot be before departure'
        }
      }
      const needsAir =
        leg.transport_mode === 'AIR' || leg.transport_mode === 'COMBINATION'
      if (needsAir && leg.flight_booking_by !== 'NOT_REQUIRED') {
        if (!AIRPORT_RE.test(leg.departure_airport.trim().toUpperCase())) {
          errors[`${p}.departure_airport`] = 'Use a 3-letter code, e.g. CPT'
        }
        if (!AIRPORT_RE.test(leg.destination_airport.trim().toUpperCase())) {
          errors[`${p}.destination_airport`] = 'Use a 3-letter code, e.g. JNB'
        }
      }
    })
  }

  if (step === 'logistics') {
    draft.itineraries.forEach((leg, i) => {
      const p = `itin.${i}`
      if (leg.accommodation_required) {
        if (!leg.accommodation_location.trim()) {
          errors[`${p}.accommodation_location`] = 'Where is accommodation needed?'
        }
        if (!leg.check_in_date) errors[`${p}.check_in_date`] = 'Required'
        if (!leg.check_out_date) {
          errors[`${p}.check_out_date`] = 'Required'
        } else if (leg.check_out_date <= leg.check_in_date) {
          errors[`${p}.check_out_date`] = 'Check-out must be after check-in'
        }
        if (leg.accommodation_booking_by === 'NOT_REQUIRED') {
          errors[`${p}.accommodation_booking_by`] = 'Choose who books'
        }
      }
      if (leg.vehicle_required) {
        if (leg.vehicle_class === 'NONE') {
          errors[`${p}.vehicle_class`] = 'Select a vehicle class'
        }
        if (leg.vehicle_booking_by === 'NOT_REQUIRED') {
          errors[`${p}.vehicle_booking_by`] = 'Choose who books'
        }
        if (leg.second_driver_required && !leg.second_driver_id) {
          errors[`${p}.second_driver_id`] = 'Select the second driver'
        }
      }
    })
  }

  if (step === 'business') {
    if (!draft.business_activity.trim()) {
      errors.business_activity = 'Give the activity a short name'
    }
    if (!draft.business_purpose.trim()) {
      errors.business_purpose = 'Describe the business purpose'
    }
    const j = draft.travel_justification.trim()
    if (!j) {
      errors.travel_justification = 'Justification is mandatory'
    } else if (j.length < 40) {
      errors.travel_justification =
        'Please give a fuller justification (at least 40 characters) — approvers rely on this'
    }
  }

  if (step === 'advance') {
    if (draft.st_advance_required) {
      const amount = toAmount(draft.st_advance_amount)
      if (amount <= 0) errors.st_advance_amount = 'Enter the advance amount'
      if (!draft.st_advance_reason.trim()) {
        errors.st_advance_reason = 'Explain what the advance covers'
      }
    }
  }

  return errors
}

/** Every step that currently has errors — used to gate final submission. */
export function validateAll(draft: TravelRequestDraft): ValidationErrors {
  return {
    ...validateStep('trip', draft),
    ...validateStep('travellers', draft),
    ...validateStep('itinerary', draft),
    ...validateStep('logistics', draft),
    ...validateStep('business', draft),
    ...validateStep('advance', draft),
  }
}
