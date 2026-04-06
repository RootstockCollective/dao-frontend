import { renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { useSwapBtcSideBalances } from './useSwapBtcSideBalances'

const mockUseAccount = vi.fn()
const mockUseBalance = vi.fn()
const mockUseReadContract = vi.fn()

vi.mock('wagmi', () => ({
  useAccount: () => mockUseAccount(),
  useBalance: (opts: unknown) => mockUseBalance(opts),
  useReadContract: (opts: unknown) => mockUseReadContract(opts),
}))

describe('useSwapBtcSideBalances', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUseAccount.mockReturnValue({ address: '0x000000000000000000000000000000000000dEaD' })
    mockUseBalance.mockReturnValue({
      data: { value: 1_000_000_000_000_000_000n },
      isLoading: false,
    })
    mockUseReadContract.mockReturnValue({
      data: 2_000_000_000_000_000_000n,
      isLoading: false,
    })
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('returns summed wei and formatted strings when both balances exist', () => {
    const { result } = renderHook(() => useSwapBtcSideBalances())

    expect(result.current.nativeWei).toBe(1_000_000_000_000_000_000n)
    expect(result.current.wrbtcWei).toBe(2_000_000_000_000_000_000n)
    expect(result.current.combinedWei).toBe(3_000_000_000_000_000_000n)
    expect(result.current.combinedBalanceFormatted).toBe('3')
    expect(result.current.wrbtcBalanceFormatted).toBe('2')
    expect(result.current.isLoading).toBe(false)
  })

  it('treats missing WRBTC read as zero', () => {
    mockUseReadContract.mockReturnValue({ data: undefined, isLoading: false })

    const { result } = renderHook(() => useSwapBtcSideBalances())

    expect(result.current.wrbtcWei).toBe(0n)
    expect(result.current.combinedWei).toBe(1_000_000_000_000_000_000n)
  })

  it('returns zeros when wallet is disconnected', () => {
    mockUseAccount.mockReturnValue({ address: undefined })
    mockUseBalance.mockReturnValue({ data: undefined, isLoading: false })
    mockUseReadContract.mockReturnValue({ data: undefined, isLoading: false })

    const { result } = renderHook(() => useSwapBtcSideBalances())

    expect(result.current.nativeWei).toBe(0n)
    expect(result.current.wrbtcWei).toBe(0n)
    expect(result.current.combinedWei).toBe(0n)
    expect(result.current.isLoading).toBe(false)
  })

  it('reports loading while either query is loading', () => {
    mockUseBalance.mockReturnValue({
      data: { value: 0n },
      isLoading: true,
    })
    mockUseReadContract.mockReturnValue({ data: 0n, isLoading: false })

    const { result } = renderHook(() => useSwapBtcSideBalances())

    expect(result.current.isLoading).toBe(true)
  })
})
