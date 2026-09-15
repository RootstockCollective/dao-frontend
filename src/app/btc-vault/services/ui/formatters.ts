import { formatDuration } from '@/lib/utils'

/**
 * Converts an APY decimal value to a percentage string with 2 decimal places.
 * @param apy - APY as a decimal (e.g. 0.085 for 8.5%)
 * @returns Formatted percentage string (e.g. "8.50")
 */
export function formatApyPercent(apy: number): string {
  return (apy * 100).toFixed(2)
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
  return formatDuration(remaining, ['m', 's'])
}
