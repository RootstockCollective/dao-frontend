import { TooltipProvider } from '@radix-ui/react-tooltip'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { cleanup, render } from '@testing-library/react'
import { type ReactNode } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { BtcVaultActions } from './BtcVaultActions'

const mockUseActionEligibility = vi.fn()
const mockUseSubmitDeposit = vi.fn()
const mockUseSubmitWithdrawal = vi.fn()

vi.mock('wagmi', () => ({
  useAccount: () => ({ address: '0x1234567890123456789012345678901234567890' }),
}))

vi.mock('@/shared/notification', () => ({
  executeTxFlow: vi.fn(),
}))

vi.mock('../hooks/useActionEligibility', () => ({
  useActionEligibility: (...args: unknown[]) => mockUseActionEligibility(...args),
}))

vi.mock('../hooks/useSubmitDeposit', () => ({
  useSubmitDeposit: () => mockUseSubmitDeposit(),
}))

vi.mock('../hooks/useSubmitWithdrawal', () => ({
  useSubmitWithdrawal: () => mockUseSubmitWithdrawal(),
}))

function renderWithQueryClient(ui: ReactNode) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return render(
    <QueryClientProvider client={client}>
      {/* Radix Tooltip requires a provider when tooltips are active (non-empty reason + not short-circuited). */}
      <TooltipProvider>{ui}</TooltipProvider>
    </QueryClientProvider>,
  )
}

describe('BtcVaultActions', () => {
  beforeEach(() => {
    cleanup()
    vi.clearAllMocks()
    mockUseActionEligibility.mockReturnValue({
      data: {
        canDeposit: true,
        canWithdraw: true,
        depositBlockReason: '',
        withdrawBlockReason: '',
      },
    })
    mockUseSubmitDeposit.mockReturnValue({
      onRequestDeposit: vi.fn(),
      isRequesting: false,
      isTxPending: false,
    })
    mockUseSubmitWithdrawal.mockReturnValue({
      onRequestRedeem: vi.fn(),
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

    const { getByTestId } = renderWithQueryClient(<BtcVaultActions />)

    expect(getByTestId('DepositButton')).toBeDisabled()
    expect(getByTestId('WithdrawButton')).toBeDisabled()
  })

  it('disables both buttons while a withdraw transaction is pending', () => {
    mockUseSubmitWithdrawal.mockReturnValue({
      onRequestRedeem: vi.fn(),
      isRequesting: false,
      isTxPending: true,
    })

    const { getByTestId } = renderWithQueryClient(<BtcVaultActions />)

    expect(getByTestId('DepositButton')).toBeDisabled()
    expect(getByTestId('WithdrawButton')).toBeDisabled()
  })

  it('enables deposit and withdraw when eligibility allows and nothing is submitting', () => {
    const { getByTestId } = renderWithQueryClient(<BtcVaultActions />)

    expect(getByTestId('DepositButton')).not.toBeDisabled()
    expect(getByTestId('WithdrawButton')).not.toBeDisabled()
  })
})
