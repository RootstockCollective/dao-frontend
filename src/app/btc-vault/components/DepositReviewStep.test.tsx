import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest'
import { DepositReviewStep } from './DepositReviewStep'
import { DEPOSIT_EXPECTED_COMPLETION } from '../services/constants'

vi.mock('@/shared/context', () => ({
  usePricesContext: () => ({ prices: {} }),
}))

beforeAll(() => {
  global.ResizeObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  }))
})

const defaultProps = {
  amount: '1',
  estimatedShares: '980.39',
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

  it('displays estimated shares as whole number with comma formatting', () => {
    render(<DepositReviewStep {...defaultProps} />)

    expect(screen.getByTestId('review-shares')).toHaveTextContent('980')
  })

  it('formats large share count with thousands separator', () => {
    render(<DepositReviewStep {...defaultProps} estimatedShares="2000.5" />)

    expect(screen.getByTestId('review-shares')).toHaveTextContent('2,000.5')
  })

  it('displays deposit fee', () => {
    render(<DepositReviewStep {...defaultProps} />)

    expect(screen.getByTestId('review-fee')).toHaveTextContent('0%')
  })

  it('displays Expected completion with constant value', () => {
    render(<DepositReviewStep {...defaultProps} />)

    expect(screen.getByTestId('review-expected-completion')).toHaveTextContent(DEPOSIT_EXPECTED_COMPLETION)
  })

  it('shows the disclaimer text', () => {
    render(<DepositReviewStep {...defaultProps} />)

    expect(screen.getByTestId('ParagraphDisclaimer')).toHaveTextContent('Subject to approval by fund manager')
  })

  it('renders Back button', () => {
    render(<DepositReviewStep {...defaultProps} />)

    expect(screen.getByTestId('BackButton')).toHaveTextContent('Back')
  })

  it('calls onBack when Back is clicked', async () => {
    const user = userEvent.setup()
    const onBack = vi.fn()
    render(<DepositReviewStep {...defaultProps} onBack={onBack} />)

    await user.click(screen.getByTestId('BackButton'))
    expect(onBack).toHaveBeenCalledOnce()
  })

  it('renders Send request button', () => {
    render(<DepositReviewStep {...defaultProps} />)

    expect(screen.getByTestId('SubmitRequestButton')).toHaveTextContent('Send request')
  })

  it('shows In progress button when isSubmitting is true', () => {
    render(<DepositReviewStep {...defaultProps} isSubmitting />)

    expect(screen.getByText('In progress')).toBeInTheDocument()
    expect(screen.queryByTestId('SubmitRequestButton')).not.toBeInTheDocument()
    expect(screen.getByTestId('BackButton')).toBeInTheDocument()
  })

  it('calls onSubmit when Send request is clicked', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    render(<DepositReviewStep {...defaultProps} onSubmit={onSubmit} />)

    await user.click(screen.getByTestId('SubmitRequestButton'))
    expect(onSubmit).toHaveBeenCalledOnce()
  })
})
