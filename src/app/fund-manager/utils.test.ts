import { SECONDS_PER_YEAR } from '@/lib/constants'
import { describe, expect, it } from 'vitest'
import { computeIndicativeApy } from './utils'

function epoch(closedAt: number, assetsAtClose: number, supplyAtClose: number) {
  return {
    closedAt: BigInt(closedAt),
    assetsAtClose: BigInt(assetsAtClose),
    supplyAtClose: BigInt(supplyAtClose),
  }
}

describe('computeIndicativeApy', () => {
  describe('valid consecutive epochs', () => {
    it('returns formatted APY when share price grows 5% over one year', () => {
      const prev = epoch(0, 1000, 1000) // share price 1.0
      const current = epoch(SECONDS_PER_YEAR, 1050, 1000) // share price 1.05
      expect(computeIndicativeApy(current, prev)).toBe('5.00%')
    })

    it('returns "0.00%" when share price is unchanged over one year', () => {
      const prev = epoch(0, 1000, 1000)
      const current = epoch(SECONDS_PER_YEAR, 1000, 1000)
      expect(computeIndicativeApy(current, prev)).toBe('0.00%')
    })

    it('returns formatted negative APY when share price decreases', () => {
      const prev = epoch(0, 1000, 1000) // share price 1.0
      const current = epoch(SECONDS_PER_YEAR, 950, 1000) // share price 0.95 → -5%
      expect(computeIndicativeApy(current, prev)).toBe('-5.00%')
    })

    it('returns formatted APY for doubling over one year', () => {
      const prev = epoch(0, 1000, 1000)
      const current = epoch(SECONDS_PER_YEAR, 2000, 1000)
      expect(computeIndicativeApy(current, prev)).toBe('100.00%')
    })

    it('scales correctly for a 7-day period', () => {
      const sevenDays = 7 * 86_400
      const prev = epoch(0, 1_000_000, 1_000_000)
      const current = epoch(sevenDays, 1_005_000, 1_000_000) // ~0.5% in 7 days
      const result = computeIndicativeApy(current, prev)
      expect(result).toMatch(/^\d+\.\d{2}%$/)
      expect(parseFloat(result)).toBeGreaterThan(20)
      expect(parseFloat(result)).toBeLessThan(35)
    })
  })

  describe('missing or null epochs', () => {
    it('returns "—" when currentEpoch is null', () => {
      const prev = epoch(0, 1000, 1000)
      expect(computeIndicativeApy(null, prev)).toBe('—')
    })

    it('returns "—" when prevEpoch is null', () => {
      const current = epoch(SECONDS_PER_YEAR, 1050, 1000)
      expect(computeIndicativeApy(current, null)).toBe('—')
    })

    it('returns "—" when both epochs are null', () => {
      expect(computeIndicativeApy(null, null)).toBe('—')
    })
  })

  describe('zero supply', () => {
    it('returns "—" when current supply is zero', () => {
      const prev = epoch(0, 1000, 1000)
      const current = epoch(SECONDS_PER_YEAR, 1050, 0)
      expect(computeIndicativeApy(current, prev)).toBe('—')
    })

    it('returns "—" when prev supply is zero', () => {
      const prev = epoch(0, 1000, 0)
      const current = epoch(SECONDS_PER_YEAR, 1050, 1000)
      expect(computeIndicativeApy(current, prev)).toBe('—')
    })
  })

  describe('invalid elapsed time', () => {
    it('returns "—" when closedAt is the same (elapsed = 0)', () => {
      const prev = epoch(1000, 1000, 1000)
      const current = epoch(1000, 1050, 1000)
      expect(computeIndicativeApy(current, prev)).toBe('—')
    })

    it('returns "—" when current closedAt is before prev (elapsed < 0)', () => {
      const prev = epoch(2000, 1000, 1000)
      const current = epoch(1000, 1050, 1000)
      expect(computeIndicativeApy(current, prev)).toBe('—')
    })
  })

  describe('zero previous share price', () => {
    it('returns "—" when prev assets are zero', () => {
      const prev = epoch(0, 0, 1000)
      const current = epoch(SECONDS_PER_YEAR, 1000, 1000)
      expect(computeIndicativeApy(current, prev)).toBe('—')
    })
  })

  describe('output format', () => {
    it('formats APY with two decimal places and percent sign', () => {
      const prev = epoch(0, 100_000, 100_000) // share price 1.0
      const current = epoch(SECONDS_PER_YEAR, 105_250, 100_000) // share price 1.0525 → 5.25%
      expect(computeIndicativeApy(current, prev)).toBe('5.25%')
    })
  })
})
