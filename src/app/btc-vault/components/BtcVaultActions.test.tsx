import { TooltipProvider } from '@radix-ui/react-tooltip'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { cleanup, render } from '@testing-library/react'
import { type ReactNode } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import type { ActionEligibility } from '../services/ui/types'
import { BtcVaultActions } from './BtcVaultActions'

const mockUseSubmitDeposit = vi.fn()

vi.mock('wagmi', () => ({
  useAccount: () => ({ address: '0x1234567890123456789012345678901234567890' }),
}))

vi.mock('@/shared/notification', () => ({
  executeTxFlow: vi.fn(),
}))

vi.mock('../hooks/useSubmitDeposit', () => ({
  useSubmitDeposit: () => mockUseSubmitDeposit(),
}))

vi.mock('../hooks/useBtcVaultInvalidation', () => ({
  useBtcVaultInvalidation: () => ({
    invalidateAfterSubmit: vi.fn(),
    invalidateAfterAction: vi.fn(),
  }),
}))

const defaultEligibility: ActionEligibility = {
  canDeposit: true,
  canWithdraw: true,
  hasVaultShares: true,
  depositBlockReason: '',
  withdrawBlockReason: '',
}

function defaultWithdrawProps() {
  return {
    isWithdrawModalOpen: false,
    onOpenWithdrawModal: vi.fn(),
    onCloseWithdrawModal: vi.fn(),
    handleApproveWithdrawShares: vi.fn(),
    handleRequestWithdrawRedeem: vi.fn(),
    allowance: undefined as bigint | undefined,
    isAllowanceReadLoading: false,
    hasAllowanceFor: vi.fn().mockResolvedValue(false),
    isApprovingShares: false,
    isWithdrawSubmitting: false,
    isAllowanceTxFailed: false,
    allowanceTxHash: undefined as `0x${string}` | undefined,
  }
}

function renderWithQueryClient(ui: ReactNode) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return render(
    <QueryClientProvider client={client}>
      <TooltipProvider>{ui}</TooltipProvider>
    </QueryClientProvider>,
  )
}

describe('BtcVaultActions', () => {
  beforeEach(() => {
    cleanup()
    vi.clearAllMocks()
    mockUseSubmitDeposit.mockReturnValue({
      onRequestDeposit: vi.fn(),
      isRequesting: false,
      isTxPending: false,
    })
  })

  afterEach(() => {
    cleanup()
  })

  it('disables both buttons while a deposit request transaction is submitting', () => {
    mockUseSubmitDeposit.mockReturnValue({
      onRequestDeposit: vi.fn(),
      isRequesting: true,
      isTxPending: false,
    })

    const { getByTestId } = renderWithQueryClient(
      <BtcVaultActions actionEligibility={defaultEligibility} {...defaultWithdrawProps()} />,
    )

    expect(getByTestId('DepositButton')).toBeDisabled()
    expect(getByTestId('WithdrawButton')).toBeDisabled()
  })

  it('disables both buttons while a withdraw transaction is pending', () => {
    const { getByTestId } = renderWithQueryClient(
      <BtcVaultActions
        actionEligibility={defaultEligibility}
        {...defaultWithdrawProps()}
        isWithdrawSubmitting
      />,
    )

    expect(getByTestId('DepositButton')).toBeDisabled()
    expect(getByTestId('WithdrawButton')).toBeDisabled()
  })

  it('enables deposit and withdraw when eligibility allows and nothing is submitting', () => {
    const { getByTestId } = renderWithQueryClient(
      <BtcVaultActions actionEligibility={defaultEligibility} {...defaultWithdrawProps()} />,
    )

    expect(getByTestId('DepositButton')).not.toBeDisabled()
    expect(getByTestId('WithdrawButton')).not.toBeDisabled()
  })

  it('disables both buttons while vault share allowance is approving', () => {
    const { getByTestId } = renderWithQueryClient(
      <BtcVaultActions
        actionEligibility={defaultEligibility}
        {...defaultWithdrawProps()}
        isApprovingShares
      />,
    )

    expect(getByTestId('DepositButton')).toBeDisabled()
    expect(getByTestId('WithdrawButton')).toBeDisabled()
  })
})
