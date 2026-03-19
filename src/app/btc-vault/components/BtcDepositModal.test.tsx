import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { DEPOSIT_EXPECTED_COMPLETION } from '../services/constants'
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
        pricePerShareFormatted: '1.02',
        timestamp: 1709000000,
        pricePerShareRaw: 1_020_000_000_000_000_000n,
      },
      isLoading: false,
    })
  })

  afterEach(() => {
    cleanup()
    vi.clearAllMocks()
  })

  it('renders the modal with DEPOSIT RBTC header', () => {
    render(<BtcDepositModal {...defaultProps} />)

    expect(screen.getByTestId('BtcDepositModal')).toBeInTheDocument()
    expect(screen.getByText('DEPOSIT RBTC')).toBeInTheDocument()
  })

  it('shows step indicator with SELECT AMOUNT and CONFIRM REQUEST', () => {
    render(<BtcDepositModal {...defaultProps} />)

    expect(screen.getByText('SELECT AMOUNT')).toBeInTheDocument()
    expect(screen.getByText('CONFIRM REQUEST')).toBeInTheDocument()
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
  })

  it('shows disclaimer on both steps', async () => {
    const user = userEvent.setup()
    render(<BtcDepositModal {...defaultProps} />)

    // Disclaimer on amount step
    expect(screen.getByTestId('ParagraphDisclaimer')).toHaveTextContent('Subject to approval by fund manager')

    // Navigate to review
    const input = screen.getByTestId('Input_amount-btc-vault')
    await user.type(input, '1')
    await user.click(screen.getByTestId('ContinueButton'))

    // Disclaimer on review step
    expect(screen.getByTestId('ParagraphDisclaimer')).toHaveTextContent('Subject to approval by fund manager')
  })

  it('displays review fields with correct values', async () => {
    const user = userEvent.setup()
    render(<BtcDepositModal {...defaultProps} />)

    const input = screen.getByTestId('Input_amount-btc-vault')
    await user.type(input, '1')
    await user.click(screen.getByTestId('ContinueButton'))

    expect(screen.getByTestId('review-amount')).toHaveTextContent('1')
    expect(screen.getByTestId('review-fee')).toHaveTextContent('0%')
    expect(screen.getByTestId('review-shares')).toBeInTheDocument()
    expect(screen.getByTestId('review-expected-completion')).toHaveTextContent(DEPOSIT_EXPECTED_COMPLETION)
  })

  it('shows instruction text on review step', async () => {
    const user = userEvent.setup()
    render(<BtcDepositModal {...defaultProps} />)

    const input = screen.getByTestId('Input_amount-btc-vault')
    await user.type(input, '1')
    await user.click(screen.getByTestId('ContinueButton'))

    expect(screen.getByText('Make sure that everything is correct before continuing:')).toBeInTheDocument()
  })

  it('calls onSubmit with correct params when Send request is clicked', async () => {
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

  it('shows shares estimate and fee on amount step', () => {
    render(<BtcDepositModal {...defaultProps} />)

    expect(screen.getByTestId('review-shares')).toBeInTheDocument()
    expect(screen.getByTestId('review-fee')).toBeInTheDocument()
  })
})
