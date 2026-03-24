import { renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { RBTC } from '@/lib/constants'

import { useTokenSelection } from './useTokenSelection'

const WRBTC_ADDRESS = '0x0000000000000000000000000000000000000001' as const

describe('useTokenSelection', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    vi.mock('wagmi', () => ({
      useAccount: vi.fn(() => ({ address: '0xuser' })),
      useReadContract: vi.fn(() => ({ data: 1_000_000_000_000_000_000n, isLoading: false })),
      useBalance: vi.fn(() => ({ data: { value: 2_000_000_000_000_000_000n }, isLoading: false })),
    }))
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('initial state', () => {
    it(`defaults to ${RBTC} selected`, () => {
      const { result } = renderHook(() => useTokenSelection(WRBTC_ADDRESS))
      expect(result.current.selectedToken).toBe(RBTC)
    })

    it('isNative is true when RBTC is selected', () => {
      const { result } = renderHook(() => useTokenSelection(WRBTC_ADDRESS))
      expect(result.current.isNative).toBe(true)
    })

    it('requiresAllowance is false when RBTC is selected', () => {
      const { result } = renderHook(() => useTokenSelection(WRBTC_ADDRESS))
      expect(result.current.requiresAllowance).toBe(false)
    })
  })

  describe('balance', () => {
    it('returns rbtcBalanceData.value when native is selected', () => {
      const { result } = renderHook(() => useTokenSelection(WRBTC_ADDRESS))
      expect(result.current.balance).toBe(2_000_000_000_000_000_000n)
    })
  })
})
