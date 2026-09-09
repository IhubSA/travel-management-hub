'use client'

import { useMemo, useState } from 'react'
import { Alert, Button, Field, TextInput } from '@/components/common'
import { initials } from '@/utils/format'
import type { StepProps } from './types'

export function TravellersStep({ draft, update, errors, reference }: StepProps) {
  const [query, setQuery] = useState('')

  const selected = useMemo(
    () =>
      draft.traveller_ids
        .map((id) => reference.profiles.find((p) => p.id === id))
        .filter((p): p is NonNullable<typeof p> => Boolean(p)),
    [draft.traveller_ids, reference.profiles]
  )

  const available = useMemo(() => {
    const q = query.trim().toLowerCase()
    return reference.profiles
      .filter((p) => !draft.traveller_ids.includes(p.id))
      .filter((p) => {
        if (!q) return true
        const dept = reference.departments.find((d) => d.id === p.department_id)
        return (
          `${p.first_name} ${p.last_name}`.toLowerCase().includes(q) ||
          p.email.toLowerCase().includes(q) ||
          (p.job_title ?? '').toLowerCase().includes(q) ||
          (dept?.name ?? '').toLowerCase().includes(q)
        )
      })
  }, [query, reference.profiles, reference.departments, draft.traveller_ids])

  const add = (id: string) =>
    update({ traveller_ids: [...draft.traveller_ids, id] })

  const remove = (id: string) =>
    update({ traveller_ids: draft.traveller_ids.filter((t) => t !== id) })

  const departmentName = (departmentId: string | null) =>
    reference.departments.find((d) => d.id === departmentId)?.name ?? 'No department'

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-semibold text-gray-900">
          Travelling ({selected.length})
        </h3>
        <p className="mt-0.5 text-sm text-gray-600">
          Everyone listed here is covered by this request. Accommodation occupancy
          and S&amp;T are calculated from this list.
        </p>

        {errors.traveller_ids && (
          <div className="mt-3">
            <Alert tone="error">{errors.traveller_ids}</Alert>
          </div>
        )}

        <ul className="mt-3 space-y-2">
          {selected.map((person, index) => (
            <li
              key={person.id}
              className="flex items-center justify-between gap-3 rounded-lg border border-gray-200 bg-white p-3"
            >
              <div className="flex min-w-0 items-center gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-semibold text-blue-700">
                  {initials(person.first_name, person.last_name)}
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-gray-900">
                    {person.first_name} {person.last_name}
                    {index === 0 && (
                      <span className="ml-2 rounded bg-gray-100 px-1.5 py-0.5 text-xs font-normal text-gray-600">
                        Lead traveller
                      </span>
                    )}
                  </p>
                  <p className="truncate text-xs text-gray-600">
                    {person.job_title ?? '—'} · {departmentName(person.department_id)}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => remove(person.id)}
                disabled={selected.length === 1}
                title={
                  selected.length === 1
                    ? 'A request needs at least one traveller'
                    : 'Remove traveller'
                }
              >
                Remove
              </Button>
            </li>
          ))}
        </ul>
      </div>

      <div className="border-t border-gray-100 pt-5">
        <Field
          label="Add another traveller"
          htmlFor="traveller-search"
          hint="Search by name, role or department."
        >
          <TextInput
            id="traveller-search"
            value={query}
            placeholder="Search staff…"
            onChange={(e) => setQuery(e.target.value)}
          />
        </Field>

        <ul className="mt-3 max-h-64 space-y-1.5 overflow-y-auto pr-1">
          {available.length === 0 && (
            <li className="py-6 text-center text-sm text-gray-500">
              {query
                ? 'No staff match that search.'
                : 'Everyone has already been added.'}
            </li>
          )}
          {available.map((person) => (
            <li key={person.id}>
              <button
                type="button"
                onClick={() => add(person.id)}
                className="flex w-full items-center justify-between gap-3 rounded-lg border border-gray-200 bg-white p-2.5 text-left transition-colors hover:border-blue-400 hover:bg-blue-50"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-100 text-xs font-semibold text-gray-600">
                    {initials(person.first_name, person.last_name)}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-gray-900">
                      {person.first_name} {person.last_name}
                    </p>
                    <p className="truncate text-xs text-gray-600">
                      {person.job_title ?? '—'} ·{' '}
                      {departmentName(person.department_id)}
                    </p>
                  </div>
                </div>
                <span className="shrink-0 text-sm font-medium text-blue-600">
                  Add
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
