import type { ReactNode } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { cleanup, render, screen } from '@testing-library/react'
import { TooltipProvider } from '@radix-ui/react-tooltip'

import { BtcVaultPage } from './BtcVaultPage'

const mockUseAccount = vi.fn()
const mockUseActionEligibility = vi.fn()

vi.mock('wagmi', async importOriginal => {
  const actual = await importOriginal<typeof import('wagmi')>()
  return {
    ...actual,
    useAccount: () => mockUseAccount(),
    useWriteContract: () => ({
      writeContractAsync: vi.fn(),
      data: undefined,
      isPending: false,
    }),
    useWaitForTransactionReceipt: () => ({ isPending: false, failureReason: null }),
  }
})

vi.mock('@tanstack/react-query', async importOriginal => {
  const actual = await importOriginal<typeof import('@tanstack/react-query')>()
  return {
    ...actual,
    useQueryClient: () => ({ invalidateQueries: vi.fn() }),
  }
})

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

vi.mock('./ActiveRequestSection', () => ({
  ActiveRequestSection: () => null,
}))

vi.mock('./components/BtcVaultDashboard', () => ({
  BtcVaultDashboard: () => <section data-testid="btc-vault-dashboard" />,
}))

vi.mock('./components/BtcVaultMetrics', () => ({
  BtcVaultMetrics: () => null,
}))

vi.mock('./hooks/useVaultMetrics', () => ({
  useVaultMetrics: () => ({
    data: {
      tvlFormatted: '50',
      apyFormatted: '8.50',
      navFormatted: '1.02',
      timestamp: 1709000000,
      navRaw: 1_020_000_000_000_000_000n,
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

function Wrapper({ children }: { children: ReactNode }) {
  return <TooltipProvider>{children}</TooltipProvider>
}

describe('BtcVaultPage', () => {
  beforeEach(() => {
    mockUseAccount.mockReturnValue({ address: undefined, isConnected: false })
    mockUseActionEligibility.mockReturnValue({ data: undefined })
  })

  afterEach(() => {
    cleanup()
    vi.clearAllMocks()
  })

  it('shows WalletDisconnectedBanner when wallet is not connected', () => {
    mockUseAccount.mockReturnValue({ address: undefined, isConnected: false })
    render(<BtcVaultPage />, { wrapper: Wrapper })

    expect(screen.getByTestId('BTC Vault')).toBeInTheDocument()
    expect(screen.getByTestId('WalletDisconnectedBanner')).toBeInTheDocument()
  })

  it('shows NotAuthorizedBanner when connected but not eligible', () => {
    mockUseAccount.mockReturnValue({
      address: '0x123',
      isConnected: true,
    })
    mockUseActionEligibility.mockReturnValue({
      data: {
        canDeposit: false,
        canWithdraw: false,
        depositBlockReason: 'KYC required',
        withdrawBlockReason: '',
      },
    })
    render(<BtcVaultPage />, { wrapper: Wrapper })

    expect(screen.getByTestId('BTC Vault')).toBeInTheDocument()
    expect(screen.getByTestId('NotAuthorizedBanner')).toBeInTheDocument()
    expect(screen.getByText('KYC required')).toBeInTheDocument()
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
    render(<BtcVaultPage />, { wrapper: Wrapper })
    expect(screen.getByTestId('btc-vault-metrics')).toBeInTheDocument()
    expect(screen.getByText('VAULT METRICS')).toBeInTheDocument()
  })

  it('shows main content when connected and eligible', () => {
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
    render(<BtcVaultPage />, { wrapper: Wrapper })

    expect(screen.getByTestId('BTC Vault')).toBeInTheDocument()
    expect(screen.getByTestId('btc-vault-metrics')).toBeInTheDocument()
    expect(screen.getByTestId('btc-vault-dashboard')).toBeInTheDocument()
    expect(screen.getByTestId('btc-vault-actions')).toBeInTheDocument()
    expect(screen.getByTestId('btc-vault-request-queue')).toBeInTheDocument()
    expect(screen.getByTestId('btc-vault-history')).toBeInTheDocument()
    expect(screen.queryByTestId('WalletDisconnectedBanner')).not.toBeInTheDocument()
    expect(screen.queryByTestId('NotAuthorizedBanner')).not.toBeInTheDocument()
  })

  it('shows main content when connected but blocked by pause (not eligibility)', () => {
    mockUseAccount.mockReturnValue({
      address: '0x123',
      isConnected: true,
    })
    mockUseActionEligibility.mockReturnValue({
      data: {
        canDeposit: false,
        canWithdraw: true,
        depositBlockReason: 'Deposits are currently paused',
        withdrawBlockReason: '',
      },
    })
    render(<BtcVaultPage />, { wrapper: Wrapper })

    expect(screen.getByTestId('BTC Vault')).toBeInTheDocument()
    expect(screen.queryByTestId('NotAuthorizedBanner')).not.toBeInTheDocument()
  })

  it('shows main content when connected but blocked by active request (not eligibility)', () => {
    mockUseAccount.mockReturnValue({
      address: '0x123',
      isConnected: true,
    })
    mockUseActionEligibility.mockReturnValue({
      data: {
        canDeposit: false,
        canWithdraw: false,
        depositBlockReason: 'You already have an active request',
        withdrawBlockReason: 'You already have an active request',
      },
    })
    render(<BtcVaultPage />, { wrapper: Wrapper })

    expect(screen.getByTestId('BTC Vault')).toBeInTheDocument()
    expect(screen.queryByTestId('NotAuthorizedBanner')).not.toBeInTheDocument()
  })
})
