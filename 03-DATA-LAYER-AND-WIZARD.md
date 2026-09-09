# Travel Management Hub — Data Layer & Travel Request Wizard

**Version:** 1.0
**Date:** 2026-09-09
**Status:** Phase 3 — built and verified

This document covers what was built on top of the Phase 1 architecture and the
Phase 2 database design, and — importantly — exactly how to swap the current
mock data layer for real Supabase when you are ready.

---

## 1. What this build adds

| Area | Before | Now |
|---|---|---|
| Data | Hardcoded numbers in each dashboard component | A schema-shaped data layer with realistic seed data |
| Travel requests | A stub page saying "no requests yet" | Full 7-step wizard, list, detail and edit |
| Dashboards | Six hand-written components with fixed figures | One layout driven by live counts, per role |
| Approvals | A stub page | A real, role-filtered queue |
| Budget | Not implemented | Live budget checks with exception detection |
| Identity | One hardcoded mock user | Switch between all 11 seeded staff from the header |

---

## 2. The three-layer split

The whole point of the structure below is that **only the middle layer knows
where data comes from.** Components never touch the store.

```
┌──────────────────────────────────────────────────────────┐
│  COMPONENTS                                              │
│  app/travel-requests/*, components/travel-request/*      │
│  Know about: TravelRequestDetail, TravelRequestDraft     │
│  Know nothing about: Supabase, the mock store            │
└───────────────────────┬──────────────────────────────────┘
                        │  async function calls
┌───────────────────────▼──────────────────────────────────┐
│  SERVICES  ← THE ONLY LAYER THAT CHANGES FOR SUPABASE    │
│  services/travel-request.service.ts                      │
│  services/reference.service.ts                           │
└───────────────────────┬──────────────────────────────────┘
                        │
┌───────────────────────▼──────────────────────────────────┐
│  STORE                                                   │
│  lib/mock-db.ts   →  replaced by lib/supabase.ts         │
└──────────────────────────────────────────────────────────┘
```

### Why the types matter

`src/types/database.ts` mirrors `supabase/migrations/001_initial_schema.sql`
**exactly** — same table names, same column names, same nullability, same enum
members. This is not decoration. It means that when you run:

```bash
npm run db:types
```

the generated file will be structurally the same as the hand-written one, and
nothing downstream breaks.

---

## 3. Switching to Supabase

Three steps, in this order.

### Step 1 — Stand up the database

Follow `docs/DATABASE_SETUP_GUIDE.md`. Run the three migrations in
`supabase/migrations/`, create the storage bucket, and set the environment
variables in Vercel.

### Step 2 — Turn off mock auth

In `src/context/AuthContext.tsx`:

```ts
const MOCK_AUTH = true   // ← change to false
```

The real Supabase branch is already written below it. It fetches the profile
row for the signed-in auth user and puts it in exactly the same shape the mock
does, so `useRole`, `useViewer`, `ProtectedRoute` and every page keep working
untouched. The "Viewing as" role switcher in the header disappears on its own,
because it is gated on `isMock`.

### Step 3 — Rewrite the service function bodies

Each function has a doc comment showing the Supabase equivalent. For example,
`listDepartments()` becomes:

```ts
export async function listDepartments(): Promise<DepartmentRow[]> {
  const { data, error } = await supabase
    .from('departments')
    .select('*')
    .eq('active', true)
    .order('name')
  if (error) throw error
  return data
}
```

The signature does not change, so no component needs editing.

**One thing to note:** `canView()` in `travel-request.service.ts` duplicates the
RLS policies from `002_rls_policies.sql` in TypeScript. Once Supabase is live,
the database enforces this for real and the client-side filter becomes a
second line of defence rather than the only one. Leave it in — it keeps the UI
honest about what it shows — but the database is the authority.

---

## 4. The wizard

Seven steps, matching PHASE 1 §5:

1. **Trip details** — travel type, project, department. Choosing the travel
   type pre-configures the itinerary legs (air vs road vs both).
2. **Travellers** — searchable staff picker. Occupancy and S&T are derived
   from this list.
3. **Itinerary** — one or more legs, each with origin, destination, dates,
   transport mode, and per-leg flight booking responsibility.
4. **Accommodation & vehicles** — per leg, with who books each item
   (Travel Officer vs self-book), vehicle class, and second-driver capture.
5. **Business justification** — activity, purpose, and a mandatory
   justification with a minimum length, because this is what approvers read.
6. **S&T advance** — optional, with amount and what it covers.
7. **Review & submit** — full summary with inline Edit links back to any step,
   a cost breakdown, and a live budget check.

### Validation

`src/lib/draft.ts` holds all validation as pure functions. Steps validate on
"Continue" and then re-validate live once touched — so the form does not shout
at someone who is still typing. The progress bar marks incomplete steps in red,
and "Submit for approval" stays disabled until every step passes.

### Draft persistence

"Save draft" writes a real `travel_requests` row with status `DRAFT` plus all
its child rows. Drafts are invisible to approvers, editable, and deletable.
Submitting flips the status to `HOD_REVIEW`, opens a pending HOD approval,
records the project commitment, queues the notification row, and writes the
audit entry — the same sequence the real workflow will perform.

---

## 5. Budget checking

`checkBudget()` compares the request cost against the project's `travel_budget`
minus existing non-cancelled commitments. If the result is negative it flags a
budget exception, which is what routes a request to the CEO.

The wizard shows this live on the review step **before** submission, so a
requester knows their trip will need CEO sign-off before they send it. That is
deliberate — it removes a surprise from the approval chain.

---

## 6. Mock data notes

- **Persistence:** the store mirrors itself into `localStorage` so anything you
  create survives a browser refresh. This is controlled by `PERSIST` at the
  bottom of `src/lib/mock-db.ts`. Set it to `false` for pure in-memory
  behaviour (every refresh returns to the seeded state).
- **Scope:** data is per browser, per device. Two people opening the site do
  not see each other's requests. That is a property of the mock layer and goes
  away entirely with Supabase.
- **Resetting:** Settings → "Reset demo data" restores the original seed.
- **Seed changes:** bump `SCHEMA_VERSION` in `mock-db.ts` whenever you change
  the seed, so stale saved data is discarded rather than merged.

### Seeded organisation

Five departments (Operations, Finance, Administration, Programmes,
Management), five projects with travel budgets totalling R1,000,000, eleven
staff covering all six roles, and eight travel requests spread across the
workflow — including one live budget exception sitting with the CEO and one
rejected request with the HOD's reasoning attached.

---

## 7. Verification

The build was checked end to end in a real browser before release:

- `tsc --noEmit` clean, `next build` clean, all 12 routes generated
- A staff member completes the wizard, is correctly blocked from skipping the
  mandatory justification, sees the budget check, and submits
- The submitted request appears in the correct HOD's queue, routed by the
  requester's department
- No console or page errors across the whole flow

---

## 8. What is not built yet

The approvals queue lists work correctly but the decision actions are the next
piece:

1. **Approve / reject / request changes** with comments, driving the state
   machine in `docs/WORKFLOW_STATE_MACHINE.md`
2. **Travel Officer booking capture** — airline, reference, actual cost, and
   confirmation document upload
3. **Finance review panel** — cost verification and the formal budget check
   that writes a `budget_checks` row
4. **Admin screens** for departments and projects (users already exists)
5. **Resend email notifications** — the `notifications` rows are already being
   written and queued, so this is wiring up the sender
6. **Reports** — spend by project, department and period
