import { describe, expect, it } from 'vitest'
import { parseEther } from 'viem'

import {
  BPS_SCALE,
  computeNavAfterWei,
  formatBpsAsPercent,
  formatPartAsPercentOfWhole,
  navChangeBps,
  navDeltaWei,
  partAsPercentOfWholeBps,
  reportedDeltaWei,
} from './updateNavImpact'

describe('computeNavAfterWei', () => {
  it('matches NAV identity with vault reads', () => {
    const onchain = parseEther('10')
    const reported = parseEther('2')
    const liabilities = parseEther('1')
    const navAfter = computeNavAfterWei(onchain, reported, liabilities)
    expect(navAfter).toBe(onchain + reported - liabilities)
  })
})

describe('deltas', () => {
  it('nav delta equals reported delta (identity)', () => {
    const navBefore = parseEther('9.39')
    const navAfter = parseEther('15.39')
    const r0 = parseEther('0')
    const r1 = parseEther('6')
    expect(navDeltaWei(navBefore, navAfter)).toBe(reportedDeltaWei(r1, r0))
  })
})

describe('navChangeBps', () => {
  it('returns null when prior NAV is zero', () => {
    expect(navChangeBps(1n, 0n)).toBeNull()
  })

  it('computes increase', () => {
    // +6 / 9.39 ≈ 63.9%
    const navBefore = parseEther('9.39')
    const navDelta = parseEther('6')
    const bps = navChangeBps(navDelta, navBefore)
    expect(bps).not.toBeNull()
    expect(Number(bps!)).toBeGreaterThan(6000)
    expect(Number(bps!)).toBeLessThan(6500)
  })
})

describe('partAsPercentOfWholeBps', () => {
  it('returns null when whole is zero', () => {
    expect(partAsPercentOfWholeBps(1n, 0n)).toBeNull()
  })

  it('60 of 100 = 60%', () => {
    expect(partAsPercentOfWholeBps(60n, 100n)).toBe(6000n)
  })
})

describe('formatPartAsPercentOfWhole', () => {
  it('matches part / whole via bps (60 of 100)', () => {
    expect(formatPartAsPercentOfWhole(60n, 100n)).toBe('60.0%')
  })

  it('returns 0.0% when whole is zero', () => {
    expect(formatPartAsPercentOfWhole(1n, 0n)).toBe('0.0%')
  })
})

describe('formatBpsAsPercent', () => {
  it('formats 6390 bps as 63.9%', () => {
    expect(formatBpsAsPercent(6390n)).toBe('63.9%')
  })

  it('rounds half-up to one decimal (6395 bps → 64.0%)', () => {
    expect(formatBpsAsPercent(6395n)).toBe('64.0%')
  })

  it('formats negative', () => {
    expect(formatBpsAsPercent(-1000n)).toBe('-10.0%')
  })

  it('formats zero', () => {
    expect(formatBpsAsPercent(0n)).toBe('0.0%')
  })
})

describe('BPS_SCALE', () => {
  it('is 100% in bps', () => {
    expect(BPS_SCALE).toBe(10_000n)
  })
})
