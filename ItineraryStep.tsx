'use client'

import { Alert, Button, Checkbox, Field, OptionCards, Select, TextInput } from '@/components/common'
import { emptyItinerary } from '@/lib/draft'
import { BOOKING_RESPONSIBILITY_LABELS } from '@/types/travel-request'
import type { BookingResponsibility, TransportMode } from '@/types/database'
import type { StepProps } from './types'

const TRANSPORT_OPTIONS: Array<{
  value: TransportMode
  label: string
  description: string
}> = [
  { value: 'ROAD', label: 'Road', description: 'Drive the whole way' },
  { value: 'AIR', label: 'Air', description: 'Fly' },
  { value: 'COMBINATION', label: 'Air and road', description: 'Fly, then drive' },
]

const FLIGHT_BOOKING_OPTIONS: Array<{
  value: BookingResponsibility
  label: string
  description: string
}> = [
  {
    value: 'TRAVEL_OFFICER',
    label: BOOKING_RESPONSIBILITY_LABELS.TRAVEL_OFFICER,
    description: 'Lerato arranges and confirms',
  },
  {
    value: 'SELF_BOOK',
    label: BOOKING_RESPONSIBILITY_LABELS.SELF_BOOK,
    description: 'You book and upload confirmation',
  },
  {
    value: 'NOT_REQUIRED',
    label: BOOKING_RESPONSIBILITY_LABELS.NOT_REQUIRED,
    description: 'No flights on this leg',
  },
]

export function ItineraryStep({
  draft,
  update,
  updateItinerary,
  errors,
}: StepProps) {
  const addLeg = () =>
    update({
      itineraries: [
        ...draft.itineraries,
        emptyItinerary(draft.itineraries.length + 1),
      ],
      is_multiple_itinerary: true,
    })

  const removeLeg = (index: number) => {
    const next = draft.itineraries.filter((_, i) => i !== index)
    update({
      itineraries: next.map((leg, i) => ({ ...leg, sequence: i + 1 })),
      is_multiple_itinerary: next.length > 1,
    })
  }

  return (
    <div className="space-y-5">
      <p className="text-sm text-gray-600">
        Add one leg per journey. A return trip is a single leg — tick “Return
        trip” and give the return date. Use multiple legs when the trip visits
        several places in sequence.
      </p>

      {errors.itineraries && <Alert tone="error">{errors.itineraries}</Alert>}

      {draft.itineraries.map((leg, index) => {
        const p = `itin.${index}`
        const needsAir =
          leg.transport_mode === 'AIR' || leg.transport_mode === 'COMBINATION'

        return (
          <div
            key={leg.key}
            className="rounded-lg border border-gray-200 bg-white shadow-sm"
          >
            <header className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
              <h3 className="text-sm font-semibold text-gray-900">
                Leg {index + 1}
                {leg.origin && leg.destination && (
                  <span className="ml-2 font-normal text-gray-600">
                    {leg.origin} → {leg.destination}
                  </span>
                )}
              </h3>
              {draft.itineraries.length > 1 && (
                <Button variant="ghost" size="sm" onClick={() => removeLeg(index)}>
                  Remove leg
                </Button>
              )}
            </header>

            <div className="space-y-4 px-4 py-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field
                  label="From"
                  htmlFor={`${p}-origin`}
                  required
                  error={errors[`${p}.origin`]}
                >
                  <TextInput
                    id={`${p}-origin`}
                    value={leg.origin}
                    placeholder="e.g. Cape Town"
                    invalid={Boolean(errors[`${p}.origin`])}
                    onChange={(e) => updateItinerary(index, { origin: e.target.value })}
                  />
                </Field>

                <Field
                  label="To"
                  htmlFor={`${p}-destination`}
                  required
                  error={errors[`${p}.destination`]}
                >
                  <TextInput
                    id={`${p}-destination`}
                    value={leg.destination}
                    placeholder="e.g. Mthatha"
                    invalid={Boolean(errors[`${p}.destination`])}
                    onChange={(e) =>
                      updateItinerary(index, { destination: e.target.value })
                    }
                  />
                </Field>
              </div>

              <Field label="How are they travelling?" required>
                <OptionCards
                  name={`${p}-transport`}
                  value={leg.transport_mode}
                  onChange={(mode) =>
                    updateItinerary(index, {
                      transport_mode: mode,
                      flight_booking_by:
                        mode === 'ROAD'
                          ? 'NOT_REQUIRED'
                          : leg.flight_booking_by === 'NOT_REQUIRED'
                            ? 'TRAVEL_OFFICER'
                            : leg.flight_booking_by,
                    })
                  }
                  options={TRANSPORT_OPTIONS}
                />
              </Field>

              <div className="grid gap-4 sm:grid-cols-3">
                <Field
                  label="Departure date"
                  htmlFor={`${p}-travel-date`}
                  required
                  error={errors[`${p}.travel_date`]}
                >
                  <TextInput
                    id={`${p}-travel-date`}
                    type="date"
                    value={leg.travel_date}
                    invalid={Boolean(errors[`${p}.travel_date`])}
                    onChange={(e) =>
                      updateItinerary(index, { travel_date: e.target.value })
                    }
                  />
                </Field>

                <Field
                  label="Preferred departure time"
                  htmlFor={`${p}-departure-time`}
                  hint="Optional"
                >
                  <TextInput
                    id={`${p}-departure-time`}
                    type="time"
                    value={leg.departure_time}
                    onChange={(e) =>
                      updateItinerary(index, { departure_time: e.target.value })
                    }
                  />
                </Field>

                <Field
                  label="Return date"
                  htmlFor={`${p}-return-date`}
                  required={leg.round_trip}
                  error={errors[`${p}.return_date`]}
                >
                  <TextInput
                    id={`${p}-return-date`}
                    type="date"
                    value={leg.return_date}
                    disabled={!leg.round_trip}
                    invalid={Boolean(errors[`${p}.return_date`])}
                    onChange={(e) =>
                      updateItinerary(index, { return_date: e.target.value })
                    }
                  />
                </Field>
              </div>

              <Checkbox
                label="Return trip"
                description="Untick for a one-way leg."
                checked={leg.round_trip}
                onChange={(e) =>
                  updateItinerary(index, { round_trip: e.target.checked })
                }
              />

              {needsAir && (
                <div className="space-y-4 rounded-lg border border-blue-100 bg-blue-50/60 p-4">
                  <h4 className="text-sm font-semibold text-gray-900">
                    Flight details
                  </h4>

                  <Field label="Who books the flights?" required>
                    <OptionCards
                      name={`${p}-flight-booking`}
                      value={leg.flight_booking_by}
                      onChange={(value) =>
                        updateItinerary(index, { flight_booking_by: value })
                      }
                      options={FLIGHT_BOOKING_OPTIONS}
                    />
                  </Field>

                  {leg.flight_booking_by !== 'NOT_REQUIRED' && (
                    <>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <Field
                          label="Departure airport"
                          htmlFor={`${p}-dep-airport`}
                          required
                          error={errors[`${p}.departure_airport`]}
                          hint="3-letter code, e.g. CPT"
                        >
                          <TextInput
                            id={`${p}-dep-airport`}
                            value={leg.departure_airport}
                            maxLength={3}
                            placeholder="CPT"
                            className="uppercase"
                            invalid={Boolean(errors[`${p}.departure_airport`])}
                            onChange={(e) =>
                              updateItinerary(index, {
                                departure_airport: e.target.value.toUpperCase(),
                              })
                            }
                          />
                        </Field>

                        <Field
                          label="Arrival airport"
                          htmlFor={`${p}-dest-airport`}
                          required
                          error={errors[`${p}.destination_airport`]}
                          hint="3-letter code, e.g. JNB"
                        >
                          <TextInput
                            id={`${p}-dest-airport`}
                            value={leg.destination_airport}
                            maxLength={3}
                            placeholder="JNB"
                            className="uppercase"
                            invalid={Boolean(errors[`${p}.destination_airport`])}
                            onChange={(e) =>
                              updateItinerary(index, {
                                destination_airport: e.target.value.toUpperCase(),
                              })
                            }
                          />
                        </Field>
                      </div>

                      <div className="grid gap-4 sm:grid-cols-3">
                        <Field
                          label="Preferred flight time"
                          htmlFor={`${p}-pref-time`}
                        >
                          <Select
                            id={`${p}-pref-time`}
                            value={leg.preferred_flight_time}
                            onChange={(e) =>
                              updateItinerary(index, {
                                preferred_flight_time: e.target.value,
                              })
                            }
                          >
                            <option value="">No preference</option>
                            <option value="Early morning">Early morning</option>
                            <option value="Morning">Morning</option>
                            <option value="Midday">Midday</option>
                            <option value="Afternoon">Afternoon</option>
                            <option value="Evening">Evening</option>
                          </Select>
                        </Field>

                        <Field label="Baggage" htmlFor={`${p}-baggage`}>
                          <Select
                            id={`${p}-baggage`}
                            value={leg.baggage_requirements}
                            onChange={(e) =>
                              updateItinerary(index, {
                                baggage_requirements: e.target.value,
                              })
                            }
                          >
                            <option value="">Hand luggage only</option>
                            <option value="1 x checked bag">1 x checked bag</option>
                            <option value="2 x checked bags">2 x checked bags</option>
                            <option value="Oversized / equipment">
                              Oversized / equipment
                            </option>
                          </Select>
                        </Field>

                        <Field
                          label="Estimated airfare (R)"
                          htmlFor={`${p}-flight-cost`}
                          hint="Total for all travellers"
                        >
                          <TextInput
                            id={`${p}-flight-cost`}
                            inputMode="decimal"
                            value={leg.flight_estimated_cost}
                            placeholder="0"
                            onChange={(e) =>
                              updateItinerary(index, {
                                flight_estimated_cost: e.target.value,
                              })
                            }
                          />
                        </Field>
                      </div>
                    </>
                  )}
                </div>
              )}

              <Field label="Notes for this leg" htmlFor={`${p}-notes`} hint="Optional">
                <TextInput
                  id={`${p}-notes`}
                  value={leg.notes}
                  placeholder="Anything the Travel Officer should know"
                  onChange={(e) => updateItinerary(index, { notes: e.target.value })}
                />
              </Field>
            </div>
          </div>
        )
      })}

      <Button variant="secondary" onClick={addLeg}>
        + Add another leg
      </Button>
    </div>
  )
}
