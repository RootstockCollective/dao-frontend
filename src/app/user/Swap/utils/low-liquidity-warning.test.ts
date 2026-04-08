import { describe, it, expect } from 'vitest'

import { RIF, USDRIF, USDT0, WRBTC } from '@/lib/constants'

import { LOW_LIQUIDITY_WARNING_MESSAGE, shouldShowLowLiquidityWarning } from './low-liquidity-warning'

const usdt0In = { symbol: USDT0 }
const usdrifOut = { symbol: USDRIF }
const rifIn = { symbol: RIF }

describe('low-liquidity-warning', () => {
  describe('LOW_LIQUIDITY_WARNING_MESSAGE', () => {
    it('should match the exact product copy', () => {
      expect(LOW_LIQUIDITY_WARNING_MESSAGE).toBe(
        'Warning: there is not enough liquidity to swap the full amount. Please double check you are happy with the amounts shown prior to swapping.',
      )
    })
  })

  describe('shouldShowLowLiquidityWarning', () => {
    it('should return true when user loses more than 5% (output < 95% of input), stable-stable only', () => {
      expect(shouldShowLowLiquidityWarning('100', '94.99', usdt0In, usdrifOut)).toBe(true)
      expect(shouldShowLowLiquidityWarning('100', '90', { symbol: USDRIF }, { symbol: USDT0 })).toBe(true)
      expect(shouldShowLowLiquidityWarning('100', '4', usdt0In, usdrifOut)).toBe(true)
      expect(shouldShowLowLiquidityWarning('1000', '949', { symbol: USDRIF }, { symbol: USDT0 })).toBe(true)
    })

    it('should return false when user loses 5% or less (output >= 95% of input), stable-stable only', () => {
      expect(shouldShowLowLiquidityWarning('100', '95', usdt0In, usdrifOut)).toBe(false)
      expect(shouldShowLowLiquidityWarning('100', '95.01', { symbol: USDRIF }, { symbol: USDT0 })).toBe(false)
      expect(shouldShowLowLiquidityWarning('100', '100', usdt0In, usdrifOut)).toBe(false)
      expect(shouldShowLowLiquidityWarning('1000', '950', { symbol: USDRIF }, { symbol: USDT0 })).toBe(false)
      expect(shouldShowLowLiquidityWarning('1000', '951', usdt0In, usdrifOut)).toBe(false)
    })

    it('does not compare raw amounts for RIF ↔ USDRIF without USD prices (would be meaningless)', () => {
      expect(shouldShowLowLiquidityWarning('1000', '34.71', { ...rifIn, price: 0 }, { ...usdrifOut, price: 0 })).toBe(
        false,
      )
      expect(shouldShowLowLiquidityWarning('1000', '34.71', rifIn, usdrifOut)).toBe(false)
    })

    it('returns false for RIF ↔ WrBTC without USD prices (cannot compare raw token amounts)', () => {
      expect(shouldShowLowLiquidityWarning('1000', '0.0002', { symbol: RIF }, { symbol: WRBTC })).toBe(false)
      expect(shouldShowLowLiquidityWarning('1000', '0.0002', { symbol: RIF, price: 0 }, { symbol: WRBTC, price: 0 })).toBe(
        false,
      )
    })

    it('uses USD notionals for RIF → WrBTC when both prices are set (WrBTC ≈ RBTC USD)', () => {
      const rifPrice = 0.04
      const wrbtcPrice = 95_000
      const rifPriced = { symbol: RIF, price: rifPrice }
      const wrbtcPriced = { symbol: WRBTC, price: wrbtcPrice }
      expect(shouldShowLowLiquidityWarning('1000', '0.0004', rifPriced, wrbtcPriced)).toBe(false)
      expect(shouldShowLowLiquidityWarning('1000', '0.000399', rifPriced, wrbtcPriced)).toBe(true)
    })

    it('uses USD notionals when both prices are set (cross-asset, e.g. RIF → USDRIF)', () => {
      const rifPrice = 0.0369
      const usdrifPrice = 1
      const rifPriced = { symbol: RIF, price: rifPrice }
      const usdrifPriced = { symbol: USDRIF, price: usdrifPrice }
      expect(shouldShowLowLiquidityWarning('100', '3.69', rifPriced, usdrifPriced)).toBe(false)
      expect(shouldShowLowLiquidityWarning('100', '3.0', rifPriced, usdrifPriced)).toBe(true)
      expect(shouldShowLowLiquidityWarning('100', '3.5055', rifPriced, usdrifPriced)).toBe(false)
      expect(shouldShowLowLiquidityWarning('100', '3.5054', rifPriced, usdrifPriced)).toBe(true)
    })

    it('should return false for empty or missing amounts', () => {
      expect(shouldShowLowLiquidityWarning('', '10', usdt0In, usdrifOut)).toBe(false)
      expect(shouldShowLowLiquidityWarning('100', '', usdt0In, usdrifOut)).toBe(false)
      expect(shouldShowLowLiquidityWarning('', '', usdt0In, usdrifOut)).toBe(false)
    })

    it('should return false when amountIn is zero', () => {
      expect(shouldShowLowLiquidityWarning('0', '1', usdt0In, usdrifOut)).toBe(false)
      expect(shouldShowLowLiquidityWarning('0', '0', usdt0In, usdrifOut)).toBe(false)
    })

    it('should handle decimal amounts correctly on stable↔stable', () => {
      expect(shouldShowLowLiquidityWarning('100.5', '95.47', usdt0In, usdrifOut)).toBe(true)
      expect(shouldShowLowLiquidityWarning('100.5', '95.48', { symbol: USDRIF }, { symbol: USDT0 })).toBe(false)
    })
  })
})
