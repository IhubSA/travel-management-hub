'use client'

// ============================================================================
// Approval timeline
//
// Renders the full approval chain for a request: which stages are done, which
// is live, and which are still ahead. Stage order follows the state machine in
// WORKFLOW_STATE_MACHINE.md.
// ============================================================================

import type { ApprovalType, ApprovalStatus, TravelStatus } from '@/types/database'
import type { ProfileRow, ApprovalRow } from '@/types/database'
import { formatDateTime } from '@/utils/format'

const STAGE_ORDER: ApprovalType[] = ['HOD', 'TRAVEL_OFFICER', 'FINANCE', 'CEO']

const STAGE_LABELS: Record<ApprovalType, string> = {
  HOD: 'Head of Department',
  TRAVEL_OFFICER: 'Travel Officer',
  FINANCE: 'Finance',
  CEO: 'CEO (budget exception)',
}

/** Which stage is live for a given request status. */
const STATUS_TO_STAGE: Partial<Record<TravelStatus, ApprovalType>> = {
  HOD_REVIEW: 'HOD',
  TRAVEL_OFFICER_REVIEW: 'TRAVEL_OFFICER',
  TRAVEL_PROCESSING: 'TRAVEL_OFFICER',
  FINANCE_REVIEW: 'FINANCE',
  BUDGET_EXCEPTION: 'CEO',
  CEO_APPROVAL: 'CEO',
}

type StageState = 'approved' | 'rejected' | 'changes' | 'current' | 'upcoming' | 'skipped'

const STATE_STYLES: Record<StageState, { dot: string; label: string }> = {
  approved: { dot: 'bg-green-600 text-white', label: 'text-gray-900' },
  rejected: { dot: 'bg-red-600 text-white', label: 'text-gray-900' },
  changes: { dot: 'bg-amber-500 text-white', label: 'text-gray-900' },
  current: { dot: 'bg-blue-600 text-white ring-4 ring-blue-100', label: 'text-gray-900' },
  upcoming: { dot: 'bg-gray-200 text-gray-500', label: 'text-gray-500' },
  skipped: { dot: 'bg-gray-100 text-gray-400', label: 'text-gray-400' },
}

const STATE_TEXT: Record<StageState, string> = {
  approved: 'Approved',
  rejected: 'Rejected',
  changes: 'Changes requested',
  current: 'Awaiting decision',
  upcoming: 'Not yet reached',
  skipped: 'Not required',
}

function stageIcon(state: StageState): string {
  if (state === 'approved') return '✓'
  if (state === 'rejected') return '✕'
  if (state === 'changes') return '!'
  return '·'
}

export function ApprovalTimeline({
  status,
  approvals,
  profiles,
  isBudgetException,
}: {
  status: TravelStatus
  approvals: ApprovalRow[]
  profiles: ProfileRow[]
  isBudgetException: boolean
}) {
  const currentStage = STATUS_TO_STAGE[status]
  const terminal = status === 'REJECTED' || status === 'CANCELLED'
  const complete = ['FULLY_APPROVED', 'BOOKING_COMPLETE', 'TRAVEL_COMPLETED'].includes(
    status
  )

  const stageState = (stage: ApprovalType): StageState => {
    const record = approvals.find((a) => a.approval_type === stage)

    if (record) {
      if (record.status === 'APPROVED') return 'approved'
      if (record.status === 'REJECTED') return 'rejected'
      if (record.status === 'CHANGES_REQUESTED') return 'changes'
      // PENDING
      return currentStage === stage ? 'current' : 'upcoming'
    }

    // The CEO stage only exists when the request breaks the budget.
    if (stage === 'CEO' && !isBudgetException) {
      return complete || terminal ? 'skipped' : 'skipped'
    }
    if (currentStage === stage) return 'current'
    return 'upcoming'
  }

  const nameOf = (id: string | null) => {
    if (!id) return null
    const p = profiles.find((x) => x.id === id)
    return p ? `${p.first_name} ${p.last_name}` : null
  }

  return (
    <ol className="space-y-0">
      {STAGE_ORDER.map((stage, index) => {
        const state = stageState(stage)
        const record = approvals.find((a) => a.approval_type === stage)
        const styles = STATE_STYLES[state]
        const isLast = index === STAGE_ORDER.length - 1

        return (
          <li key={stage} className="relative flex gap-3 pb-5 last:pb-0">
            {!isLast && (
              <span
                aria-hidden
                className={`absolute left-3 top-7 h-full w-px ${
                  state === 'approved' ? 'bg-green-300' : 'bg-gray-200'
                }`}
              />
            )}

            <span
              className={`relative z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${styles.dot}`}
            >
              {stageIcon(state)}
            </span>

            <div className="min-w-0 flex-1 pt-0.5">
              <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                <p className={`text-sm font-medium ${styles.label}`}>
                  {STAGE_LABELS[stage]}
                </p>
                <p
                  className={`text-xs ${
                    state === 'current'
                      ? 'font-medium text-blue-700'
                      : state === 'rejected'
                        ? 'font-medium text-red-700'
                        : 'text-gray-500'
                  }`}
                >
                  {STATE_TEXT[state]}
                </p>
              </div>

              {record && (
                <p className="mt-0.5 text-xs text-gray-600">
                  {nameOf(record.approver_id) ?? 'Unassigned'}
                  {record.response_at && ` · ${formatDateTime(record.response_at)}`}
                </p>
              )}

              {record?.comments && (
                <blockquote
                  className={`mt-2 rounded-lg border-l-2 px-3 py-2 text-sm ${
                    record.status === 'REJECTED'
                      ? 'border-red-400 bg-red-50 text-red-900'
                      : record.status === 'CHANGES_REQUESTED'
                        ? 'border-amber-400 bg-amber-50 text-amber-900'
                        : 'border-gray-300 bg-gray-50 text-gray-700'
                  }`}
                >
                  {record.comments}
                </blockquote>
              )}
            </div>
          </li>
        )
      })}
    </ol>
  )
}

/** Small helper the detail page uses to label an approval status inline. */
export function approvalStatusLabel(status: ApprovalStatus): string {
  switch (status) {
    case 'APPROVED':
      return 'Approved'
    case 'REJECTED':
      return 'Rejected'
    case 'CHANGES_REQUESTED':
      return 'Changes requested'
    default:
      return 'Pending'
  }
}
