import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { BtcDepositModal } from './BtcDepositModal'

const mockUseAccount = vi.fn()
const mockUseUserPosition = vi.fn()

vi.mock('wagmi', () => ({
  useAccount: () => mockUseAccount(),
}))

vi.mock('../hooks/useUserPosition', () => ({
  useUserPosition: (address: string | undefined) => mockUseUserPosition(address),
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

    // Type a valid amount
    const input = screen.getByTestId('Input_amount-btc-vault')
    await user.type(input, '1')

    // Click Continue
    await user.click(screen.getByTestId('ContinueButton'))

    expect(screen.getByTestId('DepositReviewStep')).toBeInTheDocument()
    expect(screen.queryByTestId('DepositAmountStep')).not.toBeInTheDocument()
    expect(screen.getByText('REVIEW DEPOSIT')).toBeInTheDocument()
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
