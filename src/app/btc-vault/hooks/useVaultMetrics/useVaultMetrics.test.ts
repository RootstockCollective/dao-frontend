import { renderHook } from '@testing-library/react'
import { afterEach, describe, expect, it, type Mock, vi } from 'vitest'
import { useReadContracts } from 'wagmi'

import { useVaultMetrics } from './useVaultMetrics'

vi.mock('wagmi', () => ({
  useReadContracts: vi.fn(),
}))

const mockedUseReadContracts = useReadContracts as unknown as Mock

const ONE_ETHER = 1_000_000_000_000_000_000n
const refetchStub = vi.fn()

const defaultPhase2 = { data: undefined, isLoading: false, error: null, refetch: refetchStub }

describe('useVaultMetrics', () => {
  afterEach(() => {
    mockedUseReadContracts.mockReset()
  })

  it('returns null data when phase 1 returns undefined', () => {
    mockedUseReadContracts
      .mockReturnValueOnce({ data: undefined, isLoading: true, error: null, refetch: refetchStub })
      .mockReturnValueOnce(defaultPhase2)

    const { result } = renderHook(() => useVaultMetrics())

    expect(result.current.data).toBeNull()
    expect(result.current.raw).toBeNull()
    expect(result.current.isLoading).toBe(true)
  })

  it('returns null raw when phase 1 has fewer than 3 results', () => {
    mockedUseReadContracts
      .mockReturnValueOnce({
        data: [{ result: 50n * ONE_ETHER }],
        isLoading: false,
        error: null,
        refetch: refetchStub,
      })
      .mockReturnValueOnce(defaultPhase2)

    const { result } = renderHook(() => useVaultMetrics())

    expect(result.current.raw).toBeNull()
    expect(result.current.data).toBeNull()
  })

  it('maps contract results with apy=0 when epoch is too early for snapshots', () => {
    const tvl = 50n * ONE_ETHER
    const totalSupply = 30n * ONE_ETHER
    const expectedPricePerShare = (tvl * ONE_ETHER) / totalSupply
    // currentEpoch = 1 → no lastEpochId (needs >= 2)
    mockedUseReadContracts
      .mockReturnValueOnce({
        data: [{ result: tvl }, { result: totalSupply }, { result: 1n }],
        isLoading: false,
        error: null,
        refetch: refetchStub,
      })
      .mockReturnValueOnce(defaultPhase2)

    const { result } = renderHook(() => useVaultMetrics())

    expect(result.current.raw).not.toBeNull()
    expect(result.current.raw?.tvl).toBe(tvl)
    expect(result.current.raw?.pricePerShare).toBe(expectedPricePerShare)
    expect(result.current.raw?.apy).toBe(0)
    expect(result.current.data).not.toBeNull()
    expect(result.current.data).toHaveProperty('tvlFormatted')
    expect(result.current.data).toHaveProperty('apyFormatted')
    expect(result.current.data).toHaveProperty('pricePerShareFormatted')
  })

  it('computes APY from epoch snapshots', () => {
    const tvl = 100n * ONE_ETHER
    const totalSupply = 80n * ONE_ETHER
    // currentEpoch = 5 → lastEpochId = 4, prevEpochId = 3
    mockedUseReadContracts
      .mockReturnValueOnce({
        data: [{ result: tvl }, { result: totalSupply }, { result: 5n }],
        isLoading: false,
        error: null,
        refetch: refetchStub,
      })
      .mockReturnValueOnce({
        data: [
          // epoch 4: closedAt=1000, assetsAtClose=110e18, supplyAtClose=100e18 → price=1.1
          { status: 'success', result: [1000n, 110n * ONE_ETHER, 100n * ONE_ETHER, 0n] },
          // epoch 3: closedAt=500, assetsAtClose=100e18, supplyAtClose=100e18 → price=1.0
          { status: 'success', result: [500n, 100n * ONE_ETHER, 100n * ONE_ETHER, 0n] },
        ],
        isLoading: false,
        error: null,
        refetch: refetchStub,
      })

    const { result } = renderHook(() => useVaultMetrics())

    expect(result.current.raw?.apy).not.toBe(0)
    expect(result.current.raw?.apy).toBeGreaterThan(0)
    expect(result.current.data?.apyFormatted).toBeDefined()
  })

  it('returns error when useReadContracts returns error', () => {
    const rpcError = new Error('RPC failed')
    mockedUseReadContracts
      .mockReturnValueOnce({ data: undefined, isLoading: false, error: rpcError, refetch: refetchStub })
      .mockReturnValueOnce(defaultPhase2)

    const { result } = renderHook(() => useVaultMetrics())

    expect(result.current.error).toBe(rpcError)
    expect(result.current.data).toBeNull()
  })
})
