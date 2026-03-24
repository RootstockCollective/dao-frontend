import { renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useFinalizeWithdrawal } from './useFinalizeWithdrawal'

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

describe('useFinalizeWithdrawal', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUseAccount.mockReturnValue({ address: '0xTestAddress' })
  })

  it('returns the expected interface', () => {
    const { result } = renderHook(() => useFinalizeWithdrawal())

    expect(result.current).toEqual(
      expect.objectContaining({
        onFinalizeWithdrawal: expect.any(Function),
        isRequesting: false,
        isTxPending: false,
        isTxFailed: false,
        finalizeTxHash: undefined,
      }),
    )
  })

  it('calls writeContractAsync with claimRedeemNative (no args)', async () => {
    const claimableShares = 500_000_000_000_000_000n
    const txHash = '0xmockhash'
    mockWriteContractAsync.mockResolvedValue(txHash)

    const { result } = renderHook(() => useFinalizeWithdrawal())
    const hash = await result.current.onFinalizeWithdrawal(claimableShares)

    expect(hash).toBe(txHash)
    expect(mockWriteContractAsync).toHaveBeenCalledOnce()

    const callArgs = mockWriteContractAsync.mock.calls[0][0]
    expect(callArgs.functionName).toBe('claimRedeemNative')
    expect(callArgs.args).toBeUndefined()
  })

  it('does not pass value (no rBTC sent when finalizing withdrawal)', async () => {
    mockWriteContractAsync.mockResolvedValue('0xhash')

    const { result } = renderHook(() => useFinalizeWithdrawal())
    await result.current.onFinalizeWithdrawal(1n)

    const callArgs = mockWriteContractAsync.mock.calls[0][0]
    expect(callArgs.value).toBeUndefined()
  })

  it('rejects when wallet is disconnected', async () => {
    mockUseAccount.mockReturnValue({ address: undefined })
    const { result } = renderHook(() => useFinalizeWithdrawal())
    await expect(result.current.onFinalizeWithdrawal(1_000_000_000_000_000_000n)).rejects.toThrow(
      'Wallet not connected',
    )
  })
})
