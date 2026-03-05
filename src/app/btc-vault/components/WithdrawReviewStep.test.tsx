import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { WithdrawReviewStep } from './WithdrawReviewStep'

const defaultProps = {
  amount: '2',
  rbtcEquivalent: '2.04',
  slippage: '0.5',
  navFormatted: '1.02',
  navTimestamp: 1709000000,
  withdrawalFee: '0',
  onBack: vi.fn(),
  onSubmit: vi.fn(),
  isSubmitting: false,
}

describe('WithdrawReviewStep', () => {
  afterEach(() => {
    cleanup()
    vi.clearAllMocks()
  })

  it('renders all review rows with correct values', () => {
    render(<WithdrawReviewStep {...defaultProps} />)

    expect(screen.getByTestId('WithdrawReviewStep')).toBeInTheDocument()
    expect(screen.getByTestId('review-amount')).toHaveTextContent('2 Vault Tokens')
    expect(screen.getByTestId('review-rbtc')).toHaveTextContent('2.04')
    expect(screen.getByTestId('review-nav')).toHaveTextContent('1.02')
    expect(screen.getByTestId('review-fee')).toHaveTextContent('0%')
    expect(screen.getByTestId('review-slippage')).toHaveTextContent('0.5%')
  })

  it('shows NAV timestamp as sub-value', () => {
    render(<WithdrawReviewStep {...defaultProps} />)

    expect(screen.getByTestId('review-nav')).toHaveTextContent('Updated')
  })

  it('displays all four disclosures', () => {
    render(<WithdrawReviewStep {...defaultProps} />)

    const disclosures = screen.getByTestId('review-disclosures')
    expect(disclosures).toHaveTextContent('This is a request and does not transfer assets immediately')
    expect(disclosures).toHaveTextContent(
      'Redemption value is calculated at the NAV confirmed at epoch close',
    )
    expect(disclosures).toHaveTextContent(
      'Withdrawal is a two-step process: request now, claim after epoch settles',
    )
    expect(disclosures).toHaveTextContent(
      'Once the epoch is closed, withdrawal requests cannot be canceled',
    )
  })

  it('calls onBack when Back button is clicked', async () => {
    const user = userEvent.setup()
    const onBack = vi.fn()
    render(<WithdrawReviewStep {...defaultProps} onBack={onBack} />)

    await user.click(screen.getByTestId('BackButton'))
    expect(onBack).toHaveBeenCalledOnce()
  })

  it('calls onSubmit when Submit Request button is clicked', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    render(<WithdrawReviewStep {...defaultProps} onSubmit={onSubmit} />)

    await user.click(screen.getByTestId('SubmitRequestButton'))
    expect(onSubmit).toHaveBeenCalledOnce()
  })

  it('shows "Submitting..." text when isSubmitting is true', () => {
    render(<WithdrawReviewStep {...defaultProps} isSubmitting />)

    expect(screen.getByTestId('SubmitRequestButton')).toHaveTextContent('Submitting...')
  })

  it('disables both buttons when isSubmitting is true', () => {
    render(<WithdrawReviewStep {...defaultProps} isSubmitting />)

    expect(screen.getByTestId('BackButton')).toBeDisabled()
    expect(screen.getByTestId('SubmitRequestButton')).toBeDisabled()
  })
})
