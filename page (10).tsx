'use client'

// ============================================================================
// Dashboard
//
// One layout, driven by real data from the service layer. The stat cards and
// the work queue change per role rather than each role having a hand-written
// dashboard with fixed numbers.
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
import { useAuth } from '@/context/AuthContext'
import { useRole, useViewer } from '@/hooks/useRole'
import {
  getDashboardStats,
  listRequests,
  QUEUE_STATUSES,
  type DashboardStats,
} from '@/services/travel-request.service'
import type { TravelRequestSummary } from '@/types/travel-request'
import type { UserRole } from '@/types/database'
import { formatCurrency, formatDate } from '@/utils/format'

// ----------------------------------------------------------------------------
// Role framing
// ----------------------------------------------------------------------------

const ROLE_INTRO: Record<UserRole, string> = {
  SUPER_ADMIN:
    'You can see every request in the organisation, plus user and project administration.',
  CEO: 'Requests reach you when they exceed a project’s remaining travel budget and need a final decision.',
  FINANCE:
    'Cost verification and budget checks. Anything over budget is escalated to the CEO.',
  TRAVEL_OFFICER:
    'Approved requests land here for flights, accommodation and vehicle arrangements.',
  HOD: 'Requests from your department come to you first, before travel and finance.',
  STAFF: 'Raise requests, track approvals and see what is booked.',
}

const QUEUE_HEADING: Partial<Record<UserRole, string>> = {
  HOD: 'Waiting for your approval',
  TRAVEL_OFFICER: 'Waiting to be booked',
  FINANCE: 'Waiting for cost review',
  CEO: 'Budget exceptions for your decision',
  SUPER_ADMIN: 'Moving through approval',
}

// ----------------------------------------------------------------------------
// Stat card
// ----------------------------------------------------------------------------

function Stat({
  label,
  value,
  hint,
  tone = 'default',
  href,
}: {
  label: string
  value: string | number
  hint?: string
  tone?: 'default' | 'attention' | 'positive'
  href?: string
}) {
  const tones = {
    default: 'border-gray-200 bg-white',
    attention: 'border-amber-300 bg-amber-50',
    positive: 'border-green-200 bg-green-50',
  }

  const body = (
    <div
      className={`h-full rounded-lg border p-4 shadow-sm transition-colors ${tones[tone]} ${
        href ? 'hover:border-blue-400' : ''
      }`}
    >
      <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
        {label}
      </p>
      <p className="mt-1 text-2xl font-bold text-gray-900">{value}</p>
      {hint && <p className="mt-0.5 text-xs text-gray-600">{hint}</p>}
    </div>
  )

  return href ? (
    <Link href={href} className="block">
      {body}
    </Link>
  ) : (
    body
  )
}

// ----------------------------------------------------------------------------
// Request list row
// ----------------------------------------------------------------------------

function RequestRow({ row }: { row: TravelRequestSummary }) {
  return (
    <li>
      <Link
        href={`/travel-requests/${row.id}`}
        className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-gray-200 p-3 transition-colors hover:border-blue-400 hover:bg-blue-50/40"
      >
        <div className="min-w-0">
          <p className="text-sm font-medium text-gray-900">
            {row.request_number}
            <span className="ml-2 font-normal text-gray-600">{row.destination}</span>
          </p>
          <p className="text-xs text-gray-600">
            {row.requester_name} · {row.project_code} ·{' '}
            {formatDate(row.first_travel_date)}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium tabular-nums text-gray-900">
            {formatCurrency(row.estimated_cost)}
          </span>
          <StatusBadge status={row.status} />
        </div>
      </Link>
    </li>
  )
}

// ----------------------------------------------------------------------------
// Page
// ----------------------------------------------------------------------------

export default function DashboardPage() {
  const { profile, loading: authLoading } = useAuth()
  const { role } = useRole()
  const viewer = useViewer()

  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [queue, setQueue] = useState<TravelRequestSummary[]>([])
  const [mine, setMine] = useState<TravelRequestSummary[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    if (!viewer) return
    setLoading(true)
    try {
      const [statsResult, queueResult, mineResult] = await Promise.all([
        getDashboardStats(viewer),
        listRequests(viewer, { onlyQueue: true }),
        listRequests(viewer, { onlyMine: true }),
      ])
      setStats(statsResult)
      setQueue(queueResult)
      setMine(mineResult)
    } finally {
      setLoading(false)
    }
  }, [viewer])

  useEffect(() => {
    load()
  }, [load])

  if (authLoading || loading || !stats || !role || !profile) {
    return (
      <MainLayout>
        <Spinner label="Loading dashboard…" />
      </MainLayout>
    )
  }

  const hasQueue = (QUEUE_STATUSES[role] ?? []).length > 0 || role === 'SUPER_ADMIN'
  const showsMoney = role === 'FINANCE' || role === 'CEO' || role === 'SUPER_ADMIN'
  const budgetUsedPct =
    stats.totalTravelBudget > 0
      ? Math.round((stats.totalCommitted / stats.totalTravelBudget) * 100)
      : 0

  return (
    <MainLayout>
      <div className="space-y-6">
        <PageHeader
          title={`Good day, ${profile.first_name}`}
          description={ROLE_INTRO[role]}
          actions={
            <Link href="/travel-requests/new">
              <Button>+ New travel request</Button>
            </Link>
          }
        />

        {/* ---------------- Stats ---------------- */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {hasQueue && (
            <Stat
              label="Awaiting your action"
              value={stats.pendingMyApproval}
              hint={
                stats.pendingMyApproval === 0
                  ? 'Your queue is clear'
                  : 'Needs a decision from you'
              }
              tone={stats.pendingMyApproval > 0 ? 'attention' : 'default'}
              href="/approvals"
            />
          )}

          <Stat
            label="My requests"
            value={stats.myRequests}
            hint={
              stats.myDrafts > 0
                ? `${stats.myDrafts} unsubmitted draft${stats.myDrafts === 1 ? '' : 's'}`
                : 'All submitted'
            }
            href="/travel-requests"
          />

          <Stat
            label="In approval"
            value={stats.inFlight}
            hint="Somewhere in the workflow"
          />

          <Stat
            label="Approved"
            value={stats.fullyApproved}
            hint="Cleared for travel"
            tone="positive"
          />

          {showsMoney && (
            <>
              <Stat
                label="Committed travel spend"
                value={formatCurrency(stats.totalCommitted)}
                hint={`${budgetUsedPct}% of ${formatCurrency(stats.totalTravelBudget)}`}
              />
              <Stat
                label="Budget exceptions"
                value={stats.budgetExceptions}
                hint={
                  stats.budgetExceptions === 0
                    ? 'Everything within budget'
                    : 'Over the project travel budget'
                }
                tone={stats.budgetExceptions > 0 ? 'attention' : 'default'}
              />
            </>
          )}
        </div>

        {/* ---------------- Budget bar ---------------- */}
        {showsMoney && (
          <Card
            title="Travel budget across active projects"
            description={`${formatCurrency(stats.totalCommitted)} committed of ${formatCurrency(
              stats.totalTravelBudget
            )} allocated`}
          >
            <div className="h-3 w-full overflow-hidden rounded-full bg-gray-200">
              <div
                className={`h-full rounded-full transition-all ${
                  budgetUsedPct > 90
                    ? 'bg-red-500'
                    : budgetUsedPct > 70
                      ? 'bg-amber-500'
                      : 'bg-green-500'
                }`}
                style={{ width: `${Math.min(100, budgetUsedPct)}%` }}
              />
            </div>
            <p className="mt-2 text-sm text-gray-600">
              {formatCurrency(
                Math.max(0, stats.totalTravelBudget - stats.totalCommitted)
              )}{' '}
              remaining across all active projects.
            </p>
          </Card>
        )}

        <div className="grid gap-6 lg:grid-cols-2">
          {/* ---------------- Queue ---------------- */}
          {hasQueue && (
            <Card
              title={QUEUE_HEADING[role] ?? 'Your queue'}
              actions={
                queue.length > 0 ? (
                  <Link href="/approvals">
                    <Button variant="secondary" size="sm">
                      View all
                    </Button>
                  </Link>
                ) : undefined
              }
            >
              {queue.length === 0 ? (
                <EmptyState
                  title="Nothing waiting on you"
                  description="New requests will appear here as they reach your stage."
                />
              ) : (
                <ul className="space-y-2">
                  {queue.slice(0, 5).map((row) => (
                    <RequestRow key={row.id} row={row} />
                  ))}
                </ul>
              )}
            </Card>
          )}

          {/* ---------------- My requests ---------------- */}
          <Card
            title="My recent requests"
            actions={
              <Link href="/travel-requests">
                <Button variant="secondary" size="sm">
                  View all
                </Button>
              </Link>
            }
          >
            {mine.length === 0 ? (
              <EmptyState
                title="You have not raised any travel yet"
                description="Start a request and save it as a draft — nothing is submitted until you say so."
                action={
                  <Link href="/travel-requests/new">
                    <Button>Create a travel request</Button>
                  </Link>
                }
              />
            ) : (
              <ul className="space-y-2">
                {mine.slice(0, 5).map((row) => (
                  <RequestRow key={row.id} row={row} />
                ))}
              </ul>
            )}
          </Card>
        </div>

        {stats.myDrafts > 0 && (
          <Alert
            tone="info"
            title={`You have ${stats.myDrafts} unsubmitted draft${stats.myDrafts === 1 ? '' : 's'}`}
          >
            Drafts are not visible to approvers and nothing happens until you
            submit them.{' '}
            <Link href="/travel-requests" className="font-medium underline">
              Review your drafts
            </Link>
            .
          </Alert>
        )}
      </div>
    </MainLayout>
  )
}
