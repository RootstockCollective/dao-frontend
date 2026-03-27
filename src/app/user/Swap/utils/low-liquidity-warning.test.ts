import { describe, it, expect } from 'vitest'

import { LOW_LIQUIDITY_WARNING_MESSAGE, shouldShowLowLiquidityWarning } from './low-liquidity-warning'

describe('low-liquidity-warning', () => {
  describe('LOW_LIQUIDITY_WARNING_MESSAGE', () => {
    it('should match the exact product copy', () => {
      expect(LOW_LIQUIDITY_WARNING_MESSAGE).toBe(
        'Warning: there is not enough liquidity to swap the full amount. Please double check you are happy with the amounts shown prior to swapping.',
      )
    })
  })

  describe('shouldShowLowLiquidityWarning', () => {
    it('should return true when user loses more than 5% (output < 95% of input)', () => {
      // In=100: out=94.99 → losing >5% → show warning
      expect(shouldShowLowLiquidityWarning('100', '94.99')).toBe(true)
      expect(shouldShowLowLiquidityWarning('100', '90')).toBe(true)
      expect(shouldShowLowLiquidityWarning('100', '4')).toBe(true)
      expect(shouldShowLowLiquidityWarning('1000', '949')).toBe(true)
    })

    it('should return false when user loses 5% or less (output >= 95% of input)', () => {
      // In=100: out=95.01 → losing <5% → don't show
      expect(shouldShowLowLiquidityWarning('100', '95')).toBe(false)
      expect(shouldShowLowLiquidityWarning('100', '95.01')).toBe(false)
      expect(shouldShowLowLiquidityWarning('100', '100')).toBe(false)
      expect(shouldShowLowLiquidityWarning('1000', '950')).toBe(false)
      expect(shouldShowLowLiquidityWarning('1000', '951')).toBe(false)
    })

    it('uses USD notionals when both prices are set (cross-asset, e.g. RIF → USDRIF)', () => {
      const rifPrice = 0.0369
      const usdrifPrice = 1
      // 100 RIF @ $0.0369 ≈ $3.69; 3.69 USDRIF @ $1 ≈ $3.69 → fair, no warning (not 3.69 < 100×0.95)
      expect(shouldShowLowLiquidityWarning('100', '3.69', rifPrice, usdrifPrice)).toBe(false)
      // Output value >5% below input value
      expect(shouldShowLowLiquidityWarning('100', '3.0', rifPrice, usdrifPrice)).toBe(true)
      // Edge: exactly 95% of USD in
      expect(shouldShowLowLiquidityWarning('100', '3.5055', rifPrice, usdrifPrice)).toBe(false)
      expect(shouldShowLowLiquidityWarning('100', '3.5054', rifPrice, usdrifPrice)).toBe(true)
    })

    it('should return false for empty or missing amounts', () => {
      expect(shouldShowLowLiquidityWarning('', '10')).toBe(false)
      expect(shouldShowLowLiquidityWarning('100', '')).toBe(false)
      expect(shouldShowLowLiquidityWarning('', '')).toBe(false)
    })

    it('should return false when amountIn is zero', () => {
      expect(shouldShowLowLiquidityWarning('0', '1')).toBe(false)
      expect(shouldShowLowLiquidityWarning('0', '0')).toBe(false)
    })

    it('should handle decimal amounts correctly', () => {
      // 95% of 100.5 = 95.475; 95.47 < 95.475 → show; 95.48 → don't show
      expect(shouldShowLowLiquidityWarning('100.5', '95.47')).toBe(true)
      expect(shouldShowLowLiquidityWarning('100.5', '95.48')).toBe(false)
    })
  })
})
