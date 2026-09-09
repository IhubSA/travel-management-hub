'use client'

import { Alert, Field, OptionCards, Select } from '@/components/common'
import { TRAVEL_TYPE_LABELS } from '@/types/travel-request'
import type { TravelType } from '@/types/database'
import { formatCurrency } from '@/utils/format'
import type { StepProps } from './types'

const TRAVEL_TYPE_OPTIONS: Array<{
  value: TravelType
  label: string
  description: string
}> = [
  { value: 'ROAD', label: TRAVEL_TYPE_LABELS.ROAD, description: 'Own or hired vehicle' },
  { value: 'AIR', label: TRAVEL_TYPE_LABELS.AIR, description: 'Flights required' },
  {
    value: 'AIR_AND_ROAD',
    label: TRAVEL_TYPE_LABELS.AIR_AND_ROAD,
    description: 'Fly, then drive at destination',
  },
  {
    value: 'ACCOMMODATION',
    label: TRAVEL_TYPE_LABELS.ACCOMMODATION,
    description: 'Overnight stay only',
  },
]

export function TripDetailsStep({ draft, update, errors, reference }: StepProps) {
  const selectedProject = reference.projects.find((p) => p.id === draft.project_id)

  /** Changing the travel type re-seeds the transport mode on every leg. */
  const handleTravelTypeChange = (value: TravelType) => {
    const mode =
      value === 'AIR'
        ? 'AIR'
        : value === 'AIR_AND_ROAD'
          ? 'COMBINATION'
          : 'ROAD'

    update({
      travel_type: value,
      itineraries: draft.itineraries.map((leg) => ({
        ...leg,
        transport_mode: mode,
        flight_booking_by:
          value === 'AIR' || value === 'AIR_AND_ROAD'
            ? leg.flight_booking_by === 'NOT_REQUIRED'
              ? 'TRAVEL_OFFICER'
              : leg.flight_booking_by
            : 'NOT_REQUIRED',
        accommodation_required:
          value === 'ACCOMMODATION' ? true : leg.accommodation_required,
        accommodation_booking_by:
          value === 'ACCOMMODATION' && leg.accommodation_booking_by === 'NOT_REQUIRED'
            ? 'TRAVEL_OFFICER'
            : leg.accommodation_booking_by,
      })),
    })
  }

  return (
    <div className="space-y-6">
      <Field
        label="What kind of travel is this?"
        required
        hint="This sets up the right sections later in the form. You can change it."
      >
        <OptionCards
          name="travel_type"
          value={draft.travel_type}
          onChange={handleTravelTypeChange}
          options={TRAVEL_TYPE_OPTIONS}
          columns={4}
        />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          label="Project"
          htmlFor="project_id"
          required
          error={errors.project_id}
          hint="Travel costs are charged against this project's travel budget."
        >
          <Select
            id="project_id"
            value={draft.project_id}
            invalid={Boolean(errors.project_id)}
            onChange={(e) => update({ project_id: e.target.value })}
          >
            <option value="">Select a project…</option>
            {reference.projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.project_code} — {project.project_name}
              </option>
            ))}
          </Select>
        </Field>

        <Field
          label="Department"
          htmlFor="department_id"
          required
          error={errors.department_id}
          hint="Determines which HOD approves this request."
        >
          <Select
            id="department_id"
            value={draft.department_id}
            invalid={Boolean(errors.department_id)}
            onChange={(e) => update({ department_id: e.target.value })}
          >
            <option value="">Select a department…</option>
            {reference.departments.map((department) => (
              <option key={department.id} value={department.id}>
                {department.name} ({department.code})
              </option>
            ))}
          </Select>
        </Field>
      </div>

      {selectedProject && (
        <Alert tone="info" title={selectedProject.project_name}>
          <p>
            Travel budget for this project is{' '}
            <strong>{formatCurrency(selectedProject.travel_budget)}</strong> out of a
            total project budget of {formatCurrency(selectedProject.budget)}. You will
            see the remaining balance on the review step once costs are entered.
          </p>
        </Alert>
      )}
    </div>
  )
}
