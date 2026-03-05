import { DateTime } from 'luxon'

const VAULT_BASIS_POINTS = 1_000_000_000n // 1e9 = 100%

/**
 * Placeholder price until a real oracle/price feed is wired.
 * Represents USD per 1 rBTC as a whole number (no decimals).
 */
export const MOCK_RBTC_USD_PRICE = 23_750

/**
 * Converts vault basis points (1e9 = 100%) to a percentage string with 2 decimal places.
 * @param basisPoints - APY in vault basis points
 * @returns Formatted percentage string (e.g. "8.50")
 */
export function formatApyPercent(basisPoints: bigint): string {
  const percent = Number((basisPoints * 10000n) / VAULT_BASIS_POINTS) / 100
  return percent.toFixed(2)
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
 * Formats a Unix timestamp (seconds) into a localized date string.
 * @param unix - Unix timestamp in seconds
 * @returns Formatted date string (e.g. "Mar 15, 2025, 02:30 PM")
 */
export function formatTimestamp(unix: number): string {
  return DateTime.fromSeconds(unix).toFormat('MMM dd, yyyy, hh:mm a')
}

/**
 * Formats a Unix timestamp (seconds) into a date-only string for "Last updated on" display.
 * @param unix - Unix timestamp in seconds
 * @returns Formatted date string (e.g. "May 21, 2025")
 */
export function formatDateShort(unix: number): string {
  return DateTime.fromSeconds(unix).toFormat('MMM dd, yyyy')
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
