import { TooltipProvider } from '@radix-ui/react-tooltip'
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { BtcVaultPage } from './BtcVaultPage'

const mockUseAccount = vi.fn()
const mockUseActionEligibility = vi.fn()

vi.mock('wagmi', () => ({
  useAccount: () => mockUseAccount(),
}))

vi.mock('./hooks/useActionEligibility', () => ({
  useActionEligibility: (address: string | undefined) => mockUseActionEligibility(address),
}))

vi.mock('@/shared/walletConnection/connection/useAppKitFlow', () => ({
  useAppKitFlow: vi.fn(() => ({
    onConnectWalletButtonClick: vi.fn(),
    handleConnectWallet: vi.fn(),
    handleCloseIntermediateStep: vi.fn(),
  })),
}))

vi.mock('@/shared/hooks/useIsDesktop', () => ({
  useIsDesktop: () => true,
}))

vi.mock('@/app/backing/components/DecorativeSquares', () => ({
  DecorativeSquares: () => null,
}))

vi.mock('./hooks/useVaultMetrics', () => ({
  useVaultMetrics: () => ({
    data: {
      tvlFormatted: '50',
      apyFormatted: '8.50',
      navFormatted: '1.02',
      timestamp: 1709000000,
    },
    isLoading: false,
  }),
}))

vi.mock('./hooks/useEpochState', () => ({
  useEpochState: () => ({
    data: {
      epochId: '1',
      status: 'open',
      statusSummary: 'Closes in 5m',
      isAcceptingRequests: true,
    },
    isLoading: false,
  }),
}))

const renderWithProviders = (ui: React.ReactElement = <BtcVaultPage />) =>
  render(<TooltipProvider>{ui}</TooltipProvider>)

describe('BtcVaultPage', () => {
  beforeEach(() => {
    mockUseAccount.mockReturnValue({ address: undefined, isConnected: false })
    mockUseActionEligibility.mockReturnValue({ data: undefined })
  })

  afterEach(() => {
    cleanup()
    vi.clearAllMocks()
  })

  it('shows WalletDisconnectedBanner, hides eligibility indicator and action buttons when wallet is not connected', () => {
    mockUseAccount.mockReturnValue({ address: undefined, isConnected: false })
    renderWithProviders()

    expect(screen.getByTestId('BTC Vault')).toBeInTheDocument()
    expect(screen.getByTestId('WalletDisconnectedBanner')).toBeInTheDocument()
    expect(screen.queryByTestId('EligibilityIndicator')).not.toBeInTheDocument()
    expect(screen.getByTestId('btc-vault-metrics')).toBeInTheDocument()
    expect(screen.getByTestId('btc-vault-dashboard')).toBeInTheDocument()
    expect(screen.getByTestId('btc-vault-history')).toBeInTheDocument()
  })

  it('shows NotAuthorizedBanner with indicator when connected but not eligible', () => {
    mockUseAccount.mockReturnValue({ address: '0x123', isConnected: true })
    mockUseActionEligibility.mockReturnValue({
      data: {
        canDeposit: false,
        canWithdraw: false,
        depositBlockReason: 'KYC required',
        withdrawBlockReason: '',
      },
    })
    renderWithProviders()

    expect(screen.getByTestId('NotAuthorizedBanner')).toBeInTheDocument()
    expect(screen.getByTestId('EligibilityIndicator')).toBeInTheDocument()
    expect(screen.getByText('KYB: Not Authorized')).toBeInTheDocument()
  })

  it('renders Vault Metrics section with section title', () => {
    mockUseAccount.mockReturnValue({
      address: '0x123',
      isConnected: true,
    })
    mockUseActionEligibility.mockReturnValue({
      data: {
        canDeposit: true,
        canWithdraw: true,
        depositBlockReason: '',
        withdrawBlockReason: '',
      },
    })
    renderWithProviders()
    expect(screen.getByTestId('btc-vault-metrics')).toBeInTheDocument()
    expect(screen.getByText('VAULT METRICS')).toBeInTheDocument()
  })

  it('shows eligible state when connected and approved', () => {
    mockUseAccount.mockReturnValue({ address: '0x123', isConnected: true })
    mockUseActionEligibility.mockReturnValue({
      data: {
        canDeposit: true,
        canWithdraw: true,
        depositBlockReason: '',
        withdrawBlockReason: '',
      },
    })
    renderWithProviders()

    expect(screen.queryByTestId('WalletDisconnectedBanner')).not.toBeInTheDocument()
    expect(screen.queryByTestId('NotAuthorizedBanner')).not.toBeInTheDocument()
    expect(screen.getByTestId('EligibilityIndicator')).toBeInTheDocument()
    expect(screen.getByText('KYB: Approved')).toBeInTheDocument()
  })

  it('shows pause banner and combined eligibility indicator', () => {
    mockUseAccount.mockReturnValue({ address: '0x123', isConnected: true })
    mockUseActionEligibility.mockReturnValue({
      data: {
        canDeposit: false,
        canWithdraw: true,
        depositBlockReason: 'Deposits are currently paused',
        withdrawBlockReason: '',
      },
    })
    renderWithProviders()

    expect(screen.getByTestId('PauseBanner')).toBeInTheDocument()
    expect(screen.getByText('Deposits Paused')).toBeInTheDocument()
    expect(screen.getByText('KYB: Approved | Deposits: Paused')).toBeInTheDocument()
  })

  it('shows eligibility indicator when user has an active request', () => {
    mockUseAccount.mockReturnValue({ address: '0x123', isConnected: true })
    mockUseActionEligibility.mockReturnValue({
      data: {
        canDeposit: false,
        canWithdraw: false,
        depositBlockReason: 'You already have an active request',
        withdrawBlockReason: 'You already have an active request',
      },
    })
    renderWithProviders()

    expect(screen.queryByTestId('NotAuthorizedBanner')).not.toBeInTheDocument()
    expect(screen.getByText('KYB: Approved')).toBeInTheDocument()
  })

  it('keeps data sections visible in all states (read-only mode)', () => {
    mockUseAccount.mockReturnValue({ address: undefined, isConnected: false })
    renderWithProviders()

    expect(screen.getByTestId('btc-vault-metrics')).toBeInTheDocument()
    expect(screen.getByTestId('btc-vault-dashboard')).toBeInTheDocument()
    expect(screen.getByTestId('btc-vault-actions')).toBeInTheDocument()
    expect(screen.getByTestId('btc-vault-request-queue')).toBeInTheDocument()
    expect(screen.getByTestId('btc-vault-history')).toBeInTheDocument()
  })
})
