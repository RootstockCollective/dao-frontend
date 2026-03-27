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
    const phase1Result = {
      data: [{ result: tvl }, { result: totalSupply }, { result: 5n }],
      isLoading: false,
      error: null,
      refetch: refetchStub,
    }
    const oneWeek = 604800n
    const phase2Result = {
      data: [
        // epoch 4: 1 week later, 0.1% growth → price=1.001
        { status: 'success', result: [oneWeek * 2n, 1001n * ONE_ETHER, 1000n * ONE_ETHER, 0n] },
        // epoch 3: base epoch → price=1.0
        { status: 'success', result: [oneWeek, 1000n * ONE_ETHER, 1000n * ONE_ETHER, 0n] },
      ],
      isLoading: false,
      error: null,
      refetch: refetchStub,
    }
    // useReadContracts is called twice per render (phase 1 + phase 2).
    // Distinguish by contracts array length: phase 1 = 3, phase 2 = 0 or 2.
    mockedUseReadContracts.mockImplementation(({ contracts }: { contracts: unknown[] }) => {
      if (contracts.length === 3) return phase1Result
      if (contracts.length === 2) return phase2Result
      return defaultPhase2
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
