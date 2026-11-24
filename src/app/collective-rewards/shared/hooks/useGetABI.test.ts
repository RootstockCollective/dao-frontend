import { describe, expect, it } from 'vitest'

import { CYCLES_PER_YEAR } from '@/lib/constants'

import { getCycleRateFromAbi } from './useGetABI'

describe('getCycleRateFromAbi', () => {
  it('compounds back to the ABI over a year of cycles', () => {
    const cycleRate = getCycleRateFromAbi(5)

    expect(cycleRate).not.toBeNull()
    expect((Math.pow(1 + cycleRate!, CYCLES_PER_YEAR) - 1) * 100).toBeCloseTo(5, 8)
  })

  it('is the compounded rate, not the ABI divided by the cycle count', () => {
    const cycleRate = getCycleRateFromAbi(5)!

    expect(cycleRate).toBeLessThan(0.05 / CYCLES_PER_YEAR)
    expect(cycleRate).toBeCloseTo(0.0018783, 6)
  })

  it('is zero for a zero ABI', () => {
    expect(getCycleRateFromAbi(0)).toBe(0)
  })

  it('is null when the ABI is not a usable number', () => {
    for (const abiPct of [null, NaN, Infinity, -100, -150]) {
      expect(getCycleRateFromAbi(abiPct)).toBeNull()
    }
  })
})
