import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { WithdrawReviewStep } from './WithdrawReviewStep'

vi.mock('@/shared/context', () => ({
  usePricesContext: () => ({ prices: {} }),
}))

const defaultProps = {
  amount: '2',
  rbtcEquivalent: '2.04',
  withdrawalFee: '0',
  onSubmit: vi.fn(),
  isSubmitting: false,
}

describe('WithdrawReviewStep', () => {
  afterEach(() => {
    cleanup()
    vi.clearAllMocks()
  })

  it('renders instruction text', () => {
    render(<WithdrawReviewStep {...defaultProps} />)

    expect(screen.getByText('Make sure that everything is correct before continuing:')).toBeInTheDocument()
  })

  it('renders all review metrics with correct values', () => {
    render(<WithdrawReviewStep {...defaultProps} />)

    expect(screen.getByTestId('WithdrawReviewStep')).toBeInTheDocument()
    expect(screen.getByTestId('review-shares')).toHaveTextContent('2')
    expect(screen.getByTestId('review-redemption-value')).toHaveTextContent('2.04')
    expect(screen.getByTestId('review-fee')).toHaveTextContent('0%')
    expect(screen.getByTestId('review-expected-completion')).toHaveTextContent('5 days')
  })

  it('renders Send request button', () => {
    render(<WithdrawReviewStep {...defaultProps} />)

    expect(screen.getByTestId('SubmitRequestButton')).toHaveTextContent('Send request')
  })

  it('calls onSubmit when Send request button is clicked', async () => {
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

  it('disables button when isSubmitting is true', () => {
    render(<WithdrawReviewStep {...defaultProps} isSubmitting />)

    expect(screen.getByTestId('SubmitRequestButton')).toBeDisabled()
  })

  it('shows the disclaimer text', () => {
    render(<WithdrawReviewStep {...defaultProps} />)

    expect(screen.getByTestId('ParagraphDisclaimer')).toHaveTextContent(
      'Subject to approval by fund manager',
    )
  })

  it('does not render a Back button', () => {
    render(<WithdrawReviewStep {...defaultProps} />)

    expect(screen.queryByTestId('BackButton')).not.toBeInTheDocument()
  })
})
