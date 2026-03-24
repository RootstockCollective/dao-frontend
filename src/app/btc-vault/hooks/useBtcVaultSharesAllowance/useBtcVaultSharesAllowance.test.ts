import { renderHook, waitFor } from '@testing-library/react'
import { describe, expect, it, vi, beforeEach } from 'vitest'

import { rbtcVault } from '@/lib/contracts'

import { useBtcVaultSharesAllowance } from './useBtcVaultSharesAllowance'

const SHARE_TOKEN = '0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb' as `0x${string}`

const mockRefetch = vi.fn()
const mockWriteContractAsync = vi.fn()

vi.mock('wagmi', () => ({
  useAccount: () => ({ address: '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa' }),
  useReadContract: vi.fn((config: { functionName?: string }) => {
    if (config.functionName === 'share') {
      return {
        data: SHARE_TOKEN,
        isLoading: false,
        isFetching: false,
        refetch: vi.fn(),
      }
    }
    return {
      data: 5_000_000_000_000_000_000n,
      refetch: mockRefetch,
      isLoading: false,
      isFetching: false,
    }
  }),
  useWriteContract: () => ({
    writeContractAsync: mockWriteContractAsync,
    data: undefined,
    isPending: false,
  }),
}))

vi.mock('@/app/user/Stake/hooks/useTransactionStatus', () => ({
  useTransactionStatus: () => ({ isTxPending: false, isTxFailed: false }),
}))

describe('useBtcVaultSharesAllowance', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockRefetch.mockResolvedValue({ data: 5_000_000_000_000_000_000n, status: 'success' })
    mockWriteContractAsync.mockResolvedValue('0xabc' as `0x${string}`)
  })

  it('hasAllowanceFor returns true when refetched allowance >= shares', async () => {
    const { result } = renderHook(() => useBtcVaultSharesAllowance())
    await expect(result.current.hasAllowanceFor(1n)).resolves.toBe(true)
    expect(mockRefetch).toHaveBeenCalled()
  })

  it('hasAllowanceFor returns false for zero shares', async () => {
    const { result } = renderHook(() => useBtcVaultSharesAllowance())
    await expect(result.current.hasAllowanceFor(0n)).resolves.toBe(false)
    expect(mockRefetch).not.toHaveBeenCalled()
  })

  it('hasAllowanceFor returns false when refetched allowance is below shares', async () => {
    mockRefetch.mockResolvedValueOnce({ data: 100n, status: 'success' })
    const { result } = renderHook(() => useBtcVaultSharesAllowance())
    await expect(result.current.hasAllowanceFor(200n)).resolves.toBe(false)
  })

  it('requestApproveShares approves vault as spender on the share token', async () => {
    const { result } = renderHook(() => useBtcVaultSharesAllowance())
    const shares = 2_000_000_000_000_000_000n
    await result.current.requestApproveShares(shares)

    await waitFor(() => {
      expect(mockWriteContractAsync).toHaveBeenCalledWith(
        expect.objectContaining({
          address: SHARE_TOKEN,
          functionName: 'approve',
          args: [rbtcVault.address, shares],
        }),
      )
    })
  })
})
