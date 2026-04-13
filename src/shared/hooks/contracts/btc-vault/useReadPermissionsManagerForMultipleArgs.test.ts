import { renderHook } from '@testing-library/react'
import { afterEach, describe, expect, it, Mock, vi } from 'vitest'
import { useReadContracts } from 'wagmi'

import { permissionsManager } from '@/lib/contracts'

import { useReadPermissionsManagerForMultipleArgs } from './useReadPermissionsManagerForMultipleArgs'
import { getAbi } from '@/lib/abis/btc-vault'

vi.mock('wagmi', () => ({
  useReadContracts: vi.fn(),
}))

const mockedUseReadContracts = useReadContracts as unknown as Mock

describe('useReadPermissionsManagerForMultipleArgs', () => {
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
      useReadPermissionsManagerForMultipleArgs({
        functionName: 'hasRole',
        args: [
          ['0x0000000000000000000000000000000000000000000000000000000000000000', '0x1234'],
          ['0x0000000000000000000000000000000000000000000000000000000000000000', '0x5678'],
        ],
      }),
    )

    expect(result.current.data).toEqual([])
    expect(result.current.isLoading).toBe(false)
    expect(result.current.isError).toBe(false)
  })

  it('calls useReadContracts with correct parameters when using args', () => {
    const argument0 = [
      '0x0000000000000000000000000000000000000000000000000000000000000000',
      '0x1234',
    ] as const
    const argument1 = [
      '0x0000000000000000000000000000000000000000000000000000000000000000',
      '0x5678',
    ] as const
    const args = [argument0, argument1]
    mockedUseReadContracts.mockReturnValue({
      data: [],
      isLoading: true,
      isError: false,
      refetch: vi.fn(),
    })

    renderHook(() =>
      useReadPermissionsManagerForMultipleArgs({ functionName: 'hasRole', args }),
    )

    expect(useReadContracts).toHaveBeenCalledWith(
      expect.objectContaining({
        contracts: [
          {
            abi: getAbi('PermissionsManagerAbi'),
            address: permissionsManager.address,
            args: argument0,
            functionName: 'hasRole',
          },
          {
            abi: getAbi('PermissionsManagerAbi'),
            address: permissionsManager.address,
            args: argument1,
            functionName: 'hasRole',
          },
        ],
        query: {
          retry: true,
        },
      }),
    )
  })

  it('maps useReadContracts results to a flat data array for all calls', () => {
    const dummyResults = [
      { result: true, status: 'success' },
      { result: false, status: 'success' },
    ]
    mockedUseReadContracts.mockReturnValue({
      data: dummyResults,
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    })

    const { result } = renderHook(() =>
      useReadPermissionsManagerForMultipleArgs({
        functionName: 'hasRole',
        args: [
          ['0x0000000000000000000000000000000000000000000000000000000000000000', '0x1234'],
          ['0x0000000000000000000000000000000000000000000000000000000000000000', '0x5678'],
        ],
      }),
    )

    expect(result.current.data).toEqual([true, false])
  })
})
