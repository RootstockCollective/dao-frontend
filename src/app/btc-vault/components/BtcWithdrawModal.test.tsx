import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { BtcWithdrawModal } from './BtcWithdrawModal'

const mockUseAccount = vi.fn()
const mockUseUserPosition = vi.fn()
const mockUseVaultMetrics = vi.fn()

vi.mock('wagmi', () => ({
  useAccount: () => mockUseAccount(),
}))

vi.mock('../hooks/useUserPosition', () => ({
  useUserPosition: (address: string | undefined) => mockUseUserPosition(address),
}))

vi.mock('../hooks/useVaultMetrics', () => ({
  useVaultMetrics: () => mockUseVaultMetrics(),
}))

vi.mock('@/shared/hooks/useIsDesktop', () => ({
  useIsDesktop: () => true,
}))

const defaultProps = {
  onClose: vi.fn(),
  onSubmit: vi.fn().mockResolvedValue(undefined),
  isSubmitting: false,
}

describe('BtcWithdrawModal', () => {
  beforeEach(() => {
    mockUseAccount.mockReturnValue({ address: '0x123', isConnected: true })
    mockUseUserPosition.mockReturnValue({
      data: {
        rbtcBalanceFormatted: '2.0',
        rbtcBalanceRaw: 2_000_000_000_000_000_000n,
        vaultTokensFormatted: '5.0',
        vaultTokensRaw: 5_000_000_000_000_000_000n,
        positionValueFormatted: '5.1',
        percentOfVaultFormatted: '10.20%',
      },
    })
    mockUseVaultMetrics.mockReturnValue({
      data: {
        tvlFormatted: '50',
        apyFormatted: '8.50',
        navFormatted: '1.02',
        timestamp: 1709000000,
        navRaw: 1_020_000_000_000_000_000n,
      },
      isLoading: false,
    })
  })

  afterEach(() => {
    cleanup()
    vi.clearAllMocks()
  })

  it('renders the modal with WITHDRAW VAULT TOKENS header', () => {
    render(<BtcWithdrawModal {...defaultProps} />)

    expect(screen.getByTestId('BtcWithdrawModal')).toBeInTheDocument()
    expect(screen.getByText('WITHDRAW VAULT TOKENS')).toBeInTheDocument()
  })

  it('starts on the amount step', () => {
    render(<BtcWithdrawModal {...defaultProps} />)

    expect(screen.getByTestId('WithdrawAmountStep')).toBeInTheDocument()
    expect(screen.queryByTestId('WithdrawReviewStep')).not.toBeInTheDocument()
  })

  it('navigates to review step when Continue is clicked', async () => {
    const user = userEvent.setup()
    render(<BtcWithdrawModal {...defaultProps} />)

    const input = screen.getByTestId('Input_amount-btc-vault-withdraw')
    await user.type(input, '2')

    await user.click(screen.getByTestId('ContinueButton'))

    expect(screen.getByTestId('WithdrawReviewStep')).toBeInTheDocument()
    expect(screen.queryByTestId('WithdrawAmountStep')).not.toBeInTheDocument()
    expect(screen.getByText('REVIEW WITHDRAWAL')).toBeInTheDocument()
  })

  it('navigates back to amount step from review', async () => {
    const user = userEvent.setup()
    render(<BtcWithdrawModal {...defaultProps} />)

    // Navigate to review
    const input = screen.getByTestId('Input_amount-btc-vault-withdraw')
    await user.type(input, '2')
    await user.click(screen.getByTestId('ContinueButton'))
    expect(screen.getByTestId('WithdrawReviewStep')).toBeInTheDocument()

    // Navigate back
    await user.click(screen.getByTestId('BackButton'))
    expect(screen.getByTestId('WithdrawAmountStep')).toBeInTheDocument()
    expect(screen.queryByTestId('WithdrawReviewStep')).not.toBeInTheDocument()
    expect(screen.getByText('WITHDRAW VAULT TOKENS')).toBeInTheDocument()
  })

  it('displays review fields with correct values', async () => {
    const user = userEvent.setup()
    render(<BtcWithdrawModal {...defaultProps} />)

    const input = screen.getByTestId('Input_amount-btc-vault-withdraw')
    await user.type(input, '2')
    await user.click(screen.getByTestId('ContinueButton'))

    // Check review fields
    expect(screen.getByTestId('review-amount')).toHaveTextContent('2')
    expect(screen.getByTestId('review-rbtc')).toBeInTheDocument()
    expect(screen.getByTestId('review-nav')).toHaveTextContent('1.02')
    expect(screen.getByTestId('review-fee')).toHaveTextContent('0%')
    expect(screen.getByTestId('review-slippage')).toHaveTextContent('0.5%')
  })

  it('displays all four disclosures on review step', async () => {
    const user = userEvent.setup()
    render(<BtcWithdrawModal {...defaultProps} />)

    const input = screen.getByTestId('Input_amount-btc-vault-withdraw')
    await user.type(input, '2')
    await user.click(screen.getByTestId('ContinueButton'))

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

  it('calls onSubmit with correct params when Submit Request is clicked', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn().mockResolvedValue(undefined)
    render(<BtcWithdrawModal {...defaultProps} onSubmit={onSubmit} />)

    const input = screen.getByTestId('Input_amount-btc-vault-withdraw')
    await user.type(input, '2')
    await user.click(screen.getByTestId('ContinueButton'))
    await user.click(screen.getByTestId('SubmitRequestButton'))

    expect(onSubmit).toHaveBeenCalledWith({
      amount: 2_000_000_000_000_000_000n,
      slippage: 0.005,
    })
  })

  it('calls onClose when the close button is clicked', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    render(<BtcWithdrawModal {...defaultProps} onClose={onClose} />)

    await user.click(screen.getByTestId('CloseButton'))
    expect(onClose).toHaveBeenCalledOnce()
  })

  it('shows vault token balance from useUserPosition', () => {
    render(<BtcWithdrawModal {...defaultProps} />)

    expect(screen.getByTestId('VaultBalanceLabel')).toHaveTextContent('5.0')
  })
})
