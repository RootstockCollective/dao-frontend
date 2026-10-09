// @vitest-environment jsdom
import { cleanup, renderHook } from '@testing-library/react'
import { parseUnits } from 'viem'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { RIF, RIF_ADDRESS } from '@/lib/constants'

import { useTokenAllowance } from './hooks'
import { useSwapStore } from './useSwapStore'

const { PERMIT2, mockWriteContractAsync } = vi.hoisted(() => ({
  PERMIT2: '0x000000000022D473030F116dDEE9F6B43aC78BA3',
  mockWriteContractAsync: vi.fn(),
}))

vi.mock('@/lib/constants', async importOriginal => ({
  ...(await importOriginal<typeof import('@/lib/constants')>()),
  PERMIT2_ADDRESS: PERMIT2,
}))

vi.mock('wagmi', async importOriginal => ({
  ...(await importOriginal<typeof import('wagmi')>()),
  useAccount: () => ({ address: '0x00000000000000000000000000000000000000aa' }),
  useReadContract: () => ({ data: 0n, isLoading: false, isFetching: false, refetch: vi.fn() }),
  useWriteContract: () => ({ writeContractAsync: mockWriteContractAsync, isPending: false }),
  useSignTypedData: () => ({ signTypedDataAsync: vi.fn(), isPending: false }),
}))

describe('useTokenAllowance.approve', () => {
  beforeEach(() => {
    useSwapStore.getState().reset()
    mockWriteContractAsync.mockReset()
    mockWriteContractAsync.mockResolvedValue('0xabc')
  })

  afterEach(() => {
    cleanup()
  })

  it('approves Permit2 for the requested amount only', async () => {
    useSwapStore.setState({ tokenIn: RIF })
    const amount = parseUnits('12.5', 18)
    const { result } = renderHook(() => useTokenAllowance())

    await result.current.approve(amount)

    expect(mockWriteContractAsync).toHaveBeenCalledTimes(1)
    expect(mockWriteContractAsync).toHaveBeenCalledWith(
      expect.objectContaining({
        address: RIF_ADDRESS,
        functionName: 'approve',
        args: [PERMIT2, amount],
      }),
    )
  })

  it('does not send an approval for a zero amount', async () => {
    const { result } = renderHook(() => useTokenAllowance())

    await expect(result.current.approve(0n)).rejects.toThrow('Enter an amount to swap')
    expect(mockWriteContractAsync).not.toHaveBeenCalled()
  })
})
