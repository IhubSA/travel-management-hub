'use client'

import { Alert, Checkbox, Field, TextArea, TextInput } from '@/components/common'
import { toAmount } from '@/lib/draft'
import { formatCurrency } from '@/utils/format'
import type { StepProps } from './types'

export function STAdvanceStep({ draft, update, errors }: StepProps) {
  const travellerCount = draft.traveller_ids.length
  const amount = toAmount(draft.st_advance_amount)

  /** Rough nights across all legs, to sanity-check the amount requested. */
  const nights = draft.itineraries.reduce((total, leg) => {
    if (!leg.check_in_date || !leg.check_out_date) return total
    const a = new Date(leg.check_in_date).getTime()
    const b = new Date(leg.check_out_date).getTime()
    if (Number.isNaN(a) || Number.isNaN(b)) return total
    return total + Math.max(0, Math.round((b - a) / 86_400_000))
  }, 0)

  return (
    <div className="space-y-5">
      <p className="text-sm text-gray-600">
        A subsistence and travel (S&amp;T) advance is money paid before the trip
        for meals and incidental costs. Leave this off if everything is being
        booked and paid centrally.
      </p>

      <Checkbox
        label="An S&T advance is required"
        description="Finance pays this out before departure."
        checked={draft.st_advance_required}
        onChange={(e) =>
          update({
            st_advance_required: e.target.checked,
            st_advance_amount: e.target.checked ? draft.st_advance_amount : '',
            st_advance_reason: e.target.checked ? draft.st_advance_reason : '',
          })
        }
      />

      {draft.st_advance_required && (
        <div className="space-y-4 rounded-lg border border-amber-100 bg-amber-50/60 p-4">
          <Field
            label="Advance amount (R)"
            htmlFor="st_advance_amount"
            required
            error={errors.st_advance_amount}
            hint={
              errors.st_advance_amount
                ? undefined
                : `Covering ${travellerCount} traveller${travellerCount === 1 ? '' : 's'}${nights > 0 ? ` over ${nights} night${nights === 1 ? '' : 's'}` : ''}.`
            }
          >
            <TextInput
              id="st_advance_amount"
              inputMode="decimal"
              value={draft.st_advance_amount}
              invalid={Boolean(errors.st_advance_amount)}
              placeholder="0"
              onChange={(e) => update({ st_advance_amount: e.target.value })}
            />
          </Field>

          <Field
            label="What does the advance cover?"
            htmlFor="st_advance_reason"
            required
            error={errors.st_advance_reason}
          >
            <TextArea
              id="st_advance_reason"
              rows={3}
              value={draft.st_advance_reason}
              invalid={Boolean(errors.st_advance_reason)}
              placeholder="e.g. Meals and local transport for two staff over three days."
              onChange={(e) => update({ st_advance_reason: e.target.value })}
            />
          </Field>

          {amount > 0 && (
            <Alert tone="warning" title={`${formatCurrency(amount)} requested`}>
              This is added to the total cost of the request and counts against
              the project&apos;s travel budget. Supporting receipts must be
              submitted within seven days of returning.
            </Alert>
          )}
        </div>
      )}
    </div>
  )
}
