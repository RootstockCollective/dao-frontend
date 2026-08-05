import { renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { useMinGasForStaking } from './useMinGasForStaking'

const mockUseGasPrice = vi.fn()

vi.mock('wagmi', () => ({
  useGasPrice: () => mockUseGasPrice(),
}))

/** 0.06 gwei — a typical Rootstock gas price. */
const TYPICAL_GAS_PRICE = 60_000_000n

describe('useMinGasForStaking', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns the fallback while the gas price is loading', () => {
    mockUseGasPrice.mockReturnValue({ data: undefined, isLoading: true, isError: false })

    const { result } = renderHook(() => useMinGasForStaking())

    expect(result.current.isLoading).toBe(true)
    expect(result.current.minGas).toBe('0.0002')
  })

  it('falls back and flags it when the gas price errors', () => {
    mockUseGasPrice.mockReturnValue({ data: undefined, isLoading: false, isError: true })

    const { result } = renderHook(() => useMinGasForStaking())

    expect(result.current.isLoading).toBe(false)
    expect(result.current.minGas).toBe('0.0002')
  })

  it('falls back when the node returns no gas price at all', () => {
    mockUseGasPrice.mockReturnValue({ data: undefined, isLoading: false, isError: false })

    const { result } = renderHook(() => useMinGasForStaking())
    expect(result.current.minGas).toBe('0.0002')
  })

  it('estimates from a live gas price', () => {
    mockUseGasPrice.mockReturnValue({ data: TYPICAL_GAS_PRICE, isLoading: false, isError: false })

    const { result } = renderHook(() => useMinGasForStaking())

    expect(result.current.isLoading).toBe(false)
    // 670k gas units x 0.06 gwei x safety factor 2 = 0.00008040, rounded up to 4dp.
    expect(result.current.minGas).toBe('0.0001')
  })

  it('never rounds a tiny estimate down to zero', () => {
    mockUseGasPrice.mockReturnValue({ data: 1n, isLoading: false, isError: false })

    const { result } = renderHook(() => useMinGasForStaking())

    expect(result.current.minGas).toBe('0.0001')
    expect(Number(result.current.minGas)).toBeGreaterThan(0)
  })

  it('caps the figure so a bad reading cannot demand an absurd amount', () => {
    // 100 gwei would put the raw estimate at 0.134 rBTC.
    mockUseGasPrice.mockReturnValue({ data: 100_000_000_000n, isLoading: false, isError: false })

    const { result } = renderHook(() => useMinGasForStaking())

    expect(result.current.minGas).toBe('0.001')
  })

  it('scales with the gas price below the cap', () => {
    mockUseGasPrice.mockReturnValue({ data: TYPICAL_GAS_PRICE, isLoading: false, isError: false })
    const { result: cheap } = renderHook(() => useMinGasForStaking())

    mockUseGasPrice.mockReturnValue({ data: TYPICAL_GAS_PRICE * 5n, isLoading: false, isError: false })
    const { result: pricey } = renderHook(() => useMinGasForStaking())

    expect(Number(pricey.current.minGas)).toBeGreaterThan(Number(cheap.current.minGas))
  })
})
