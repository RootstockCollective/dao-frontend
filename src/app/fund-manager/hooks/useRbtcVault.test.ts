import { renderHook } from '@testing-library/react'
import { afterEach, describe, expect, it, vi, type Mock } from 'vitest'
import type { Address } from 'viem'
import { useReadContract } from 'wagmi'

import { useReadRbtcVaultBatch, useReadRbtcVaultForMultipleArgs } from '@/shared/hooks/contracts/btc-vault'

import { useRbtcVault } from './useRbtcVault'

vi.mock('@/shared/hooks/contracts/btc-vault', () => ({
  useReadRbtcVaultBatch: vi.fn(),
  useReadRbtcVaultForMultipleArgs: vi.fn(),
}))

vi.mock('wagmi', () => ({
  useReadContract: vi.fn(),
}))

const mockedBatch = useReadRbtcVaultBatch as Mock
const mockedEpochSnapshots = useReadRbtcVaultForMultipleArgs as Mock
const mockedReadContract = useReadContract as Mock

const ASSET = '0x1234567890123456789012345678901234567890' as Address

describe('useRbtcVault', () => {
  afterEach(() => {
    vi.clearAllMocks()
  })

  it('does not treat a failed reportedOffchainAssets call as 0n when the batch has no top-level error', () => {
    mockedBatch.mockReturnValue({
      data: [ASSET, 1n, undefined, 0n, 0n, 0n, 0n, 0n],
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    } as any)
    mockedEpochSnapshots.mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    } as any)
    mockedReadContract.mockReturnValue({
      data: 0n,
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    } as any)

    const { result } = renderHook(() => useRbtcVault())

    expect(result.current.reportedOffchainAssets).toBeNull()
    expect(result.current.vaultBatchError).toBeNull()
  })

  it('returns bigint when the reportedOffchainAssets batch slot succeeds', () => {
    const reported = 42n
    mockedBatch.mockReturnValue({
      data: [ASSET, 1n, reported, 0n, 0n, 0n, 0n, 0n],
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    } as any)
    mockedEpochSnapshots.mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    } as any)
    mockedReadContract.mockReturnValue({
      data: 0n,
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    } as any)

    const { result } = renderHook(() => useRbtcVault())

    expect(result.current.reportedOffchainAssets).toBe(reported)
  })
})
