import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { RBTC } from '@/lib/constants'
import { WithdrawAmountStep, WithdrawType } from './WithdrawAmountStep'

vi.mock('@/shared/hooks/useIsDesktop', () => ({
  useIsDesktop: () => true,
}))

const defaultProps = {
  amount: '',
  setAmount: vi.fn(),
  slippage: '0.5',
  setSlippage: vi.fn(),
  withdrawType: 'partial' as WithdrawType,
  setWithdrawType: vi.fn(),
  vaultTokensFormatted: '5.0',
  vaultTokensRaw: 5_000_000_000_000_000_000n,
  rbtcEquivalent: '0',
  onNext: vi.fn(),
}

describe('WithdrawAmountStep', () => {
  afterEach(() => {
    cleanup()
    vi.clearAllMocks()
  })

  it('renders with Partial selected by default', () => {
    render(<WithdrawAmountStep {...defaultProps} />)

    expect(screen.getByTestId('WithdrawAmountStep')).toBeInTheDocument()
    expect(screen.getByTestId('PartialButton')).toBeInTheDocument()
    expect(screen.getByTestId('FullButton')).toBeInTheDocument()
    expect(screen.getByText('Amount to withdraw')).toBeInTheDocument()
  })

  it('calls setWithdrawType and setAmount when Full is clicked', async () => {
    const user = userEvent.setup()
    const setWithdrawType = vi.fn()
    const setAmount = vi.fn()
    render(
      <WithdrawAmountStep {...defaultProps} setWithdrawType={setWithdrawType} setAmount={setAmount} />,
    )

    await user.click(screen.getByTestId('FullButton'))
    expect(setWithdrawType).toHaveBeenCalledWith('full')
    expect(setAmount).toHaveBeenCalledWith('5')
  })

  it('makes input readonly when withdrawType is full', () => {
    render(<WithdrawAmountStep {...defaultProps} withdrawType="full" amount="5" />)

    const input = screen.getByTestId('Input_amount-btc-vault-withdraw')
    expect(input).toHaveAttribute('readonly')
  })

  it('shows vault token balance', () => {
    render(<WithdrawAmountStep {...defaultProps} />)

    expect(screen.getByTestId('VaultBalanceLabel')).toHaveTextContent('5.0 Vault Tokens')
  })

  it('shows rBTC equivalent when amount is set', () => {
    render(<WithdrawAmountStep {...defaultProps} amount="2" rbtcEquivalent="2.04" />)

    expect(screen.getByTestId('RbtcEquivalent')).toHaveTextContent(`≈ 2.04 ${RBTC}`)
  })

  it('does not show rBTC equivalent when amount is empty', () => {
    render(<WithdrawAmountStep {...defaultProps} amount="" />)

    expect(screen.queryByTestId('RbtcEquivalent')).not.toBeInTheDocument()
  })

  it('shows error when amount exceeds balance', () => {
    render(<WithdrawAmountStep {...defaultProps} amount="10" />)

    expect(screen.getByTestId('ErrorText')).toHaveTextContent(
      'This is more than your available vault token balance',
    )
  })

  it('disables Continue when amount is empty', () => {
    render(<WithdrawAmountStep {...defaultProps} amount="" />)

    expect(screen.getByTestId('ContinueButton')).toBeDisabled()
  })

  it('disables Continue when amount exceeds balance', () => {
    render(<WithdrawAmountStep {...defaultProps} amount="10" />)

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

  it('shows percentage buttons in partial mode', () => {
    render(<WithdrawAmountStep {...defaultProps} withdrawType="partial" />)

    expect(screen.getByTestId('PercentageButtons')).toBeInTheDocument()
  })

  it('hides percentage buttons in full mode', () => {
    render(<WithdrawAmountStep {...defaultProps} withdrawType="full" amount="5" />)

    expect(screen.queryByTestId('PercentageButtons')).not.toBeInTheDocument()
  })

  it('calls setAmount with correct value when percentage button is clicked', async () => {
    const user = userEvent.setup()
    const setAmount = vi.fn()
    render(<WithdrawAmountStep {...defaultProps} setAmount={setAmount} />)

    await user.click(screen.getByTestId('50Button'))
    expect(setAmount).toHaveBeenCalledWith('2.5')
  })

  it('calls setWithdrawType and setAmount when switching to Partial', async () => {
    const user = userEvent.setup()
    const setWithdrawType = vi.fn()
    const setAmount = vi.fn()
    render(
      <WithdrawAmountStep
        {...defaultProps}
        withdrawType="full"
        amount="5"
        setWithdrawType={setWithdrawType}
        setAmount={setAmount}
      />,
    )

    await user.click(screen.getByTestId('PartialButton'))
    expect(setWithdrawType).toHaveBeenCalledWith('partial')
    expect(setAmount).toHaveBeenCalledWith('')
  })
})
