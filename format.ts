// ============================================================================
// Formatting helpers
//
// The NPO operates in South Africa: ZAR currency, Africa/Johannesburg dates.
// ============================================================================

const ZAR = new Intl.NumberFormat('en-ZA', {
  style: 'currency',
  currency: 'ZAR',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
})

const ZAR_PRECISE = new Intl.NumberFormat('en-ZA', {
  style: 'currency',
  currency: 'ZAR',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

/** R 12 500 — whole rands, for dashboards and totals. */
export function formatCurrency(value: number | null | undefined): string {
  if (value === null || value === undefined || Number.isNaN(value)) return 'R 0'
  return ZAR.format(value).replace(/ /g, ' ')
}

/** R 12 500,00 — cents included, for line items and invoices. */
export function formatCurrencyPrecise(value: number | null | undefined): string {
  if (value === null || value === undefined || Number.isNaN(value)) return 'R 0,00'
  return ZAR_PRECISE.format(value).replace(/ /g, ' ')
}

/** 14 Mar 2026 */
export function formatDate(value: string | null | undefined): string {
  if (!value) return '—'
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleDateString('en-ZA', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

/** 14 Mar 2026, 09:30 */
export function formatDateTime(value: string | null | undefined): string {
  if (!value) return '—'
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return '—'
  return `${formatDate(value)}, ${d.toLocaleTimeString('en-ZA', {
    hour: '2-digit',
    minute: '2-digit',
  })}`
}

/** "3 days ago", "in 2 weeks" */
export function formatRelative(value: string | null | undefined): string {
  if (!value) return '—'
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return '—'

  const diffMs = d.getTime() - Date.now()
  const diffDays = Math.round(diffMs / 86_400_000)

  if (Math.abs(diffDays) < 1) return 'today'
  if (diffDays === 1) return 'tomorrow'
  if (diffDays === -1) return 'yesterday'
  if (Math.abs(diffDays) < 30) {
    return diffDays > 0 ? `in ${diffDays} days` : `${Math.abs(diffDays)} days ago`
  }
  const months = Math.round(Math.abs(diffDays) / 30)
  return diffDays > 0
    ? `in ${months} month${months === 1 ? '' : 's'}`
    : `${months} month${months === 1 ? '' : 's'} ago`
}

/** Range like "14 – 18 Mar 2026", collapsing repeated month/year. */
export function formatDateRange(
  from: string | null | undefined,
  to: string | null | undefined
): string {
  if (!from) return '—'
  if (!to) return formatDate(from)
  const a = new Date(from)
  const b = new Date(to)
  if (Number.isNaN(a.getTime()) || Number.isNaN(b.getTime())) return formatDate(from)

  const sameMonth =
    a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth()
  if (sameMonth) {
    return `${a.getDate()} – ${formatDate(to)}`
  }
  return `${formatDate(from)} – ${formatDate(to)}`
}

/** Initials for avatar chips. */
export function initials(first: string, last: string): string {
  return `${first.charAt(0)}${last.charAt(0)}`.toUpperCase()
}

/** Turn ENUM_VALUES into "Enum values" for anything without an explicit label. */
export function humaniseEnum(value: string): string {
  const lower = value.replace(/_/g, ' ').toLowerCase()
  return lower.charAt(0).toUpperCase() + lower.slice(1)
}
