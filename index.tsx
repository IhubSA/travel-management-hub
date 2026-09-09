'use client'

// ============================================================================
// Shared UI primitives
//
// Small, dependency-free building blocks used across the wizard, lists and
// approval panels. Tailwind only — no component library.
// ============================================================================

import React from 'react'
import type { TravelStatus } from '@/types/database'
import { STATUS_LABELS, STATUS_STYLES } from '@/types/travel-request'

// ----------------------------------------------------------------------------
// Button
// ----------------------------------------------------------------------------

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost' | 'success'
type ButtonSize = 'sm' | 'md'

const BUTTON_VARIANTS: Record<ButtonVariant, string> = {
  primary:
    'bg-blue-600 text-white hover:bg-blue-700 focus-visible:ring-blue-500 disabled:bg-blue-300',
  secondary:
    'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 focus-visible:ring-gray-400 disabled:text-gray-400',
  danger:
    'bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-500 disabled:bg-red-300',
  success:
    'bg-green-600 text-white hover:bg-green-700 focus-visible:ring-green-500 disabled:bg-green-300',
  ghost:
    'bg-transparent text-gray-600 hover:bg-gray-100 focus-visible:ring-gray-400 disabled:text-gray-300',
}

const BUTTON_SIZES: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-sm',
}

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  loading?: boolean
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled,
  className = '',
  children,
  ...rest
}: ButtonProps) {
  return (
    <button
      {...rest}
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 disabled:cursor-not-allowed ${BUTTON_VARIANTS[variant]} ${BUTTON_SIZES[size]} ${className}`}
    >
      {loading && (
        <span
          aria-hidden
          className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent"
        />
      )}
      {children}
    </button>
  )
}

// ----------------------------------------------------------------------------
// Card
// ----------------------------------------------------------------------------

export function Card({
  title,
  description,
  actions,
  children,
  className = '',
}: {
  title?: React.ReactNode
  description?: React.ReactNode
  actions?: React.ReactNode
  children: React.ReactNode
  className?: string
}) {
  return (
    <section
      className={`rounded-lg border border-gray-200 bg-white shadow-sm ${className}`}
    >
      {(title || actions) && (
        <header className="flex items-start justify-between gap-4 border-b border-gray-100 px-5 py-4">
          <div>
            {title && (
              <h2 className="text-base font-semibold text-gray-900">{title}</h2>
            )}
            {description && (
              <p className="mt-0.5 text-sm text-gray-600">{description}</p>
            )}
          </div>
          {actions && <div className="flex shrink-0 gap-2">{actions}</div>}
        </header>
      )}
      <div className="px-5 py-4">{children}</div>
    </section>
  )
}

// ----------------------------------------------------------------------------
// StatusBadge
// ----------------------------------------------------------------------------

export function StatusBadge({
  status,
  className = '',
}: {
  status: TravelStatus
  className?: string
}) {
  return (
    <span
      className={`inline-flex items-center whitespace-nowrap rounded-full border px-2.5 py-0.5 text-xs font-medium ${STATUS_STYLES[status]} ${className}`}
    >
      {STATUS_LABELS[status]}
    </span>
  )
}

// ----------------------------------------------------------------------------
// Form fields
// ----------------------------------------------------------------------------

const CONTROL_BASE =
  'w-full rounded-lg border bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 transition-colors focus:outline-none focus:ring-2 disabled:bg-gray-50 disabled:text-gray-500'
const CONTROL_OK = 'border-gray-300 focus:border-blue-500 focus:ring-blue-500/20'
const CONTROL_ERR = 'border-red-400 focus:border-red-500 focus:ring-red-500/20'

export function Field({
  label,
  htmlFor,
  error,
  hint,
  required,
  children,
  className = '',
}: {
  label?: string
  htmlFor?: string
  error?: string
  hint?: string
  required?: boolean
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={`space-y-1 ${className}`}>
      {label && (
        <label
          htmlFor={htmlFor}
          className="block text-sm font-medium text-gray-700"
        >
          {label}
          {required && <span className="ml-0.5 text-red-500">*</span>}
        </label>
      )}
      {children}
      {error ? (
        <p className="text-xs text-red-600">{error}</p>
      ) : hint ? (
        <p className="text-xs text-gray-500">{hint}</p>
      ) : null}
    </div>
  )
}

export const TextInput = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement> & { invalid?: boolean }
>(function TextInput({ invalid, className = '', ...rest }, ref) {
  return (
    <input
      ref={ref}
      {...rest}
      className={`${CONTROL_BASE} ${invalid ? CONTROL_ERR : CONTROL_OK} ${className}`}
    />
  )
})

export const TextArea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement> & { invalid?: boolean }
>(function TextArea({ invalid, className = '', rows = 4, ...rest }, ref) {
  return (
    <textarea
      ref={ref}
      rows={rows}
      {...rest}
      className={`${CONTROL_BASE} ${invalid ? CONTROL_ERR : CONTROL_OK} ${className}`}
    />
  )
})

export const Select = React.forwardRef<
  HTMLSelectElement,
  React.SelectHTMLAttributes<HTMLSelectElement> & { invalid?: boolean }
>(function Select({ invalid, className = '', children, ...rest }, ref) {
  return (
    <select
      ref={ref}
      {...rest}
      className={`${CONTROL_BASE} ${invalid ? CONTROL_ERR : CONTROL_OK} ${className}`}
    >
      {children}
    </select>
  )
})

export function Checkbox({
  label,
  description,
  className = '',
  ...rest
}: React.InputHTMLAttributes<HTMLInputElement> & {
  label: React.ReactNode
  description?: React.ReactNode
}) {
  return (
    <label
      className={`flex cursor-pointer items-start gap-3 text-sm ${className}`}
    >
      <input
        type="checkbox"
        {...rest}
        className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer rounded border-gray-300 text-blue-600 focus:ring-blue-500"
      />
      <span>
        <span className="font-medium text-gray-900">{label}</span>
        {description && (
          <span className="block text-xs text-gray-600">{description}</span>
        )}
      </span>
    </label>
  )
}

/** Radio-style option cards, used for booking responsibility and travel type. */
export function OptionCards<T extends string>({
  value,
  onChange,
  options,
  columns = 3,
  name,
}: {
  value: T
  onChange: (next: T) => void
  options: Array<{ value: T; label: string; description?: string }>
  columns?: 2 | 3 | 4
  name: string
}) {
  const cols =
    columns === 2
      ? 'sm:grid-cols-2'
      : columns === 4
        ? 'sm:grid-cols-4'
        : 'sm:grid-cols-3'

  return (
    <div className={`grid grid-cols-1 gap-2 ${cols}`} role="radiogroup">
      {options.map((option) => {
        const selected = option.value === value
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={selected}
            name={name}
            onClick={() => onChange(option.value)}
            className={`rounded-lg border p-3 text-left transition-colors ${
              selected
                ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500'
                : 'border-gray-300 bg-white hover:border-gray-400 hover:bg-gray-50'
            }`}
          >
            <span
              className={`block text-sm font-medium ${selected ? 'text-blue-900' : 'text-gray-900'}`}
            >
              {option.label}
            </span>
            {option.description && (
              <span className="mt-0.5 block text-xs text-gray-600">
                {option.description}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}

// ----------------------------------------------------------------------------
// Feedback
// ----------------------------------------------------------------------------

export function Alert({
  tone = 'info',
  title,
  children,
}: {
  tone?: 'info' | 'warning' | 'error' | 'success'
  title?: React.ReactNode
  children?: React.ReactNode
}) {
  const tones = {
    info: 'border-blue-200 bg-blue-50 text-blue-900',
    warning: 'border-amber-200 bg-amber-50 text-amber-900',
    error: 'border-red-200 bg-red-50 text-red-900',
    success: 'border-green-200 bg-green-50 text-green-900',
  }
  return (
    <div className={`rounded-lg border p-3 text-sm ${tones[tone]}`}>
      {title && <p className="font-semibold">{title}</p>}
      {children && <div className={title ? 'mt-1' : ''}>{children}</div>}
    </div>
  )
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string
  description?: string
  action?: React.ReactNode
}) {
  return (
    <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 px-6 py-12 text-center">
      <p className="text-sm font-medium text-gray-900">{title}</p>
      {description && (
        <p className="mx-auto mt-1 max-w-md text-sm text-gray-600">{description}</p>
      )}
      {action && <div className="mt-4 flex justify-center">{action}</div>}
    </div>
  )
}

export function Spinner({ label = 'Loading' }: { label?: string }) {
  return (
    <div className="flex items-center justify-center gap-3 py-12 text-sm text-gray-500">
      <span
        aria-hidden
        className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600"
      />
      {label}
    </div>
  )
}

// ----------------------------------------------------------------------------
// Modal
// ----------------------------------------------------------------------------

export function Modal({
  open,
  onClose,
  title,
  children,
  footer,
  width = 'md',
}: {
  open: boolean
  onClose: () => void
  title: React.ReactNode
  children: React.ReactNode
  footer?: React.ReactNode
  width?: 'sm' | 'md' | 'lg'
}) {
  React.useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  const widths = { sm: 'max-w-sm', md: 'max-w-lg', lg: 'max-w-2xl' }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-gray-900/40"
        onClick={onClose}
        aria-hidden
      />
      <div
        role="dialog"
        aria-modal="true"
        className={`relative w-full ${widths[width]} rounded-xl bg-white shadow-xl`}
      >
        <header className="border-b border-gray-100 px-5 py-4">
          <h2 className="text-base font-semibold text-gray-900">{title}</h2>
        </header>
        <div className="max-h-[60vh] overflow-y-auto px-5 py-4 text-sm text-gray-700">
          {children}
        </div>
        {footer && (
          <footer className="flex justify-end gap-2 border-t border-gray-100 px-5 py-3">
            {footer}
          </footer>
        )}
      </div>
    </div>
  )
}

// ----------------------------------------------------------------------------
// Layout helpers
// ----------------------------------------------------------------------------

export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string
  description?: string
  actions?: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
        {description && <p className="mt-1 text-sm text-gray-600">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap gap-2">{actions}</div>}
    </div>
  )
}

/** Label/value pair used all over the review and detail screens. */
export function DetailItem({
  label,
  children,
  className = '',
}: {
  label: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={className}>
      <dt className="text-xs font-medium uppercase tracking-wide text-gray-500">
        {label}
      </dt>
      <dd className="mt-0.5 text-sm text-gray-900">{children}</dd>
    </div>
  )
}
