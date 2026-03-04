import { cleanup, render, screen } from '@testing-library/react'
import { TooltipProvider } from '@radix-ui/react-tooltip'
import { afterEach, describe, expect, it, vi } from 'vitest'
import type { ReactNode } from 'react'

import { BtcVaultActions } from './BtcVaultActions'

const mockUseActionEligibility = vi.fn()

vi.mock('../hooks/useActionEligibility', () => ({
  useActionEligibility: (address: string | undefined) => mockUseActionEligibility(address),
}))

function Wrapper({ children }: { children: ReactNode }) {
  return <TooltipProvider>{children}</TooltipProvider>
}

describe('BtcVaultActions', () => {
  afterEach(() => {
    cleanup()
    vi.clearAllMocks()
  })

  it('shows Deposit and Withdraw when fully eligible', () => {
    mockUseActionEligibility.mockReturnValue({
      data: { canDeposit: true, canWithdraw: true, depositBlockReason: '', withdrawBlockReason: '' },
    })
    render(<BtcVaultActions address="0x123" />, { wrapper: Wrapper })

    expect(screen.getByTestId('btc-vault-deposit-button')).toBeInTheDocument()
    expect(screen.getByTestId('btc-vault-deposit-button')).not.toBeDisabled()
    expect(screen.getByTestId('btc-vault-withdraw-button')).toBeInTheDocument()
    expect(screen.getByTestId('btc-vault-withdraw-button')).not.toBeDisabled()
    expect(screen.getByTestId('btc-vault-swap-link')).toBeInTheDocument()
  })

  it('shows disabled Deposit with tooltip when active request blocks it', () => {
    mockUseActionEligibility.mockReturnValue({
      data: {
        canDeposit: false,
        canWithdraw: false,
        depositBlockReason: 'You already have an active request',
        withdrawBlockReason: 'You already have an active request',
      },
    })
    render(<BtcVaultActions address="0x123" />, { wrapper: Wrapper })

    expect(screen.getByTestId('btc-vault-deposit-button')).toBeInTheDocument()
    expect(screen.getByTestId('btc-vault-deposit-button')).toBeDisabled()
    expect(screen.getByTestId('btc-vault-withdraw-button')).toBeInTheDocument()
    expect(screen.getByTestId('btc-vault-withdraw-button')).toBeDisabled()
  })

  it('hides Deposit when deposits are paused', () => {
    mockUseActionEligibility.mockReturnValue({
      data: {
        canDeposit: false,
        canWithdraw: true,
        depositBlockReason: 'Deposits are currently paused',
        withdrawBlockReason: '',
      },
    })
    render(<BtcVaultActions address="0x123" />, { wrapper: Wrapper })

    expect(screen.queryByTestId('btc-vault-deposit-button')).not.toBeInTheDocument()
    expect(screen.getByTestId('btc-vault-withdraw-button')).toBeInTheDocument()
    expect(screen.getByTestId('btc-vault-swap-link')).toBeInTheDocument()
  })

  it('hides Withdraw when withdrawals are paused', () => {
    mockUseActionEligibility.mockReturnValue({
      data: {
        canDeposit: true,
        canWithdraw: false,
        depositBlockReason: '',
        withdrawBlockReason: 'Withdrawals are currently paused',
      },
    })
    render(<BtcVaultActions address="0x123" />, { wrapper: Wrapper })

    expect(screen.getByTestId('btc-vault-deposit-button')).toBeInTheDocument()
    expect(screen.queryByTestId('btc-vault-withdraw-button')).not.toBeInTheDocument()
    expect(screen.getByTestId('btc-vault-swap-link')).toBeInTheDocument()
  })

  it('hides all action buttons when user is not eligible (KYB)', () => {
    mockUseActionEligibility.mockReturnValue({
      data: {
        canDeposit: false,
        canWithdraw: true,
        depositBlockReason: 'KYC required',
        withdrawBlockReason: '',
      },
    })
    const { container } = render(<BtcVaultActions address="0x123" />, { wrapper: Wrapper })
    expect(container.innerHTML).toBe('')
  })

  it('shows swap link when at least one action is visible', () => {
    mockUseActionEligibility.mockReturnValue({
      data: {
        canDeposit: false,
        canWithdraw: true,
        depositBlockReason: 'Deposits are currently paused',
        withdrawBlockReason: '',
      },
    })
    render(<BtcVaultActions address="0x123" />, { wrapper: Wrapper })
    expect(screen.getByTestId('btc-vault-swap-link')).toBeInTheDocument()
  })

  it('hides all actions including swap when both deposits and withdrawals are paused', () => {
    mockUseActionEligibility.mockReturnValue({
      data: {
        canDeposit: false,
        canWithdraw: false,
        depositBlockReason: 'Deposits are currently paused',
        withdrawBlockReason: 'Withdrawals are currently paused',
      },
    })
    render(<BtcVaultActions address="0x123" />, { wrapper: Wrapper })

    expect(screen.queryByTestId('btc-vault-deposit-button')).not.toBeInTheDocument()
    expect(screen.queryByTestId('btc-vault-withdraw-button')).not.toBeInTheDocument()
    expect(screen.queryByTestId('btc-vault-swap-link')).not.toBeInTheDocument()
  })

  it('does not throw when onClick handlers are omitted (no-op)', () => {
    mockUseActionEligibility.mockReturnValue({
      data: { canDeposit: true, canWithdraw: true, depositBlockReason: '', withdrawBlockReason: '' },
    })
    render(<BtcVaultActions address="0x123" />, { wrapper: Wrapper })

    expect(() => screen.getByTestId('btc-vault-deposit-button').click()).not.toThrow()
    expect(() => screen.getByTestId('btc-vault-withdraw-button').click()).not.toThrow()
  })

  it('returns null when data is not yet loaded', () => {
    mockUseActionEligibility.mockReturnValue({ data: undefined })
    const { container } = render(<BtcVaultActions address="0x123" />, { wrapper: Wrapper })
    expect(container.innerHTML).toBe('')
  })
})
