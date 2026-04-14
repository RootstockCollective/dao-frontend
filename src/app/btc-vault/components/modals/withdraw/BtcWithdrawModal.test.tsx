import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

import { VAULT_SHARE_MULTIPLIER, WeiPerEther } from '@/lib/constants'

import { BtcWithdrawModal } from './BtcWithdrawModal'

const ONE_SHARE_RAW = WeiPerEther * VAULT_SHARE_MULTIPLIER
const TWO_SHARES_RAW = 2n * ONE_SHARE_RAW

const mockUseAccount = vi.fn()
const mockUseUserPosition = vi.fn()
const mockUseVaultMetrics = vi.fn()

vi.mock('wagmi', () => ({
  useAccount: () => mockUseAccount(),
}))

vi.mock('../../../hooks/useUserPosition', () => ({
  useUserPosition: (address: string | undefined) => mockUseUserPosition(address),
}))

vi.mock('../../../hooks/useVaultMetrics', () => ({
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
  hasAllowanceFor: vi.fn().mockResolvedValue(true),
  onApproveShares: vi.fn().mockResolvedValue(undefined),
  onRequestWithdraw: vi.fn().mockResolvedValue(undefined),
  isApprovingShares: false,
  isWithdrawSubmitting: false,
  allowance: undefined as bigint | undefined,
  isAllowanceReadLoading: false,
  allowanceTxHash: undefined as `0x${string}` | undefined,
  isAllowanceTxFailed: false,
}

describe('BtcWithdrawModal', () => {
  beforeEach(() => {
    mockUseAccount.mockReturnValue({ address: '0x123', isConnected: true })
    mockUseUserPosition.mockReturnValue({
      data: {
        rbtcBalanceFormatted: '2.0',
        rbtcBalanceRaw: 2_000_000_000_000_000_000n,
        vaultTokensFormatted: '5.00',
        vaultTokensRaw: 5n * ONE_SHARE_RAW,
        positionValueFormatted: '5.1',
        percentOfVaultFormatted: '10.20%',
      },
    })
    mockUseVaultMetrics.mockReturnValue({
      data: {
        tvlFormatted: '50',
        apyFormatted: '8.50',
        pricePerShareFormatted: '1.02',
        timestamp: 1709000000,
        pricePerShareRaw: 1_020_000_000_000n,
      },
      isLoading: false,
    })
  })

  afterEach(() => {
    cleanup()
    vi.clearAllMocks()
  })

  it('renders the modal with WITHDRAW rBTC header', () => {
    render(<BtcWithdrawModal {...defaultProps} />)

    expect(screen.getByTestId('BtcWithdrawModal')).toBeInTheDocument()
    expect(screen.getByText('WITHDRAW rBTC')).toBeInTheDocument()
  })

  it('starts on the amount step', () => {
    render(<BtcWithdrawModal {...defaultProps} />)

    expect(screen.getByTestId('WithdrawAmountStep')).toBeInTheDocument()
    expect(screen.queryByTestId('WithdrawReviewStep')).not.toBeInTheDocument()
  })

  it('navigates to confirm when Continue is clicked and allowance is sufficient', async () => {
    const user = userEvent.setup()
    render(<BtcWithdrawModal {...defaultProps} />)

    const input = screen.getByTestId('Input_amount-btc-vault-withdraw')
    await user.type(input, '2')

    await user.click(screen.getByTestId('ContinueButton'))

    expect(screen.getByTestId('WithdrawReviewStep')).toBeInTheDocument()
    expect(screen.queryByTestId('WithdrawAmountStep')).not.toBeInTheDocument()
    expect(screen.queryByTestId('WithdrawAllowanceStep')).not.toBeInTheDocument()
  })

  it('navigates to allowance step when Continue and allowance is insufficient', async () => {
    const user = userEvent.setup()
    const hasAllowanceFor = vi.fn().mockResolvedValue(false)
    render(<BtcWithdrawModal {...defaultProps} hasAllowanceFor={hasAllowanceFor} />)

    const input = screen.getByTestId('Input_amount-btc-vault-withdraw')
    await user.type(input, '2')
    await user.click(screen.getByTestId('ContinueButton'))

    expect(screen.getByTestId('WithdrawAllowanceStep')).toBeInTheDocument()
    expect(screen.queryByTestId('WithdrawReviewStep')).not.toBeInTheDocument()
  })

  it('displays review fields with correct values', async () => {
    const user = userEvent.setup()
    render(<BtcWithdrawModal {...defaultProps} />)

    const input = screen.getByTestId('Input_amount-btc-vault-withdraw')
    await user.type(input, '2')
    await user.click(screen.getByTestId('ContinueButton'))

    expect(screen.getByTestId('review-shares')).toHaveTextContent('2')
    expect(screen.getByTestId('review-redemption-value')).toBeInTheDocument()
    expect(screen.getByTestId('review-fee')).toHaveTextContent('0%')
    expect(screen.getByTestId('review-expected-completion')).toHaveTextContent('7 days')
  })

  it('calls onRequestWithdraw with correct params when Send request is clicked', async () => {
    const user = userEvent.setup()
    const onRequestWithdraw = vi.fn().mockResolvedValue(undefined)
    render(<BtcWithdrawModal {...defaultProps} onRequestWithdraw={onRequestWithdraw} />)

    const input = screen.getByTestId('Input_amount-btc-vault-withdraw')
    await user.type(input, '2')
    await user.click(screen.getByTestId('ContinueButton'))
    await user.click(screen.getByTestId('SubmitRequestButton'))

    expect(onRequestWithdraw).toHaveBeenCalledWith(TWO_SHARES_RAW)
  })

  it('calls onClose when the close button is clicked', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    render(<BtcWithdrawModal {...defaultProps} onClose={onClose} />)

    await user.click(screen.getByTestId('CloseButton'))
    expect(onClose).toHaveBeenCalledOnce()
  })

  it('shows shares balance from useUserPosition', () => {
    render(<BtcWithdrawModal {...defaultProps} />)

    expect(screen.getByTestId('SharesBalanceLabel')).toHaveTextContent('5.00')
  })

  it('keeps WITHDRAW rBTC title on confirm step', async () => {
    const user = userEvent.setup()
    render(<BtcWithdrawModal {...defaultProps} />)

    const input = screen.getByTestId('Input_amount-btc-vault-withdraw')
    await user.type(input, '2')
    await user.click(screen.getByTestId('ContinueButton'))

    expect(screen.getByText('WITHDRAW rBTC')).toBeInTheDocument()
  })

  it('returns to amount step when Back is clicked on confirm', async () => {
    const user = userEvent.setup()
    render(<BtcWithdrawModal {...defaultProps} />)

    const input = screen.getByTestId('Input_amount-btc-vault-withdraw')
    await user.type(input, '2')
    await user.click(screen.getByTestId('ContinueButton'))

    expect(screen.getByTestId('WithdrawReviewStep')).toBeInTheDocument()

    await user.click(screen.getByTestId('BackButton'))

    expect(screen.getByTestId('WithdrawAmountStep')).toBeInTheDocument()
    expect(screen.queryByTestId('WithdrawReviewStep')).not.toBeInTheDocument()
  })

  it('shows three-step labels including APPROVE SHARES', () => {
    render(<BtcWithdrawModal {...defaultProps} />)
    expect(screen.getByText('SELECT AMOUNT')).toBeInTheDocument()
    expect(screen.getByText('APPROVE SHARES')).toBeInTheDocument()
    expect(screen.getByText('CONFIRM WITHDRAW')).toBeInTheDocument()
  })
})
