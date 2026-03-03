import { TooltipProvider } from '@radix-ui/react-tooltip'
import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { BtcVaultActions } from './BtcVaultActions'

const mockUseAccount = vi.fn()
const mockUseActionEligibility = vi.fn()
const mockUseUserPosition = vi.fn()
const mockUseVaultMetrics = vi.fn()

vi.mock('wagmi', () => ({
  useAccount: () => mockUseAccount(),
}))

vi.mock('../hooks/useActionEligibility', () => ({
  useActionEligibility: (address: string | undefined) => mockUseActionEligibility(address),
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

const renderWithProviders = () =>
  render(
    <TooltipProvider>
      <BtcVaultActions />
    </TooltipProvider>,
  )

describe('BtcVaultActions', () => {
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

  it('renders the Deposit button', () => {
    mockUseActionEligibility.mockReturnValue({
      data: {
        canDeposit: true,
        canWithdraw: false,
        depositBlockReason: '',
        withdrawBlockReason: '',
      },
    })
    renderWithProviders()

    expect(screen.getByTestId('DepositButton')).toBeInTheDocument()
    expect(screen.getByTestId('DepositButton')).not.toBeDisabled()
  })

  it('disables the Deposit button when canDeposit is false', () => {
    mockUseActionEligibility.mockReturnValue({
      data: {
        canDeposit: false,
        canWithdraw: false,
        depositBlockReason: 'Deposits are currently paused',
        withdrawBlockReason: '',
      },
    })
    renderWithProviders()

    expect(screen.getByTestId('DepositButton')).toBeDisabled()
  })

  it('disables the Deposit button when user has active request', () => {
    mockUseActionEligibility.mockReturnValue({
      data: {
        canDeposit: false,
        canWithdraw: false,
        depositBlockReason: 'You already have an active request',
        withdrawBlockReason: 'You already have an active request',
      },
    })
    renderWithProviders()

    expect(screen.getByTestId('DepositButton')).toBeDisabled()
  })

  it('disables the Deposit button when eligibility data is not yet loaded', () => {
    mockUseActionEligibility.mockReturnValue({ data: undefined })
    renderWithProviders()

    expect(screen.getByTestId('DepositButton')).toBeDisabled()
  })

  it('opens the modal when clicking the enabled Deposit button', async () => {
    const user = userEvent.setup()
    mockUseActionEligibility.mockReturnValue({
      data: {
        canDeposit: true,
        canWithdraw: false,
        depositBlockReason: '',
        withdrawBlockReason: '',
      },
    })
    renderWithProviders()

    await user.click(screen.getByTestId('DepositButton'))
    expect(screen.getByTestId('BtcDepositModal')).toBeInTheDocument()
  })

  it('does not open the modal when clicking a disabled Deposit button', async () => {
    const user = userEvent.setup()
    mockUseActionEligibility.mockReturnValue({
      data: {
        canDeposit: false,
        canWithdraw: false,
        depositBlockReason: 'Not eligible',
        withdrawBlockReason: '',
      },
    })
    renderWithProviders()

    await user.click(screen.getByTestId('DepositButton'))
    expect(screen.queryByTestId('BtcDepositModal')).not.toBeInTheDocument()
  })

  it('closes the modal when close button is clicked', async () => {
    const user = userEvent.setup()
    mockUseActionEligibility.mockReturnValue({
      data: {
        canDeposit: true,
        canWithdraw: false,
        depositBlockReason: '',
        withdrawBlockReason: '',
      },
    })
    renderWithProviders()

    await user.click(screen.getByTestId('DepositButton'))
    expect(screen.getByTestId('BtcDepositModal')).toBeInTheDocument()

    await user.click(screen.getByTestId('CloseButton'))
    expect(screen.queryByTestId('BtcDepositModal')).not.toBeInTheDocument()
  })
})
