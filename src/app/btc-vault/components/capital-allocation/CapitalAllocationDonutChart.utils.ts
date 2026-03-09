import type { CapitalAllocationDisplay } from '../../services/ui/types'

/** Parses "50%" -> 50. Returns 0 for invalid or missing input. */
export function parsePercent(s: string): number {
  if (!s || typeof s !== 'string') return 0
  const match = s.trim().match(/^([\d.]+)\s*%?$/)
  if (!match) return 0
  const n = parseFloat(match[1])
  return Number.isFinite(n) ? n : 0
}

/** Builds segment values that sum to 100 from percentFormatted strings. Last segment gets remainder. */
export function segmentsFromDisplay(data: CapitalAllocationDisplay): { name: string; value: number }[] {
  const raw = data.categories.map(cat => ({
    name: cat.label,
    value: parsePercent(cat.percentFormatted),
  }))
  const sum = raw.reduce((acc, s) => acc + s.value, 0)
  if (sum <= 0 || raw.length === 0) return raw.map(s => ({ ...s, value: 0 }))
  const result = raw.map(s => ({ name: s.name, value: s.value }))
  const exceptLast = result.slice(0, -1).reduce((a, x) => a + x.value, 0)
  result[result.length - 1].value = Math.max(0, 100 - exceptLast)
  return result
}
