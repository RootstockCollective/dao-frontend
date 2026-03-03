import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { VaultActionButtons } from './VaultActionButtons'
import type { ActionEligibility } from '../services/ui/types'

vi.mock('@/components/Tooltip', () => ({
  Tooltip: ({ children, text, disabled }: { children: React.ReactNode; text: string; disabled?: boolean }) => (
    <div data-tooltip-text={disabled ? '' : text}>{children}</div>
  ),
}))

const ELIGIBLE: ActionEligibility = {
  canDeposit: true,
  canWithdraw: true,
  depositBlockReason: '',
  withdrawBlockReason: '',
}

describe('VaultActionButtons', () => {
  afterEach(cleanup)

  it('renders both buttons enabled when fully eligible', () => {
    render(<VaultActionButtons eligibility={ELIGIBLE} isConnected />)

    expect(screen.getByTestId('VaultActionButtons')).toBeInTheDocument()
    expect(screen.getByTestId('DepositButton')).not.toBeDisabled()
    expect(screen.getByTestId('WithdrawButton')).not.toBeDisabled()
  })

  it('disables both buttons when not authorized', () => {
    const eligibility: ActionEligibility = {
      canDeposit: false,
      canWithdraw: false,
      depositBlockReason: 'KYC required',
      withdrawBlockReason: '',
    }
    render(<VaultActionButtons eligibility={eligibility} isConnected />)

    expect(screen.getByTestId('DepositButton')).toBeDisabled()
    const depositTooltip = screen.getByTestId('DepositButton').closest('[data-tooltip-text]')
    expect(depositTooltip).toHaveAttribute('data-tooltip-text', 'KYC required')
  })

  it('disables deposit when deposits are paused, withdraw remains enabled', () => {
    const eligibility: ActionEligibility = {
      canDeposit: false,
      canWithdraw: true,
      depositBlockReason: 'Deposits are currently paused',
      withdrawBlockReason: '',
    }
    render(<VaultActionButtons eligibility={eligibility} isConnected />)

    expect(screen.getByTestId('DepositButton')).toBeDisabled()
    expect(screen.getByTestId('WithdrawButton')).not.toBeDisabled()
  })

  it('disables both buttons when user has an active request', () => {
    const eligibility: ActionEligibility = {
      canDeposit: false,
      canWithdraw: false,
      depositBlockReason: 'You already have an active request',
      withdrawBlockReason: 'You already have an active request',
    }
    render(<VaultActionButtons eligibility={eligibility} isConnected />)

    expect(screen.getByTestId('DepositButton')).toBeDisabled()
    expect(screen.getByTestId('WithdrawButton')).toBeDisabled()
    const withdrawTooltip = screen.getByTestId('WithdrawButton').closest('[data-tooltip-text]')
    expect(withdrawTooltip).toHaveAttribute('data-tooltip-text', 'You already have an active request')
  })

  it('returns null when wallet is not connected', () => {
    const { container } = render(<VaultActionButtons eligibility={ELIGIBLE} isConnected={false} />)

    expect(container.innerHTML).toBe('')
    expect(screen.queryByTestId('VaultActionButtons')).not.toBeInTheDocument()
  })
})
