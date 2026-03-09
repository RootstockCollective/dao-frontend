import { describe, it, expect } from 'vitest'

import type { CapitalAllocationDisplay } from '../../services/ui/types'

import { parsePercent, segmentsFromDisplay } from './CapitalAllocationDonutChart.utils'

describe('parsePercent', () => {
  it('parses "50%" to 50', () => {
    expect(parsePercent('50%')).toBe(50)
  })

  it('parses "33.33%" to 33.33', () => {
    expect(parsePercent('33.33%')).toBe(33.33)
  })

  it('parses "100" without % sign', () => {
    expect(parsePercent('100')).toBe(100)
  })

  it('handles leading/trailing whitespace', () => {
    expect(parsePercent('  25%  ')).toBe(25)
  })

  it('returns 0 for empty string', () => {
    expect(parsePercent('')).toBe(0)
  })

  it('returns 0 for non-numeric string', () => {
    expect(parsePercent('abc')).toBe(0)
  })

  it('returns 0 for null/undefined coerced input', () => {
    expect(parsePercent(null as unknown as string)).toBe(0)
    expect(parsePercent(undefined as unknown as string)).toBe(0)
  })

  it('parses "0%" to 0', () => {
    expect(parsePercent('0%')).toBe(0)
  })

  it('parses "0.5%" to 0.5', () => {
    expect(parsePercent('0.5%')).toBe(0.5)
  })
})

describe('segmentsFromDisplay', () => {
  const makeDisplay = (
    categories: { label: string; percentFormatted: string }[],
  ): CapitalAllocationDisplay => ({
    categories: categories.map(c => ({
      label: c.label,
      percentFormatted: c.percentFormatted,
      amountFormatted: '0',
      fiatAmountFormatted: '$0.00 USD',
    })),
  })

  it('returns segments that sum to 100 for normal input', () => {
    const data = makeDisplay([
      { label: 'A', percentFormatted: '50%' },
      { label: 'B', percentFormatted: '30%' },
      { label: 'C', percentFormatted: '20%' },
    ])
    const result = segmentsFromDisplay(data)

    expect(result).toEqual([
      { name: 'A', value: 50 },
      { name: 'B', value: 30 },
      { name: 'C', value: 20 },
    ])
    expect(result.reduce((s, seg) => s + seg.value, 0)).toBe(100)
  })

  it('adjusts last segment to ensure sum is exactly 100', () => {
    const data = makeDisplay([
      { label: 'A', percentFormatted: '33.33%' },
      { label: 'B', percentFormatted: '33.33%' },
      { label: 'C', percentFormatted: '33.33%' },
    ])
    const result = segmentsFromDisplay(data)

    expect(result[0].value).toBe(33.33)
    expect(result[1].value).toBe(33.33)
    expect(result[2].value).toBeCloseTo(33.34, 2)
    expect(result.reduce((s, seg) => s + seg.value, 0)).toBe(100)
  })

  it('handles a single category', () => {
    const data = makeDisplay([{ label: 'Only', percentFormatted: '100%' }])
    const result = segmentsFromDisplay(data)

    expect(result).toEqual([{ name: 'Only', value: 100 }])
  })

  it('returns zeroed values when all percentages are 0', () => {
    const data = makeDisplay([
      { label: 'A', percentFormatted: '0%' },
      { label: 'B', percentFormatted: '0%' },
    ])
    const result = segmentsFromDisplay(data)

    expect(result).toEqual([
      { name: 'A', value: 0 },
      { name: 'B', value: 0 },
    ])
  })

  it('returns empty array for empty categories', () => {
    const data = makeDisplay([])
    const result = segmentsFromDisplay(data)

    expect(result).toEqual([])
  })

  it('handles invalid percentage strings gracefully', () => {
    const data = makeDisplay([
      { label: 'Valid', percentFormatted: '80%' },
      { label: 'Invalid', percentFormatted: 'abc' },
    ])
    const result = segmentsFromDisplay(data)

    expect(result[0].value).toBe(80)
    expect(result[1].value).toBe(20)
    expect(result.reduce((s, seg) => s + seg.value, 0)).toBe(100)
  })
})
