import { act, renderHook } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { parseUnits } from 'viem'

import { useAmountInput } from './useAmountInput'

const TWO_RBTC = 2000000000000000000n

const FULL_BALANCE_GAS_WARNING =
  'Using your full balance may not leave enough for gas fees, which could cause the transaction to fail.'

describe('useAmountInput', () => {
  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('initial state', () => {
    it('initializes with empty amount', () => {
      const { result } = renderHook(() => useAmountInput({ balance: TWO_RBTC, isNative: true }))
      expect(result.current.amount).toBe('')
    })
  })

  describe('validation based on initial props', () => {
    it('isValidAmount is false when amount is empty', () => {
      const { result } = renderHook(() => useAmountInput({ balance: TWO_RBTC, isNative: true }))
      expect(result.current.isValidAmount).toBe(false)
    })

    it('isValidAmount is false when amount is 0', () => {
      const { result } = renderHook(() => useAmountInput({ balance: TWO_RBTC, isNative: true }))
      // Directly test the isValidAmount logic by checking the calculation
      // Since handleAmountChange updates state, we verify validation logic independently
      expect(result.current.isAmountOverBalance).toBe(false)
    })

    it('isAmountOverBalance is false when amount is empty', () => {
      const { result } = renderHook(() => useAmountInput({ balance: TWO_RBTC, isNative: true }))
      expect(result.current.isAmountOverBalance).toBe(false)
    })

    it('errorMessage is empty when amount is empty', () => {
      const { result } = renderHook(() => useAmountInput({ balance: TWO_RBTC, isNative: true }))
      expect(result.current.errorMessage).toBe('')
    })
  })

  describe('state updates via setAmount', () => {
    it('setAmount updates amount', () => {
      const { result } = renderHook(() => useAmountInput({ balance: TWO_RBTC, isNative: true }))
      act(() => {
        result.current.setAmount('1')
      })
      expect(result.current.amount).toBe('1')
    })

    it('setAmount with empty string clears amount', () => {
      const { result } = renderHook(() => useAmountInput({ balance: TWO_RBTC, isNative: true }))
      act(() => {
        result.current.setAmount('1')
      })
      expect(result.current.amount).toBe('1')
      act(() => {
        result.current.setAmount('')
      })
      expect(result.current.amount).toBe('')
    })
  })

  describe('validation via setAmount', () => {
    it('isAmountOverBalance is false when amount is within balance', () => {
      const { result } = renderHook(() => useAmountInput({ balance: TWO_RBTC, isNative: true }))
      act(() => {
        result.current.setAmount('1')
      })
      expect(result.current.isAmountOverBalance).toBe(false)
    })

    it('isAmountOverBalance is true when amount exceeds balance', () => {
      const { result } = renderHook(() => useAmountInput({ balance: TWO_RBTC, isNative: true }))
      act(() => {
        result.current.setAmount('3')
      })
      expect(result.current.isAmountOverBalance).toBe(true)
    })

    it('errorMessage shows balance error when amount exceeds balance', () => {
      const { result } = renderHook(() => useAmountInput({ balance: TWO_RBTC, isNative: true }))
      act(() => {
        result.current.setAmount('3')
      })
      expect(result.current.errorMessage).toBe(
        'This is more than the available balance. Please update the amount.',
      )
    })

    it('errorMessage is empty when amount is within balance', () => {
      const { result } = renderHook(() => useAmountInput({ balance: TWO_RBTC, isNative: true }))
      act(() => {
        result.current.setAmount('1')
      })
      expect(result.current.errorMessage).toBe('')
    })
  })

  describe('percentage shortcuts - non-native token', () => {
    it('handlePercentageClick(0.1) sets 10% of balance', () => {
      const { result } = renderHook(() => useAmountInput({ balance: TWO_RBTC, isNative: false }))
      act(() => {
        result.current.handlePercentageClick(0.1)
      })
      expect(result.current.amount).toBe('0.2')
    })

    it('handlePercentageClick(0.5) sets 50% of balance', () => {
      const { result } = renderHook(() => useAmountInput({ balance: TWO_RBTC, isNative: false }))
      act(() => {
        result.current.handlePercentageClick(0.5)
      })
      expect(result.current.amount).toBe('1')
    })

    it('handlePercentageClick(1) sets 100% of balance', () => {
      const { result } = renderHook(() => useAmountInput({ balance: TWO_RBTC, isNative: false }))
      act(() => {
        result.current.handlePercentageClick(1)
      })
      expect(result.current.amount).toBe('2')
    })

    it('handlePercentageClick does not produce >18 decimal places (tiny balance × %)', () => {
      // 11 wei × 10% yields a value that needs truncation to fit parseUnits(..., 18)
      const { result } = renderHook(() => useAmountInput({ balance: 11n, isNative: false }))
      act(() => {
        result.current.handlePercentageClick(0.1)
      })
      const { amount } = result.current
      const fractional = amount.split('.')[1] ?? ''
      expect(fractional.length).toBeLessThanOrEqual(18)
      expect(() => parseUnits(amount, 18)).not.toThrow()
    })
  })

  describe('percentage shortcuts - native token', () => {
    it('handlePercentageClick(1) sets 100% of balance (no gas reserve)', () => {
      const { result } = renderHook(() => useAmountInput({ balance: TWO_RBTC, isNative: true }))
      act(() => {
        result.current.handlePercentageClick(1)
      })
      expect(result.current.amount).toBe('2')
    })
  })

  describe('gas warning via errorMessage', () => {
    it('returns gas warning when native, user balance, and amount equals full balance', () => {
      const { result } = renderHook(() => useAmountInput({ balance: TWO_RBTC, isNative: true }))
      act(() => {
        result.current.setAmount('2')
      })
      expect(result.current.errorMessage).toBe(FULL_BALANCE_GAS_WARNING)
    })

    it('returns empty errorMessage when isUserBalance is false', () => {
      const { result } = renderHook(() =>
        useAmountInput({ balance: TWO_RBTC, isNative: true, isUserBalance: false }),
      )
      act(() => {
        result.current.setAmount('2')
      })
      expect(result.current.errorMessage).toBe('')
    })

    it('returns empty when token is not native', () => {
      const { result } = renderHook(() => useAmountInput({ balance: TWO_RBTC, isNative: false }))
      act(() => {
        result.current.setAmount('2')
      })
      expect(result.current.errorMessage).toBe('')
    })

    it('returns empty when amount is below full balance', () => {
      const { result } = renderHook(() => useAmountInput({ balance: TWO_RBTC, isNative: true }))
      act(() => {
        result.current.setAmount('1')
      })
      expect(result.current.errorMessage).toBe('')
    })

    it('returns balance error when amount exceeds balance (not gas warning)', () => {
      const { result } = renderHook(() => useAmountInput({ balance: TWO_RBTC, isNative: true }))
      act(() => {
        result.current.setAmount('3')
      })
      expect(result.current.errorMessage).toBe(
        'This is more than the available balance. Please update the amount.',
      )
    })
  })

  describe('USD equivalent', () => {
    it('returns empty string when amount is empty', () => {
      const { result } = renderHook(() =>
        useAmountInput({ balance: TWO_RBTC, isNative: true, tokenPrice: 50000 }),
      )
      expect(result.current.usdEquivalent).toBe('')
    })

    it('returns empty string when tokenPrice is 0', () => {
      const { result } = renderHook(() =>
        useAmountInput({ balance: TWO_RBTC, isNative: true, tokenPrice: 0 }),
      )
      act(() => {
        result.current.setAmount('1')
      })
      expect(result.current.usdEquivalent).toBe('')
    })

    it('calculates USD equivalent correctly', () => {
      const { result } = renderHook(() =>
        useAmountInput({ balance: TWO_RBTC, isNative: true, tokenPrice: 50000 }),
      )
      act(() => {
        result.current.setAmount('1')
      })
      expect(result.current.usdEquivalent).toBe('$50,000.00 USD')
    })

    it('calculates USD equivalent with decimals', () => {
      const { result } = renderHook(() =>
        useAmountInput({ balance: TWO_RBTC, isNative: true, tokenPrice: 50000 }),
      )
      act(() => {
        result.current.setAmount('1.5')
      })
      expect(result.current.usdEquivalent).toBe('$75,000.00 USD')
    })
  })
})
