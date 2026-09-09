'use client'

import { Alert, Button, DetailItem } from '@/components/common'
import { estimateDraftCost, nightsBetween, toAmount } from '@/lib/draft'
import {
  BOOKING_RESPONSIBILITY_LABELS,
  TRANSPORT_MODE_LABELS,
  TRAVEL_TYPE_LABELS,
  VEHICLE_CLASS_LABELS,
} from '@/types/travel-request'
import type { WizardStepId } from '@/types/travel-request'
import type { BudgetPosition } from '@/services/travel-request.service'
import { formatCurrency, formatDate, formatDateRange } from '@/utils/format'
import type { StepProps } from './types'

interface ReviewStepProps extends StepProps {
  budget: BudgetPosition | null
  budgetLoading: boolean
  onJumpToStep: (step: WizardStepId) => void
  /** Errors from every step, so the review can block a broken submission. */
  allErrors: Record<string, string>
}

function SectionHeading({
  title,
  onEdit,
}: {
  title: string
  onEdit: () => void
}) {
  return (
    <div className="mb-3 flex items-center justify-between border-b border-gray-100 pb-2">
      <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
      <Button variant="ghost" size="sm" onClick={onEdit}>
        Edit
      </Button>
    </div>
  )
}

export function ReviewStep({
  draft,
  reference,
  budget,
  budgetLoading,
  onJumpToStep,
  allErrors,
}: ReviewStepProps) {
  const project = reference.projects.find((p) => p.id === draft.project_id)
  const department = reference.departments.find((d) => d.id === draft.department_id)
  const travellers = draft.traveller_ids
    .map((id) => reference.profiles.find((p) => p.id === id))
    .filter((p): p is NonNullable<typeof p> => Boolean(p))

  const total = estimateDraftCost(draft)
  const errorCount = Object.keys(allErrors).length

  return (
    <div className="space-y-6">
      {errorCount > 0 && (
        <Alert tone="error" title="This request is not ready to submit">
          There {errorCount === 1 ? 'is' : 'are'} {errorCount} item
          {errorCount === 1 ? '' : 's'} still to fix. Step back through the form —
          incomplete steps are marked in the progress bar above.
        </Alert>
      )}

      {/* ---------------- Trip ---------------- */}
      <section>
        <SectionHeading title="Trip details" onEdit={() => onJumpToStep('trip')} />
        <dl className="grid gap-4 sm:grid-cols-3">
          <DetailItem label="Travel type">
            {TRAVEL_TYPE_LABELS[draft.travel_type]}
          </DetailItem>
          <DetailItem label="Project">
            {project ? `${project.project_code} — ${project.project_name}` : '—'}
          </DetailItem>
          <DetailItem label="Department">{department?.name ?? '—'}</DetailItem>
        </dl>
      </section>

      {/* ---------------- Travellers ---------------- */}
      <section>
        <SectionHeading
          title={`Travellers (${travellers.length})`}
          onEdit={() => onJumpToStep('travellers')}
        />
        <ul className="space-y-1.5">
          {travellers.map((t) => (
            <li key={t.id} className="text-sm text-gray-900">
              {t.first_name} {t.last_name}
              <span className="text-gray-600"> · {t.job_title ?? '—'}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* ---------------- Itinerary ---------------- */}
      <section>
        <SectionHeading
          title={`Itinerary (${draft.itineraries.length} leg${draft.itineraries.length === 1 ? '' : 's'})`}
          onEdit={() => onJumpToStep('itinerary')}
        />
        <div className="space-y-3">
          {draft.itineraries.map((leg, index) => (
            <div
              key={leg.key}
              className="rounded-lg border border-gray-200 bg-gray-50 p-3"
            >
              <p className="text-sm font-medium text-gray-900">
                Leg {index + 1}: {leg.origin || '—'} → {leg.destination || '—'}
              </p>
              <dl className="mt-2 grid gap-3 sm:grid-cols-4">
                <DetailItem label="Mode">
                  {TRANSPORT_MODE_LABELS[leg.transport_mode]}
                </DetailItem>
                <DetailItem label="Dates">
                  {leg.round_trip
                    ? formatDateRange(leg.travel_date, leg.return_date)
                    : formatDate(leg.travel_date)}
                </DetailItem>
                <DetailItem label="Flights">
                  {leg.flight_booking_by === 'NOT_REQUIRED'
                    ? 'Not required'
                    : `${leg.departure_airport || '—'} → ${leg.destination_airport || '—'} (${BOOKING_RESPONSIBILITY_LABELS[leg.flight_booking_by]})`}
                </DetailItem>
                <DetailItem label="Airfare est.">
                  {toAmount(leg.flight_estimated_cost) > 0
                    ? formatCurrency(toAmount(leg.flight_estimated_cost))
                    : '—'}
                </DetailItem>
              </dl>
            </div>
          ))}
        </div>
      </section>

      {/* ---------------- Logistics ---------------- */}
      <section>
        <SectionHeading
          title="Accommodation & vehicles"
          onEdit={() => onJumpToStep('logistics')}
        />
        <div className="space-y-3">
          {draft.itineraries.map((leg, index) => {
            if (!leg.accommodation_required && !leg.vehicle_required) {
              return (
                <p key={leg.key} className="text-sm text-gray-600">
                  Leg {index + 1}: nothing additional required.
                </p>
              )
            }
            const nights = nightsBetween(leg.check_in_date, leg.check_out_date)
            return (
              <div
                key={leg.key}
                className="rounded-lg border border-gray-200 bg-gray-50 p-3"
              >
                <p className="text-sm font-medium text-gray-900">
                  Leg {index + 1}: {leg.destination || '—'}
                </p>
                <dl className="mt-2 grid gap-3 sm:grid-cols-4">
                  {leg.accommodation_required && (
                    <>
                      <DetailItem label="Accommodation">
                        {leg.accommodation_location || '—'}
                        {nights > 0 && ` · ${nights} night${nights === 1 ? '' : 's'}`}
                      </DetailItem>
                      <DetailItem label="Rooms / booked by">
                        {leg.rooms_required} ·{' '}
                        {BOOKING_RESPONSIBILITY_LABELS[leg.accommodation_booking_by]}
                      </DetailItem>
                      <DetailItem label="Accommodation est.">
                        {toAmount(leg.accommodation_estimated_cost) > 0
                          ? formatCurrency(
                              toAmount(leg.accommodation_estimated_cost)
                            )
                          : '—'}
                      </DetailItem>
                    </>
                  )}
                  {leg.vehicle_required && (
                    <>
                      <DetailItem label="Vehicle">
                        {leg.own_vehicle
                          ? 'Own vehicle (km claim)'
                          : `${VEHICLE_CLASS_LABELS[leg.vehicle_class]} · ${BOOKING_RESPONSIBILITY_LABELS[leg.vehicle_booking_by]}`}
                      </DetailItem>
                      {!leg.own_vehicle && (
                        <DetailItem label="Vehicle est.">
                          {toAmount(leg.vehicle_estimated_cost) > 0
                            ? formatCurrency(toAmount(leg.vehicle_estimated_cost))
                            : '—'}
                        </DetailItem>
                      )}
                    </>
                  )}
                </dl>
              </div>
            )
          })}
        </div>
      </section>

      {/* ---------------- Justification ---------------- */}
      <section>
        <SectionHeading
          title="Business justification"
          onEdit={() => onJumpToStep('business')}
        />
        <dl className="space-y-3">
          <DetailItem label="Activity">{draft.business_activity || '—'}</DetailItem>
          <DetailItem label="Purpose">
            <span className="whitespace-pre-wrap">
              {draft.business_purpose || '—'}
            </span>
          </DetailItem>
          <DetailItem label="Justification">
            <span className="whitespace-pre-wrap">
              {draft.travel_justification || '—'}
            </span>
          </DetailItem>
        </dl>
      </section>

      {/* ---------------- Costs & budget ---------------- */}
      <section>
        <SectionHeading
          title="Costs and budget"
          onEdit={() => onJumpToStep('advance')}
        />

        <div className="overflow-hidden rounded-lg border border-gray-200">
          <table className="w-full text-sm">
            <tbody className="divide-y divide-gray-100">
              {draft.itineraries.map((leg, index) => {
                const rows: Array<[string, number]> = []
                const flight = toAmount(leg.flight_estimated_cost)
                const acc = toAmount(leg.accommodation_estimated_cost)
                const veh = toAmount(leg.vehicle_estimated_cost)
                if (flight > 0) rows.push([`Leg ${index + 1} — flights`, flight])
                if (acc > 0) rows.push([`Leg ${index + 1} — accommodation`, acc])
                if (veh > 0) rows.push([`Leg ${index + 1} — vehicle`, veh])
                return rows.map(([label, value]) => (
                  <tr key={label}>
                    <td className="px-4 py-2 text-gray-700">{label}</td>
                    <td className="px-4 py-2 text-right tabular-nums text-gray-900">
                      {formatCurrency(value)}
                    </td>
                  </tr>
                ))
              })}
              {draft.st_advance_required && toAmount(draft.st_advance_amount) > 0 && (
                <tr>
                  <td className="px-4 py-2 text-gray-700">S&amp;T advance</td>
                  <td className="px-4 py-2 text-right tabular-nums text-gray-900">
                    {formatCurrency(toAmount(draft.st_advance_amount))}
                  </td>
                </tr>
              )}
              <tr className="bg-gray-50">
                <td className="px-4 py-2.5 font-semibold text-gray-900">
                  Total estimated cost
                </td>
                <td className="px-4 py-2.5 text-right font-semibold tabular-nums text-gray-900">
                  {formatCurrency(total)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {total === 0 && (
          <p className="mt-2 text-xs text-gray-500">
            No cost estimates were entered. Finance will cost this request during
            review, but an estimate helps the budget check.
          </p>
        )}

        <div className="mt-4">
          {budgetLoading && (
            <p className="text-sm text-gray-500">Checking project budget…</p>
          )}

          {!budgetLoading && budget && (
            <>
              <dl className="grid gap-4 rounded-lg border border-gray-200 bg-gray-50 p-4 sm:grid-cols-4">
                <DetailItem label="Project travel budget">
                  {formatCurrency(budget.project_travel_budget)}
                </DetailItem>
                <DetailItem label="Already committed">
                  {formatCurrency(budget.existing_commitments)}
                </DetailItem>
                <DetailItem label="Available now">
                  {formatCurrency(budget.remaining_before_request)}
                </DetailItem>
                <DetailItem label="Left after this trip">
                  <span
                    className={
                      budget.is_budget_exception
                        ? 'font-semibold text-red-700'
                        : 'font-semibold text-green-700'
                    }
                  >
                    {formatCurrency(budget.remaining_after_request)}
                  </span>
                </DetailItem>
              </dl>

              <div className="mt-3">
                {budget.is_budget_exception ? (
                  <Alert
                    tone="warning"
                    title={`Over budget by ${formatCurrency(budget.amount_over_budget)}`}
                  >
                    This request exceeds the remaining travel budget on{' '}
                    {project?.project_code ?? 'this project'}. It can still be
                    submitted — Finance will flag it as a budget exception and it
                    will be routed to the CEO for a final decision.
                  </Alert>
                ) : (
                  <Alert tone="success" title="Within budget">
                    This request fits inside the remaining travel budget on{' '}
                    {project?.project_code ?? 'this project'}.
                  </Alert>
                )}
              </div>
            </>
          )}
        </div>
      </section>

      <Alert tone="info" title="What happens when you submit">
        The request is locked for editing and sent to{' '}
        {department?.name ?? 'your department'}&apos;s HOD for approval. From
        there it goes to the Travel Officer for booking, then Finance
        {budget?.is_budget_exception ? ', and finally the CEO for the budget exception' : ''}
        . You will be emailed at each step.
      </Alert>
    </div>
  )
}
