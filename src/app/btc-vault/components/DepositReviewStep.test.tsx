import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { DepositReviewStep } from './DepositReviewStep'

const defaultProps = {
  amount: '1.5',
  slippage: '0.5',
  estimatedShares: '1.470588235294117647',
  navFormatted: '1.02',
  navTimestamp: 1709000000,
  depositFee: '0',
  onBack: vi.fn(),
  onSubmit: vi.fn(),
  isSubmitting: false,
}

describe('DepositReviewStep', () => {
  afterEach(() => {
    cleanup()
    vi.clearAllMocks()
  })

  it('renders all review fields', () => {
    render(<DepositReviewStep {...defaultProps} />)

    expect(screen.getByTestId('DepositReviewStep')).toBeInTheDocument()
    expect(screen.getByTestId('review-amount')).toBeInTheDocument()
    expect(screen.getByTestId('review-shares')).toBeInTheDocument()
    expect(screen.getByTestId('review-nav')).toBeInTheDocument()
    expect(screen.getByTestId('review-fee')).toBeInTheDocument()
    expect(screen.getByTestId('review-slippage')).toBeInTheDocument()
  })

  it('displays the correct deposit amount', () => {
    render(<DepositReviewStep {...defaultProps} />)

    const amountRow = screen.getByTestId('review-amount')
    expect(amountRow).toHaveTextContent('Deposit amount')
    expect(amountRow).toHaveTextContent('1.5')
  })

  it('displays estimated vault shares', () => {
    render(<DepositReviewStep {...defaultProps} />)

    const sharesRow = screen.getByTestId('review-shares')
    expect(sharesRow).toHaveTextContent('Estimated vault shares')
    expect(sharesRow).toHaveTextContent('1.470588235294117647')
  })

  it('displays NAV with timestamp', () => {
    render(<DepositReviewStep {...defaultProps} />)

    const navRow = screen.getByTestId('review-nav')
    expect(navRow).toHaveTextContent('Last confirmed NAV')
    expect(navRow).toHaveTextContent('1.02')
    expect(navRow).toHaveTextContent('Updated')
  })

  it('displays deposit fee', () => {
    render(<DepositReviewStep {...defaultProps} />)

    const feeRow = screen.getByTestId('review-fee')
    expect(feeRow).toHaveTextContent('Deposit fee')
    expect(feeRow).toHaveTextContent('0%')
  })

  it('displays slippage tolerance', () => {
    render(<DepositReviewStep {...defaultProps} />)

    const slippageRow = screen.getByTestId('review-slippage')
    expect(slippageRow).toHaveTextContent('Slippage tolerance')
    expect(slippageRow).toHaveTextContent('0.5%')
  })

  it('displays all three disclosures', () => {
    render(<DepositReviewStep {...defaultProps} />)

    const disclosures = screen.getByTestId('review-disclosures')
    expect(disclosures).toHaveTextContent('This is a request and requires approval')
    expect(disclosures).toHaveTextContent('Shares are minted at the NAV confirmed at epoch close')
    expect(disclosures).toHaveTextContent('Once the epoch is closed, deposit requests cannot be canceled')
  })

  it('calls onBack when Back button is clicked', async () => {
    const user = userEvent.setup()
    const onBack = vi.fn()
    render(<DepositReviewStep {...defaultProps} onBack={onBack} />)

    await user.click(screen.getByTestId('BackButton'))
    expect(onBack).toHaveBeenCalledOnce()
  })

  it('calls onSubmit when Submit Request button is clicked', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    render(<DepositReviewStep {...defaultProps} onSubmit={onSubmit} />)

    await user.click(screen.getByTestId('SubmitRequestButton'))
    expect(onSubmit).toHaveBeenCalledOnce()
  })

  it('disables Submit Request button when isSubmitting is true', () => {
    render(<DepositReviewStep {...defaultProps} isSubmitting={true} />)

    expect(screen.getByTestId('SubmitRequestButton')).toBeDisabled()
    expect(screen.getByTestId('SubmitRequestButton')).toHaveTextContent('Submitting...')
  })

  it('disables Back button when isSubmitting is true', () => {
    render(<DepositReviewStep {...defaultProps} isSubmitting={true} />)

    expect(screen.getByTestId('BackButton')).toBeDisabled()
  })
})
