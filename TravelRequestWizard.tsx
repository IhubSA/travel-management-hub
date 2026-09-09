'use client'

// ============================================================================
// Travel Request Wizard
//
// Seven steps, per PHASE 1 section 5. Holds the draft in local state, validates
// step by step, saves through travel-request.service and submits into the
// approval workflow.
// ============================================================================

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Alert, Button, Modal, Spinner } from '@/components/common'
import { useAuth } from '@/context/AuthContext'
import { useViewer } from '@/hooks/useRole'
import { emptyDraft, estimateDraftCost, validateAll, validateStep } from '@/lib/draft'
import { loadReferenceData } from '@/services/reference.service'
import {
  checkDraftBudget,
  getDraft,
  saveDraft,
  submitRequest,
  type BudgetPosition,
} from '@/services/travel-request.service'
import { WIZARD_STEPS } from '@/types/travel-request'
import type {
  DraftItinerary,
  TravelRequestDraft,
  ValidationErrors,
  WizardStepId,
} from '@/types/travel-request'
import { formatCurrency } from '@/utils/format'
import { BusinessInfoStep } from './steps/BusinessInfoStep'
import { ItineraryStep } from './steps/ItineraryStep'
import { LogisticsStep } from './steps/LogisticsStep'
import { ReviewStep } from './steps/ReviewStep'
import { STAdvanceStep } from './steps/STAdvanceStep'
import { TravellersStep } from './steps/TravellersStep'
import { TripDetailsStep } from './steps/TripDetailsStep'
import type { ReferenceData } from './steps/types'

export function TravelRequestWizard({ requestId }: { requestId?: string }) {
  const router = useRouter()
  const { profile } = useAuth()
  const viewer = useViewer()

  const [reference, setReference] = useState<ReferenceData | null>(null)
  const [draft, setDraft] = useState<TravelRequestDraft | null>(null)
  const [stepIndex, setStepIndex] = useState(0)
  const [errors, setErrors] = useState<ValidationErrors>({})
  const [touchedSteps, setTouchedSteps] = useState<Set<WizardStepId>>(new Set())

  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [notice, setNotice] = useState<string | null>(null)
  const [confirmOpen, setConfirmOpen] = useState(false)

  const [budget, setBudget] = useState<BudgetPosition | null>(null)
  const [budgetLoading, setBudgetLoading] = useState(false)

  const contentRef = useRef<HTMLDivElement>(null)
  const currentStep = WIZARD_STEPS[stepIndex]

  // --------------------------------------------------------------------------
  // Load reference data and (when editing) the existing draft
  // --------------------------------------------------------------------------
  useEffect(() => {
    let cancelled = false

    const load = async () => {
      if (!profile || !viewer) return
      setLoading(true)
      setLoadError(null)

      try {
        const ref = await loadReferenceData()
        if (cancelled) return
        setReference(ref)

        if (requestId) {
          const existing = await getDraft(requestId, viewer)
          if (cancelled) return
          if (!existing) {
            setLoadError('That travel request could not be found, or you do not have access to it.')
          } else if (existing.status !== 'DRAFT') {
            setLoadError(
              'This request has already been submitted and can no longer be edited.'
            )
          } else {
            setDraft(existing)
          }
        } else {
          setDraft(emptyDraft(profile.department_id ?? '', profile.id))
        }
      } catch (err) {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : 'Failed to load the form')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [profile, viewer, requestId])

  // --------------------------------------------------------------------------
  // Budget check whenever the review step is shown
  // --------------------------------------------------------------------------
  useEffect(() => {
    if (currentStep.id !== 'review' || !draft) return
    let cancelled = false

    setBudgetLoading(true)
    checkDraftBudget(draft)
      .then((position) => {
        if (!cancelled) setBudget(position)
      })
      .catch(() => {
        if (!cancelled) setBudget(null)
      })
      .finally(() => {
        if (!cancelled) setBudgetLoading(false)
      })

    return () => {
      cancelled = true
    }
    // draft.project_id and the cost are what actually move the budget position
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentStep.id, draft?.project_id, draft ? estimateDraftCost(draft) : 0])

  // --------------------------------------------------------------------------
  // Draft mutation
  // --------------------------------------------------------------------------
  const update = useCallback((patch: Partial<TravelRequestDraft>) => {
    setDraft((prev) => (prev ? { ...prev, ...patch } : prev))
  }, [])

  const updateItinerary = useCallback(
    (index: number, patch: Partial<DraftItinerary>) => {
      setDraft((prev) => {
        if (!prev) return prev
        const itineraries = prev.itineraries.map((leg, i) =>
          i === index ? { ...leg, ...patch } : leg
        )
        return { ...prev, itineraries }
      })
    },
    []
  )

  // Re-validate the current step live, but only once it has been left or
  // attempted — so the form does not shout at someone still filling it in.
  useEffect(() => {
    if (!draft) return
    if (!touchedSteps.has(currentStep.id)) return
    setErrors(validateStep(currentStep.id, draft))
  }, [draft, currentStep.id, touchedSteps])

  const allErrors = useMemo(
    () => (draft ? validateAll(draft) : {}),
    [draft]
  )

  /** Steps that currently fail validation, for the progress bar. */
  const invalidSteps = useMemo(() => {
    if (!draft) return new Set<WizardStepId>()
    const set = new Set<WizardStepId>()
    WIZARD_STEPS.forEach((step) => {
      if (step.id === 'review') return
      if (Object.keys(validateStep(step.id, draft)).length > 0) set.add(step.id)
    })
    return set
  }, [draft])

  // --------------------------------------------------------------------------
  // Navigation
  // --------------------------------------------------------------------------
  const scrollToTop = () => {
    contentRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const goToStep = (index: number) => {
    setStepIndex(index)
    setErrors({})
    scrollToTop()
  }

  const jumpToStepId = (id: WizardStepId) => {
    const index = WIZARD_STEPS.findIndex((s) => s.id === id)
    if (index >= 0) goToStep(index)
  }

  const next = () => {
    if (!draft) return
    const stepErrors = validateStep(currentStep.id, draft)
    setTouchedSteps((prev) => new Set(prev).add(currentStep.id))

    if (Object.keys(stepErrors).length > 0) {
      setErrors(stepErrors)
      scrollToTop()
      return
    }
    if (stepIndex < WIZARD_STEPS.length - 1) goToStep(stepIndex + 1)
  }

  const back = () => {
    if (stepIndex > 0) goToStep(stepIndex - 1)
  }

  // --------------------------------------------------------------------------
  // Persistence
  // --------------------------------------------------------------------------
  const handleSaveDraft = async () => {
    if (!draft || !profile) return
    setSaving(true)
    setNotice(null)
    try {
      const result = await saveDraft(draft, profile.id)
      setDraft((prev) =>
        prev ? { ...prev, id: result.id, request_number: result.request_number } : prev
      )
      setNotice(`Draft saved as ${result.request_number}.`)
    } catch (err) {
      setNotice(err instanceof Error ? err.message : 'Could not save the draft')
    } finally {
      setSaving(false)
    }
  }

  const handleSubmit = async () => {
    if (!draft || !profile) return
    setSubmitting(true)
    setNotice(null)
    try {
      const result = await saveDraft(draft, profile.id)
      await submitRequest(result.id, profile.id)
      setConfirmOpen(false)
      // Signal the detail page to show a confirmation banner. sessionStorage
      // avoids useSearchParams, which would need its own Suspense boundary.
      try {
        window.sessionStorage.setItem('arc-just-submitted', result.id)
      } catch {
        // Non-fatal — the banner just won't show.
      }
      router.push(`/travel-requests/${result.id}`)
    } catch (err) {
      setConfirmOpen(false)
      setNotice(err instanceof Error ? err.message : 'Could not submit the request')
      setSubmitting(false)
    }
  }

  // --------------------------------------------------------------------------
  // Render
  // --------------------------------------------------------------------------
  if (loading) return <Spinner label="Loading form…" />

  if (loadError) {
    return (
      <div className="space-y-4">
        <Alert tone="error" title="Cannot open this request">
          {loadError}
        </Alert>
        <Button variant="secondary" onClick={() => router.push('/travel-requests')}>
          Back to travel requests
        </Button>
      </div>
    )
  }

  if (!draft || !reference || !profile) {
    return <Alert tone="error">The form could not be prepared.</Alert>
  }

  const stepProps = { draft, update, updateItinerary, errors, reference }
  const total = estimateDraftCost(draft)
  const canSubmit = Object.keys(allErrors).length === 0

  return (
    <div className="space-y-5" ref={contentRef}>
      {/* ---------------- Progress ---------------- */}
      <nav aria-label="Progress" className="rounded-lg border border-gray-200 bg-white p-4">
        <ol className="flex flex-wrap gap-2">
          {WIZARD_STEPS.map((step, index) => {
            const isCurrent = index === stepIndex
            const isPast = index < stepIndex
            const isInvalid = touchedSteps.has(step.id) && invalidSteps.has(step.id)

            return (
              <li key={step.id} className="flex-1 basis-28">
                <button
                  type="button"
                  onClick={() => goToStep(index)}
                  className={`w-full rounded-lg border px-2 py-2 text-left transition-colors ${
                    isCurrent
                      ? 'border-blue-500 bg-blue-50'
                      : isInvalid
                        ? 'border-red-200 bg-red-50 hover:bg-red-100'
                        : isPast
                          ? 'border-gray-200 bg-gray-50 hover:bg-gray-100'
                          : 'border-gray-200 bg-white hover:bg-gray-50'
                  }`}
                >
                  <span
                    className={`flex items-center gap-1.5 text-xs font-semibold ${
                      isCurrent
                        ? 'text-blue-700'
                        : isInvalid
                          ? 'text-red-700'
                          : 'text-gray-500'
                    }`}
                  >
                    <span
                      className={`flex h-4 w-4 items-center justify-center rounded-full text-[10px] ${
                        isCurrent
                          ? 'bg-blue-600 text-white'
                          : isInvalid
                            ? 'bg-red-500 text-white'
                            : isPast
                              ? 'bg-gray-400 text-white'
                              : 'bg-gray-200 text-gray-600'
                      }`}
                    >
                      {isPast && !isInvalid ? '✓' : index + 1}
                    </span>
                    Step {index + 1}
                  </span>
                  <span
                    className={`mt-0.5 block text-xs ${isCurrent ? 'font-medium text-gray-900' : 'text-gray-600'}`}
                  >
                    {step.short}
                  </span>
                </button>
              </li>
            )
          })}
        </ol>
      </nav>

      {notice && (
        <Alert tone={notice.includes('saved') ? 'success' : 'warning'}>{notice}</Alert>
      )}

      {/* ---------------- Step body ---------------- */}
      <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
        <header className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <div>
            <h2 className="text-base font-semibold text-gray-900">
              {currentStep.title}
            </h2>
            <p className="mt-0.5 text-sm text-gray-600">
              Step {stepIndex + 1} of {WIZARD_STEPS.length}
              {draft.request_number && ` · ${draft.request_number}`}
            </p>
          </div>
          {total > 0 && (
            <div className="text-right">
              <p className="text-xs uppercase tracking-wide text-gray-500">
                Estimated
              </p>
              <p className="text-sm font-semibold text-gray-900">
                {formatCurrency(total)}
              </p>
            </div>
          )}
        </header>

        <div className="px-5 py-5">
          {currentStep.id === 'trip' && <TripDetailsStep {...stepProps} />}
          {currentStep.id === 'travellers' && <TravellersStep {...stepProps} />}
          {currentStep.id === 'itinerary' && <ItineraryStep {...stepProps} />}
          {currentStep.id === 'logistics' && <LogisticsStep {...stepProps} />}
          {currentStep.id === 'business' && <BusinessInfoStep {...stepProps} />}
          {currentStep.id === 'advance' && <STAdvanceStep {...stepProps} />}
          {currentStep.id === 'review' && (
            <ReviewStep
              {...stepProps}
              budget={budget}
              budgetLoading={budgetLoading}
              onJumpToStep={jumpToStepId}
              allErrors={allErrors}
            />
          )}
        </div>

        {/* ---------------- Footer actions ---------------- */}
        <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 bg-gray-50 px-5 py-3">
          <Button variant="secondary" onClick={back} disabled={stepIndex === 0}>
            Back
          </Button>

          <div className="flex flex-wrap gap-2">
            <Button variant="ghost" onClick={handleSaveDraft} loading={saving}>
              Save draft
            </Button>

            {stepIndex < WIZARD_STEPS.length - 1 ? (
              <Button onClick={next}>Continue</Button>
            ) : (
              <Button
                variant="success"
                onClick={() => setConfirmOpen(true)}
                disabled={!canSubmit}
                title={
                  canSubmit ? undefined : 'Fix the outstanding items before submitting'
                }
              >
                Submit for approval
              </Button>
            )}
          </div>
        </footer>
      </div>

      {/* ---------------- Submit confirmation ---------------- */}
      <Modal
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title="Submit this travel request?"
        footer={
          <>
            <Button variant="secondary" onClick={() => setConfirmOpen(false)}>
              Cancel
            </Button>
            <Button variant="success" onClick={handleSubmit} loading={submitting}>
              Yes, submit
            </Button>
          </>
        }
      >
        <p>
          Once submitted you will not be able to edit this request. It goes to
          your HOD for approval, and you will be notified of the outcome.
        </p>
        <p className="mt-3">
          Total estimated cost: <strong>{formatCurrency(total)}</strong>
          {budget?.is_budget_exception && (
            <>
              {' '}— this is{' '}
              <strong>{formatCurrency(budget.amount_over_budget)}</strong> over the
              remaining project travel budget and will require CEO approval.
            </>
          )}
        </p>
      </Modal>
    </div>
  )
}
