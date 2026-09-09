'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { MainLayout } from '@/components/layout/MainLayout'
import {
  Button,
  EmptyState,
  PageHeader,
  Select,
  Spinner,
  StatusBadge,
  TextInput,
} from '@/components/common'
import { useRole, useViewer } from '@/hooks/useRole'
import { listRequests, QUEUE_STATUSES } from '@/services/travel-request.service'
import type { TravelRequestSummary } from '@/types/travel-request'
import { STATUS_LABELS } from '@/types/travel-request'
import type { TravelStatus } from '@/types/database'
import { formatCurrency, formatDate } from '@/utils/format'

type Tab = 'all' | 'mine' | 'queue'

const STATUS_FILTER_OPTIONS: TravelStatus[] = [
  'DRAFT',
  'HOD_REVIEW',
  'TRAVEL_OFFICER_REVIEW',
  'TRAVEL_PROCESSING',
  'FINANCE_REVIEW',
  'BUDGET_EXCEPTION',
  'CEO_APPROVAL',
  'FULLY_APPROVED',
  'BOOKING_COMPLETE',
  'TRAVEL_COMPLETED',
  'REJECTED',
  'CANCELLED',
]

export default function TravelRequestsPage() {
  const viewer = useViewer()
  const { role, isApprover } = useRole()

  const [tab, setTab] = useState<Tab>('all')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<TravelStatus | ''>('')
  const [rows, setRows] = useState<TravelRequestSummary[]>([])
  const [loading, setLoading] = useState(true)

  const hasQueue = useMemo(
    () => Boolean(role && (QUEUE_STATUSES[role] ?? []).length > 0),
    [role]
  )

  const load = useCallback(async () => {
    if (!viewer) return
    setLoading(true)
    try {
      const result = await listRequests(viewer, {
        onlyMine: tab === 'mine',
        onlyQueue: tab === 'queue',
        statuses: statusFilter ? [statusFilter] : undefined,
        search,
      })
      setRows(result)
    } finally {
      setLoading(false)
    }
  }, [viewer, tab, statusFilter, search])

  useEffect(() => {
    load()
  }, [load])

  const tabs: Array<{ id: Tab; label: string; show: boolean }> = [
    { id: 'all', label: 'All I can see', show: true },
    { id: 'mine', label: 'My requests', show: true },
    {
      id: 'queue',
      label: 'Awaiting my action',
      show: hasQueue && isApprover,
    },
  ]

  return (
    <MainLayout>
      <div className="space-y-6">
        <PageHeader
          title="Travel requests"
          description="Raise a new request, track your own, and see anything awaiting you."
          actions={
            <Link href="/travel-requests/new">
              <Button>+ New request</Button>
            </Link>
          }
        />

        <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
          {/* Filters */}
          <div className="flex flex-col gap-3 border-b border-gray-100 p-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap gap-1">
              {tabs
                .filter((t) => t.show)
                .map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setTab(t.id)}
                    className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                      tab === t.id
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              <TextInput
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search number, name, destination…"
                className="sm:w-64"
              />
              <Select
                value={statusFilter}
                onChange={(e) =>
                  setStatusFilter(e.target.value as TravelStatus | '')
                }
                className="sm:w-52"
              >
                <option value="">All statuses</option>
                {STATUS_FILTER_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {STATUS_LABELS[s]}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          {/* Table */}
          {loading ? (
            <Spinner label="Loading requests…" />
          ) : rows.length === 0 ? (
            <div className="p-4">
              <EmptyState
                title="Nothing to show here"
                description={
                  tab === 'queue'
                    ? 'Your approval queue is clear.'
                    : tab === 'mine'
                      ? 'You have not raised any travel requests yet.'
                      : 'No requests match the current filters.'
                }
                action={
                  tab !== 'queue' ? (
                    <Link href="/travel-requests/new">
                      <Button>Create a travel request</Button>
                    </Link>
                  ) : undefined
                }
              />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[860px] text-sm">
                <thead className="bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-500">
                  <tr>
                    <th className="px-4 py-3 font-medium">Request</th>
                    <th className="px-4 py-3 font-medium">Requester</th>
                    <th className="px-4 py-3 font-medium">Destination</th>
                    <th className="px-4 py-3 font-medium">Travel date</th>
                    <th className="px-4 py-3 font-medium">Project</th>
                    <th className="px-4 py-3 text-right font-medium">Estimated</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {rows.map((row) => (
                    <tr key={row.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <Link
                          href={`/travel-requests/${row.id}`}
                          className="font-medium text-blue-600 hover:underline"
                        >
                          {row.request_number}
                        </Link>
                        <p className="text-xs text-gray-500">
                          {row.number_of_travellers} traveller
                          {row.number_of_travellers === 1 ? '' : 's'}
                        </p>
                      </td>
                      <td className="px-4 py-3 text-gray-900">
                        {row.requester_name}
                        <p className="text-xs text-gray-500">{row.department_name}</p>
                      </td>
                      <td className="px-4 py-3 text-gray-900">{row.destination}</td>
                      <td className="px-4 py-3 text-gray-700">
                        {formatDate(row.first_travel_date)}
                      </td>
                      <td className="px-4 py-3 text-gray-700">{row.project_code}</td>
                      <td className="px-4 py-3 text-right tabular-nums text-gray-900">
                        {formatCurrency(row.estimated_cost)}
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={row.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {!loading && rows.length > 0 && (
          <p className="text-xs text-gray-500">
            Showing {rows.length} request{rows.length === 1 ? '' : 's'}. What you
            can see is governed by your role — the same rules the database
            enforces through row level security.
          </p>
        )}
      </div>
    </MainLayout>
  )
}
