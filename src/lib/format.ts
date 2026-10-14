import type { JobDetails, JobLocation, JobSummary } from '@/entities/job'
import type { Money } from '@/entities/money'

const CURRENCIES: Record<number, string> = { 1: 'CHF' }

const amountFormat = new Intl.NumberFormat('en-CH', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

/** All jobs are in Switzerland, so dates are shown in Swiss time whatever the viewer's zone. */
const dateFormat = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  timeZone: 'Europe/Zurich',
})

export function formatWage({ amount, currencyId }: Money): string {
  const value = amountFormat.format(amount)
  const currency = CURRENCIES[currencyId]
  return currency ? `${currency} ${value}` : value
}

export function formatDate(epochMs: JobSummary['datePublished']): string {
  return dateFormat.format(epochMs)
}

export function formatLocation({ zip, city }: JobLocation): string {
  return [zip, city].filter(Boolean).join(' ')
}

export function formatDuration(minutes: JobDetails['workDuration']): string {
  const hours = Math.floor(minutes / 60)
  const rest = minutes % 60
  if (hours === 0) return `${rest} min`
  return rest === 0 ? `${hours} h` : `${hours} h ${rest} min`
}
