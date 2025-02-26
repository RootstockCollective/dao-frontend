import { getAbi } from '@/lib/abis/v2'
import { AVERAGE_BLOCKTIME } from '@/lib/constants'
import { BuilderRegistryAddress } from '@/lib/contracts'
import { renderHook } from '@testing-library/react'
import { afterEach, describe, expect, it, Mock, vi } from 'vitest'
import { useReadContracts } from 'wagmi'
import { useReadBuilderRegistryForMultipleArgs } from './useReadBuilderRegistryForMultipleArgs'

// Mock wagmi's useReadContracts
vi.mock('wagmi', () => ({
  useReadContracts: vi.fn(),
}))

const mockedUseReadContracts = useReadContracts as unknown as Mock
const builderRegistryAbi = getAbi('BuilderRegistryAbi')

describe('useReadBuilderRegistries hook', () => {
  afterEach(() => {
    mockedUseReadContracts.mockReset()
  })

  it('returns empty data array when useReadContracts returns undefined data', () => {
    const functionName = 'gaugeToBuilder'
    mockedUseReadContracts.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    })

    const { result } = renderHook(() =>
      useReadBuilderRegistryForMultipleArgs({ functionName, args: [['0x1'], ['0x2']] }),
    )

    expect(result.current.data).toEqual([])
    expect(result.current.isLoading).toBe(false)
    expect(result.current.isError).toBe(false)
  })

  it('calls useReadContracts with correct parameters when using args', () => {
    const functionName = 'getGaugeAt'
    const argument0 = [1n] as const
    const argument1 = [2n] as const
    const args = [argument0, argument1]
    mockedUseReadContracts.mockReturnValue({
      data: [],
      isLoading: true,
      isError: false,
      refetch: vi.fn(),
    })

    renderHook(() => useReadBuilderRegistryForMultipleArgs({ functionName, args }))

    expect(useReadContracts).toHaveBeenCalledWith(
      expect.objectContaining({
        contracts: [
          { abi: builderRegistryAbi, address: BuilderRegistryAddress, args: argument0, functionName },
          { abi: builderRegistryAbi, address: BuilderRegistryAddress, args: argument1, functionName },
        ],
        query: {
          retry: true,
          refetchInterval: AVERAGE_BLOCKTIME,
        },
      }),
    )
  })

  it('maps useReadContracts results to a flat data array for all calls', () => {
    const dummyResults = [
      { result: 'value1', status: 'success' },
      { result: 'value2', status: 'error', error: new Error('Error fetching data') },
      { result: 'value3', status: 'success' },
      { result: 'value4', status: 'something else' },
      { result: 'value5', status: 'success' },
    ]
    const functionName = 'gaugeToBuilder'
    mockedUseReadContracts.mockReturnValue({
      data: dummyResults,
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    })

    const { result } = renderHook(() =>
      useReadBuilderRegistryForMultipleArgs({
        functionName,
        args: [['0x1'], ['0x2'], ['0x3'], ['0x4'], ['0x5']],
      }),
    )

    expect(result.current.data).toEqual(['value1', 'value2', 'value3', 'value4', 'value5'])
  })
})
