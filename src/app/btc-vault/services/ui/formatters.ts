import { DateTime } from 'luxon'

/**
 * Converts an APY decimal value to a percentage string with 2 decimal places.
 * @param apy - APY as a decimal (e.g. 0.085 for 8.5%)
 * @returns Formatted percentage string (e.g. "8.50")
 */
export function formatApyPercent(apy: number): string {
  return (apy * 100).toFixed(2)
}

/**
 * Formats a numeric value as a percentage string with 2 decimal places.
 * @param value - Numeric percentage value
 * @returns Formatted string with % suffix (e.g. "10.20%")
 */
export function formatPercent(value: number): string {
  return `${value.toFixed(2)}%`
}

/**
 * Formats a Unix timestamp (seconds) into a day-first date string.
 * @param unix - Unix timestamp in seconds
 * @param options.includeTime - When true, appends time (e.g. "15 Mar 2025, 02:30 PM")
 * @returns Formatted date string (e.g. "15 Mar 2025")
 */
export function formatTimestamp(unix: number, options?: { includeTime?: boolean }): string {
  const format = options?.includeTime ? 'dd MMM yyyy, hh:mm a' : 'dd MMM yyyy'
  return DateTime.fromSeconds(unix).toFormat(format)
}

/**
 * Formats a Unix timestamp (seconds) into a day-first date-only string.
 * @param unix - Unix timestamp in seconds
 * @returns Formatted date string (e.g. "21 May 2025")
 */
export function formatDateShort(unix: number): string {
  return DateTime.fromSeconds(unix).toFormat('dd MMM yyyy')
}

/**
 * Formats a Unix timestamp (seconds) into a month-first date-only string with comma after day.
 * @param unix - Unix timestamp in seconds
 * @returns Formatted date string (e.g. "Mar 18, 2026")
 */
export function formatDateMonthFirst(unix: number): string {
  return DateTime.fromSeconds(unix).toFormat('MMM d, yyyy')
}

/**
 * Formats a Unix timestamp (seconds) for "closing on [Month Day]" display (e.g. "February 23").
 * Uses UTC so the calendar day is stable across client timezones.
 * @param unix - Unix timestamp in seconds
 * @returns Formatted date string (e.g. "February 23")
 */
export function formatDateClosingOn(unix: number): string {
  return DateTime.fromSeconds(unix, { zone: 'utc' }).toFormat('MMMM d')
}

/**
 * Formats a Unix timestamp (seconds) as full month name and zero-padded day (UTC).
 * For deposit-window style copy (e.g. "April 06") where {@link formatDateClosingOn} uses an unpadded day.
 * @param unix - Unix timestamp in seconds
 * @returns Formatted string (e.g. "April 06")
 */
export function formatDateFullMonthPaddedDayUtc(unix: number): string {
  return DateTime.fromSeconds(unix, { zone: 'utc' }).toFormat('MMMM dd')
}

/**
 * Shortens a transaction hash for display by keeping the first 6 and last 4 characters.
 * @param hash - Full transaction hash string
 * @returns Shortened hash (e.g. "0xabc1...def4") or original if too short
 */
export function shortenTxHash(hash: string): string {
  if (hash.length < 12) return hash
  return `${hash.slice(0, 6)}...${hash.slice(-4)}`
}

/**
 * Formats the remaining time until a Unix timestamp as a human-readable countdown.
 * @param endTime - Target Unix timestamp in seconds
 * @returns Countdown string (e.g. "4m 32s") or "Expired" if past
 */
export function formatCountdown(endTime: number): string {
  const remaining = endTime - Math.floor(Date.now() / 1000)
  if (remaining <= 0) return 'Expired'
  const m = Math.floor(remaining / 60)
  const s = remaining % 60
  return m > 0 ? `${m}m ${s}s` : `${s}s`
}
