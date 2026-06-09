import { describe, expect, it } from 'vitest'

import {
  effectiveDepositMaxWei,
  isAmountOverReportedOffchain,
  moveCapitalInBlockingError,
} from './moveCapitalInAmountValidation'

const ONE = 1000000000000000000n

describe('moveCapitalInAmountValidation', () => {
  describe('isAmountOverReportedOffchain', () => {
    it('is false when amount equals cap', () => {
      expect(isAmountOverReportedOffchain(ONE, ONE)).toBe(false)
    })

    it('is false when amount is below cap', () => {
      expect(isAmountOverReportedOffchain(ONE / 2n, ONE)).toBe(false)
    })

    it('is true when amount exceeds cap', () => {
      expect(isAmountOverReportedOffchain(ONE * 2n, ONE)).toBe(true)
    })

    it('is false when cap is unknown', () => {
      expect(isAmountOverReportedOffchain(ONE * 2n, null)).toBe(false)
      expect(isAmountOverReportedOffchain(ONE * 2n, undefined)).toBe(false)
    })
  })

  describe('moveCapitalInBlockingError', () => {
    it('returns null when amount is within cap', () => {
      expect(moveCapitalInBlockingError(ONE / 2n, ONE, '1')).toBe(null)
    })

    it('returns error when amount exceeds cap', () => {
      expect(moveCapitalInBlockingError(ONE * 2n, ONE, '1')).toBe(
        'Amount cannot exceed reported offchain assets (1). Please reduce the amount.',
      )
    })

    it('returns null when cap is unknown', () => {
      expect(moveCapitalInBlockingError(ONE * 2n, null, '1')).toBe(null)
      expect(moveCapitalInBlockingError(ONE * 2n, undefined, '1')).toBe(null)
    })
  })

  describe('effectiveDepositMaxWei', () => {
    it('returns wallet balance when cap is unknown (null)', () => {
      expect(effectiveDepositMaxWei(ONE * 10n, null)).toBe(ONE * 10n)
    })

    it('returns reported cap when it is below wallet balance', () => {
      expect(effectiveDepositMaxWei(ONE * 10n, ONE * 2n)).toBe(ONE * 2n)
    })

    it('returns wallet balance when it is below reported cap', () => {
      expect(effectiveDepositMaxWei(ONE * 2n, ONE * 10n)).toBe(ONE * 2n)
    })

    it('returns the same value when wallet equals reported', () => {
      expect(effectiveDepositMaxWei(ONE * 5n, ONE * 5n)).toBe(ONE * 5n)
    })
  })
})
