import { TooltipProvider } from '@radix-ui/react-tooltip'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { type ReactNode } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { ACTIVE_REQUEST_REASON, REQUEST_SUBMITTING_REASON } from '../services/constants'
import { BtcVaultRedeemSharesButton } from './BtcVaultRedeemSharesButton'

const mockUseAccount = vi.fn()

vi.mock('wagmi', () => ({
  useAccount: () => mockUseAccount(),
}))

function Wrapper({ children }: { children: ReactNode }) {
  return <TooltipProvider>{children}</TooltipProvider>
}

describe('BtcVaultRedeemSharesButton', () => {
  const onOpenWithdrawModal = vi.fn()

  beforeEach(() => {
    mockUseAccount.mockReturnValue({ address: '0x1234567890123456789012345678901234567890' })
    onOpenWithdrawModal.mockClear()
  })

  afterEach(() => {
    cleanup()
    vi.clearAllMocks()
  })

  it('renders nothing without wallet address', () => {
    mockUseAccount.mockReturnValue({ address: undefined })
    const { container } = render(
      <BtcVaultRedeemSharesButton
        hasVaultShares
        canWithdraw
        withdrawBlockReason=""
        isActionEligibilityLoading={false}
        isAnyVaultActionSubmitting={false}
        onOpenWithdrawModal={onOpenWithdrawModal}
      />,
    )
    expect(container.firstChild).toBeNull()
  })

  it('renders nothing while action eligibility is loading', () => {
    const { container } = render(
      <BtcVaultRedeemSharesButton
        hasVaultShares={false}
        canWithdraw={false}
        withdrawBlockReason=""
        isActionEligibilityLoading
        isAnyVaultActionSubmitting={false}
        onOpenWithdrawModal={onOpenWithdrawModal}
      />,
    )
    expect(container.firstChild).toBeNull()
  })

  it('hides when user has no vault shares (eligibility resolved)', () => {
    const { container } = render(
      <BtcVaultRedeemSharesButton
        hasVaultShares={false}
        canWithdraw={false}
        withdrawBlockReason=""
        isActionEligibilityLoading={false}
        isAnyVaultActionSubmitting={false}
        onOpenWithdrawModal={onOpenWithdrawModal}
      />,
    )
    expect(container.firstChild).toBeNull()
  })

  it('shows disabled button with block reason when has shares but cannot withdraw', () => {
    render(
      <BtcVaultRedeemSharesButton
        hasVaultShares
        canWithdraw={false}
        withdrawBlockReason={ACTIVE_REQUEST_REASON}
        isActionEligibilityLoading={false}
        isAnyVaultActionSubmitting={false}
        onOpenWithdrawModal={onOpenWithdrawModal}
      />,
      { wrapper: Wrapper },
    )
    const btn = screen.getByTestId('btc-vault-redeem-shares-button')
    expect(btn).toBeDisabled()
    expect(btn).toHaveTextContent('Redeem Shares')
  })

  it('disables while any vault action is submitting', () => {
    render(
      <BtcVaultRedeemSharesButton
        hasVaultShares
        canWithdraw={false}
        withdrawBlockReason={ACTIVE_REQUEST_REASON}
        isActionEligibilityLoading={false}
        isAnyVaultActionSubmitting
        onOpenWithdrawModal={onOpenWithdrawModal}
      />,
      { wrapper: Wrapper },
    )
    const btn = screen.getByTestId('btc-vault-redeem-shares-button')
    expect(btn).toBeDisabled()
    expect(REQUEST_SUBMITTING_REASON).toBeDefined()
  })

  it('opens withdraw modal when allowed and clicked', () => {
    render(
      <BtcVaultRedeemSharesButton
        hasVaultShares
        canWithdraw
        withdrawBlockReason=""
        isActionEligibilityLoading={false}
        isAnyVaultActionSubmitting={false}
        onOpenWithdrawModal={onOpenWithdrawModal}
      />,
    )
    fireEvent.click(screen.getByTestId('btc-vault-redeem-shares-button'))
    expect(onOpenWithdrawModal).toHaveBeenCalledTimes(1)
  })
})
