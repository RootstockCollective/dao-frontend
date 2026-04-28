/**
 * Formats a numeric percentage value to a string with exactly 2 decimal places and a `%` suffix.
 * @param value - Numeric percentage value (e.g. 10.2 for 10.2%)
 * @returns Formatted percentage string (e.g. "10.20%")
 */
export function formatPercentage(value: number): string {
  return `${value.toFixed(2)}%`
}
