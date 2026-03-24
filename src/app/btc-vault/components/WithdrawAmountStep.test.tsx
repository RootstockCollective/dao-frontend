import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { RBTC } from '@/lib/constants'

import { WithdrawAmountStep } from './WithdrawAmountStep'

vi.mock('@/shared/hooks/useIsDesktop', () => ({
  useIsDesktop: () => true,
}))

vi.mock('@/shared/context', () => ({
  usePricesContext: () => ({ prices: {} }),
}))

const defaultProps = {
  amount: '',
  setAmount: vi.fn(),
  vaultTokensFormatted: '5.0',
  vaultTokensRaw: 5_000_000_000_000_000_000n,
  rbtcEquivalent: '0',
  withdrawalFee: '0',
  onNext: vi.fn(),
}

describe('WithdrawAmountStep', () => {
  afterEach(() => {
    cleanup()
    vi.clearAllMocks()
  })

  it('renders with correct input label', () => {
    render(<WithdrawAmountStep {...defaultProps} />)

    expect(screen.getByTestId('WithdrawAmountStep')).toBeInTheDocument()
    expect(screen.getByText('No. of shares to withdraw')).toBeInTheDocument()
  })

  it('shows shares balance', () => {
    render(<WithdrawAmountStep {...defaultProps} />)

    expect(screen.getByTestId('SharesBalanceLabel')).toHaveTextContent('Shares balance: 5.0')
  })

  it('shows rBTC equivalent in metrics when amount is set', () => {
    render(<WithdrawAmountStep {...defaultProps} amount="2" rbtcEquivalent="2.04" />)

    expect(screen.getByTestId('review-redemption-value')).toHaveTextContent(`2.04${RBTC}`)
  })

  it('shows error when amount exceeds balance', () => {
    render(<WithdrawAmountStep {...defaultProps} amount="10" />)

    expect(screen.getByTestId('ErrorText')).toHaveTextContent(
      'This is more than your available shares balance',
    )
  })

  it('disables Continue when amount is empty', () => {
    render(<WithdrawAmountStep {...defaultProps} amount="" />)

    expect(screen.getByTestId('ContinueButton')).toBeDisabled()
  })

  it('enables Continue when amount is valid', () => {
    render(<WithdrawAmountStep {...defaultProps} amount="2" />)

    expect(screen.getByTestId('ContinueButton')).not.toBeDisabled()
  })

  it('calls onNext when Continue is clicked with valid amount', async () => {
    const user = userEvent.setup()
    const onNext = vi.fn()
    render(<WithdrawAmountStep {...defaultProps} amount="2" onNext={onNext} />)

    await user.click(screen.getByTestId('ContinueButton'))
    expect(onNext).toHaveBeenCalledOnce()
  })

  it('renders default percentage buttons (10%, 20%, 50%, Max)', () => {
    render(<WithdrawAmountStep {...defaultProps} />)

    expect(screen.getByTestId('PercentageButtons')).toBeInTheDocument()
  })

  it('calls setAmount with correct value when percentage button is clicked', async () => {
    const user = userEvent.setup()
    const setAmount = vi.fn()
    render(<WithdrawAmountStep {...defaultProps} setAmount={setAmount} />)

    await user.click(screen.getByTestId('50Button'))
    expect(setAmount).toHaveBeenCalledWith('2.5')
  })

  it('shows the disclaimer text', () => {
    render(<WithdrawAmountStep {...defaultProps} />)

    expect(screen.getByTestId('ParagraphDisclaimer')).toHaveTextContent(
      'Subject to approval by fund manager',
    )
  })

  it('shows redemption fee metric', () => {
    render(<WithdrawAmountStep {...defaultProps} amount="2" rbtcEquivalent="2.04" />)

    expect(screen.getByTestId('review-fee')).toHaveTextContent('0%')
  })
})
