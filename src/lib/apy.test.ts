import { describe, expect, it } from 'vitest'
import { growthFactorToApy, ratePerSecondToApy } from './apy'
import { SECONDS_PER_YEAR } from './constants'

const SECONDS_PER_DAY = 86_400
const SECONDS_PER_MONTH = SECONDS_PER_YEAR / 12
const SECONDS_PER_QUARTER = SECONDS_PER_YEAR / 4

describe('growthFactorToApy', () => {
  describe('annual compounding (period = year)', () => {
    it('returns exactly 0.05 for 1.05 growth over one year', () => {
      // 1.05^1 - 1 = 0.05
      expect(growthFactorToApy(1.05, SECONDS_PER_YEAR)).toBeCloseTo(0.05, 10)
    })

    it('returns exactly 1.0 (100%) for doubling over one year', () => {
      // 2.0^1 - 1 = 1.0
      expect(growthFactorToApy(2.0, SECONDS_PER_YEAR)).toBeCloseTo(1.0, 10)
    })

    it('returns exactly 0 for no growth (factor = 1)', () => {
      expect(growthFactorToApy(1, SECONDS_PER_YEAR)).toBe(0)
    })
  })

  describe('sub-annual compounding', () => {
    it('quarterly 5% APR: (1.0125)^4 - 1 ≈ 5.0945%', () => {
      const quarterlyGrowth = 1.0125 // 5% / 4
      const expected = Math.pow(1.0125, 4) - 1
      expect(growthFactorToApy(quarterlyGrowth, SECONDS_PER_QUARTER)).toBeCloseTo(expected, 8)
    })

    it('monthly 12% APR: (1.01)^12 - 1 ≈ 12.6825%', () => {
      const monthlyGrowth = 1.01 // 12% / 12
      const expected = Math.pow(1.01, 12) - 1
      expect(growthFactorToApy(monthlyGrowth, SECONDS_PER_MONTH)).toBeCloseTo(expected, 6)
    })

    it('daily 10% APR: (1 + 0.10/365.25)^365.25 - 1 ≈ e^0.10 - 1', () => {
      const dailyGrowth = 1 + 0.1 / 365.25
      const apy = growthFactorToApy(dailyGrowth, SECONDS_PER_DAY)
      const continuousLimit = Math.exp(0.1) - 1
      // daily compounding should be very close to, but slightly below, continuous
      expect(apy).toBeCloseTo(continuousLimit, 4)
      expect(apy).toBeLessThan(continuousLimit)
    })

    it('half-year: 5% growth in 6 months ≈ 10.25% APY', () => {
      const halfYear = SECONDS_PER_YEAR / 2
      const expected = Math.pow(1.05, 2) - 1 // 1.05^2 - 1 = 0.1025
      expect(growthFactorToApy(1.05, halfYear)).toBeCloseTo(expected, 8)
    })
  })

  describe('per-second rate mode (periodSeconds = 1)', () => {
    it('converts 5% APR continuous rate to APY ≈ e^0.05 - 1', () => {
      const ratePerSecond = 0.05 / SECONDS_PER_YEAR
      const apy = growthFactorToApy(ratePerSecond, 1)
      const expected = Math.exp(0.05) - 1
      expect(apy).toBeCloseTo(expected, 6)
    })

    it('zero rate yields 0% APY', () => {
      // growthPerPeriod = 1 + 0 = 1, so 1^n - 1 = 0
      expect(growthFactorToApy(0, 1)).toBe(0)
    })

    it('converts 10% APR continuous rate correctly', () => {
      const ratePerSecond = 0.1 / SECONDS_PER_YEAR
      const apy = growthFactorToApy(ratePerSecond, 1)
      const expected = Math.exp(0.1) - 1
      expect(apy).toBeCloseTo(expected, 6)
    })

    it('handles very small rates (0.1% APR — realistic low-yield scenario)', () => {
      const ratePerSecond = 0.001 / SECONDS_PER_YEAR
      const apy = growthFactorToApy(ratePerSecond, 1)
      const expected = Math.exp(0.001) - 1
      expect(apy).toBeCloseTo(expected, 8)
    })
  })

  describe('more frequent compounding yields higher APY for the same APR', () => {
    it('annual < semi-annual < quarterly < monthly < daily < per-second', () => {
      const apr = 0.1

      const annual = growthFactorToApy(1 + apr, SECONDS_PER_YEAR)
      const semiAnnual = growthFactorToApy(1 + apr / 2, SECONDS_PER_YEAR / 2)
      const quarterly = growthFactorToApy(1 + apr / 4, SECONDS_PER_QUARTER)
      const monthly = growthFactorToApy(1 + apr / 12, SECONDS_PER_MONTH)
      const daily = growthFactorToApy(1 + apr / 365.25, SECONDS_PER_DAY)
      const continuous = growthFactorToApy(apr / SECONDS_PER_YEAR, 1)

      expect(annual).toBeLessThan(semiAnnual)
      expect(semiAnnual).toBeLessThan(quarterly)
      expect(quarterly).toBeLessThan(monthly)
      expect(monthly).toBeLessThan(daily)
      expect(daily).toBeLessThan(continuous)
    })
  })

  describe('large growth factors', () => {
    it('10x growth over a year = 900% APY', () => {
      expect(growthFactorToApy(10, SECONDS_PER_YEAR)).toBeCloseTo(9.0, 10)
    })

    it('10% growth per day compounds to a very large APY', () => {
      const expected = Math.pow(1.1, 365.25) - 1
      const apy = growthFactorToApy(1.1, SECONDS_PER_DAY)
      // relative error within floating-point tolerance at 10^15 magnitude
      expect(Math.abs(apy - expected) / expected).toBeLessThan(1e-10)
      expect(apy).toBeGreaterThan(1_000_000)
    })
  })

  describe('fractional-second periods are valid', () => {
    it('handles period of 0.5 seconds', () => {
      const apy = growthFactorToApy(1.000001, 0.5)
      expect(Number.isFinite(apy)).toBe(true)
      expect(apy).toBeGreaterThan(0)
    })
  })

  describe('invalid inputs return NaN', () => {
    it('growth factor = 0 with period > 1', () => {
      expect(growthFactorToApy(0, 100)).toBeNaN()
    })

    it('negative growth factor', () => {
      expect(growthFactorToApy(-1, 100)).toBeNaN()
      expect(growthFactorToApy(-0.5, 100)).toBeNaN()
    })

    it('zero period', () => {
      expect(growthFactorToApy(1.05, 0)).toBeNaN()
    })

    it('negative period', () => {
      expect(growthFactorToApy(1.05, -1)).toBeNaN()
    })

    it('non-finite inputs', () => {
      expect(growthFactorToApy(Infinity, 1)).toBeNaN()
      expect(growthFactorToApy(-Infinity, 1)).toBeNaN()
      expect(growthFactorToApy(1, Infinity)).toBeNaN()
      expect(growthFactorToApy(NaN, 1)).toBeNaN()
      expect(growthFactorToApy(1, NaN)).toBeNaN()
    })
  })
})

describe('ratePerSecondToApy', () => {
  it('is equivalent to growthFactorToApy with periodSeconds=1', () => {
    const rates = [0, 1e-10, 0.001 / SECONDS_PER_YEAR, 0.05 / SECONDS_PER_YEAR, 0.5 / SECONDS_PER_YEAR]
    for (const rate of rates) {
      expect(ratePerSecondToApy(rate)).toEqual(growthFactorToApy(rate, 1))
    }
  })

  it('propagates NaN for invalid inputs', () => {
    expect(ratePerSecondToApy(NaN)).toBeNaN()
    expect(ratePerSecondToApy(Infinity)).toBeNaN()
  })

  it('produces the continuous compounding result for a realistic vault rate', () => {
    // Simulate a vault earning ~3.5% APR
    const apr = 0.035
    const ratePerSecond = apr / SECONDS_PER_YEAR
    const apy = ratePerSecondToApy(ratePerSecond)
    const expected = Math.exp(apr) - 1
    expect(apy).toBeCloseTo(expected, 8)
    expect(apy).toBeGreaterThan(apr) // compound effect
  })
})
