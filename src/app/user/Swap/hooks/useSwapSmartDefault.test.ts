// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook } from '@testing-library/react'

import { USDT0, USDRIF } from '@/lib/constants'

import { useSwapSmartDefault } from './useSwapSmartDefault'

const mockSetTokenIn = vi.fn()
const mockSetTokenOut = vi.fn()
const mockGetSmartDefault = vi.fn()

vi.mock('../utils/smart-default-direction', () => ({
  getSmartDefaultSwapDirection: (...args: unknown[]) => mockGetSmartDefault(...args),
}))

vi.mock('@/shared/stores/swap', () => ({
  useSwapStore: (selector: (state: Record<string, unknown>) => unknown) =>
    selector({
      tokenIn: USDT0,
      tokenOut: USDRIF,
      setTokenIn: mockSetTokenIn,
      setTokenOut: mockSetTokenOut,
    }),
}))

const mockBalancesContext = {
  balances: {
    [USDT0]: { balance: '0' },
    [USDRIF]: { balance: '100' },
  },
  isBalancesLoading: false,
  prices: {},
}

vi.mock('@/app/user/Balances/context/BalancesContext', () => ({
  useBalancesContext: () => mockBalancesContext,
}))

describe('useSwapSmartDefault', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockBalancesContext.isBalancesLoading = false
    mockBalancesContext.balances = {
      [USDT0]: { balance: '0' },
      [USDRIF]: { balance: '100' },
    }
  })

  it('should call setTokenIn and setTokenOut when smart default differs from store (AC-1)', () => {
    mockGetSmartDefault.mockReturnValue({ tokenIn: USDRIF, tokenOut: USDT0 })

    renderHook(() => useSwapSmartDefault())

    expect(mockGetSmartDefault).toHaveBeenCalledWith('0', '100')
    expect(mockSetTokenIn).toHaveBeenCalledWith(USDRIF)
    expect(mockSetTokenOut).toHaveBeenCalledWith(USDT0)
  })

  it('should not call setters when smart default matches store defaults (AC-2, AC-3, AC-4)', () => {
    mockGetSmartDefault.mockReturnValue({ tokenIn: USDT0, tokenOut: USDRIF })

    renderHook(() => useSwapSmartDefault())

    expect(mockSetTokenIn).not.toHaveBeenCalled()
    expect(mockSetTokenOut).not.toHaveBeenCalled()
  })

  it('should not apply when balances are still loading', () => {
    mockBalancesContext.isBalancesLoading = true
    mockGetSmartDefault.mockReturnValue({ tokenIn: USDRIF, tokenOut: USDT0 })

    renderHook(() => useSwapSmartDefault())

    expect(mockGetSmartDefault).not.toHaveBeenCalled()
    expect(mockSetTokenIn).not.toHaveBeenCalled()
    expect(mockSetTokenOut).not.toHaveBeenCalled()
  })

  it('should only apply once even if re-rendered', () => {
    mockGetSmartDefault.mockReturnValue({ tokenIn: USDRIF, tokenOut: USDT0 })

    const { rerender } = renderHook(() => useSwapSmartDefault())

    expect(mockSetTokenIn).toHaveBeenCalledTimes(1)
    expect(mockSetTokenOut).toHaveBeenCalledTimes(1)

    vi.clearAllMocks()
    rerender()

    expect(mockSetTokenIn).not.toHaveBeenCalled()
    expect(mockSetTokenOut).not.toHaveBeenCalled()
  })

  it('should use fallback "0" when balance entries are missing', () => {
    // SAFETY: testing defensive fallback for missing balance entries
    mockBalancesContext.balances = {} as typeof mockBalancesContext.balances
    mockGetSmartDefault.mockReturnValue({ tokenIn: USDT0, tokenOut: USDRIF })

    renderHook(() => useSwapSmartDefault())

    expect(mockGetSmartDefault).toHaveBeenCalledWith('0', '0')
  })
})
