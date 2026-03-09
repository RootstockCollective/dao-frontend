import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { DepositAmountStep } from './DepositAmountStep'

vi.mock('@/shared/hooks/useIsDesktop', () => ({
  useIsDesktop: () => true,
}))

vi.mock('@/shared/context', () => ({
  usePricesContext: () => ({ prices: {} }),
}))

const TWO_RBTC = 2000000000000000000n

const defaultProps = {
  amount: '',
  setAmount: vi.fn(),
  rbtcBalanceFormatted: '2.0',
  rbtcBalanceRaw: TWO_RBTC,
  estimatedShares: '0',
  depositFee: '0',
  onNext: vi.fn(),
}

describe('DepositAmountStep', () => {
  afterEach(() => {
    cleanup()
    vi.clearAllMocks()
  })

  it('renders amount input and wallet balance', () => {
    render(<DepositAmountStep {...defaultProps} />)

    expect(screen.getByTestId('DepositAmountStep')).toBeInTheDocument()
    expect(screen.getByTestId('Input_amount-btc-vault')).toBeInTheDocument()
    expect(screen.getByTestId('WalletBalanceLabel')).toHaveTextContent('2.0')
  })

  it('renders default percentage buttons (10%, 20%, 50%, Max)', () => {
    render(<DepositAmountStep {...defaultProps} />)

    expect(screen.getByTestId('10Button')).toBeInTheDocument()
    expect(screen.getByTestId('20Button')).toBeInTheDocument()
    expect(screen.getByTestId('50Button')).toBeInTheDocument()
    expect(screen.getByTestId('MaxButton')).toBeInTheDocument()
  })

  it('shows shares estimate and deposit fee metrics', () => {
    render(<DepositAmountStep {...defaultProps} estimatedShares="1000" depositFee="0" />)

    expect(screen.getByTestId('review-shares')).toHaveTextContent('1000')
    expect(screen.getByTestId('review-fee')).toHaveTextContent('0%')
  })

  it('shows the disclaimer text', () => {
    render(<DepositAmountStep {...defaultProps} />)

    expect(screen.getByTestId('ParagraphDisclaimer')).toHaveTextContent('Subject to approval by fund manager')
  })

  it('disables Continue button when amount is empty', () => {
    render(<DepositAmountStep {...defaultProps} />)

    expect(screen.getByTestId('ContinueButton')).toBeDisabled()
  })

  it('disables Continue button when amount is 0', () => {
    render(<DepositAmountStep {...defaultProps} amount="0" />)

    expect(screen.getByTestId('ContinueButton')).toBeDisabled()
  })

  it('enables Continue button when amount is valid', () => {
    render(<DepositAmountStep {...defaultProps} amount="1" />)

    expect(screen.getByTestId('ContinueButton')).not.toBeDisabled()
  })

  it('shows error when amount exceeds balance', () => {
    render(<DepositAmountStep {...defaultProps} amount="3" />)

    expect(screen.getByTestId('ErrorText')).toBeInTheDocument()
    expect(screen.getByTestId('ContinueButton')).toBeDisabled()
  })

  it('calls onNext when Continue is clicked with valid amount', async () => {
    const user = userEvent.setup()
    const onNext = vi.fn()
    render(<DepositAmountStep {...defaultProps} amount="1" onNext={onNext} />)

    await user.click(screen.getByTestId('ContinueButton'))
    expect(onNext).toHaveBeenCalledOnce()
  })

  it('calls setAmount when percentage button is clicked', async () => {
    const user = userEvent.setup()
    const setAmount = vi.fn()
    render(<DepositAmountStep {...defaultProps} setAmount={setAmount} />)

    await user.click(screen.getByTestId('50Button'))
    expect(setAmount).toHaveBeenCalledWith('1')
  })

  it('calls setAmount with balance minus gas reserve when Max is clicked', async () => {
    const user = userEvent.setup()
    const setAmount = vi.fn()
    render(<DepositAmountStep {...defaultProps} setAmount={setAmount} />)

    await user.click(screen.getByTestId('MaxButton'))
    expect(setAmount).toHaveBeenCalledWith('1.999')
  })

  it('calls setAmount with 0 when Max is clicked and balance is less than gas reserve', async () => {
    const user = userEvent.setup()
    const setAmount = vi.fn()
    const tinyBalance = 500_000_000_000_000n
    render(<DepositAmountStep {...defaultProps} rbtcBalanceRaw={tinyBalance} setAmount={setAmount} />)

    await user.click(screen.getByTestId('MaxButton'))
    expect(setAmount).toHaveBeenCalledWith('0')
  })
})
