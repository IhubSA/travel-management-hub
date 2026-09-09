'use client'

import { Checkbox, Field, OptionCards, Select, TextInput } from '@/components/common'
import { nightsBetween } from '@/lib/draft'
import {
  BOOKING_RESPONSIBILITY_LABELS,
  VEHICLE_CLASS_LABELS,
} from '@/types/travel-request'
import type { BookingResponsibility, VehicleClass } from '@/types/database'
import type { StepProps } from './types'

const BOOKING_OPTIONS: Array<{
  value: BookingResponsibility
  label: string
  description: string
}> = [
  {
    value: 'TRAVEL_OFFICER',
    label: BOOKING_RESPONSIBILITY_LABELS.TRAVEL_OFFICER,
    description: 'Booked and paid centrally',
  },
  {
    value: 'SELF_BOOK',
    label: BOOKING_RESPONSIBILITY_LABELS.SELF_BOOK,
    description: 'You book and claim back',
  },
]

export function LogisticsStep({
  draft,
  updateItinerary,
  errors,
  reference,
}: StepProps) {
  const travellers = draft.traveller_ids
    .map((id) => reference.profiles.find((p) => p.id === id))
    .filter((p): p is NonNullable<typeof p> => Boolean(p))

  return (
    <div className="space-y-5">
      <p className="text-sm text-gray-600">
        Tell us what else each leg needs. Anything you mark as “Travel Officer
        books” goes into Lerato&apos;s processing queue once the request is
        approved.
      </p>

      {draft.itineraries.map((leg, index) => {
        const p = `itin.${index}`
        const nights = nightsBetween(leg.check_in_date, leg.check_out_date)

        return (
          <div
            key={leg.key}
            className="rounded-lg border border-gray-200 bg-white shadow-sm"
          >
            <header className="border-b border-gray-100 px-4 py-3">
              <h3 className="text-sm font-semibold text-gray-900">
                Leg {index + 1}
                <span className="ml-2 font-normal text-gray-600">
                  {leg.origin || 'From'} → {leg.destination || 'To'}
                </span>
              </h3>
            </header>

            <div className="space-y-5 px-4 py-4">
              {/* ---------------- Accommodation ---------------- */}
              <div>
                <Checkbox
                  label="Accommodation needed"
                  description="Overnight stay required for this leg."
                  checked={leg.accommodation_required}
                  onChange={(e) =>
                    updateItinerary(index, {
                      accommodation_required: e.target.checked,
                      accommodation_booking_by: e.target.checked
                        ? leg.accommodation_booking_by === 'NOT_REQUIRED'
                          ? 'TRAVEL_OFFICER'
                          : leg.accommodation_booking_by
                        : 'NOT_REQUIRED',
                      accommodation_location:
                        leg.accommodation_location || leg.destination,
                      check_in_date: leg.check_in_date || leg.travel_date,
                      check_out_date: leg.check_out_date || leg.return_date,
                    })
                  }
                />

                {leg.accommodation_required && (
                  <div className="mt-3 space-y-4 rounded-lg border border-teal-100 bg-teal-50/60 p-4">
                    <Field
                      label="Who books the accommodation?"
                      required
                      error={errors[`${p}.accommodation_booking_by`]}
                    >
                      <OptionCards
                        name={`${p}-acc-booking`}
                        value={leg.accommodation_booking_by}
                        onChange={(value) =>
                          updateItinerary(index, {
                            accommodation_booking_by: value,
                          })
                        }
                        options={BOOKING_OPTIONS}
                        columns={2}
                      />
                    </Field>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <Field
                        label="Location"
                        htmlFor={`${p}-acc-location`}
                        required
                        error={errors[`${p}.accommodation_location`]}
                      >
                        <TextInput
                          id={`${p}-acc-location`}
                          value={leg.accommodation_location}
                          placeholder="e.g. Mthatha town centre"
                          invalid={Boolean(errors[`${p}.accommodation_location`])}
                          onChange={(e) =>
                            updateItinerary(index, {
                              accommodation_location: e.target.value,
                            })
                          }
                        />
                      </Field>

                      <Field label="Preferred type" htmlFor={`${p}-acc-type`}>
                        <Select
                          id={`${p}-acc-type`}
                          value={leg.preferred_type}
                          onChange={(e) =>
                            updateItinerary(index, { preferred_type: e.target.value })
                          }
                        >
                          <option value="">No preference</option>
                          <option value="Hotel">Hotel</option>
                          <option value="Guest house">Guest house</option>
                          <option value="B&B">B&amp;B</option>
                          <option value="Self-catering">Self-catering</option>
                          <option value="Lodge">Lodge</option>
                        </Select>
                      </Field>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-4">
                      <Field
                        label="Check in"
                        htmlFor={`${p}-check-in`}
                        required
                        error={errors[`${p}.check_in_date`]}
                      >
                        <TextInput
                          id={`${p}-check-in`}
                          type="date"
                          value={leg.check_in_date}
                          invalid={Boolean(errors[`${p}.check_in_date`])}
                          onChange={(e) =>
                            updateItinerary(index, { check_in_date: e.target.value })
                          }
                        />
                      </Field>

                      <Field
                        label="Check out"
                        htmlFor={`${p}-check-out`}
                        required
                        error={errors[`${p}.check_out_date`]}
                        hint={nights > 0 ? `${nights} night${nights === 1 ? '' : 's'}` : undefined}
                      >
                        <TextInput
                          id={`${p}-check-out`}
                          type="date"
                          value={leg.check_out_date}
                          invalid={Boolean(errors[`${p}.check_out_date`])}
                          onChange={(e) =>
                            updateItinerary(index, { check_out_date: e.target.value })
                          }
                        />
                      </Field>

                      <Field
                        label="Rooms"
                        htmlFor={`${p}-rooms`}
                        hint={`${travellers.length} traveller${travellers.length === 1 ? '' : 's'}`}
                      >
                        <TextInput
                          id={`${p}-rooms`}
                          type="number"
                          min={1}
                          value={leg.rooms_required}
                          onChange={(e) =>
                            updateItinerary(index, {
                              rooms_required: Math.max(
                                1,
                                parseInt(e.target.value, 10) || 1
                              ),
                            })
                          }
                        />
                      </Field>

                      <Field
                        label="Estimated cost (R)"
                        htmlFor={`${p}-acc-cost`}
                        hint="Total for the stay"
                      >
                        <TextInput
                          id={`${p}-acc-cost`}
                          inputMode="decimal"
                          value={leg.accommodation_estimated_cost}
                          placeholder="0"
                          onChange={(e) =>
                            updateItinerary(index, {
                              accommodation_estimated_cost: e.target.value,
                            })
                          }
                        />
                      </Field>
                    </div>

                    <Field
                      label="Special requirements"
                      htmlFor={`${p}-acc-special`}
                      hint="Accessibility, dietary, late arrival — optional"
                    >
                      <TextInput
                        id={`${p}-acc-special`}
                        value={leg.accommodation_special_requirements}
                        onChange={(e) =>
                          updateItinerary(index, {
                            accommodation_special_requirements: e.target.value,
                          })
                        }
                      />
                    </Field>
                  </div>
                )}
              </div>

              {/* ---------------- Vehicle ---------------- */}
              <div className="border-t border-gray-100 pt-4">
                <Checkbox
                  label="Vehicle needed"
                  description="A hired vehicle, or an own vehicle claim."
                  checked={leg.vehicle_required}
                  onChange={(e) =>
                    updateItinerary(index, {
                      vehicle_required: e.target.checked,
                      vehicle_booking_by: e.target.checked
                        ? leg.vehicle_booking_by === 'NOT_REQUIRED'
                          ? 'TRAVEL_OFFICER'
                          : leg.vehicle_booking_by
                        : 'NOT_REQUIRED',
                      vehicle_class: e.target.checked
                        ? leg.vehicle_class === 'NONE'
                          ? 'B_CLASS'
                          : leg.vehicle_class
                        : 'NONE',
                    })
                  }
                />

                {leg.vehicle_required && (
                  <div className="mt-3 space-y-4 rounded-lg border border-indigo-100 bg-indigo-50/60 p-4">
                    <Checkbox
                      label="Using an own vehicle"
                      description="No hire needed — a kilometre claim will be submitted instead."
                      checked={leg.own_vehicle}
                      onChange={(e) =>
                        updateItinerary(index, { own_vehicle: e.target.checked })
                      }
                    />

                    {!leg.own_vehicle && (
                      <>
                        <Field
                          label="Who books the vehicle?"
                          required
                          error={errors[`${p}.vehicle_booking_by`]}
                        >
                          <OptionCards
                            name={`${p}-veh-booking`}
                            value={leg.vehicle_booking_by}
                            onChange={(value) =>
                              updateItinerary(index, { vehicle_booking_by: value })
                            }
                            options={BOOKING_OPTIONS}
                            columns={2}
                          />
                        </Field>

                        <div className="grid gap-4 sm:grid-cols-3">
                          <Field
                            label="Vehicle class"
                            htmlFor={`${p}-veh-class`}
                            required
                            error={errors[`${p}.vehicle_class`]}
                          >
                            <Select
                              id={`${p}-veh-class`}
                              value={leg.vehicle_class}
                              invalid={Boolean(errors[`${p}.vehicle_class`])}
                              onChange={(e) =>
                                updateItinerary(index, {
                                  vehicle_class: e.target.value as VehicleClass,
                                })
                              }
                            >
                              <option value="NONE">Select a class…</option>
                              <option value="B_CLASS">
                                {VEHICLE_CLASS_LABELS.B_CLASS}
                              </option>
                              <option value="O_CLASS">
                                {VEHICLE_CLASS_LABELS.O_CLASS}
                              </option>
                            </Select>
                          </Field>

                          <Field
                            label="Collection point"
                            htmlFor={`${p}-veh-collect`}
                            hint="Defaults to the destination"
                          >
                            <TextInput
                              id={`${p}-veh-collect`}
                              value={leg.collection_location}
                              placeholder={leg.destination || 'Destination'}
                              onChange={(e) =>
                                updateItinerary(index, {
                                  collection_location: e.target.value,
                                })
                              }
                            />
                          </Field>

                          <Field
                            label="Estimated cost (R)"
                            htmlFor={`${p}-veh-cost`}
                            hint="Hire for the period"
                          >
                            <TextInput
                              id={`${p}-veh-cost`}
                              inputMode="decimal"
                              value={leg.vehicle_estimated_cost}
                              placeholder="0"
                              onChange={(e) =>
                                updateItinerary(index, {
                                  vehicle_estimated_cost: e.target.value,
                                })
                              }
                            />
                          </Field>
                        </div>

                        <Checkbox
                          label="Second driver required"
                          description="Long-distance trips should have a second approved driver."
                          checked={leg.second_driver_required}
                          onChange={(e) =>
                            updateItinerary(index, {
                              second_driver_required: e.target.checked,
                              second_driver_id: e.target.checked
                                ? leg.second_driver_id
                                : '',
                            })
                          }
                        />

                        {leg.second_driver_required && (
                          <Field
                            label="Second driver"
                            htmlFor={`${p}-second-driver`}
                            required
                            error={errors[`${p}.second_driver_id`]}
                            hint="Must be one of the travellers on this request."
                          >
                            <Select
                              id={`${p}-second-driver`}
                              value={leg.second_driver_id}
                              invalid={Boolean(errors[`${p}.second_driver_id`])}
                              onChange={(e) =>
                                updateItinerary(index, {
                                  second_driver_id: e.target.value,
                                })
                              }
                            >
                              <option value="">Select a driver…</option>
                              {travellers.map((t) => (
                                <option key={t.id} value={t.id}>
                                  {t.first_name} {t.last_name}
                                </option>
                              ))}
                            </Select>
                          </Field>
                        )}
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
