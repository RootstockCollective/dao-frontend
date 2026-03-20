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

vi.mock('@/shared/hooks/useTransactionStatus', () => ({
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
    const txHash = '0xmockhash'
    mockWriteContractAsync.mockResolvedValue(txHash)

    const { result } = renderHook(() => useFinalizeWithdrawal())
    const hash = await result.current.onFinalizeWithdrawal()

    expect(hash).toBe(txHash)
    expect(mockWriteContractAsync).toHaveBeenCalledOnce()

    const callArgs = mockWriteContractAsync.mock.calls[0][0]
    expect(callArgs.functionName).toBe('claimRedeemNative')
    expect(callArgs.args).toBeUndefined()
  })

  it('does not pass value (no rBTC sent when finalizing withdrawal)', async () => {
    mockWriteContractAsync.mockResolvedValue('0xhash')

    const { result } = renderHook(() => useFinalizeWithdrawal())
    await result.current.onFinalizeWithdrawal()

    const callArgs = mockWriteContractAsync.mock.calls[0][0]
    expect(callArgs.value).toBeUndefined()
  })

  it('rejects when wallet is disconnected', async () => {
    mockUseAccount.mockReturnValue({ address: undefined })
    const { result } = renderHook(() => useFinalizeWithdrawal())
    await expect(result.current.onFinalizeWithdrawal()).rejects.toThrow('Wallet not connected')
  })
})
