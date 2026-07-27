import { GaugeAbi } from '@/lib/abis/tok/GaugeAbi'
import { renderHook } from '@testing-library/react'
import { Address } from 'viem'
import { afterEach, describe, expect, it, Mock, vi } from 'vitest'
import { useReadContract } from 'wagmi'
import { useReadGauge } from './useReadGauge'

// Mock wagmi's useReadContract
vi.mock('wagmi', () => ({
  useReadContract: vi.fn(),
  useReadContracts: vi.fn(),
}))

const mockedUseReadContract = useReadContract as unknown as Mock
const address = '0x1' as Address

describe('useReadGauge hook', () => {
  afterEach(() => {
    mockedUseReadContract.mockReset()
  })

  it('reads the caller-provided address and keeps the shared defaults its overrides omit', () => {
    const functionName = 'builderRewards'
    const args = ['0xtoken'] as [Address]
    mockedUseReadContract.mockReturnValue({ data: 1n, isLoading: false })

    renderHook(() => useReadGauge({ address, functionName, args }))

    expect(useReadContract).toHaveBeenCalledWith({
      abi: GaugeAbi,
      address,
      functionName,
      args,
      query: {
        // Gauges opt out of block polling, but must not lose the shared `retry` default.
        retry: true,
        refetchInterval: false,
      },
    })
  })

  it('lets the caller override the query on a per-call basis', () => {
    mockedUseReadContract.mockReturnValue({ data: undefined, isLoading: false })

    renderHook(() => useReadGauge({ address, functionName: 'rewardShares' }, { enabled: false }))

    expect(useReadContract).toHaveBeenCalledWith(
      expect.objectContaining({
        query: {
          retry: true,
          refetchInterval: false,
          enabled: false,
        },
      }),
    )
  })
})
