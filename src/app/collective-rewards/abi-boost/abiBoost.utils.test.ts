import { parseEther } from 'viem'
import { describe, expect, it } from 'vitest'

import Big from '@/lib/big'

import {
  ABI_BOOST,
  formatAbiBoostAmount,
  formatAbiBoostPercentage,
  formatAbiBoostTerm,
  formatMissingAmount,
  formatRate,
  getAbiBoostGuidance,
  getAbiBoostStatus,
  getBackingBoostHint,
  getBoostedRate,
  getMissingForAbiBoost,
  getStakeBoostOutlook,
  isBelowAbiBoostThreshold,
  toWeiAmount,
} from './abiBoost.utils'

const MIN = parseEther('100000')

describe('ABI_BOOST', () => {
  it('defaults to a 100,000 stRIF minimum, a 7.5% boost and a 12 month term', () => {
    expect(ABI_BOOST.minBacking).toBe(100_000)
    expect(ABI_BOOST.minBackingWei).toBe(MIN)
    expect(ABI_BOOST.percentage).toBe(7.5)
    expect(ABI_BOOST.termMonths).toBe(12)
  })
})

describe('getAbiBoostStatus', () => {
  it('is not eligible while the stRIF balance is under the minimum', () => {
    expect(getAbiBoostStatus({ stRifBalance: MIN - 1n, backing: 0n }, MIN)).toBe('notEligible')
  })

  it('is eligible once the stRIF balance reaches the minimum but the backing does not', () => {
    expect(getAbiBoostStatus({ stRifBalance: MIN, backing: 0n }, MIN)).toBe('eligible')
    expect(getAbiBoostStatus({ stRifBalance: MIN * 2n, backing: MIN - 1n }, MIN)).toBe('eligible')
  })

  it('is active once the backing reaches the minimum', () => {
    expect(getAbiBoostStatus({ stRifBalance: MIN, backing: MIN }, MIN)).toBe('active')
  })

  it('follows the backing rather than the balance when the two disagree', () => {
    // A stale balance read must not hide a boost that is already running
    expect(getAbiBoostStatus({ stRifBalance: 0n, backing: MIN }, MIN)).toBe('active')
  })
})

describe('getMissingForAbiBoost', () => {
  it('returns what is left to reach the minimum', () => {
    expect(getMissingForAbiBoost(parseEther('60000'), MIN)).toBe(parseEther('40000'))
  })

  it('returns zero at or above the minimum', () => {
    expect(getMissingForAbiBoost(MIN, MIN)).toBe(0n)
    expect(getMissingForAbiBoost(MIN + 1n, MIN)).toBe(0n)
  })
})

describe('isBelowAbiBoostThreshold', () => {
  it('flags a backing that exists but falls short of the minimum', () => {
    expect(isBelowAbiBoostThreshold(1n, MIN)).toBe(true)
    expect(isBelowAbiBoostThreshold(MIN - 1n, MIN)).toBe(true)
  })

  it('does not flag an empty backing or one at the minimum', () => {
    expect(isBelowAbiBoostThreshold(0n, MIN)).toBe(false)
    expect(isBelowAbiBoostThreshold(MIN, MIN)).toBe(false)
  })
})

describe('getBoostedRate', () => {
  it('adds the boost to the current ABI', () => {
    expect(formatRate(getBoostedRate(Big(5), 7.5))).toBe('12.5%')
  })

  it('moves with the ABI instead of staying at a fixed figure', () => {
    expect(formatRate(getBoostedRate(Big(4.5), 7.5))).toBe('12.0%')
    expect(formatRate(getBoostedRate(Big('5.24'), 7.5))).toBe('12.7%')
  })
})

describe('formatters', () => {
  it('formats the boost without trailing zeros', () => {
    expect(formatAbiBoostPercentage(7.5)).toBe('7.5%')
    expect(formatAbiBoostPercentage(10)).toBe('10%')
  })

  it('formats the term in months', () => {
    expect(formatAbiBoostTerm(12)).toBe('12 months')
    expect(formatAbiBoostTerm(6)).toBe('6 months')
    expect(formatAbiBoostTerm(1)).toBe('1 month')
  })

  it('shows amounts as they are, and rounds up only what is still missing', () => {
    expect(formatAbiBoostAmount(100_000, 'stRIF')).toBe('100,000 stRIF')
    expect(formatAbiBoostAmount('100000.5', 'RIF')).toBe('100,000.5 RIF')
    expect(formatAbiBoostAmount('39999.2', 'RIF', 'up')).toBe('40,000 RIF')
    expect(formatMissingAmount(parseEther('497.3'), 'stRIF')).toBe('498 stRIF')
  })
})

describe('toWeiAmount', () => {
  it('converts whole tokens to wei', () => {
    expect(toWeiAmount(100_000)).toBe(parseEther('100000'))
    expect(toWeiAmount(10)).toBe(parseEther('10'))
  })

  it('handles values Number#toString writes with an exponent', () => {
    expect(toWeiAmount(1e21)).toBe(parseEther('1000000000000000000000'))
    expect(toWeiAmount(1e-7)).toBe(parseEther('0.0000001'))
  })
})

describe('getStakeBoostOutlook', () => {
  const empty = { stRifBalance: 0n, backing: 0n }

  it('judges the stRIF the stake leaves, not the amount typed', () => {
    const holding60k = { stRifBalance: parseEther('60000'), backing: 0n }
    expect(getStakeBoostOutlook(holding60k, parseEther('40000'), MIN)).toEqual({
      kind: 'eligible',
      becomesEligible: true,
    })
    expect(getStakeBoostOutlook(holding60k, parseEther('39999'), MIN)).toEqual({
      kind: 'belowMinimum',
      missing: parseEther('40000'),
    })
  })

  it('asks a wallet with no stRIF for the whole minimum', () => {
    expect(getStakeBoostOutlook(empty, parseEther('10000'), MIN)).toEqual({
      kind: 'belowMinimum',
      missing: MIN,
    })
    expect(getStakeBoostOutlook(empty, 0n, MIN)).toEqual({ kind: 'belowMinimum', missing: MIN })
    expect(getStakeBoostOutlook(empty, MIN, MIN)).toEqual({ kind: 'eligible', becomesEligible: true })
  })

  it('does not treat a wallet that was already eligible as newly eligible', () => {
    const eligible = { stRifBalance: MIN, backing: 0n }
    expect(getStakeBoostOutlook(eligible, parseEther('10'), MIN)).toEqual({
      kind: 'eligible',
      becomesEligible: false,
    })
  })

  it('reports a boost that is already running, whatever the amount', () => {
    const active = { stRifBalance: MIN * 2n, backing: MIN }
    expect(getStakeBoostOutlook(active, parseEther('10'), MIN)).toEqual({ kind: 'active' })
    expect(getStakeBoostOutlook(active, MIN, MIN)).toEqual({ kind: 'active' })
  })
})

describe('getAbiBoostGuidance', () => {
  it('asks to stake what the balance lacks', () => {
    expect(getAbiBoostGuidance({ stRifBalance: parseEther('30000'), backing: 0n }, MIN)).toEqual({
      kind: 'stakeMore',
      missing: parseEther('70000'),
    })
  })

  it('asks to back what the backing lacks once the balance is enough', () => {
    expect(getAbiBoostGuidance({ stRifBalance: MIN * 2n, backing: parseEther('80000') }, MIN)).toEqual({
      kind: 'backMore',
      missing: parseEther('20000'),
    })
  })

  it('is active once the backing reaches the minimum', () => {
    expect(getAbiBoostGuidance({ stRifBalance: MIN, backing: MIN }, MIN)).toEqual({ kind: 'active' })
  })
})

describe('getBackingBoostHint', () => {
  const k = (thousands: string) => parseEther(`${thousands}000`)

  it('says nothing about an empty backing', () => {
    expect(getBackingBoostHint(0n, 0n, MIN)).toBeNull()
  })

  it('flags a saved backing under the minimum', () => {
    expect(getBackingBoostHint(k('50'), k('50'), MIN)).toEqual({ kind: 'belowThreshold' })
  })

  it('tells what is missing while editing under the minimum', () => {
    expect(getBackingBoostHint(0n, parseEther('97300'), MIN)).toEqual({
      kind: 'missing',
      missing: parseEther('2700'),
    })
    expect(getBackingBoostHint(k('50'), parseEther('98700'), MIN)).toEqual({
      kind: 'missing',
      missing: parseEther('1300'),
    })
  })

  it('announces the boost when the edit crosses the minimum', () => {
    expect(getBackingBoostHint(k('50'), parseEther('101800'), MIN)).toEqual({ kind: 'willActivate' })
  })

  it('keeps the boost active while both amounts reach the minimum', () => {
    expect(getBackingBoostHint(k('150'), k('150'), MIN)).toEqual({ kind: 'active' })
    expect(getBackingBoostHint(k('150'), MIN, MIN)).toEqual({ kind: 'active' })
  })

  it('warns when the edit takes a boosted backing under the minimum', () => {
    expect(getBackingBoostHint(k('150'), k('90'), MIN)).toEqual({ kind: 'willDeactivate' })
    expect(getBackingBoostHint(k('150'), 0n, MIN)).toEqual({ kind: 'willDeactivate' })
  })
})
