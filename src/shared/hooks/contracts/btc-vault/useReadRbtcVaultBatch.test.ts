import { renderHook } from '@testing-library/react'
import { afterEach, describe, expect, it, Mock, vi } from 'vitest'
import { useReadContracts } from 'wagmi'

import { getAbi } from '@/lib/abis/btc-vault'
import { AVERAGE_BLOCKTIME } from '@/lib/constants'
import { rbtcVault } from '@/lib/contracts'

import { useReadRbtcVaultBatch } from './useReadRbtcVaultBatch'


vi.mock('wagmi', () => ({
  useReadContracts: vi.fn(),
}))

const mockedUseReadContracts = useReadContracts as unknown as Mock

describe('useReadRbtcVaultBatch', () => {
  afterEach(() => {
    mockedUseReadContracts.mockReset()
  })

  it('returns tuple of undefined and single isLoading/error when useReadContracts returns undefined data', () => {
    mockedUseReadContracts.mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
      refetch: vi.fn(),
    })

    const configs = [
      { functionName: 'asset' as const },
      { functionName: 'currentEpoch' as const },
    ] as const
    const { result } = renderHook(() => useReadRbtcVaultBatch(configs))

    expect(result.current.data).toEqual([undefined, undefined])
    expect(result.current.isLoading).toBe(true)
    expect(result.current.error).toBeNull()
  })

  it('calls useReadContracts with contracts built from configs (no args)', () => {
    mockedUseReadContracts.mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    })

    const configs = [
      { functionName: 'asset' as const },
      { functionName: 'currentEpoch' as const },
    ] as const
    renderHook(() => useReadRbtcVaultBatch(configs))

    expect(useReadContracts).toHaveBeenCalledWith(
      expect.objectContaining({
        contracts: [
          { abi: getAbi('RBTCAsyncVaultAbi'), address: rbtcVault.address, functionName: 'asset' },
          {
            abi: getAbi('RBTCAsyncVaultAbi'),
            address: rbtcVault.address,
            functionName: 'currentEpoch',
          },
        ],
        query: expect.objectContaining({
          retry: true,
          refetchInterval: AVERAGE_BLOCKTIME,
        }),
      }),
    )
  })

  it('calls useReadContracts with contracts including args when config has args', () => {
    const address = rbtcVault.address
    mockedUseReadContracts.mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    })

    const configs = [{ functionName: 'balanceOf' as const, args: [address] }] as const
    renderHook(() => useReadRbtcVaultBatch(configs))

    expect(useReadContracts).toHaveBeenCalledWith(
      expect.objectContaining({
        contracts: [
          {
            abi: getAbi('RBTCAsyncVaultAbi'),
            address: rbtcVault.address,
            functionName: 'balanceOf',
            args: [address],
          },
        ],
        query: expect.objectContaining({
          retry: true,
          refetchInterval: AVERAGE_BLOCKTIME,
        }),
      }),
    )
  })

  it('maps useReadContracts results to data tuple in same order as configs', () => {
    const dummyResults = [
      { result: '0xabc', status: 'success' as const },
      { result: 42n, status: 'success' as const },
    ]
    mockedUseReadContracts.mockReturnValue({
      data: dummyResults,
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    })

    const configs = [
      { functionName: 'asset' as const },
      { functionName: 'currentEpoch' as const },
    ] as const
    const { result } = renderHook(() => useReadRbtcVaultBatch(configs))

    expect(result.current.data).toEqual(['0xabc', 42n])
    expect(result.current.isLoading).toBe(false)
    expect(result.current.error).toBeNull()
  })

  it('passes query overrides (e.g. enabled) to useReadContracts', () => {
    mockedUseReadContracts.mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    })

    const configs = [{ functionName: 'asset' as const }] as const
    renderHook(() => useReadRbtcVaultBatch(configs, { enabled: false }))

    expect(useReadContracts).toHaveBeenCalledWith(
      expect.objectContaining({
        query: expect.objectContaining({
          enabled: false,
          retry: true,
          refetchInterval: AVERAGE_BLOCKTIME,
        }),
      }),
    )
  })

  it('returns first call result as undefined when that call fails', () => {
    const err = new Error('RPC error')
    const dummyResults = [
      { result: undefined, error: err, status: 'failure' as const },
      { result: 42n, status: 'success' as const },
    ]
    mockedUseReadContracts.mockReturnValue({
      data: dummyResults,
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    })

    const configs = [
      { functionName: 'asset' as const },
      { functionName: 'currentEpoch' as const },
    ] as const
    const { result } = renderHook(() => useReadRbtcVaultBatch(configs))

    expect(result.current.data).toEqual([undefined, 42n])
  })
})
