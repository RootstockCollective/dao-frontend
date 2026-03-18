import { renderHook } from '@testing-library/react'
import { afterEach, describe, expect, it, Mock, vi } from 'vitest'
import { useReadContracts } from 'wagmi'

import { useVaultMetrics } from './useVaultMetrics'

vi.mock('wagmi', () => ({
  useReadContracts: vi.fn(),
}))

const mockedUseReadContracts = useReadContracts as unknown as Mock

describe('useVaultMetrics', () => {
  afterEach(() => {
    mockedUseReadContracts.mockReset()
  })

  it('returns null data and raw when useReadContracts returns undefined', () => {
    mockedUseReadContracts.mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
      refetch: vi.fn(),
    })

    const { result } = renderHook(() => useVaultMetrics())

    expect(result.current.data).toBeNull()
    expect(result.current.raw).toBeNull()
    expect(result.current.isLoading).toBe(true)
  })

  it('returns null raw when data has fewer than 3 results', () => {
    mockedUseReadContracts.mockReturnValue({
      data: [
        { result: 50_000_000_000_000_000_000n },
        { result: 1_020_000_000_000_000_000n },
      ],
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    })

    const { result } = renderHook(() => useVaultMetrics())

    expect(result.current.raw).toBeNull()
    expect(result.current.data).toBeNull()
  })

  it('maps contract results to VaultMetrics and formatted display', () => {
    const tvl = 50_000_000_000_000_000_000n
    const pricePerShare = 1_020_000_000_000_000_000n
    const totalSupply = 30_000_000_000_000_000_000n
    mockedUseReadContracts.mockReturnValue({
      data: [
        { result: tvl },
        { result: pricePerShare },
        { result: totalSupply },
        { result: null },
        { result: null },
      ],
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    })

    const { result } = renderHook(() => useVaultMetrics())

    expect(result.current.raw).not.toBeNull()
    expect(result.current.raw?.tvl).toBe(tvl)
    expect(result.current.raw?.pricePerShare).toBe(pricePerShare)
    expect(result.current.raw?.apy).toBe(0n)
    expect(typeof result.current.raw?.timestamp).toBe('number')

    expect(result.current.data).not.toBeNull()
    expect(result.current.data).toHaveProperty('tvlFormatted')
    expect(result.current.data).toHaveProperty('apyFormatted')
    expect(result.current.data).toHaveProperty('pricePerShareFormatted')
    expect(result.current.data).toHaveProperty('tvlRaw', tvl)
    expect(result.current.data).toHaveProperty('pricePerShareRaw', pricePerShare)
  })

  it('derives APY from synthetic yield when rate and SECONDS_PER_YEAR are present', () => {
    const tvl = 100_000_000_000_000_000_000n
    const pricePerShare = 1_000_000_000_000_000_000n
    const totalSupply = 80_000_000_000_000_000_000n
    const ratePerSecond = 317_097_919_837_645n // ~1e18 / 31_536_000
    const secondsPerYear = 31_536_000n
    mockedUseReadContracts.mockReturnValue({
      data: [
        { result: tvl },
        { result: pricePerShare },
        { result: totalSupply },
        { result: ratePerSecond },
        { result: secondsPerYear },
      ],
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    })

    const { result } = renderHook(() => useVaultMetrics())

    expect(result.current.raw?.apy).not.toBe(0n)
    expect(result.current.data?.apyFormatted).toBeDefined()
  })

  it('returns error when useReadContracts returns error', () => {
    const rpcError = new Error('RPC failed')
    mockedUseReadContracts.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: rpcError,
      refetch: vi.fn(),
    })

    const { result } = renderHook(() => useVaultMetrics())

    expect(result.current.error).toBe(rpcError)
    expect(result.current.data).toBeNull()
    expect(result.current.raw).toBeNull()
  })

  it('calls useReadContracts with refetchInterval 60_000', () => {
    mockedUseReadContracts.mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    })

    renderHook(() => useVaultMetrics())

    expect(useReadContracts).toHaveBeenCalledWith(
      expect.objectContaining({
        query: expect.objectContaining({ refetchInterval: 60_000 }),
      }),
    )
  })
})
