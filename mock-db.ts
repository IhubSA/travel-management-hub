// ============================================================================
// Mock database
//
// An in-memory store shaped exactly like the Postgres tables defined in
// 001_initial_schema.sql. Every record uses the real column names, so the
// services layer that reads from here can be repointed at Supabase without
// touching a single component.
//
// TO SWITCH TO SUPABASE: this file becomes unused. The service functions in
// src/services/*.ts are the only place that talks to it.
// ============================================================================

import type {
  AccommodationRow,
  AirTravelRow,
  ApprovalRow,
  AttachmentRow,
  AuditLogRow,
  BudgetCheckRow,
  DepartmentRow,
  ItineraryRow,
  NotificationRow,
  ProfileRow,
  ProjectRow,
  ProjectTravelCommitmentRow,
  RentalVehicleRow,
  RoadTravelRow,
  TravelRequestRow,
  TravelRequestTravellerRow,
} from '@/types/database'

// ----------------------------------------------------------------------------
// HELPERS
// ----------------------------------------------------------------------------

/** Deterministic UUID-shaped id, so seeded relationships are readable. */
function fixedId(group: number, index: number): string {
  return `${String(group).padStart(8, '0')}-0000-4000-8000-${String(index).padStart(12, '0')}`
}

/** Random UUID for records created at runtime. */
export function newId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

export function nowIso(): string {
  return new Date().toISOString()
}

/** 'YYYY-MM-DD' offset from today, so seed data never looks stale. */
function dateOffset(days: number): string {
  const d = new Date()
  d.setDate(d.getDate() + days)
  return d.toISOString().slice(0, 10)
}

/** ISO timestamp offset from now. */
function timeOffset(days: number): string {
  const d = new Date()
  d.setDate(d.getDate() + days)
  return d.toISOString()
}

// ----------------------------------------------------------------------------
// SEED: DEPARTMENTS
// ----------------------------------------------------------------------------

const D = {
  OPS: fixedId(1, 1),
  FIN: fixedId(1, 2),
  ADM: fixedId(1, 3),
  PROG: fixedId(1, 4),
  MGMT: fixedId(1, 5),
}

// ----------------------------------------------------------------------------
// SEED: PROFILES
// ----------------------------------------------------------------------------

const P = {
  ADMIN: fixedId(2, 1),
  CEO: fixedId(2, 2),
  FINANCE: fixedId(2, 3),
  TRAVEL_OFFICER: fixedId(2, 4),
  HOD_OPS: fixedId(2, 5),
  HOD_PROG: fixedId(2, 6),
  STAFF_NOMSA: fixedId(2, 7),
  STAFF_PIETER: fixedId(2, 8),
  STAFF_THABO: fixedId(2, 9),
  STAFF_ZANELE: fixedId(2, 10),
  STAFF_RIAAN: fixedId(2, 11),
}

// ----------------------------------------------------------------------------
// SEED: PROJECTS
// ----------------------------------------------------------------------------

const PR = {
  RURAL_ECD: fixedId(3, 1),
  YOUTH_SKILLS: fixedId(3, 2),
  FOOD_SECURITY: fixedId(3, 3),
  WATER_SANITATION: fixedId(3, 4),
  CORE_OPS: fixedId(3, 5),
}

// ----------------------------------------------------------------------------
// STORE
// ----------------------------------------------------------------------------

export interface MockDatabase {
  departments: DepartmentRow[]
  profiles: ProfileRow[]
  projects: ProjectRow[]
  travel_requests: TravelRequestRow[]
  travel_request_travellers: TravelRequestTravellerRow[]
  itineraries: ItineraryRow[]
  air_travel: AirTravelRow[]
  road_travel: RoadTravelRow[]
  accommodation: AccommodationRow[]
  rental_vehicles: RentalVehicleRow[]
  project_travel_commitments: ProjectTravelCommitmentRow[]
  approvals: ApprovalRow[]
  budget_checks: BudgetCheckRow[]
  attachments: AttachmentRow[]
  notifications: NotificationRow[]
  audit_logs: AuditLogRow[]
}

function seedDepartments(): DepartmentRow[] {
  const base = { active: true, created_at: timeOffset(-400), updated_at: timeOffset(-400) }
  return [
    { id: D.OPS, name: 'Operations', code: 'OPS', hod_user_id: P.HOD_OPS, ...base },
    { id: D.FIN, name: 'Finance', code: 'FIN', hod_user_id: P.FINANCE, ...base },
    { id: D.ADM, name: 'Administration', code: 'ADM', hod_user_id: P.CEO, ...base },
    { id: D.PROG, name: 'Programmes', code: 'PROG', hod_user_id: P.HOD_PROG, ...base },
    { id: D.MGMT, name: 'Management', code: 'MGMT', hod_user_id: P.CEO, ...base },
  ]
}

function seedProfiles(): ProfileRow[] {
  const base = {
    active: true,
    created_at: timeOffset(-400),
    updated_at: timeOffset(-400),
  }
  const mk = (
    id: string,
    first_name: string,
    last_name: string,
    email: string,
    role: ProfileRow['role'],
    department_id: string,
    job_title: string,
    employee_ref: string,
    phone: string
  ): ProfileRow => ({
    id,
    auth_user_id: id,
    first_name,
    last_name,
    email,
    phone,
    department_id,
    job_title,
    role,
    employee_ref,
    ...base,
  })

  return [
    mk(P.ADMIN, 'System', 'Administrator', 'admin@angelsrc.org.za', 'SUPER_ADMIN', D.ADM, 'Systems Administrator', 'ARC-001', '+27 21 555 0101'),
    mk(P.CEO, 'Miriam', 'Ngcobo', 'ceo@angelsrc.org.za', 'CEO', D.MGMT, 'Chief Executive Officer', 'ARC-002', '+27 21 555 0102'),
    mk(P.FINANCE, 'Deon', 'van Wyk', 'finance@angelsrc.org.za', 'FINANCE', D.FIN, 'Finance Manager', 'ARC-003', '+27 21 555 0103'),
    mk(P.TRAVEL_OFFICER, 'Lerato', 'Mokoena', 'travel@angelsrc.org.za', 'TRAVEL_OFFICER', D.ADM, 'Travel Officer', 'ARC-004', '+27 21 555 0104'),
    mk(P.HOD_OPS, 'Sipho', 'Dlamini', 'sipho.dlamini@angelsrc.org.za', 'HOD', D.OPS, 'Head of Operations', 'ARC-005', '+27 21 555 0105'),
    mk(P.HOD_PROG, 'Annelie', 'Botha', 'annelie.botha@angelsrc.org.za', 'HOD', D.PROG, 'Head of Programmes', 'ARC-006', '+27 21 555 0106'),
    mk(P.STAFF_NOMSA, 'Nomsa', 'Khumalo', 'nomsa.khumalo@angelsrc.org.za', 'STAFF', D.PROG, 'Programme Coordinator', 'ARC-007', '+27 21 555 0107'),
    mk(P.STAFF_PIETER, 'Pieter', 'Steyn', 'pieter.steyn@angelsrc.org.za', 'STAFF', D.OPS, 'Field Officer', 'ARC-008', '+27 21 555 0108'),
    mk(P.STAFF_THABO, 'Thabo', 'Maseko', 'thabo.maseko@angelsrc.org.za', 'STAFF', D.PROG, 'Monitoring & Evaluation Officer', 'ARC-009', '+27 21 555 0109'),
    mk(P.STAFF_ZANELE, 'Zanele', 'Mbeki', 'zanele.mbeki@angelsrc.org.za', 'STAFF', D.OPS, 'Community Liaison Officer', 'ARC-010', '+27 21 555 0110'),
    mk(P.STAFF_RIAAN, 'Riaan', 'du Plessis', 'riaan.duplessis@angelsrc.org.za', 'STAFF', D.OPS, 'Logistics Coordinator', 'ARC-011', '+27 21 555 0111'),
  ]
}

function seedProjects(): ProjectRow[] {
  const base = {
    active: true,
    created_at: timeOffset(-360),
    updated_at: timeOffset(-360),
    start_date: dateOffset(-330),
    end_date: dateOffset(400),
  }
  return [
    {
      id: PR.RURAL_ECD,
      project_code: 'ARC-ECD-24',
      project_name: 'Rural Early Childhood Development',
      description: 'ECD practitioner training and centre support across Eastern Cape rural nodes.',
      project_manager_id: P.HOD_PROG,
      budget: 4_800_000,
      travel_budget: 320_000,
      ...base,
    },
    {
      id: PR.YOUTH_SKILLS,
      project_code: 'ARC-YTH-24',
      project_name: 'Youth Skills & Enterprise',
      description: 'Skills development and enterprise incubation for rural youth.',
      project_manager_id: P.HOD_PROG,
      budget: 3_200_000,
      travel_budget: 180_000,
      ...base,
    },
    {
      id: PR.FOOD_SECURITY,
      project_code: 'ARC-FSC-24',
      project_name: 'Household Food Security',
      description: 'Homestead food gardens and smallholder farmer support.',
      project_manager_id: P.HOD_OPS,
      budget: 2_600_000,
      travel_budget: 145_000,
      ...base,
    },
    {
      id: PR.WATER_SANITATION,
      project_code: 'ARC-WSH-25',
      project_name: 'Water, Sanitation & Hygiene',
      description: 'Borehole rehabilitation and WASH education in under-served wards.',
      project_manager_id: P.HOD_OPS,
      budget: 5_400_000,
      travel_budget: 260_000,
      ...base,
    },
    {
      id: PR.CORE_OPS,
      project_code: 'ARC-CORE',
      project_name: 'Core Operations & Governance',
      description: 'Organisational running costs, board and governance activities.',
      project_manager_id: P.CEO,
      budget: 1_900_000,
      travel_budget: 95_000,
      ...base,
    },
  ]
}

// ----------------------------------------------------------------------------
// SEED: TRAVEL REQUESTS
// ----------------------------------------------------------------------------

interface SeedRequestSpec {
  index: number
  requester_id: string
  department_id: string
  project_id: string
  status: TravelRequestRow['status']
  travel_type: TravelRequestRow['travel_type']
  business_activity: string
  business_purpose: string
  travel_justification: string
  travellers: string[]
  createdDaysAgo: number
  submittedDaysAgo: number | null
  leg: {
    travel_date: string
    origin: string
    destination: string
    transport_mode: ItineraryRow['transport_mode']
    round_trip: boolean
    return_date?: string
  }
  air?: {
    departure_airport: string
    destination_airport: string
    return_airport?: string
    booking_by: AirTravelRow['booking_by']
    booking_status: AirTravelRow['booking_status']
    ticket_cost: number
    airline_name?: string
    flight_number?: string
    confirmation_reference?: string
  }
  road?: {
    vehicle_required: boolean
    own_vehicle: boolean
    vehicle_class: RoadTravelRow['vehicle_class']
  }
  accommodation?: {
    nights: number
    location: string
    rooms_required: number
    booking_by: AccommodationRow['booking_by']
    booking_status: AccommodationRow['booking_status']
    estimated_cost: number
    provider_name?: string
  }
  vehicle?: {
    vehicle_class: RentalVehicleRow['vehicle_class']
    booking_by: RentalVehicleRow['booking_by']
    booking_status: RentalVehicleRow['booking_status']
    estimated_cost: number
    rental_company?: string
  }
  st_advance?: { amount: number; reason: string }
  approvals?: Array<{
    type: ApprovalRow['approval_type']
    approver_id: string
    status: ApprovalRow['status']
    comments?: string
    daysAgo: number
  }>
  budget_exception?: boolean
}

const SEED_REQUESTS: SeedRequestSpec[] = [
  {
    index: 1,
    requester_id: P.STAFF_NOMSA,
    department_id: D.PROG,
    project_id: PR.RURAL_ECD,
    status: 'DRAFT',
    travel_type: 'ROAD',
    business_activity: 'ECD centre monitoring visit',
    business_purpose: 'Quarterly monitoring of six supported ECD centres in the Mthatha node.',
    travel_justification:
      'Quarterly on-site monitoring is a donor reporting requirement. Centres cannot be assessed remotely as practitioner observation and facility checks must be done in person.',
    travellers: [P.STAFF_NOMSA, P.STAFF_THABO],
    createdDaysAgo: 2,
    submittedDaysAgo: null,
    leg: {
      travel_date: dateOffset(21),
      origin: 'Cape Town',
      destination: 'Mthatha',
      transport_mode: 'ROAD',
      round_trip: true,
      return_date: dateOffset(25),
    },
    road: { vehicle_required: true, own_vehicle: false, vehicle_class: 'O_CLASS' },
    accommodation: {
      nights: 4,
      location: 'Mthatha',
      rooms_required: 2,
      booking_by: 'TRAVEL_OFFICER',
      booking_status: 'AWAITING_BOOKING',
      estimated_cost: 7200,
    },
    vehicle: {
      vehicle_class: 'O_CLASS',
      booking_by: 'TRAVEL_OFFICER',
      booking_status: 'AWAITING_BOOKING',
      estimated_cost: 6800,
    },
  },
  {
    index: 2,
    requester_id: P.STAFF_PIETER,
    department_id: D.OPS,
    project_id: PR.WATER_SANITATION,
    status: 'HOD_REVIEW',
    travel_type: 'AIR_AND_ROAD',
    business_activity: 'Borehole site inspection',
    business_purpose: 'Inspect four rehabilitated borehole sites and sign off contractor completion certificates.',
    travel_justification:
      'Contractor payment is conditional on physical sign-off of completed works. Sites are 90km apart in Limpopo and require a hire vehicle from Polokwane.',
    travellers: [P.STAFF_PIETER],
    createdDaysAgo: 5,
    submittedDaysAgo: 3,
    leg: {
      travel_date: dateOffset(14),
      origin: 'Cape Town',
      destination: 'Polokwane',
      transport_mode: 'COMBINATION',
      round_trip: true,
      return_date: dateOffset(17),
    },
    air: {
      departure_airport: 'CPT',
      destination_airport: 'PTG',
      return_airport: 'CPT',
      booking_by: 'TRAVEL_OFFICER',
      booking_status: 'AWAITING_BOOKING',
      ticket_cost: 5400,
    },
    accommodation: {
      nights: 3,
      location: 'Polokwane',
      rooms_required: 1,
      booking_by: 'TRAVEL_OFFICER',
      booking_status: 'AWAITING_BOOKING',
      estimated_cost: 3900,
    },
    vehicle: {
      vehicle_class: 'O_CLASS',
      booking_by: 'TRAVEL_OFFICER',
      booking_status: 'AWAITING_BOOKING',
      estimated_cost: 4200,
    },
    approvals: [{ type: 'HOD', approver_id: P.HOD_OPS, status: 'PENDING', daysAgo: 3 }],
  },
  {
    index: 3,
    requester_id: P.STAFF_ZANELE,
    department_id: D.OPS,
    project_id: PR.FOOD_SECURITY,
    status: 'TRAVEL_OFFICER_REVIEW',
    travel_type: 'AIR',
    business_activity: 'Smallholder farmer indaba',
    business_purpose: 'Represent Angels RC at the national smallholder farmer indaba in Bloemfontein.',
    travel_justification:
      'Angels RC is presenting our homestead garden model. Attendance was funded by the donor as part of the dissemination workplan.',
    travellers: [P.STAFF_ZANELE, P.HOD_OPS],
    createdDaysAgo: 9,
    submittedDaysAgo: 8,
    leg: {
      travel_date: dateOffset(11),
      origin: 'Cape Town',
      destination: 'Bloemfontein',
      transport_mode: 'AIR',
      round_trip: true,
      return_date: dateOffset(13),
    },
    air: {
      departure_airport: 'CPT',
      destination_airport: 'BFN',
      return_airport: 'CPT',
      booking_by: 'TRAVEL_OFFICER',
      booking_status: 'BOOKING_IN_PROGRESS',
      ticket_cost: 8600,
    },
    accommodation: {
      nights: 2,
      location: 'Bloemfontein',
      rooms_required: 2,
      booking_by: 'TRAVEL_OFFICER',
      booking_status: 'AWAITING_BOOKING',
      estimated_cost: 4400,
    },
    approvals: [
      { type: 'HOD', approver_id: P.HOD_OPS, status: 'APPROVED', comments: 'Approved. Please share the presentation with the team on return.', daysAgo: 6 },
    ],
  },
  {
    index: 4,
    requester_id: P.STAFF_THABO,
    department_id: D.PROG,
    project_id: PR.YOUTH_SKILLS,
    status: 'FINANCE_REVIEW',
    travel_type: 'AIR',
    business_activity: 'Youth programme evaluation workshop',
    business_purpose: 'Facilitate the mid-term evaluation workshop with implementing partners in Durban.',
    travel_justification:
      'Mid-term evaluation is a contractual donor milestone. Partner facilitators and beneficiaries must be convened in person.',
    travellers: [P.STAFF_THABO, P.STAFF_NOMSA],
    createdDaysAgo: 14,
    submittedDaysAgo: 13,
    leg: {
      travel_date: dateOffset(8),
      origin: 'Cape Town',
      destination: 'Durban',
      transport_mode: 'AIR',
      round_trip: true,
      return_date: dateOffset(11),
    },
    air: {
      departure_airport: 'CPT',
      destination_airport: 'DUR',
      return_airport: 'CPT',
      booking_by: 'TRAVEL_OFFICER',
      booking_status: 'CONFIRMATION_RECEIVED',
      ticket_cost: 9800,
      airline_name: 'FlySafair',
      flight_number: 'FA 262',
      confirmation_reference: 'FS8K2P',
    },
    accommodation: {
      nights: 3,
      location: 'Durban',
      rooms_required: 2,
      booking_by: 'TRAVEL_OFFICER',
      booking_status: 'BOOKED',
      estimated_cost: 6600,
      provider_name: 'Garden Court Umhlanga',
    },
    st_advance: { amount: 2400, reason: 'Meals and local transport for two staff over three days.' },
    approvals: [
      { type: 'HOD', approver_id: P.HOD_PROG, status: 'APPROVED', comments: 'Approved.', daysAgo: 11 },
      { type: 'TRAVEL_OFFICER', approver_id: P.TRAVEL_OFFICER, status: 'APPROVED', comments: 'Flights and accommodation confirmed.', daysAgo: 4 },
      { type: 'FINANCE', approver_id: P.FINANCE, status: 'PENDING', daysAgo: 4 },
    ],
  },
  {
    index: 5,
    requester_id: P.HOD_PROG,
    department_id: D.PROG,
    project_id: PR.YOUTH_SKILLS,
    status: 'CEO_APPROVAL',
    travel_type: 'AIR',
    business_activity: 'Donor engagement - Johannesburg',
    business_purpose: 'Present the youth programme results to the funding partner and negotiate the follow-on grant.',
    travel_justification:
      'The funder requested an in-person presentation ahead of their board meeting. The follow-on grant represents R3.1m of programme funding.',
    travellers: [P.HOD_PROG, P.CEO],
    createdDaysAgo: 12,
    submittedDaysAgo: 11,
    leg: {
      travel_date: dateOffset(6),
      origin: 'Cape Town',
      destination: 'Johannesburg',
      transport_mode: 'AIR',
      round_trip: true,
      return_date: dateOffset(8),
    },
    air: {
      departure_airport: 'CPT',
      destination_airport: 'JNB',
      return_airport: 'CPT',
      booking_by: 'TRAVEL_OFFICER',
      booking_status: 'BOOKED',
      ticket_cost: 14200,
      airline_name: 'SAA',
      flight_number: 'SA 322',
      confirmation_reference: 'SA71QW',
    },
    accommodation: {
      nights: 2,
      location: 'Sandton, Johannesburg',
      rooms_required: 2,
      booking_by: 'TRAVEL_OFFICER',
      booking_status: 'BOOKED',
      estimated_cost: 9800,
      provider_name: 'City Lodge Sandton',
    },
    vehicle: {
      vehicle_class: 'B_CLASS',
      booking_by: 'TRAVEL_OFFICER',
      booking_status: 'BOOKED',
      estimated_cost: 3100,
      rental_company: 'Avis',
    },
    approvals: [
      { type: 'HOD', approver_id: P.CEO, status: 'APPROVED', comments: 'Approved - critical funder engagement.', daysAgo: 10 },
      { type: 'TRAVEL_OFFICER', approver_id: P.TRAVEL_OFFICER, status: 'APPROVED', comments: 'All bookings confirmed.', daysAgo: 6 },
      { type: 'FINANCE', approver_id: P.FINANCE, status: 'APPROVED', comments: 'Costs verified. Exceeds remaining travel budget on ARC-YTH-24 - escalating to CEO.', daysAgo: 2 },
      { type: 'CEO', approver_id: P.CEO, status: 'PENDING', daysAgo: 2 },
    ],
    budget_exception: true,
  },
  {
    index: 6,
    requester_id: P.STAFF_RIAAN,
    department_id: D.OPS,
    project_id: PR.WATER_SANITATION,
    status: 'FULLY_APPROVED',
    travel_type: 'ROAD',
    business_activity: 'Materials delivery oversight',
    business_purpose: 'Oversee delivery and offloading of WASH materials at three ward storerooms.',
    travel_justification:
      'High-value materials require staff present at offloading for asset verification and to complete the delivery register.',
    travellers: [P.STAFF_RIAAN],
    createdDaysAgo: 18,
    submittedDaysAgo: 17,
    leg: {
      travel_date: dateOffset(4),
      origin: 'Cape Town',
      destination: 'Beaufort West',
      transport_mode: 'ROAD',
      round_trip: true,
      return_date: dateOffset(6),
    },
    road: { vehicle_required: true, own_vehicle: false, vehicle_class: 'O_CLASS' },
    accommodation: {
      nights: 2,
      location: 'Beaufort West',
      rooms_required: 1,
      booking_by: 'SELF_BOOK',
      booking_status: 'BOOKED',
      estimated_cost: 2400,
      provider_name: 'Karoo Lodge',
    },
    vehicle: {
      vehicle_class: 'O_CLASS',
      booking_by: 'TRAVEL_OFFICER',
      booking_status: 'CONFIRMATION_RECEIVED',
      estimated_cost: 3800,
      rental_company: 'Hertz',
    },
    st_advance: { amount: 900, reason: 'Meals and fuel incidentals.' },
    approvals: [
      { type: 'HOD', approver_id: P.HOD_OPS, status: 'APPROVED', comments: 'Approved.', daysAgo: 15 },
      { type: 'TRAVEL_OFFICER', approver_id: P.TRAVEL_OFFICER, status: 'APPROVED', comments: 'Vehicle confirmed, staff self-booking accommodation.', daysAgo: 9 },
      { type: 'FINANCE', approver_id: P.FINANCE, status: 'APPROVED', comments: 'Within project travel budget. Approved.', daysAgo: 7 },
    ],
  },
  {
    index: 7,
    requester_id: P.STAFF_PIETER,
    department_id: D.OPS,
    project_id: PR.FOOD_SECURITY,
    status: 'REJECTED',
    travel_type: 'AIR',
    business_activity: 'Agricultural trade expo',
    business_purpose: 'Attend NAMPO agricultural trade expo in Bothaville.',
    travel_justification: 'Networking with input suppliers and reviewing new irrigation equipment.',
    travellers: [P.STAFF_PIETER],
    createdDaysAgo: 25,
    submittedDaysAgo: 24,
    leg: {
      travel_date: dateOffset(-2),
      origin: 'Cape Town',
      destination: 'Bothaville',
      transport_mode: 'AIR',
      round_trip: true,
      return_date: dateOffset(1),
    },
    air: {
      departure_airport: 'CPT',
      destination_airport: 'BFN',
      return_airport: 'CPT',
      booking_by: 'TRAVEL_OFFICER',
      booking_status: 'CANCELLED',
      ticket_cost: 7800,
    },
    approvals: [
      {
        type: 'HOD',
        approver_id: P.HOD_OPS,
        status: 'REJECTED',
        comments:
          'Not approved. The justification does not link to a project deliverable and the food security travel budget is committed through year end. Please resubmit if a supplier meeting can be tied to procurement milestones.',
        daysAgo: 22,
      },
    ],
  },
  {
    index: 8,
    requester_id: P.STAFF_NOMSA,
    department_id: D.PROG,
    project_id: PR.RURAL_ECD,
    status: 'TRAVEL_COMPLETED',
    travel_type: 'ROAD',
    business_activity: 'ECD practitioner training',
    business_purpose: 'Deliver a three-day practitioner training block in George.',
    travel_justification:
      'Scheduled training block per the project workplan. 24 practitioners enrolled.',
    travellers: [P.STAFF_NOMSA],
    createdDaysAgo: 52,
    submittedDaysAgo: 50,
    leg: {
      travel_date: dateOffset(-30),
      origin: 'Cape Town',
      destination: 'George',
      transport_mode: 'ROAD',
      round_trip: true,
      return_date: dateOffset(-26),
    },
    road: { vehicle_required: true, own_vehicle: false, vehicle_class: 'B_CLASS' },
    accommodation: {
      nights: 4,
      location: 'George',
      rooms_required: 1,
      booking_by: 'TRAVEL_OFFICER',
      booking_status: 'COMPLETED',
      estimated_cost: 4800,
      provider_name: 'Protea Hotel King George',
    },
    vehicle: {
      vehicle_class: 'B_CLASS',
      booking_by: 'TRAVEL_OFFICER',
      booking_status: 'COMPLETED',
      estimated_cost: 3200,
      rental_company: 'Avis',
    },
    approvals: [
      { type: 'HOD', approver_id: P.HOD_PROG, status: 'APPROVED', comments: 'Approved.', daysAgo: 48 },
      { type: 'TRAVEL_OFFICER', approver_id: P.TRAVEL_OFFICER, status: 'APPROVED', daysAgo: 44 },
      { type: 'FINANCE', approver_id: P.FINANCE, status: 'APPROVED', comments: 'Within budget.', daysAgo: 42 },
    ],
  },
]

function buildSeedRequests(store: MockDatabase): void {
  SEED_REQUESTS.forEach((spec) => {
    const requestId = fixedId(4, spec.index)
    const itineraryId = fixedId(5, spec.index)
    const year = new Date().getFullYear()

    store.travel_requests.push({
      id: requestId,
      request_number: `ARC-TR-${year}-${String(spec.index).padStart(6, '0')}`,
      requester_id: spec.requester_id,
      department_id: spec.department_id,
      project_id: spec.project_id,
      business_activity: spec.business_activity,
      business_purpose: spec.business_purpose,
      travel_justification: spec.travel_justification,
      number_of_travellers: spec.travellers.length,
      travel_type: spec.travel_type,
      is_multiple_itinerary: false,
      round_trip: spec.leg.round_trip,
      st_advance_required: Boolean(spec.st_advance),
      st_advance_amount: spec.st_advance?.amount ?? null,
      st_advance_reason: spec.st_advance?.reason ?? null,
      status: spec.status,
      created_at: timeOffset(-spec.createdDaysAgo),
      updated_at: timeOffset(-Math.max(0, spec.createdDaysAgo - 1)),
      submitted_at:
        spec.submittedDaysAgo === null ? null : timeOffset(-spec.submittedDaysAgo),
    })

    spec.travellers.forEach((travellerId, i) => {
      store.travel_request_travellers.push({
        id: newId(),
        travel_request_id: requestId,
        traveller_id: travellerId,
        sequence_order: i + 1,
        created_at: timeOffset(-spec.createdDaysAgo),
      })
    })

    store.itineraries.push({
      id: itineraryId,
      travel_request_id: requestId,
      sequence: 1,
      travel_date: spec.leg.travel_date,
      departure_time: '07:00',
      origin: spec.leg.origin,
      destination: spec.leg.destination,
      transport_mode: spec.leg.transport_mode,
      round_trip: spec.leg.round_trip,
      flight_booking_by: spec.air ? spec.air.booking_by : 'NOT_REQUIRED',
      accommodation_required: Boolean(spec.accommodation),
      accommodation_booking_by: spec.accommodation
        ? spec.accommodation.booking_by
        : 'NOT_REQUIRED',
      vehicle_required: Boolean(spec.vehicle),
      vehicle_booking_by: spec.vehicle ? spec.vehicle.booking_by : 'NOT_REQUIRED',
      notes: null,
      created_at: timeOffset(-spec.createdDaysAgo),
      updated_at: timeOffset(-spec.createdDaysAgo),
    })

    if (spec.air) {
      store.air_travel.push({
        id: newId(),
        travel_request_id: requestId,
        itinerary_id: itineraryId,
        departure_airport: spec.air.departure_airport,
        destination_airport: spec.air.destination_airport,
        departure_date: spec.leg.travel_date,
        departure_time: '07:00',
        preferred_flight_time: 'Morning',
        return_airport: spec.air.return_airport ?? null,
        return_date: spec.leg.return_date ?? null,
        return_time: '17:00',
        baggage_requirements: '1 x checked bag',
        special_requirements: null,
        notes: null,
        booking_by: spec.air.booking_by,
        booking_status: spec.air.booking_status,
        airline_name: spec.air.airline_name ?? null,
        flight_number: spec.air.flight_number ?? null,
        confirmation_reference: spec.air.confirmation_reference ?? null,
        ticket_cost: spec.air.ticket_cost,
        booking_date: spec.air.confirmation_reference ? dateOffset(-5) : null,
        confirmation_uploaded: Boolean(spec.air.confirmation_reference),
        created_at: timeOffset(-spec.createdDaysAgo),
        updated_at: timeOffset(-spec.createdDaysAgo),
      })
    }

    if (spec.road) {
      store.road_travel.push({
        id: newId(),
        travel_request_id: requestId,
        itinerary_id: itineraryId,
        origin: spec.leg.origin,
        destination: spec.leg.destination,
        departure_date: spec.leg.travel_date,
        departure_time: '07:00',
        return_date: spec.leg.return_date ?? null,
        return_time: '16:00',
        vehicle_required: spec.road.vehicle_required,
        vehicle_class: spec.road.vehicle_class,
        own_vehicle: spec.road.own_vehicle,
        second_driver_required: false,
        second_driver_id: null,
        notes: null,
        created_at: timeOffset(-spec.createdDaysAgo),
        updated_at: timeOffset(-spec.createdDaysAgo),
      })
    }

    if (spec.accommodation) {
      const a = spec.accommodation
      store.accommodation.push({
        id: newId(),
        travel_request_id: requestId,
        itinerary_id: itineraryId,
        check_in_date: spec.leg.travel_date,
        check_out_date: spec.leg.return_date ?? spec.leg.travel_date,
        nights_count: a.nights,
        location: a.location,
        preferred_type: 'Hotel or guest house',
        rooms_required: a.rooms_required,
        occupants_count: spec.travellers.length,
        special_requirements: null,
        booking_by: a.booking_by,
        booking_status: a.booking_status,
        provider_name: a.provider_name ?? null,
        booking_reference: a.provider_name ? 'ACC-' + spec.index + '4471' : null,
        booking_date: a.provider_name ? dateOffset(-6) : null,
        estimated_cost: a.estimated_cost,
        actual_cost: a.booking_status === 'COMPLETED' ? a.estimated_cost : null,
        confirmation_uploaded: Boolean(a.provider_name),
        created_at: timeOffset(-spec.createdDaysAgo),
        updated_at: timeOffset(-spec.createdDaysAgo),
      })
    }

    if (spec.vehicle) {
      const v = spec.vehicle
      store.rental_vehicles.push({
        id: newId(),
        travel_request_id: requestId,
        itinerary_id: itineraryId,
        vehicle_class: v.vehicle_class,
        booking_by: v.booking_by,
        booking_status: v.booking_status,
        second_driver_required: false,
        second_driver_id: null,
        collection_location: spec.leg.destination,
        collection_date: spec.leg.travel_date,
        collection_time: '09:00',
        return_location: spec.leg.destination,
        return_date: spec.leg.return_date ?? null,
        return_time: '15:00',
        rental_company: v.rental_company ?? null,
        vehicle_type: v.vehicle_class === 'O_CLASS' ? 'Toyota Fortuner' : 'VW Polo',
        booking_reference: v.rental_company ? 'VEH-' + spec.index + '9920' : null,
        estimated_cost: v.estimated_cost,
        actual_cost: v.booking_status === 'COMPLETED' ? v.estimated_cost : null,
        notes: null,
        created_at: timeOffset(-spec.createdDaysAgo),
        updated_at: timeOffset(-spec.createdDaysAgo),
      })
    }

    ;(spec.approvals ?? []).forEach((ap) => {
      store.approvals.push({
        id: newId(),
        travel_request_id: requestId,
        approver_id: ap.approver_id,
        approval_type: ap.type,
        status: ap.status,
        comments: ap.comments ?? null,
        approved_at: ap.status === 'APPROVED' ? timeOffset(-ap.daysAgo) : null,
        response_at: ap.status === 'PENDING' ? null : timeOffset(-ap.daysAgo),
        created_at: timeOffset(-ap.daysAgo - 1),
        updated_at: timeOffset(-ap.daysAgo),
      })
    })

    // Estimated cost = sum of the costed components
    const estimated =
      (spec.air?.ticket_cost ?? 0) +
      (spec.accommodation?.estimated_cost ?? 0) +
      (spec.vehicle?.estimated_cost ?? 0) +
      (spec.st_advance?.amount ?? 0)

    if (spec.status !== 'DRAFT') {
      store.project_travel_commitments.push({
        id: newId(),
        project_id: spec.project_id,
        travel_request_id: requestId,
        committed_amount: estimated,
        actual_amount: spec.status === 'TRAVEL_COMPLETED' ? estimated : null,
        status:
          spec.status === 'TRAVEL_COMPLETED'
            ? 'COMPLETED'
            : spec.status === 'REJECTED'
              ? 'CANCELLED'
              : 'ESTIMATED',
        created_at: timeOffset(-spec.createdDaysAgo),
        updated_at: timeOffset(-spec.createdDaysAgo),
      })
    }

    if (spec.budget_exception) {
      const project = store.projects.find((p) => p.id === spec.project_id)!
      const existing = 158_000
      store.budget_checks.push({
        id: newId(),
        travel_request_id: requestId,
        project_id: spec.project_id,
        project_travel_budget: project.travel_budget,
        existing_commitments: existing,
        current_request_cost: estimated,
        remaining_before_request: project.travel_budget - existing,
        amount_over_budget: Math.max(
          0,
          estimated - (project.travel_budget - existing)
        ),
        is_budget_exception: true,
        checked_by: P.FINANCE,
        checked_at: timeOffset(-2),
      })
    }

    // Audit trail
    store.audit_logs.push({
      id: newId(),
      user_id: spec.requester_id,
      travel_request_id: requestId,
      action: 'CREATED',
      previous_status: null,
      new_status: 'DRAFT',
      comments: 'Travel request created.',
      metadata: null,
      created_at: timeOffset(-spec.createdDaysAgo),
    })

    if (spec.submittedDaysAgo !== null) {
      store.audit_logs.push({
        id: newId(),
        user_id: spec.requester_id,
        travel_request_id: requestId,
        action: 'SUBMITTED',
        previous_status: 'DRAFT',
        new_status: 'HOD_REVIEW',
        comments: 'Submitted for HOD approval.',
        metadata: null,
        created_at: timeOffset(-spec.submittedDaysAgo),
      })
    }

    ;(spec.approvals ?? [])
      .filter((ap) => ap.status !== 'PENDING')
      .forEach((ap) => {
        store.audit_logs.push({
          id: newId(),
          user_id: ap.approver_id,
          travel_request_id: requestId,
          action: `${ap.type}_${ap.status}`,
          previous_status: null,
          new_status: null,
          comments: ap.comments ?? null,
          metadata: null,
          created_at: timeOffset(-ap.daysAgo),
        })
      })
  })
}

function createStore(): MockDatabase {
  const store: MockDatabase = {
    departments: seedDepartments(),
    profiles: seedProfiles(),
    projects: seedProjects(),
    travel_requests: [],
    travel_request_travellers: [],
    itineraries: [],
    air_travel: [],
    road_travel: [],
    accommodation: [],
    rental_vehicles: [],
    project_travel_commitments: [],
    approvals: [],
    budget_checks: [],
    attachments: [],
    notifications: [],
    audit_logs: [],
  }
  buildSeedRequests(store)
  return store
}

// ----------------------------------------------------------------------------
// PERSISTENCE
//
// Without this, the store is rebuilt from seed on every full page load, so
// anything you create disappears the moment the browser refreshes. That reads
// as a bug during a demo, so the store is mirrored into localStorage.
//
// Set PERSIST to false for pure in-memory behaviour (every refresh returns to
// the seeded state). Bump SCHEMA_VERSION whenever the seed data changes, so
// stale saved data is discarded rather than merged.
// ----------------------------------------------------------------------------

const PERSIST = true
const STORAGE_KEY = 'arc-travel-hub.db'
const SCHEMA_VERSION = 1

function loadPersisted(): MockDatabase | null {
  if (!PERSIST || typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as { version: number; data: MockDatabase }
    if (parsed.version !== SCHEMA_VERSION) return null
    // Guard against a partially written or hand-edited payload.
    if (!Array.isArray(parsed.data?.travel_requests)) return null
    return parsed.data
  } catch {
    return null
  }
}

/**
 * Mirror the store to localStorage. Called by the service layer after every
 * write. Safe to call when storage is unavailable — it simply does nothing.
 */
export function saveDb(): void {
  if (!PERSIST || typeof window === 'undefined') return
  try {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ version: SCHEMA_VERSION, data: db })
    )
  } catch {
    // Quota exceeded, private window, or storage blocked — the app keeps
    // working, the data just won't survive a refresh.
  }
}

/** Throw away everything and rebuild from seed. Wired to a button in Settings. */
export function resetDb(): void {
  const fresh = createStore()
  ;(Object.keys(fresh) as Array<keyof MockDatabase>).forEach((key) => {
    // Replace contents in place so existing imports keep pointing at `db`.
    ;(db[key] as unknown[]).length = 0
    ;(db[key] as unknown[]).push(...(fresh[key] as unknown[]))
  })
  saveDb()
}

/**
 * Module-level singleton, restored from localStorage when available and
 * seeded otherwise.
 */
export const db: MockDatabase = loadPersisted() ?? createStore()

/** Next sequential request number, matching generate_travel_request_number(). */
export function nextRequestNumber(): string {
  const year = new Date().getFullYear()
  const prefix = `ARC-TR-${year}-`
  const highest = db.travel_requests
    .filter((r) => r.request_number.startsWith(prefix))
    .map((r) => parseInt(r.request_number.slice(prefix.length), 10))
    .filter((n) => !Number.isNaN(n))
    .reduce((max, n) => Math.max(max, n), 0)
  return `${prefix}${String(highest + 1).padStart(6, '0')}`
}

/** Seed profile ids, exported so the mock auth layer can switch identities. */
export const SEED_PROFILE_IDS = P
export const SEED_DEPARTMENT_IDS = D
export const SEED_PROJECT_IDS = PR
