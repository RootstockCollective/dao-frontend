type TimeUnit = 'd' | 'h' | 'm' | 's'

const UNIT_DIVISORS: Record<TimeUnit, number> = {
  d: 86400,
  h: 3600,
  m: 60,
  s: 1,
}

/**
 * Converts a number of seconds into a human-readable duration string.
 * Leading zero-valued units are omitted (e.g. "45s" instead of "0m 45s").
 *
 * @param totalSeconds - Duration in seconds (clamped to 0 if negative)
 * @param units - Which time units to include, in order (default: ['d', 'h', 'm'])
 * @returns Formatted string (e.g. "2d 5h 30m", "4m 32s")
 */
export function formatDuration(totalSeconds: number, units: TimeUnit[] = ['d', 'h', 'm']): string {
  let remaining = Math.max(0, Math.floor(totalSeconds))

  const parts: { unit: TimeUnit; value: number }[] = []
  for (const unit of units) {
    const divisor = UNIT_DIVISORS[unit]
    const value = Math.floor(remaining / divisor)
    remaining %= divisor
    parts.push({ unit, value })
  }

  // Skip leading zeros but always keep the last unit
  const firstNonZero = parts.findIndex(p => p.value > 0)
  const start = firstNonZero === -1 ? parts.length - 1 : firstNonZero

  return parts
    .slice(start)
    .map(p => `${p.value}${p.unit}`)
    .join(' ')
}
