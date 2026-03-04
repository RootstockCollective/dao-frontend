import { TooltipProvider } from '@radix-ui/react-tooltip'
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  ELIGIBILITY_REASON_DEPOSITS_PAUSED,
  ELIGIBILITY_REASON_DISCONNECTED,
  ELIGIBILITY_REASON_ELIGIBLE,
  ELIGIBILITY_REASON_LOADING,
  ELIGIBILITY_REASON_NOT_AUTHORIZED,
} from './services/ui/eligibilityReasons'
import { BtcVaultPage } from './BtcVaultPage'

const mockUseAccount = vi.fn()
const mockUseActionEligibility = vi.fn()

vi.mock('wagmi', async importOriginal => {
  const actual = await importOriginal<typeof import('wagmi')>()
  return {
    ...actual,
    useAccount: () => mockUseAccount(),
  }
})

vi.mock('./hooks/useActionEligibility', () => ({
  useActionEligibility: () => mockUseActionEligibility(),
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
    mockUseActionEligibility.mockReturnValue({
      isEligible: false,
      reason: ELIGIBILITY_REASON_LOADING,
      isLoading: false,
    })
  })

  afterEach(() => {
    cleanup()
    vi.clearAllMocks()
  })

  it('shows wallet disconnected section at bottom when wallet is not connected', () => {
    mockUseAccount.mockReturnValue({ address: undefined, isConnected: false })
    mockUseActionEligibility.mockReturnValue({
      isEligible: false,
      reason: ELIGIBILITY_REASON_DISCONNECTED,
      isLoading: false,
    })
    renderWithProviders()

    expect(screen.getByTestId('BtcVaultWalletDisconnectedSection')).toBeInTheDocument()
    expect(screen.getByText('Your wallet is not connected')).toBeInTheDocument()
    expect(screen.getByTestId('ConnectWallet')).toBeInTheDocument()
  })

  it('does not show wallet disconnected section when wallet is connected', () => {
    mockUseAccount.mockReturnValue({
      address: '0x123',
      isConnected: true,
    })
    mockUseActionEligibility.mockReturnValue({
      isEligible: true,
      reason: ELIGIBILITY_REASON_ELIGIBLE,
      isLoading: false,
    })
    renderWithProviders()

    expect(screen.queryByTestId('BtcVaultWalletDisconnectedSection')).not.toBeInTheDocument()
  })

  it('shows NotAuthorizedBanner when connected but not eligible', () => {
    mockUseAccount.mockReturnValue({
      address: '0x123',
      isConnected: true,
    })
    mockUseActionEligibility.mockReturnValue({
      isEligible: false,
      reason: ELIGIBILITY_REASON_NOT_AUTHORIZED,
      isLoading: false,
    })
    renderWithProviders()

    expect(screen.getByTestId('BTC Vault')).toBeInTheDocument()
    expect(screen.getByTestId('NotAuthorizedBanner')).toBeInTheDocument()
    expect(screen.getByText(ELIGIBILITY_REASON_NOT_AUTHORIZED)).toBeInTheDocument()
  })

  it('renders Vault Metrics section with section title', () => {
    mockUseAccount.mockReturnValue({
      address: '0x123',
      isConnected: true,
    })
    mockUseActionEligibility.mockReturnValue({
      isEligible: true,
      reason: ELIGIBILITY_REASON_ELIGIBLE,
      isLoading: false,
    })
    renderWithProviders()
    expect(screen.getByTestId('btc-vault-metrics')).toBeInTheDocument()
    expect(screen.getByText('VAULT METRICS')).toBeInTheDocument()
  })

  it('shows main content when connected and eligible', () => {
    mockUseAccount.mockReturnValue({
      address: '0x123',
      isConnected: true,
    })
    mockUseActionEligibility.mockReturnValue({
      isEligible: true,
      reason: ELIGIBILITY_REASON_ELIGIBLE,
      isLoading: false,
    })
    renderWithProviders()

    expect(screen.getByTestId('BTC Vault')).toBeInTheDocument()
    expect(screen.getByTestId('btc-vault-metrics')).toBeInTheDocument()
    expect(screen.getByTestId('btc-vault-dashboard')).toBeInTheDocument()
    expect(screen.getByTestId('btc-vault-actions')).toBeInTheDocument()
    expect(screen.getByTestId('btc-vault-request-queue')).toBeInTheDocument()
    expect(screen.getByTestId('btc-vault-history')).toBeInTheDocument()
    expect(screen.queryByTestId('NotAuthorizedBanner')).not.toBeInTheDocument()
    expect(screen.queryByTestId('BtcVaultWalletDisconnectedSection')).not.toBeInTheDocument()
  })

  it('shows DepositsPausedBanner when connected but deposits are paused', () => {
    mockUseAccount.mockReturnValue({
      address: '0x123',
      isConnected: true,
    })
    mockUseActionEligibility.mockReturnValue({
      isEligible: false,
      reason: ELIGIBILITY_REASON_DEPOSITS_PAUSED,
      isLoading: false,
    })
    renderWithProviders()

    expect(screen.getByTestId('BTC Vault')).toBeInTheDocument()
    expect(screen.getByTestId('DepositsPausedBanner')).toBeInTheDocument()
    expect(screen.queryByTestId('NotAuthorizedBanner')).not.toBeInTheDocument()
  })

  it('shows no eligibility banner when connected with active request (eligible, not paused)', () => {
    mockUseAccount.mockReturnValue({
      address: '0x123',
      isConnected: true,
    })
    mockUseActionEligibility.mockReturnValue({
      isEligible: true,
      reason: ELIGIBILITY_REASON_ELIGIBLE,
      isLoading: false,
    })
    renderWithProviders()

    expect(screen.getByTestId('BTC Vault')).toBeInTheDocument()
    expect(screen.queryByTestId('NotAuthorizedBanner')).not.toBeInTheDocument()
  })
})
