import { renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useCancelBtcVaultRequest } from './useCancelRequest'

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

describe('useCancelRequest', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUseAccount.mockReturnValue({ address: '0xTestAddress' })
  })

  it('returns the expected interface', () => {
    const { result } = renderHook(() => useCancelBtcVaultRequest('deposit'))

    expect(result.current).toEqual(
      expect.objectContaining({
        onCancelRequest: expect.any(Function),
        isRequesting: false,
        isTxPending: false,
        isTxFailed: false,
        cancelTxHash: undefined,
      }),
    )
  })

  it('calls cancelDepositRequestNative for deposit cancellations', async () => {
    const txHash = '0xmockhash'
    mockWriteContractAsync.mockResolvedValue(txHash)

    const { result } = renderHook(() => useCancelBtcVaultRequest('deposit'))
    const hash = await result.current.onCancelRequest()

    expect(hash).toBe(txHash)
    expect(mockWriteContractAsync).toHaveBeenCalledOnce()

    const callArgs = mockWriteContractAsync.mock.calls[0][0]
    expect(callArgs.functionName).toBe('cancelDepositRequestNative')
    expect(callArgs.args).toEqual(['0xTestAddress'])
  })

  it('calls cancelRedeemRequest for withdrawal cancellations', async () => {
    const txHash = '0xmockhash'
    mockWriteContractAsync.mockResolvedValue(txHash)

    const { result } = renderHook(() => useCancelBtcVaultRequest('withdrawal'))
    const hash = await result.current.onCancelRequest()

    expect(hash).toBe(txHash)

    const callArgs = mockWriteContractAsync.mock.calls[0][0]
    expect(callArgs.functionName).toBe('cancelRedeemRequest')
    expect(callArgs.args).toEqual(['0xTestAddress'])
  })

  it('does not pass value (no rBTC sent when cancelling)', async () => {
    mockWriteContractAsync.mockResolvedValue('0xhash')

    const { result } = renderHook(() => useCancelBtcVaultRequest('deposit'))
    await result.current.onCancelRequest()

    const callArgs = mockWriteContractAsync.mock.calls[0][0]
    expect(callArgs.value).toBeUndefined()
  })

  it('rejects when wallet is disconnected', async () => {
    mockUseAccount.mockReturnValue({ address: undefined })
    const { result } = renderHook(() => useCancelBtcVaultRequest('deposit'))
    await expect(result.current.onCancelRequest()).rejects.toThrow('Wallet not connected')
  })
})
