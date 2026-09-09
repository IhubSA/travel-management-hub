'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { MainLayout } from '@/components/layout/MainLayout'
import {
  Alert,
  Button,
  Card,
  DetailItem,
  Modal,
  PageHeader,
  Spinner,
  StatusBadge,
} from '@/components/common'
import { ApprovalTimeline } from '@/components/travel-request/ApprovalTimeline'
import { useAuth } from '@/context/AuthContext'
import { useViewer } from '@/hooks/useRole'
import { listProfiles } from '@/services/reference.service'
import { deleteDraft, getRequest } from '@/services/travel-request.service'
import type { ProfileRow } from '@/types/database'
import type { TravelRequestDetail } from '@/types/travel-request'
import {
  BOOKING_RESPONSIBILITY_LABELS,
  TRANSPORT_MODE_LABELS,
  TRAVEL_TYPE_LABELS,
  VEHICLE_CLASS_LABELS,
} from '@/types/travel-request'
import {
  formatCurrency,
  formatDate,
  formatDateRange,
  formatDateTime,
  humaniseEnum,
} from '@/utils/format'

export default function TravelRequestDetailPage() {
  const params = useParams<{ id: string }>()
  const id = typeof params?.id === 'string' ? params.id : ''
  const router = useRouter()
  const viewer = useViewer()
  const { profile } = useAuth()

  const [request, setRequest] = useState<TravelRequestDetail | null>(null)
  const [profiles, setProfiles] = useState<ProfileRow[]>([])
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [justSubmitted, setJustSubmitted] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)

  // Confirmation banner is signalled by the wizard through sessionStorage.
  useEffect(() => {
    try {
      if (window.sessionStorage.getItem('arc-just-submitted') === id) {
        setJustSubmitted(true)
        window.sessionStorage.removeItem('arc-just-submitted')
      }
    } catch {
      // Storage unavailable — skip the banner.
    }
  }, [id])

  const load = useCallback(async () => {
    if (!viewer || !id) return
    setLoading(true)
    try {
      const [detail, people] = await Promise.all([
        getRequest(id, viewer),
        listProfiles(),
      ])
      setProfiles(people)
      if (!detail) {
        setNotFound(true)
      } else {
        setRequest(detail)
        setNotFound(false)
      }
    } finally {
      setLoading(false)
    }
  }, [viewer, id])

  useEffect(() => {
    load()
  }, [load])

  const handleDelete = async () => {
    if (!request) return
    setDeleting(true)
    try {
      await deleteDraft(request.id)
      router.push('/travel-requests')
    } catch {
      setDeleting(false)
      setConfirmDelete(false)
    }
  }

  if (loading) {
    return (
      <MainLayout>
        <Spinner label="Loading request…" />
      </MainLayout>
    )
  }

  if (notFound || !request) {
    return (
      <MainLayout>
        <div className="space-y-4">
          <Alert tone="error" title="Request not available">
            This travel request either does not exist, or your role does not give
            you visibility of it.
          </Alert>
          <Link href="/travel-requests">
            <Button variant="secondary">Back to travel requests</Button>
          </Link>
        </div>
      </MainLayout>
    )
  }

  const isOwner = profile?.id === request.requester_id
  const isDraft = request.status === 'DRAFT'
  const nameOf = (pid: string | null) => {
    if (!pid) return '—'
    const p = profiles.find((x) => x.id === pid)
    return p ? `${p.first_name} ${p.last_name}` : '—'
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <nav className="text-sm text-gray-500">
          <Link href="/travel-requests" className="hover:underline">
            Travel requests
          </Link>
          <span className="mx-2">/</span>
          <span className="text-gray-900">{request.request_number}</span>
        </nav>

        {justSubmitted && (
          <Alert tone="success" title="Request submitted">
            {request.request_number} has gone to{' '}
            {request.department?.name ?? 'your department'}&apos;s HOD for
            approval. You will be notified when there is a decision.
          </Alert>
        )}

        <PageHeader
          title={request.business_activity || request.request_number}
          description={`${request.request_number} · raised by ${nameOf(request.requester_id)}`}
          actions={
            <>
              <StatusBadge status={request.status} className="self-center px-3 py-1.5" />
              {isDraft && isOwner && (
                <>
                  <Link href={`/travel-requests/${request.id}/edit`}>
                    <Button variant="secondary">Continue editing</Button>
                  </Link>
                  <Button variant="danger" onClick={() => setConfirmDelete(true)}>
                    Delete draft
                  </Button>
                </>
              )}
            </>
          }
        />

        {isDraft && (
          <Alert tone="warning" title="This request has not been submitted">
            It is still a draft and no one has been asked to approve it.
            {isOwner && ' Continue editing to finish and submit it.'}
          </Alert>
        )}

        {request.budget_check?.is_budget_exception && (
          <Alert
            tone="warning"
            title={`Budget exception — over by ${formatCurrency(request.budget_check.amount_over_budget ?? 0)}`}
          >
            This request exceeds the remaining travel budget on{' '}
            {request.project?.project_code ?? 'the project'} and requires CEO
            approval. Flagged by {nameOf(request.budget_check.checked_by)} on{' '}
            {formatDate(request.budget_check.checked_at)}.
          </Alert>
        )}

        <div className="grid gap-6 lg:grid-cols-3">
          {/* ---------------- Main column ---------------- */}
          <div className="space-y-6 lg:col-span-2">
            <Card title="Overview">
              <dl className="grid gap-4 sm:grid-cols-3">
                <DetailItem label="Travel type">
                  {TRAVEL_TYPE_LABELS[request.travel_type]}
                </DetailItem>
                <DetailItem label="Project">
                  {request.project
                    ? `${request.project.project_code} — ${request.project.project_name}`
                    : '—'}
                </DetailItem>
                <DetailItem label="Department">
                  {request.department?.name ?? '—'}
                </DetailItem>
                <DetailItem label="Raised">
                  {formatDateTime(request.created_at)}
                </DetailItem>
                <DetailItem label="Submitted">
                  {request.submitted_at
                    ? formatDateTime(request.submitted_at)
                    : 'Not submitted'}
                </DetailItem>
                <DetailItem label="Travellers">
                  {request.number_of_travellers ?? request.travellers.length}
                </DetailItem>
              </dl>
            </Card>

            <Card title="Business justification">
              <dl className="space-y-4">
                <DetailItem label="Purpose">
                  <span className="whitespace-pre-wrap">
                    {request.business_purpose || '—'}
                  </span>
                </DetailItem>
                <DetailItem label="Justification">
                  <span className="whitespace-pre-wrap">
                    {request.travel_justification}
                  </span>
                </DetailItem>
              </dl>
            </Card>

            <Card
              title={`Itinerary (${request.itineraries.length} leg${request.itineraries.length === 1 ? '' : 's'})`}
            >
              <div className="space-y-4">
                {request.itineraries.map((leg, index) => {
                  const air = leg.air_travel[0]
                  const road = leg.road_travel[0]
                  const acc = leg.accommodation[0]
                  const veh = leg.rental_vehicles[0]

                  return (
                    <div
                      key={leg.id}
                      className="rounded-lg border border-gray-200 bg-gray-50 p-4"
                    >
                      <div className="flex flex-wrap items-baseline justify-between gap-2">
                        <h3 className="text-sm font-semibold text-gray-900">
                          Leg {index + 1}: {leg.origin} → {leg.destination}
                        </h3>
                        <span className="text-xs text-gray-600">
                          {TRANSPORT_MODE_LABELS[leg.transport_mode]} ·{' '}
                          {leg.round_trip
                            ? formatDateRange(
                                leg.travel_date,
                                air?.return_date ?? road?.return_date ?? null
                              )
                            : formatDate(leg.travel_date)}
                        </span>
                      </div>

                      <dl className="mt-3 grid gap-3 sm:grid-cols-2">
                        {air && (
                          <DetailItem label="Flights">
                            {air.departure_airport} → {air.destination_airport}
                            <span className="block text-xs text-gray-600">
                              {BOOKING_RESPONSIBILITY_LABELS[air.booking_by]} ·{' '}
                              {humaniseEnum(air.booking_status)}
                              {air.airline_name &&
                                ` · ${air.airline_name} ${air.flight_number ?? ''}`}
                              {air.confirmation_reference &&
                                ` · ref ${air.confirmation_reference}`}
                            </span>
                            {air.ticket_cost != null && (
                              <span className="block text-xs font-medium text-gray-900">
                                {formatCurrency(air.ticket_cost)}
                              </span>
                            )}
                          </DetailItem>
                        )}

                        {acc && (
                          <DetailItem label="Accommodation">
                            {acc.location}
                            <span className="block text-xs text-gray-600">
                              {formatDateRange(acc.check_in_date, acc.check_out_date)} ·{' '}
                              {acc.nights_count} night
                              {acc.nights_count === 1 ? '' : 's'} · {acc.rooms_required}{' '}
                              room{acc.rooms_required === 1 ? '' : 's'}
                            </span>
                            <span className="block text-xs text-gray-600">
                              {BOOKING_RESPONSIBILITY_LABELS[acc.booking_by]} ·{' '}
                              {humaniseEnum(acc.booking_status)}
                              {acc.provider_name && ` · ${acc.provider_name}`}
                            </span>
                            {(acc.actual_cost ?? acc.estimated_cost) != null && (
                              <span className="block text-xs font-medium text-gray-900">
                                {formatCurrency(acc.actual_cost ?? acc.estimated_cost)}
                              </span>
                            )}
                          </DetailItem>
                        )}

                        {veh && (
                          <DetailItem label="Vehicle">
                            {VEHICLE_CLASS_LABELS[veh.vehicle_class]}
                            <span className="block text-xs text-gray-600">
                              {BOOKING_RESPONSIBILITY_LABELS[veh.booking_by]} ·{' '}
                              {humaniseEnum(veh.booking_status)}
                              {veh.rental_company && ` · ${veh.rental_company}`}
                            </span>
                            {veh.second_driver_required && (
                              <span className="block text-xs text-gray-600">
                                Second driver: {nameOf(veh.second_driver_id)}
                              </span>
                            )}
                            {(veh.actual_cost ?? veh.estimated_cost) != null && (
                              <span className="block text-xs font-medium text-gray-900">
                                {formatCurrency(veh.actual_cost ?? veh.estimated_cost)}
                              </span>
                            )}
                          </DetailItem>
                        )}

                        {road?.own_vehicle && (
                          <DetailItem label="Vehicle">
                            Own vehicle — kilometre claim
                          </DetailItem>
                        )}

                        {leg.notes && (
                          <DetailItem label="Notes" className="sm:col-span-2">
                            {leg.notes}
                          </DetailItem>
                        )}
                      </dl>
                    </div>
                  )
                })}
              </div>
            </Card>

            {request.audit_logs.length > 0 && (
              <Card title="Activity">
                <ol className="space-y-3">
                  {request.audit_logs
                    .slice()
                    .reverse()
                    .map((log) => (
                      <li key={log.id} className="flex gap-3 text-sm">
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gray-300" />
                        <div className="min-w-0">
                          <p className="text-gray-900">
                            {humaniseEnum(log.action)}
                            <span className="text-gray-600">
                              {' '}
                              by {nameOf(log.user_id)}
                            </span>
                          </p>
                          <p className="text-xs text-gray-500">
                            {formatDateTime(log.created_at)}
                          </p>
                          {log.comments && (
                            <p className="mt-1 text-xs text-gray-600">
                              {log.comments}
                            </p>
                          )}
                        </div>
                      </li>
                    ))}
                </ol>
              </Card>
            )}
          </div>

          {/* ---------------- Sidebar column ---------------- */}
          <div className="space-y-6">
            <Card title="Approval progress">
              <ApprovalTimeline
                status={request.status}
                approvals={request.approvals}
                profiles={profiles}
                isBudgetException={Boolean(
                  request.budget_check?.is_budget_exception
                )}
              />
            </Card>

            <Card title="Costs">
              <dl className="space-y-3">
                <DetailItem label="Total estimated">
                  <span className="text-lg font-semibold">
                    {formatCurrency(request.estimated_cost)}
                  </span>
                </DetailItem>
                {request.st_advance_required && (
                  <DetailItem label="S&T advance">
                    {formatCurrency(request.st_advance_amount)}
                    {request.st_advance_reason && (
                      <span className="mt-0.5 block text-xs text-gray-600">
                        {request.st_advance_reason}
                      </span>
                    )}
                  </DetailItem>
                )}
                {request.project && (
                  <DetailItem label="Project travel budget">
                    {formatCurrency(request.project.travel_budget)}
                  </DetailItem>
                )}
              </dl>
            </Card>

            <Card title={`Travellers (${request.travellers.length})`}>
              <ul className="space-y-2">
                {request.travellers.map((t) => (
                  <li key={t.id} className="text-sm">
                    <p className="font-medium text-gray-900">
                      {t.first_name} {t.last_name}
                    </p>
                    <p className="text-xs text-gray-600">{t.job_title ?? '—'}</p>
                  </li>
                ))}
              </ul>
            </Card>
          </div>
        </div>

        <Modal
          open={confirmDelete}
          onClose={() => setConfirmDelete(false)}
          title="Delete this draft?"
          footer={
            <>
              <Button variant="secondary" onClick={() => setConfirmDelete(false)}>
                Cancel
              </Button>
              <Button variant="danger" onClick={handleDelete} loading={deleting}>
                Delete permanently
              </Button>
            </>
          }
        >
          <p>
            {request.request_number} will be removed. This cannot be undone, but
            since it was never submitted no one else has seen it.
          </p>
        </Modal>
      </div>
    </MainLayout>
  )
}
