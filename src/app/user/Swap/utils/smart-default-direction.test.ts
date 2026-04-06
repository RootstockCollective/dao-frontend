import { describe, it, expect } from 'vitest'

import { RIF, USDT0, USDRIF, WRBTC } from '@/lib/constants'

import { getSmartDefaultSwapDirection } from './smart-default-direction'

describe('getSmartDefaultSwapDirection', () => {
  it('should return USDRIF → USDT0 when USDT0=0 and USDRIF>0', () => {
    const result = getSmartDefaultSwapDirection('0', '100', '0', '0')
    expect(result).toEqual({ tokenIn: USDRIF, tokenOut: USDT0 })
  })

  it('should return USDT0 → USDRIF when USDT0>0 and USDRIF=0', () => {
    const result = getSmartDefaultSwapDirection('50', '0', '0', '0')
    expect(result).toEqual({ tokenIn: USDT0, tokenOut: USDRIF })
  })

  it('should return USDT0 → USDRIF when USDT0>0 even if USDRIF>0', () => {
    const result = getSmartDefaultSwapDirection('100', '200', '0', '0')
    expect(result).toEqual({ tokenIn: USDT0, tokenOut: USDRIF })
  })

  it('should return USDT0 → USDRIF when all balances are zero', () => {
    const result = getSmartDefaultSwapDirection('0', '0', '0', '0')
    expect(result).toEqual({ tokenIn: USDT0, tokenOut: USDRIF })
  })

  it('should return RIF → USDRIF when only RIF is positive', () => {
    const result = getSmartDefaultSwapDirection('0', '0', '25', '0')
    expect(result).toEqual({ tokenIn: RIF, tokenOut: USDRIF })
  })

  it('should handle very small USDRIF balance', () => {
    const result = getSmartDefaultSwapDirection('0', '0.0000001', '0', '0')
    expect(result).toEqual({ tokenIn: USDRIF, tokenOut: USDT0 })
  })

  it('should handle very small USDT0 balance as non-zero', () => {
    const result = getSmartDefaultSwapDirection('0.0000001', '100', '0', '0')
    expect(result).toEqual({ tokenIn: USDT0, tokenOut: USDRIF })
  })

  it('should treat "0.0" as zero for USDT0', () => {
    const result = getSmartDefaultSwapDirection('0.0', '50', '0', '0')
    expect(result).toEqual({ tokenIn: USDRIF, tokenOut: USDT0 })
  })

  it('should handle large balances', () => {
    const result = getSmartDefaultSwapDirection('0', '999999999.123456', '0', '0')
    expect(result).toEqual({ tokenIn: USDRIF, tokenOut: USDT0 })
  })

  it('should prefer USDT0 over RIF when both are positive', () => {
    const result = getSmartDefaultSwapDirection('1', '0', '999', '0')
    expect(result).toEqual({ tokenIn: USDT0, tokenOut: USDRIF })
  })

  it('should return WrBTC → USDRIF when only BTC-side balance is positive', () => {
    const result = getSmartDefaultSwapDirection('0', '0', '0', '0.5')
    expect(result).toEqual({ tokenIn: WRBTC, tokenOut: USDRIF })
  })

  it('should prefer RIF over BTC-side when both are positive', () => {
    const result = getSmartDefaultSwapDirection('0', '0', '1', '100')
    expect(result).toEqual({ tokenIn: RIF, tokenOut: USDRIF })
  })
})
