import { renderHook } from '@testing-library/react'
import { afterEach, describe, expect, it, Mock, vi } from 'vitest'
import { useReadContracts } from 'wagmi'

import { rbtcVault } from '@/lib/contracts'

import { useReadRbtcVaultForMultipleArgs } from './useReadRbtcVaultForMultipleArgs'
import { getAbi } from '@/lib/abis/btc-vault'

vi.mock('wagmi', () => ({
  useReadContracts: vi.fn(),
}))

const mockedUseReadContracts = useReadContracts as unknown as Mock

describe('useReadRbtcVaultForMultipleArgs', () => {
  afterEach(() => {
    mockedUseReadContracts.mockReset()
  })

  it('returns empty data array when useReadContracts returns undefined data', () => {
    mockedUseReadContracts.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    })

    const { result } = renderHook(() =>
      useReadRbtcVaultForMultipleArgs({
        functionName: 'epochSnapshot',
        args: [[1n], [2n]],
      }),
    )

    expect(result.current.data).toEqual([])
    expect(result.current.isLoading).toBe(false)
    expect(result.current.isError).toBe(false)
  })

  it('calls useReadContracts with correct parameters when using args', () => {
    const argument0 = [1n] as const
    const argument1 = [2n] as const
    const args = [argument0, argument1]
    mockedUseReadContracts.mockReturnValue({
      data: [],
      isLoading: true,
      isError: false,
      refetch: vi.fn(),
    })

    renderHook(() =>
      useReadRbtcVaultForMultipleArgs({ functionName: 'epochSnapshot', args }),
    )

    expect(useReadContracts).toHaveBeenCalledWith(
      expect.objectContaining({
        contracts: [
          {
            abi: getAbi('RBTCAsyncVaultAbi'),
            address: rbtcVault.address,
            args: argument0,
            functionName: 'epochSnapshot',
          },
          {
            abi: getAbi('RBTCAsyncVaultAbi'),
            address: rbtcVault.address,
            args: argument1,
            functionName: 'epochSnapshot',
          },
        ],
        query: expect.objectContaining({
          retry: true,
        }),
      }),
    )
  })

  it('maps useReadContracts results to a flat data array for all calls', () => {
    const dummyResults = [
      { result: 'snap1', status: 'success' },
      { result: 'snap2', status: 'success' },
    ]
    mockedUseReadContracts.mockReturnValue({
      data: dummyResults,
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    })

    const { result } = renderHook(() =>
      useReadRbtcVaultForMultipleArgs({
        functionName: 'epochSnapshot',
        args: [[1n], [2n]],
      }),
    )

    expect(result.current.data).toEqual(['snap1', 'snap2'])
  })
})
