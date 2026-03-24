import { renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { useFinalizeDeposit } from './useFinalizeDeposit'

const mockWriteContractAsync = vi.fn()
const mockUseAccount = vi.fn()

vi.mock('wagmi', () => ({
  useAccount: () => mockUseAccount(),
  useWriteContract: () => ({
    writeContractAsync: mockWriteContractAsync,
    data: undefined,
    isPending: false,
  }),
}))

vi.mock('@/app/user/Stake/hooks/useTransactionStatus', () => ({
  useTransactionStatus: () => ({
    isTxPending: false,
    isTxFailed: false,
  }),
}))

const CONNECTED_ADDRESS = '0x1234567890abcdef1234567890abcdef12345678'

describe('useFinalizeDeposit', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUseAccount.mockReturnValue({ address: CONNECTED_ADDRESS })
  })

  it('returns the expected interface', () => {
    const { result } = renderHook(() => useFinalizeDeposit())

    expect(result.current).toEqual(
      expect.objectContaining({
        onFinalizeDeposit: expect.any(Function),
        isRequesting: false,
        isTxPending: false,
        isTxFailed: false,
        finalizeTxHash: undefined,
      }),
    )
  })

  it('calls writeContractAsync with claimDeposit() (no args)', async () => {
    const claimableAssets = 2_000_000_000_000_000_000n
    const txHash = '0xfinalizetxhash'
    mockWriteContractAsync.mockResolvedValue(txHash)

    const { result } = renderHook(() => useFinalizeDeposit())
    const hash = await result.current.onFinalizeDeposit(claimableAssets)

    expect(hash).toBe(txHash)
    expect(mockWriteContractAsync).toHaveBeenCalledOnce()

    const callArgs = mockWriteContractAsync.mock.calls[0][0]
    expect(callArgs.functionName).toBe('claimDeposit')
    expect(callArgs.args).toBeUndefined()
  })

  it('rejects when wallet is disconnected', async () => {
    mockUseAccount.mockReturnValue({ address: undefined })

    const { result } = renderHook(() => useFinalizeDeposit())

    await expect(result.current.onFinalizeDeposit(1_000_000_000_000_000_000n)).rejects.toThrow(
      'Wallet not connected',
    )
  })

  it('does not send value (deposit finalizes shares, not native rBTC)', async () => {
    mockWriteContractAsync.mockResolvedValue('0xhash')

    const { result } = renderHook(() => useFinalizeDeposit())
    await result.current.onFinalizeDeposit(1_000_000_000_000_000_000n)

    const callArgs = mockWriteContractAsync.mock.calls[0][0]
    expect(callArgs.value).toBeUndefined()
  })
})
