import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { DepositAmountStep } from './DepositAmountStep'

vi.mock('@/shared/hooks/useIsDesktop', () => ({
  useIsDesktop: () => true,
}))

const TWO_RBTC = 2000000000000000000n

const defaultProps = {
  amount: '',
  setAmount: vi.fn(),
  rbtcBalanceFormatted: '2.0',
  rbtcBalanceRaw: TWO_RBTC,
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

  it('renders percentage buttons with 25%, 50%, 75%, Max options', () => {
    render(<DepositAmountStep {...defaultProps} />)

    expect(screen.getByTestId('25Button')).toBeInTheDocument()
    expect(screen.getByTestId('50Button')).toBeInTheDocument()
    expect(screen.getByTestId('75Button')).toBeInTheDocument()
    expect(screen.getByTestId('MaxButton')).toBeInTheDocument()
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

  it('does not call onNext when Continue is clicked with invalid amount', async () => {
    const user = userEvent.setup()
    const onNext = vi.fn()
    render(<DepositAmountStep {...defaultProps} amount="" onNext={onNext} />)

    await user.click(screen.getByTestId('ContinueButton'))
    expect(onNext).not.toHaveBeenCalled()
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
    // 2.0 rBTC - 0.001 rBTC gas reserve = 1.999 rBTC
    expect(setAmount).toHaveBeenCalledWith('1.999')
  })

  it('calls setAmount with 0 when Max is clicked and balance is less than gas reserve', async () => {
    const user = userEvent.setup()
    const setAmount = vi.fn()
    const tinyBalance = 500_000_000_000_000n // 0.0005 rBTC < gas reserve
    render(<DepositAmountStep {...defaultProps} rbtcBalanceRaw={tinyBalance} setAmount={setAmount} />)

    await user.click(screen.getByTestId('MaxButton'))
    expect(setAmount).toHaveBeenCalledWith('0')
  })
})
