'use client'

import { Alert, Field, TextArea, TextInput } from '@/components/common'
import type { StepProps } from './types'

const MIN_JUSTIFICATION = 40

export function BusinessInfoStep({ draft, update, errors }: StepProps) {
  const justificationLength = draft.travel_justification.trim().length

  return (
    <div className="space-y-5">
      <Alert tone="info" title="This is what approvers read first">
        The HOD, Finance and (where budget is exceeded) the CEO decide on this
        request largely from what you write here. Be specific about the
        deliverable the travel serves and why it cannot be done remotely.
      </Alert>

      <Field
        label="Activity name"
        htmlFor="business_activity"
        required
        error={errors.business_activity}
        hint="A short title, e.g. “ECD centre monitoring visit”"
      >
        <TextInput
          id="business_activity"
          value={draft.business_activity}
          invalid={Boolean(errors.business_activity)}
          placeholder="Short name for this trip"
          onChange={(e) => update({ business_activity: e.target.value })}
        />
      </Field>

      <Field
        label="Business purpose"
        htmlFor="business_purpose"
        required
        error={errors.business_purpose}
        hint="What will actually happen on this trip?"
      >
        <TextArea
          id="business_purpose"
          rows={3}
          value={draft.business_purpose}
          invalid={Boolean(errors.business_purpose)}
          placeholder="e.g. Quarterly monitoring of six supported ECD centres in the Mthatha node."
          onChange={(e) => update({ business_purpose: e.target.value })}
        />
      </Field>

      <Field
        label="Travel justification"
        htmlFor="travel_justification"
        required
        error={errors.travel_justification}
        hint={
          errors.travel_justification
            ? undefined
            : `Why must this be done in person? ${justificationLength}/${MIN_JUSTIFICATION} characters minimum.`
        }
      >
        <TextArea
          id="travel_justification"
          rows={5}
          value={draft.travel_justification}
          invalid={Boolean(errors.travel_justification)}
          placeholder="Explain the link to a project deliverable or donor requirement, and why the activity cannot be done remotely."
          onChange={(e) => update({ travel_justification: e.target.value })}
        />
      </Field>

      <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
        <p className="text-sm font-medium text-gray-900">
          A strong justification usually covers:
        </p>
        <ul className="mt-2 space-y-1 text-sm text-gray-700">
          <li>· the project deliverable or donor milestone this serves</li>
          <li>· why it cannot be done by phone, email or video call</li>
          <li>· who is being met, or what is being inspected, on site</li>
          <li>· the consequence if the travel does not happen</li>
        </ul>
      </div>
    </div>
  )
}
