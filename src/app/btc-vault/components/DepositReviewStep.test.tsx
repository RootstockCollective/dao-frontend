import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { DepositReviewStep } from './DepositReviewStep'

vi.mock('@/shared/context', () => ({
  usePricesContext: () => ({ prices: {} }),
}))

const defaultProps = {
  amount: '1',
  estimatedShares: '980.39',
  pricePerShareFormatted: '1.02',
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

  it('renders instruction text', () => {
    render(<DepositReviewStep {...defaultProps} />)

    expect(
      screen.getByText('Make sure that everything is correct before continuing:'),
    ).toBeInTheDocument()
  })

  it('displays amount with rBTC label', () => {
    render(<DepositReviewStep {...defaultProps} />)

    expect(screen.getByTestId('review-amount')).toHaveTextContent('1')
  })

  it('displays estimated shares', () => {
    render(<DepositReviewStep {...defaultProps} />)

    expect(screen.getByTestId('review-shares')).toHaveTextContent('980.39')
  })

  it('displays deposit fee', () => {
    render(<DepositReviewStep {...defaultProps} />)

    expect(screen.getByTestId('review-fee')).toHaveTextContent('0%')
  })

  it('displays Price Per Share', () => {
    render(<DepositReviewStep {...defaultProps} />)

    expect(screen.getByTestId('review-price-per-share')).toHaveTextContent('1.02')
  })

  it('shows the disclaimer text', () => {
    render(<DepositReviewStep {...defaultProps} />)

    expect(screen.getByTestId('ParagraphDisclaimer')).toHaveTextContent('Subject to approval by fund manager')
  })

  it('renders Send request button', () => {
    render(<DepositReviewStep {...defaultProps} />)

    expect(screen.getByTestId('SubmitRequestButton')).toHaveTextContent('Send request')
  })

  it('shows Submitting... when isSubmitting is true', () => {
    render(<DepositReviewStep {...defaultProps} isSubmitting />)

    expect(screen.getByTestId('SubmitRequestButton')).toHaveTextContent('Submitting...')
    expect(screen.getByTestId('SubmitRequestButton')).toBeDisabled()
  })

  it('calls onSubmit when Send request is clicked', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    render(<DepositReviewStep {...defaultProps} onSubmit={onSubmit} />)

    await user.click(screen.getByTestId('SubmitRequestButton'))
    expect(onSubmit).toHaveBeenCalledOnce()
  })
})
