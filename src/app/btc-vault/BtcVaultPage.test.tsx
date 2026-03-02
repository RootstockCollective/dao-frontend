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
    render(<BtcVaultPage />)

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
    render(<BtcVaultPage />)

    expect(screen.getByTestId('BTC Vault')).toBeInTheDocument()
    expect(screen.getByTestId('NotAuthorizedBanner')).toBeInTheDocument()
    expect(screen.getByText('KYC required')).toBeInTheDocument()
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
    render(<BtcVaultPage />)

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
    render(<BtcVaultPage />)

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
    render(<BtcVaultPage />)

    expect(screen.getByTestId('BTC Vault')).toBeInTheDocument()
    expect(screen.queryByTestId('NotAuthorizedBanner')).not.toBeInTheDocument()
  })
})
