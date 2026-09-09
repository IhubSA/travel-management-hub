'use client'

// ============================================================================
// Approvals
//
// The queue of requests sitting at this role's stage of the workflow. The
// approve / reject / request-changes actions themselves are the next build
// step — this screen surfaces the queue and links through to each request.
// ============================================================================

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { MainLayout } from '@/components/layout/MainLayout'
import {
  Alert,
  Button,
  Card,
  EmptyState,
  PageHeader,
  Spinner,
  StatusBadge,
} from '@/components/common'
import { useRole, useViewer } from '@/hooks/useRole'
import { listRequests, QUEUE_STATUSES } from '@/services/travel-request.service'
import type { TravelRequestSummary } from '@/types/travel-request'
import type { UserRole } from '@/types/database'
import { formatCurrency, formatDate, formatRelative } from '@/utils/format'

const STAGE_DESCRIPTION: Partial<Record<UserRole, string>> = {
  HOD: 'Requests raised in your department, waiting for departmental sign-off before they go to the Travel Officer.',
  TRAVEL_OFFICER:
    'Approved requests that need flights, accommodation or vehicles arranged and confirmed.',
  FINANCE:
    'Requests with bookings in place, waiting for cost verification against the project travel budget.',
  CEO: 'Requests that exceed the remaining project travel budget and need an executive decision.',
  SUPER_ADMIN:
    'Everything currently moving through the approval chain, at any stage.',
}

export default function ApprovalsPage() {
  const viewer = useViewer()
  const { role, isApprover } = useRole()

  const [rows, setRows] = useState<TravelRequestSummary[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    if (!viewer) return
    setLoading(true)
    try {
      setRows(await listRequests(viewer, { onlyQueue: true }))
    } finally {
      setLoading(false)
    }
  }, [viewer])

  useEffect(() => {
    load()
  }, [load])

  if (!role) {
    return (
      <MainLayout>
        <Spinner label="Loading…" />
      </MainLayout>
    )
  }

  if (!isApprover) {
    return (
      <MainLayout>
        <div className="space-y-4">
          <PageHeader title="Approvals" />
          <Alert tone="info" title="No approvals for your role">
            Your role does not sit in the approval chain. You can see the
            progress of your own requests on the{' '}
            <Link href="/travel-requests" className="font-medium underline">
              travel requests
            </Link>{' '}
            page.
          </Alert>
        </div>
      </MainLayout>
    )
  }

  const queueStatuses = QUEUE_STATUSES[role] ?? []

  return (
    <MainLayout>
      <div className="space-y-6">
        <PageHeader
          title="Approvals"
          description={STAGE_DESCRIPTION[role]}
          actions={
            <Button variant="secondary" onClick={load}>
              Refresh
            </Button>
          }
        />

        {loading ? (
          <Spinner label="Loading your queue…" />
        ) : rows.length === 0 ? (
          <EmptyState
            title="Your queue is clear"
            description={
              queueStatuses.length > 0
                ? `Nothing is currently at the ${queueStatuses
                    .map((s) => s.replace(/_/g, ' ').toLowerCase())
                    .join(' or ')} stage.`
                : 'Nothing is currently waiting on you.'
            }
            action={
              <Link href="/travel-requests">
                <Button variant="secondary">Browse all requests</Button>
              </Link>
            }
          />
        ) : (
          <div className="space-y-3">
            {rows.map((row) => (
              <Card key={row.id}>
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <Link
                        href={`/travel-requests/${row.id}`}
                        className="text-sm font-semibold text-blue-600 hover:underline"
                      >
                        {row.request_number}
                      </Link>
                      <StatusBadge status={row.status} />
                    </div>
                    <p className="mt-1 text-sm text-gray-900">
                      {row.destination} · {row.number_of_travellers} traveller
                      {row.number_of_travellers === 1 ? '' : 's'}
                    </p>
                    <p className="mt-0.5 text-xs text-gray-600">
                      {row.requester_name} · {row.department_name} ·{' '}
                      {row.project_code} · travelling{' '}
                      {formatDate(row.first_travel_date)}
                    </p>
                  </div>

                  <div className="flex items-center gap-4 lg:shrink-0">
                    <div className="text-right">
                      <p className="text-xs uppercase tracking-wide text-gray-500">
                        Estimated
                      </p>
                      <p className="text-sm font-semibold tabular-nums text-gray-900">
                        {formatCurrency(row.estimated_cost)}
                      </p>
                      {row.submitted_at && (
                        <p className="text-xs text-gray-500">
                          submitted {formatRelative(row.submitted_at)}
                        </p>
                      )}
                    </div>
                    <Link href={`/travel-requests/${row.id}`}>
                      <Button>Review</Button>
                    </Link>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {!loading && rows.length > 0 && (
          <Alert tone="info" title="Approve and reject actions are next">
            This queue is live and reads from the same data as everything else.
            The decision buttons — approve, reject, request changes, with
            comments — are the next piece of the workflow to build.
          </Alert>
        )}
      </div>
    </MainLayout>
  )
}
