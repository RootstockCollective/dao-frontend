import { describe, it, expect } from 'vitest'

import { USDT0, USDRIF } from '@/lib/constants'

import { getSmartDefaultSwapDirection } from './smart-default-direction'

describe('getSmartDefaultSwapDirection', () => {
  it('should return USDRIF → USDT0 when USDT0=0 and USDRIF>0 (AC-1)', () => {
    const result = getSmartDefaultSwapDirection('0', '100')
    expect(result).toEqual({ tokenIn: USDRIF, tokenOut: USDT0 })
  })

  it('should return USDT0 → USDRIF when USDT0>0 and USDRIF=0 (AC-2)', () => {
    const result = getSmartDefaultSwapDirection('50', '0')
    expect(result).toEqual({ tokenIn: USDT0, tokenOut: USDRIF })
  })

  it('should return USDT0 → USDRIF when both >0 (AC-3)', () => {
    const result = getSmartDefaultSwapDirection('100', '200')
    expect(result).toEqual({ tokenIn: USDT0, tokenOut: USDRIF })
  })

  it('should return USDT0 → USDRIF when both =0 (AC-4)', () => {
    const result = getSmartDefaultSwapDirection('0', '0')
    expect(result).toEqual({ tokenIn: USDT0, tokenOut: USDRIF })
  })

  it('should handle very small USDRIF balance', () => {
    const result = getSmartDefaultSwapDirection('0', '0.0000001')
    expect(result).toEqual({ tokenIn: USDRIF, tokenOut: USDT0 })
  })

  it('should handle very small USDT0 balance as non-zero', () => {
    const result = getSmartDefaultSwapDirection('0.0000001', '100')
    expect(result).toEqual({ tokenIn: USDT0, tokenOut: USDRIF })
  })

  it('should treat "0.0" as zero', () => {
    const result = getSmartDefaultSwapDirection('0.0', '50')
    expect(result).toEqual({ tokenIn: USDRIF, tokenOut: USDT0 })
  })

  it('should handle large balances', () => {
    const result = getSmartDefaultSwapDirection('0', '999999999.123456')
    expect(result).toEqual({ tokenIn: USDRIF, tokenOut: USDT0 })
  })
})
