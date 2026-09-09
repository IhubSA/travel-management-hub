# Travel Request Workflow State Machine

**Version:** 1.0  
**Document:** Workflow Logic Reference  
**Status:** Phase 2 Complete

---

## State Diagram

```
                        ┌─────────────────────────────┐
                        │         START: DRAFT         │
                        └────────────┬────────────────┘
                                     │
                      ┌──────────────┴──────────────┐
                      │                             │
                  (multi-leg)                   (single-leg)
                      │                             │
                      ▼                             ▼
         ┌──────────────────────────┐  ┌────────────────────────┐
         │  AWAITING_ITINERARY      │  │      SUBMITTED         │
         │ (Add more legs required) │  │                        │
         └──────────┬───────────────┘  └────────────┬───────────┘
                    │                               │
                    │ (All legs complete)           │
                    └───────────────┬────────────────┘
                                    │
                                    ▼
                        ┌──────────────────────┐
                        │     HOD_REVIEW       │
                        │  (Awaiting approval) │
                        └────────┬─────────────┘
                                 │
                    ┌────────────┼────────────┐
                    │            │            │
               (Approve)    (Reject)   (Changes)
                    │            │            │
                    ▼            ▼            ▼
           ┌─────────────┐  ┌────────┐  ┌──────────────┐
           │ HOD_APPROVED│  │REJECTED│  │ SUBMITTED    │◄──┐
           └──────┬──────┘  │        │  │(go back to   │   │
                  │         └────────┘  │ requester)   │   │
                  │                     └──────────────┘   │
                  │                            │           │
                  │                            └───────────┘
                  │
                  ▼
      ┌──────────────────────────┐
      │ TRAVEL_OFFICER_REVIEW    │
      │  (Booking coordination)  │
      └──────────┬───────────────┘
                 │
      ┌──────────┴──────────┐
      │                     │
  (Proceed)            (Reject)
      │                     │
      ▼                     ▼
 ┌──────────────┐      ┌────────┐
 │TRAVEL_       │      │REJECTED│
 │PROCESSING   │      └────────┘
 │(Managing    │
 │ bookings)   │
 └──────┬──────┘
        │
        ▼
  ┌──────────────┐
  │FINANCE_      │
  │REVIEW        │
  │(Cost check)  │
  └──────┬───────┘
         │
      ┌──┴──┬─────────────┐
      │     │             │
 (Within) (Over)    (Reject)
      │     │             │
      ▼     ▼             ▼
 ┌───────┐ ┌─────────┐ ┌────────┐
 │FULLY_ │ │ BUDGET_ │ │REJECTED│
 │APPROVED│ │EXCEPTION│ └────────┘
 └───┬───┘ └────┬────┘
     │         │
     │         ▼
     │    ┌──────────────┐
     │    │ CEO_APPROVAL │
     │    │(Exception    │
     │    │ review)      │
     │    └───┬──────┬──┬─┘
     │        │      │  │
     │    (Approve)(Reject)(Changes)
     │        │      │  │
     │        ▼      ▼  └──┐
     │    ┌───────┐ │      │
     │    │FULLY_ │ │      │
     │    │APPROVED │      │
     │    └───┬───┘ └──────┘
     │        │       │
     │        │       └─────┐
     │        │             │
     │        ▼             ▼
     │   ┌──────────────┬────────┐
     └──►│ BOOKING_     │REJECTED│
         │ COMPLETE     └────────┘
         └──────┬───────┘
                │
                ▼
         ┌──────────────┐
         │ TRAVEL_      │
         │ COMPLETED    │
         └──────────────┘
```

---

## State Details & Transitions

### 1. DRAFT
**Description:** Request created but not submitted  
**Allowed Actions:**
- Save draft
- Edit all fields
- Add/remove travellers
- Manage itineraries (if multi-leg)
- Cancel request

**Valid Next States:**
- AWAITING_ITINERARY (if multi-itinerary selected)
- SUBMITTED (if single itinerary complete)
- CANCELLED (user withdrawal)

**Who Can:** Requester (logged-in user)

---

### 2. AWAITING_ITINERARY
**Description:** Multi-leg request waiting for additional itinerary items  
**Allowed Actions:**
- Add itinerary items
- Edit/delete itinerary items
- Save progress
- Cancel request

**Valid Next States:**
- SUBMITTED (once all legs complete)
- CANCELLED

**Who Can:** Requester

---

### 3. SUBMITTED
**Description:** Request submitted and ready for HOD review  
**Allowed Actions:**
- View request status
- View approval timeline
- Edit only if HOD requests changes

**Valid Next States:**
- HOD_REVIEW (automatic transition)

**Who Can:** System (automatic)

---

### 4. HOD_REVIEW
**Description:** Awaiting Head of Department approval  
**Allowed Actions:**
- HOD views full request details
- HOD can approve, reject, or request changes
- Requester can view status

**Valid Next States:**
- HOD_APPROVED (HOD approves)
- REJECTED (HOD rejects - terminal)
- SUBMITTED (HOD requests changes - goes back to requester)

**Who Can:** HOD, Requester (view only)

**Triggers:**
- Send email to HOD: "Travel Request ARC-TR-2026-000001 requires your approval"
- Create approval record

---

### 5. HOD_APPROVED
**Description:** HOD has approved the request  
**Allowed Actions:**
- View approval details
- Route to Travel Officer

**Valid Next States:**
- TRAVEL_OFFICER_REVIEW (automatic)

**Who Can:** System (automatic)

**Triggers:**
- Send email to Travel Officer
- Send email to Requester: "Your travel request has been approved by [HOD Name]"

---

### 6. TRAVEL_OFFICER_REVIEW
**Description:** Travel Officer reviewing and determining booking responsibility  
**Allowed Actions:**
- Review travel details
- Determine booking responsibility for each component
- Request additional information
- Assess feasibility

**Valid Next States:**
- TRAVEL_PROCESSING (Travel Officer accepts)
- REJECTED (Travel Officer rejects - terminal)

**Who Can:** Travel Officer

**Triggers:**
- Email to Requester: "Your travel request is being processed by our Travel Officer"

---

### 7. TRAVEL_PROCESSING
**Description:** Travel Officer actively booking travel/receiving self-booking confirmations  
**Allowed Actions:**
- Add flight bookings
- Add accommodation bookings
- Add vehicle bookings
- Upload confirmations
- Capture actual costs
- Request self-booking information from requester
- Add notes

**Valid Next States:**
- FINANCE_REVIEW (all bookings complete or self-booking acknowledged)

**Who Can:** Travel Officer, Requester (for self-bookings)

**Duration:** Typically 1-3 business days

---

### 8. FINANCE_REVIEW
**Description:** Finance Manager reviewing costs and budget  
**Allowed Actions:**
- View all cost information
- Compare against project budget
- Calculate budget exceptions
- Add finance notes

**Valid Next States:**
- FULLY_APPROVED (within budget)
- BUDGET_EXCEPTION (over budget)
- REJECTED (Finance rejects - terminal)

**Who Can:** Finance Manager

**Workflow Logic:**
```
if (requested_cost <= available_project_budget) {
  → FULLY_APPROVED
  → Send email to Requester
} else {
  → BUDGET_EXCEPTION
  → Escalate to CEO
}
```

---

### 9. BUDGET_EXCEPTION
**Description:** Request exceeds available project budget  
**Allowed Actions:**
- View budget calculations
- Review finance justification
- Route to CEO for final decision

**Valid Next States:**
- CEO_APPROVAL (automatic escalation)

**Who Can:** System (automatic)

**Triggers:**
- Send email to CEO: "Travel Request ARC-TR-2026-000001 requires budget exception approval"
- Create CEO approval record
- Include budget variance information

---

### 10. CEO_APPROVAL
**Description:** Awaiting CEO approval for budget exception  
**Allowed Actions:**
- CEO views request + budget exception details
- CEO approves, rejects, or requests changes

**Valid Next States:**
- FULLY_APPROVED (CEO approves)
- REJECTED (CEO rejects - terminal)
- SUBMITTED (CEO requests changes - back to HOD with comments)

**Who Can:** CEO

---

### 11. FULLY_APPROVED
**Description:** Request has all required approvals and budgets confirmed  
**Allowed Actions:**
- Finalize bookings
- Confirm with travellers
- Prepare travel documents

**Valid Next States:**
- BOOKING_COMPLETE (travel ready)

**Who Can:** Travel Officer, Requester

**Triggers:**
- Send email to Requester: "Your travel request ARC-TR-2026-000001 is fully approved"
- Include booking confirmations and travel details
- Send email to Travellers with travel information

---

### 12. BOOKING_COMPLETE
**Description:** All bookings finalized and confirmations in system  
**Allowed Actions:**
- Prepare for travel
- Download travel documents
- Review final details

**Valid Next States:**
- TRAVEL_COMPLETED (after travel occurs)
- CANCELLED (if travel cancelled)

**Who Can:** Requester, Travel Officer

---

### 13. TRAVEL_COMPLETED
**Description:** Travel has occurred - terminal state  
**Allowed Actions:**
- Submit expense claims (future feature)
- View final request record
- Archive request

**Valid Next States:**
- None (terminal)

**Who Can:** Finance Manager, Super Admin (archival)

---

### 14. REJECTED
**Description:** Request rejected at any approval stage - terminal state  
**Reason Can Be:**
- HOD rejects during HOD_REVIEW
- Travel Officer rejects during TRAVEL_OFFICER_REVIEW
- Finance rejects during FINANCE_REVIEW
- CEO rejects during CEO_APPROVAL

**Allowed Actions:**
- View rejection reason
- Create new travel request

**Valid Next States:**
- None (terminal) - but user can create new request

**Triggers:**
- Send email to Requester with rejection reason and comments

---

### 15. CANCELLED
**Description:** Request cancelled by user or system - terminal state  
**Allowed Actions:**
- View cancellation reason
- Create new travel request

**Valid Next States:**
- None (terminal)

**Triggers:**
- Notify all involved parties
- Update budget commitments

---

## Validation Rules & Business Logic

### State Transition Rules

1. **No Skipping Approval Stages**
   - Cannot jump directly from HOD_REVIEW → FINANCE_REVIEW
   - Must go through TRAVEL_OFFICER_REVIEW

2. **Changes Request Loop**
   - When changes requested, goes back to SUBMITTED
   - Then returns to same approval stage
   - Audit trail shows loop history

3. **Budget Exception is Automatic**
   - No user action required to escalate to CEO
   - System calculates and auto-escalates

4. **Terminal States Cannot Revert**
   - REJECTED, CANCELLED, TRAVEL_COMPLETED are final
   - Cannot undo these states
   - User must create new request if needed

### Email Notification Triggers

| Transition | Email Sent To | Template |
|-----------|---------------|----------|
| → HOD_REVIEW | HOD | "Approval Required" |
| → HOD_APPROVED | Requester | "Approved by HOD" |
| → REJECTED (HOD) | Requester | "Rejected by HOD" |
| → SUBMITTED (Changes) | Requester | "Changes Requested" |
| → TRAVEL_OFFICER_REVIEW | Travel Officer | "Action Required" |
| → TRAVEL_PROCESSING | Requester | "In Progress" |
| → FINANCE_REVIEW | Finance Manager | "Finance Review Required" |
| → BUDGET_EXCEPTION | CEO | "Budget Exception" |
| → CEO_APPROVAL | CEO | "Approval Required" |
| → FULLY_APPROVED | Requester + Travellers | "Approved" |
| → REJECTED (Finance/CEO) | Requester | "Rejected" |

### Data Integrity Rules

1. **Request Number Generation**
   - Format: `ARC-TR-YYYY-NNNNNN`
   - Generated on creation, never changes
   - Globally unique

2. **Audit Trail**
   - Every state change logged
   - Previous status recorded
   - New status recorded
   - User who triggered change
   - Timestamp
   - Any comments

3. **Approval Records**
   - One approval record per approval type per request
   - Captures: approver, status, comments, timestamp
   - Immutable once created

4. **Budget Calculations**
   - Calculated at FINANCE_REVIEW
   - Committed amount locked in project_travel_commitments
   - Cannot exceed available budget for approval
   - Exception flag if exceeds

---

## Implementation Checklist for Workflow Engine

- [ ] State machine validator function
  ```typescript
  function isValidTransition(currentState, nextState): boolean
  ```

- [ ] Automatic status updates on certain transitions
  - SUBMITTED → HOD_REVIEW
  - HOD_APPROVED → TRAVEL_OFFICER_REVIEW
  - TRAVEL_PROCESSING → FINANCE_REVIEW
  - BUDGET_EXCEPTION → CEO_APPROVAL

- [ ] Email notification system integrated at each transition

- [ ] Audit logging on every state change

- [ ] Database constraints to prevent invalid states

- [ ] API validation to enforce business rules

- [ ] UI to reflect current state and allowed actions

- [ ] Role-based permission checks at each transition

---

## Error Handling Scenarios

### Scenario 1: Network Failure During Approval
**Problem:** User approves but email fails  
**Solution:**
- Approval recorded in database
- Email retry queue initiated
- Manual resend available in admin panel
- Notification log shows failure

### Scenario 2: User Deleted While Request Pending
**Problem:** Requester made inactive before approval complete  
**Solution:**
- Approval can still proceed
- User marked inactive but profile retained
- Historical record preserved
- Cannot create new requests

### Scenario 3: Project Budget Changed During Review
**Problem:** Budget reduced after TRAVEL_OFFICER_REVIEW  
**Solution:**
- Recalculated at FINANCE_REVIEW
- May trigger new budget exception
- Creates audit log entry
- Notifies Finance Manager

### Scenario 4: Travel Officer Requests Clarification
**Problem:** Travel Officer needs more info before booking  
**Solution:**
- Email sent to Requester
- Request stays in TRAVEL_PROCESSING
- Requester updates details
- Travel Officer notified of update

---

## Test Cases for State Machine

1. **Happy Path:** DRAFT → HOD_APPROVED → FINANCE_REVIEW → FULLY_APPROVED
2. **Budget Exception Path:** → BUDGET_EXCEPTION → CEO_APPROVAL → APPROVED
3. **Rejection at HOD:** → HOD_REVIEW → REJECTED
4. **Changes Requested Loop:** → HOD_REVIEW → SUBMITTED → HOD_REVIEW → APPROVED
5. **Multi-itinerary Workflow:** DRAFT → AWAITING_ITINERARY → SUBMITTED → HOD_REVIEW
6. **Self-booking Workflow:** → TRAVEL_PROCESSING → (Requester self-books) → FINANCE_REVIEW
7. **Cancellation:** Any state → CANCELLED

---

**End of Workflow State Machine Document**
