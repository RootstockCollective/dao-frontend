import { DateTime } from 'luxon'

type DateInput = number | string

function toSeconds(input: DateInput): number {
  return typeof input === 'string' ? Number(input) : input
}

function toDateTime(input: DateInput, utc = false): DateTime {
  const seconds = toSeconds(input)
  return utc ? DateTime.fromSeconds(seconds, { zone: 'utc' }) : DateTime.fromSeconds(seconds)
}

/** "15 Mar 2025" */
export function formatDateDayFirst(input: DateInput): string {
  return toDateTime(input).toFormat('dd MMM yyyy')
}

/** "15 Mar 2025, 02:30 PM" */
export function formatDateDayFirstWithTime(input: DateInput): string {
  return toDateTime(input).toFormat('dd MMM yyyy, hh:mm a')
}

/** "Mar 18, 2026" */
export function formatDateMonthFirst(input: DateInput): string {
  return toDateTime(input).toFormat('MMM d, yyyy')
}

/** "February 23" — UTC by default for closing-date display */
export function formatDateFullMonth(input: DateInput, options?: { utc?: boolean }): string {
  return toDateTime(input, options?.utc).toFormat('MMMM d')
}

/** "April 06" — UTC by default for deposit-window display */
export function formatDateFullMonthPadded(input: DateInput, options?: { utc?: boolean }): string {
  return toDateTime(input, options?.utc).toFormat('MMMM dd')
}

/** "March 2025" from a unix-seconds timestamp */
export function formatMonthYear(input: DateInput): string {
  return toDateTime(input).toFormat('MMMM yyyy')
}

/** "March 2025" from a "YYYY-MM" period string */
export function formatPeriodToMonthYear(period: string): string {
  const [year, month] = period.split('-')
  return DateTime.fromObject({ year: Number(year), month: Number(month) }).toFormat('MMMM yyyy')
}

/** "Mar 15, 14:30" — short datetime without year, 24h */
export function formatDateExpanded(input: DateInput): string {
  return toDateTime(input).toFormat('MMM d, HH:mm')
}

/** "Jan 1, 2024, 12:00 PM" (default) or "Jan 1, 2024, 14:00" with hour12: false */
export function formatDateForCsv(input: DateInput, options?: { utc?: boolean; hour12?: boolean }): string {
  const dt = toDateTime(input, options?.utc)
  const hour12 = options?.hour12 ?? true
  return dt.toFormat(hour12 ? 'MMM d, yyyy, hh:mm a' : 'MMM d, yyyy, HH:mm')
}

/**
 * "Jan 1 - 15, 2024" — formats a date range from a start timestamp and duration in seconds.
 * Handles same-month, cross-month, and cross-year ranges.
 */
export function formatDateRange(cycleStart: DateInput, durationSeconds: number): string {
  const startDt = toDateTime(cycleStart)
  // Subtract 1 second so the end falls on the last moment of the range, not the start of the next
  const endDt = DateTime.fromSeconds(toSeconds(cycleStart) + durationSeconds - 1)

  const startMonth = startDt.toFormat('MMM')
  const startDay = String(startDt.day)
  const startYear = startDt.toFormat('yyyy')
  const endMonth = endDt.toFormat('MMM')
  const endDay = String(endDt.day)
  const endYear = endDt.toFormat('yyyy')

  if (startMonth === endMonth && startYear === endYear) {
    if (startDay === endDay) {
      return `${startMonth} ${startDay}, ${startYear}`
    }
    return `${startMonth} ${startDay} - ${endDay}, ${startYear}`
  }

  if (startYear === endYear) {
    return `${startMonth} ${startDay} - ${endMonth} ${endDay}, ${endYear}`
  }

  return `${startMonth} ${startDay}, ${startYear} - ${endMonth} ${endDay}, ${endYear}`
}
