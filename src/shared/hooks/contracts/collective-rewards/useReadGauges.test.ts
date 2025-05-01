import * as abis from '@/lib/abis/v2'
import { AVERAGE_BLOCKTIME } from '@/lib/constants'
import { waitFor } from '@testing-library/dom'
import { renderHook } from '@testing-library/react-hooks'
import { Address } from 'viem'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import * as wagmi from 'wagmi'
import { ViewPureFunctionName } from '../types'
import { ReadGaugesConfig, useReadGauges } from './useReadGauges'

// Mock out wagmi.useReadContracts
vi.mock('wagmi', () => ({
  useReadContracts: vi.fn(),
}))
const mockUseReadContracts = vi.mocked(wagmi.useReadContracts)

vi.mock('@/lib/abis/v2')
const mockGetAbi = vi.mocked(abis.getAbi)

const mockAbi = [
  {
    inputs: [],
    name: 'someViewFunction',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'anotherPureFn',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'pure',
    type: 'function',
  },
] as const

type MockAbi = typeof mockAbi

mockGetAbi.mockReturnValue(mockAbi as unknown as abis.CollectiveRewardsAbi)

describe('useReadGauges', () => {
  beforeEach(() => {
    mockUseReadContracts.mockReset()
  })

  it('returns an array of raw results when there are no errors', () => {
    const dummyResults = [
      { result: 10, error: undefined },
      { result: 20, error: null },
    ]
    mockUseReadContracts.mockReturnValue({
      data: dummyResults,
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    } as unknown as wagmi.UseReadContractReturnType<MockAbi, 'someViewFunction'>)

    const addresses: Address[] = ['0xabc', '0xdef']
    const { result } = renderHook(() =>
      useReadGauges({ addresses, functionName: 'someViewFunction' } as unknown as ReadGaugesConfig<
        ViewPureFunctionName<abis.GaugeAbi>
      >),
    )

    waitFor(() => {
      // ensure the hook forwarded the right contracts list and interval
      expect(mockUseReadContracts).toHaveBeenCalledWith({
        contracts: addresses.map(addr => ({
          abi: expect.any(Array),
          address: addr,
          functionName: 'someViewFunction',
        })),
        query: { refetchInterval: AVERAGE_BLOCKTIME },
      })

      // should unwrap the result values
      expect(result.current.data).toEqual([10, 20])
    })
  })

  it('places any Error into the array when error is present', () => {
    const myError = new Error('read-failed')
    const dummyResults = [
      { result: undefined, error: myError },
      { result: undefined, error: null },
      { result: 20, error: null },
    ]
    mockUseReadContracts.mockReturnValueOnce({
      data: dummyResults,
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    } as unknown as wagmi.UseReadContractReturnType<MockAbi, 'someViewFunction'>)

    const addresses: Address[] = ['0x123']
    const { result } = renderHook(() =>
      useReadGauges({ addresses, functionName: 'anotherPureFn' } as unknown as ReadGaugesConfig<
        ViewPureFunctionName<abis.GaugeAbi>
      >),
    )

    waitFor(() => {
      expect(result.current.data).toHaveLength(1)
      expect(result.current.data[0]).toBe(myError)
      expect(result.current.data[1]).toBeNull()
      expect(result.current.data[2]).toBe(20)
    })
  })

  it('merges user-provided query options with the default refetchInterval', () => {
    const dummyResults: any[] = []
    mockUseReadContracts.mockReturnValue({
      data: dummyResults,
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    } as unknown as wagmi.UseReadContractReturnType<MockAbi, 'someViewFunction'>)

    const addresses = ['0xfeed']
    const extraQuery = { watch: true } as const
    renderHook(() =>
      useReadGauges(
        { addresses, functionName: 'foo' } as unknown as ReadGaugesConfig<
          ViewPureFunctionName<abis.GaugeAbi>
        >,
        extraQuery,
      ),
    )

    waitFor(() => {
      expect(mockUseReadContracts).toHaveBeenCalledWith({
        contracts: addresses.map(addr => ({
          abi: expect.any(Array),
          address: addr,
          functionName: 'foo',
        })),
        query: {
          refetchInterval: AVERAGE_BLOCKTIME,
          ...extraQuery,
        },
      })
    })
  })
})
