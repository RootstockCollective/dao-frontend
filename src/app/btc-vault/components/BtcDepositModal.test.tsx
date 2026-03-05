import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { BtcDepositModal } from './BtcDepositModal'

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

describe('BtcDepositModal', () => {
  beforeEach(() => {
    mockUseAccount.mockReturnValue({ address: '0x123', isConnected: true })
    mockUseUserPosition.mockReturnValue({
      data: {
        rbtcBalanceFormatted: '2.0',
        rbtcBalanceRaw: 2000000000000000000n,
        vaultTokensFormatted: '0',
        positionValueFormatted: '0',
        percentOfVaultFormatted: '0%',
        vaultTokensRaw: 0n,
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

  it('renders the modal with DEPOSIT rBTC header', () => {
    render(<BtcDepositModal {...defaultProps} />)

    expect(screen.getByTestId('BtcDepositModal')).toBeInTheDocument()
    expect(screen.getByText('DEPOSIT rBTC')).toBeInTheDocument()
  })

  it('starts on the amount step', () => {
    render(<BtcDepositModal {...defaultProps} />)

    expect(screen.getByTestId('DepositAmountStep')).toBeInTheDocument()
    expect(screen.queryByTestId('DepositReviewStep')).not.toBeInTheDocument()
  })

  it('navigates to review step when Continue is clicked', async () => {
    const user = userEvent.setup()
    render(<BtcDepositModal {...defaultProps} />)

    const input = screen.getByTestId('Input_amount-btc-vault')
    await user.type(input, '1')

    await user.click(screen.getByTestId('ContinueButton'))

    expect(screen.getByTestId('DepositReviewStep')).toBeInTheDocument()
    expect(screen.queryByTestId('DepositAmountStep')).not.toBeInTheDocument()
    expect(screen.getByText('REVIEW DEPOSIT')).toBeInTheDocument()
  })

  it('navigates back to amount step from review', async () => {
    const user = userEvent.setup()
    render(<BtcDepositModal {...defaultProps} />)

    // Navigate to review
    const input = screen.getByTestId('Input_amount-btc-vault')
    await user.type(input, '1')
    await user.click(screen.getByTestId('ContinueButton'))
    expect(screen.getByTestId('DepositReviewStep')).toBeInTheDocument()

    // Navigate back
    await user.click(screen.getByTestId('BackButton'))
    expect(screen.getByTestId('DepositAmountStep')).toBeInTheDocument()
    expect(screen.queryByTestId('DepositReviewStep')).not.toBeInTheDocument()
    expect(screen.getByText('DEPOSIT rBTC')).toBeInTheDocument()
  })

  it('displays review fields with correct values', async () => {
    const user = userEvent.setup()
    render(<BtcDepositModal {...defaultProps} />)

    const input = screen.getByTestId('Input_amount-btc-vault')
    await user.type(input, '1')
    await user.click(screen.getByTestId('ContinueButton'))

    // Check review fields
    expect(screen.getByTestId('review-amount')).toHaveTextContent('1')
    expect(screen.getByTestId('review-nav')).toHaveTextContent('1.02')
    expect(screen.getByTestId('review-fee')).toHaveTextContent('0%')
    expect(screen.getByTestId('review-shares')).toBeInTheDocument()
  })

  it('displays all three disclosures on review step', async () => {
    const user = userEvent.setup()
    render(<BtcDepositModal {...defaultProps} />)

    const input = screen.getByTestId('Input_amount-btc-vault')
    await user.type(input, '1')
    await user.click(screen.getByTestId('ContinueButton'))

    const disclosures = screen.getByTestId('review-disclosures')
    expect(disclosures).toHaveTextContent('This is a request and requires approval')
    expect(disclosures).toHaveTextContent('Shares are minted at the NAV confirmed at epoch close')
    expect(disclosures).toHaveTextContent('Once the epoch is closed, deposit requests cannot be canceled')
  })

  it('calls onSubmit with correct params when Submit Request is clicked', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn().mockResolvedValue(undefined)
    render(<BtcDepositModal {...defaultProps} onSubmit={onSubmit} />)

    const input = screen.getByTestId('Input_amount-btc-vault')
    await user.type(input, '1')
    await user.click(screen.getByTestId('ContinueButton'))
    await user.click(screen.getByTestId('SubmitRequestButton'))

    expect(onSubmit).toHaveBeenCalledWith({
      amount: 1000000000000000000n,
    })
  })

  it('calls onClose when the close button is clicked', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    render(<BtcDepositModal {...defaultProps} onClose={onClose} />)

    await user.click(screen.getByTestId('CloseButton'))
    expect(onClose).toHaveBeenCalledOnce()
  })

  it('shows wallet balance from useUserPosition', () => {
    render(<BtcDepositModal {...defaultProps} />)

    expect(screen.getByTestId('WalletBalanceLabel')).toHaveTextContent('2.0')
  })
})
