import { renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { useSubmitWithdrawal } from './useSubmitWithdrawal'

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

describe('useSubmitWithdrawal', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUseAccount.mockReturnValue({ address: '0xTestAddress' })
  })

  it('returns the expected interface', () => {
    const { result } = renderHook(() => useSubmitWithdrawal())

    expect(result.current).toEqual(
      expect.objectContaining({
        onRequestRedeem: expect.any(Function),
        isRequesting: false,
        isTxPending: false,
        isTxFailed: false,
        withdrawTxHash: undefined,
      }),
    )
  })

  it('calls writeContractAsync with correct config when onRequestRedeem is invoked', async () => {
    const shares = 1_000_000_000_000_000_000n
    const txHash = '0xmockhash'
    mockWriteContractAsync.mockResolvedValue(txHash)

    const { result } = renderHook(() => useSubmitWithdrawal())
    const hash = await result.current.onRequestRedeem(shares)

    expect(hash).toBe(txHash)
    expect(mockWriteContractAsync).toHaveBeenCalledOnce()

    const callArgs = mockWriteContractAsync.mock.calls[0][0]
    expect(callArgs.functionName).toBe('requestRedeem')
    expect(callArgs.value).toBeUndefined()
    expect(callArgs.args[0]).toBe(shares)
    expect(callArgs.args[1]).toBe('0xTestAddress')
    expect(callArgs.args[2]).toBe('0xTestAddress')
  })

  it('rejects when wallet is disconnected', async () => {
    mockUseAccount.mockReturnValue({ address: undefined })
    const { result } = renderHook(() => useSubmitWithdrawal())
    await expect(result.current.onRequestRedeem(1_000_000_000_000_000_000n)).rejects.toThrow(
      'Wallet not connected',
    )
  })
})
