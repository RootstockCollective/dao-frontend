import { describe, expect, it } from 'vitest'

import Big from '@/lib/big'
import { CYCLES_PER_YEAR, WeiPerEther } from '@/lib/constants'

import { calculateAbi, getCycleRateFromAbi } from './useGetABI'

describe('getCycleRateFromAbi', () => {
  it('inverts calculateAbi, so a per-cycle projection lands on the published ABI', () => {
    // 0.0019 RIF of rewards per stRIF per cycle, at a RIF price of $0.08.
    const rewardsPerStRif = Big(0.0019).mul(WeiPerEther.toString()).mul(0.08)
    const abiPct = calculateAbi(rewardsPerStRif, 0.08).toNumber()

    const cycleRate = getCycleRateFromAbi(abiPct)

    expect(cycleRate).not.toBeNull()
    expect(cycleRate).toBeCloseTo(0.0019, 10)
    expect((Math.pow(1 + cycleRate!, CYCLES_PER_YEAR) - 1) * 100).toBeCloseTo(abiPct, 8)
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
