import { act, renderHook, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { BTC_VAULT_BACKEND_INDEX_DELAY_MS } from '../constants'
import { useBtcVaultWithdrawFlow } from './useBtcVaultWithdrawFlow'

const mockExecuteTxFlow = vi.fn()
const mockOnRequestRedeem = vi.fn()
const mockRequestApproveShares = vi.fn()
const mockRefetchAllowance = vi.fn()
const mockInvalidateAfterSubmit = vi.fn()
const mockOnRequestSubmitted = vi.fn()

vi.mock('@/shared/notification', () => ({
  executeTxFlow: (args: unknown) => mockExecuteTxFlow(args),
}))

vi.mock('./useBtcVaultInvalidation', () => ({
  useBtcVaultInvalidation: () => ({
    invalidateAfterSubmit: mockInvalidateAfterSubmit,
    invalidateAfterAction: vi.fn(),
  }),
}))

vi.mock('./useSubmitWithdrawal', () => ({
  useSubmitWithdrawal: () => ({
    onRequestRedeem: mockOnRequestRedeem,
    isRequesting: false,
    isTxPending: false,
  }),
}))

vi.mock('./useBtcVaultSharesAllowance', () => ({
  useBtcVaultSharesAllowance: () => ({
    allowance: undefined,
    refetchAllowance: mockRefetchAllowance,
    isAllowanceReadLoading: false,
    requestApproveShares: mockRequestApproveShares,
    hasAllowanceFor: vi.fn().mockResolvedValue(false),
    isRequesting: false,
    isTxPending: false,
    isTxFailed: false,
    allowanceTxHash: undefined,
  }),
}))

describe('useBtcVaultWithdrawFlow', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockRefetchAllowance.mockResolvedValue({ data: 0n })
    mockExecuteTxFlow.mockResolvedValue(undefined)
    mockOnRequestRedeem.mockResolvedValue('0xabc')
    mockRequestApproveShares.mockResolvedValue('0xdef')
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('closes modal, invalidates, and defers onRequestSubmitted after redeem success', async () => {
    vi.useFakeTimers()
    const { result } = renderHook(() =>
      useBtcVaultWithdrawFlow({ onRequestSubmitted: mockOnRequestSubmitted }),
    )

    act(() => {
      result.current.openWithdrawModal()
    })
    expect(result.current.isWithdrawModalOpen).toBe(true)

    mockExecuteTxFlow.mockImplementationOnce(
      async ({ onSuccess }: { onSuccess?: () => void }) => {
        onSuccess?.()
      },
    )

    await act(async () => {
      await result.current.handleRequestWithdrawRedeem(1n)
    })

    expect(result.current.isWithdrawModalOpen).toBe(false)
    expect(mockInvalidateAfterSubmit).toHaveBeenCalled()
    expect(mockOnRequestSubmitted).not.toHaveBeenCalled()

    await act(async () => {
      await vi.advanceTimersByTimeAsync(BTC_VAULT_BACKEND_INDEX_DELAY_MS)
    })

    expect(mockOnRequestSubmitted).toHaveBeenCalledTimes(1)
  })

  it('awaits refetchAllowance after approve success', async () => {
    const { result } = renderHook(() => useBtcVaultWithdrawFlow({}))

    mockExecuteTxFlow.mockImplementationOnce(
      async ({ onSuccess }: { onSuccess?: () => Promise<void> }) => {
        await onSuccess?.()
      },
    )

    await act(async () => {
      await result.current.handleApproveWithdrawShares(1n)
    })

    await waitFor(() => expect(mockRefetchAllowance).toHaveBeenCalled())
  })
})
