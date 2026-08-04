import { GaugeAbi } from '@/lib/abis/tok/GaugeAbi'
import { AVERAGE_BLOCKTIME } from '@/lib/constants'
import { renderHook } from '@testing-library/react'
import { Address } from 'viem'
import { afterEach, describe, expect, it, Mock, vi } from 'vitest'
import { useReadContracts } from 'wagmi'
import { useReadGauges } from './useReadGauges'

// Mock wagmi's useReadContracts
vi.mock('wagmi', () => ({
  useReadContract: vi.fn(),
  useReadContracts: vi.fn(),
}))

const mockedUseReadContracts = useReadContracts as unknown as Mock
const addresses = ['0x1', '0x2'] as Address[]

describe('useReadGauges hook', () => {
  afterEach(() => {
    mockedUseReadContracts.mockReset()
    vi.restoreAllMocks()
  })

  it('returns empty data array when useReadContracts returns undefined data', () => {
    mockedUseReadContracts.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    })

    const { result } = renderHook(() => useReadGauges({ addresses, functionName: 'totalAllocation' }))

    expect(result.current.data).toEqual([])
    expect(result.current.isLoading).toBe(false)
    expect(result.current.isError).toBe(false)
  })

  it('calls useReadContracts once per address with the shared function name', () => {
    const functionName = 'totalAllocation'
    mockedUseReadContracts.mockReturnValue({
      data: [],
      isLoading: true,
      isError: false,
      refetch: vi.fn(),
    })

    renderHook(() => useReadGauges({ addresses, functionName }))

    expect(useReadContracts).toHaveBeenCalledWith(
      expect.objectContaining({
        contracts: [
          { abi: GaugeAbi, address: '0x1', functionName },
          { abi: GaugeAbi, address: '0x2', functionName },
        ],
        query: {
          retry: true,
          refetchInterval: AVERAGE_BLOCKTIME,
        },
      }),
    )
  })

  it('forwards the shared args to every address', () => {
    const functionName = 'earned'
    const args = ['0xtoken', '0xbacker'] as [Address, Address]
    mockedUseReadContracts.mockReturnValue({
      data: [],
      isLoading: true,
      isError: false,
      refetch: vi.fn(),
    })

    renderHook(() => useReadGauges({ addresses, functionName, args }))

    expect(useReadContracts).toHaveBeenCalledWith(
      expect.objectContaining({
        contracts: [
          { abi: GaugeAbi, address: '0x1', functionName, args },
          { abi: GaugeAbi, address: '0x2', functionName, args },
        ],
      }),
    )
  })

  it('merges query overrides on top of the defaults instead of replacing them', () => {
    mockedUseReadContracts.mockReturnValue({
      data: [],
      isLoading: true,
      isError: false,
      refetch: vi.fn(),
    })

    renderHook(() => useReadGauges({ addresses, functionName: 'totalAllocation' }, { enabled: false }))

    expect(useReadContracts).toHaveBeenCalledWith(
      expect.objectContaining({
        query: {
          retry: true,
          refetchInterval: AVERAGE_BLOCKTIME,
          enabled: false,
        },
      }),
    )
  })

  it('maps useReadContracts results to a flat data array and logs the failed calls', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
    const error = new Error('Error fetching data')
    const dummyResults = [
      { result: 1n, status: 'success' },
      { result: undefined, status: 'error', error },
      { result: 3n, status: 'something else' },
    ]
    mockedUseReadContracts.mockReturnValue({
      data: dummyResults,
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    })

    const { result } = renderHook(() =>
      useReadGauges({ addresses: ['0x1', '0x2', '0x3'] as Address[], functionName: 'totalAllocation' }),
    )

    expect(result.current.data).toEqual([1n, undefined, 3n])
    expect(consoleError).toHaveBeenCalledTimes(2)
    expect(consoleError).toHaveBeenNthCalledWith(
      1,
      'Call index: 1: data fetch not successful for Gauge(0x2).totalAllocation.',
      error,
    )
    expect(consoleError).toHaveBeenNthCalledWith(
      2,
      'Call index: 2: data fetch not successful for Gauge(0x3).totalAllocation.',
      'Unknown error',
    )
  })
})
