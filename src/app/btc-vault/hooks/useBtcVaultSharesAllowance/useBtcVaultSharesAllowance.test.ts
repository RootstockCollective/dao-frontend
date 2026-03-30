import { renderHook, waitFor } from '@testing-library/react'
import { describe, expect, it, vi, beforeEach } from 'vitest'

import { rbtcVault } from '@/lib/contracts'
import { VAULT_SHARE_MULTIPLIER, WeiPerEther } from '@/lib/constants'

import { useBtcVaultSharesAllowance } from './useBtcVaultSharesAllowance'

const FIVE_SHARES_RAW = 5n * WeiPerEther * VAULT_SHARE_MULTIPLIER
const TWO_SHARES_RAW = 2n * WeiPerEther * VAULT_SHARE_MULTIPLIER

const mockRefetch = vi.fn()
const mockWriteContractAsync = vi.fn()

vi.mock('wagmi', () => ({
  useAccount: () => ({ address: '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa' }),
  useReadContract: () => ({
    data: 5_000_000_000_000_000_000_000_000n,
    refetch: mockRefetch,
    isLoading: false,
    isFetching: false,
  }),
  useWriteContract: () => ({
    writeContractAsync: mockWriteContractAsync,
    data: undefined,
    isPending: false,
  }),
}))

vi.mock('@/shared/hooks/useTransactionStatus', () => ({
  useTransactionStatus: () => ({ isTxPending: false, isTxFailed: false }),
}))

describe('useBtcVaultSharesAllowance', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockRefetch.mockResolvedValue({ data: FIVE_SHARES_RAW, status: 'success' })
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

  it('requestApproveShares uses vault as ERC-20 token and spender', async () => {
    const { result } = renderHook(() => useBtcVaultSharesAllowance())
    const shares = TWO_SHARES_RAW
    await result.current.requestApproveShares(shares)

    await waitFor(() => {
      expect(mockWriteContractAsync).toHaveBeenCalledWith(
        expect.objectContaining({
          address: rbtcVault.address,
          functionName: 'approve',
          args: [rbtcVault.address, shares],
        }),
      )
    })
  })
})
