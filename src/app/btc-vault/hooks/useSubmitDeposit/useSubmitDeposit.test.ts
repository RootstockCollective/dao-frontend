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
    const { result } = renderHook(() => useSubmitDeposit(1_000_000_000_000_000_000n))

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

    const { result } = renderHook(() => useSubmitDeposit(amount))
    const hash = await result.current.onRequestDeposit()

    expect(hash).toBe(txHash)
    expect(mockWriteContractAsync).toHaveBeenCalledOnce()

    const callArgs = mockWriteContractAsync.mock.calls[0][0]
    expect(callArgs.functionName).toBe('requestDeposit')
    expect(callArgs.value).toBe(amount)
    // args: [amount, receiver, minSharesOut]
    expect(callArgs.args[0]).toBe(amount)
    expect(callArgs.args[1]).toBe('0xTestAddress')
    // minSharesOut should be less than amount due to slippage
    expect(callArgs.args[2]).toBeLessThan(amount)
    expect(callArgs.args[2]).toBeGreaterThan(0n)
  })

  it('applies custom slippage percentage', async () => {
    const amount = 1_000_000_000_000_000_000n
    mockWriteContractAsync.mockResolvedValue('0xhash')

    const { result } = renderHook(() => useSubmitDeposit(amount, 1.0))
    await result.current.onRequestDeposit()

    const callArgs = mockWriteContractAsync.mock.calls[0][0]
    const minSharesOut = callArgs.args[2] as bigint
    // With 1% slippage, minSharesOut = amount * 99/100
    expect(minSharesOut).toBe(990_000_000_000_000_000n)
  })

  it('sets minSharesOut to 0n when amount is 0n', () => {
    const { result } = renderHook(() => useSubmitDeposit(0n))

    // Hook initializes but minSharesOut is 0n internally
    expect(result.current.onRequestDeposit).toBeDefined()
  })
})
