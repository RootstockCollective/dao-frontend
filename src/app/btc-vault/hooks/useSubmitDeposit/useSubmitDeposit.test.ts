import { renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useSubmitDeposit } from './useSubmitDeposit'

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

describe('useSubmitDeposit', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUseAccount.mockReturnValue({ address: '0xTestAddress' })
  })

  it('returns the expected interface', () => {
    const { result } = renderHook(() => useSubmitDeposit())

    expect(result.current).toEqual(
      expect.objectContaining({
        onRequestDeposit: expect.any(Function),
        isRequesting: false,
        isTxPending: false,
        isTxFailed: false,
        depositTxHash: undefined,
      }),
    )
  })

  it('calls writeContractAsync with correct config when onRequestDeposit is invoked', async () => {
    const amount = 1_000_000_000_000_000_000n
    const txHash = '0xmockhash'
    mockWriteContractAsync.mockResolvedValue(txHash)

    const { result } = renderHook(() => useSubmitDeposit())
    const hash = await result.current.onRequestDeposit(amount)

    expect(hash).toBe(txHash)
    expect(mockWriteContractAsync).toHaveBeenCalledOnce()

    const callArgs = mockWriteContractAsync.mock.calls[0][0]
    expect(callArgs.functionName).toBe('requestDeposit')
    expect(callArgs.value).toBe(amount)
    // args: [amount, receiver, minSharesOut]
    expect(callArgs.args[0]).toBe(amount)
    expect(callArgs.args[1]).toBe('0xTestAddress')
    expect(callArgs.args[2]).toBe(0n)
  })

  it('rejects when wallet is disconnected', async () => {
    mockUseAccount.mockReturnValue({ address: undefined })
    const { result } = renderHook(() => useSubmitDeposit())
    await expect(result.current.onRequestDeposit(1_000_000_000_000_000_000n)).rejects.toThrow(
      'Wallet not connected',
    )
  })
})
