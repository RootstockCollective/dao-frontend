import { describe, expect, it } from 'vitest'

import Big from '@/lib/big'

import { formatBackingCompact, formatSplitLabel, getSplitPercentages } from './dashboardFormatters'

describe('getSplitPercentages', () => {
  it('takes the Builder side as the remainder so the two always sum to 100', () => {
    expect(getSplitPercentages(0.125)).toEqual({ backersPct: 13, buildersPct: 87 })
    expect(getSplitPercentages(0.64)).toEqual({ backersPct: 64, buildersPct: 36 })
  })
})

describe('formatBackingCompact', () => {
  it('keeps one decimal so a column of totals lines up', () => {
    expect(formatBackingCompact(27_590_000)).toBe('27.6M')
    expect(formatBackingCompact(27_422_000)).toBe('27.4M')
    expect(formatBackingCompact(27_000_000)).toBe('27.0M')
  })

  it('drops the decimal below a thousand, where there is no unit to anchor it', () => {
    expect(formatBackingCompact(0)).toBe('0')
    expect(formatBackingCompact(950)).toBe('950')
  })

  it('accepts every numeric shape a backing figure arrives in', () => {
    expect(formatBackingCompact(1_250n)).toBe('1.3K')
    expect(formatBackingCompact(Big('1250'))).toBe('1.3K')
  })
})

describe('formatSplitLabel', () => {
  it('adds up to 100% when both sides would round up', () => {
    expect(formatSplitLabel(0.125)).toBe('13% / 87%')
  })

  it('handles a share that goes entirely to one side', () => {
    expect(formatSplitLabel(1)).toBe('100% / 0%')
    expect(formatSplitLabel(0)).toBe('0% / 100%')
  })
})
