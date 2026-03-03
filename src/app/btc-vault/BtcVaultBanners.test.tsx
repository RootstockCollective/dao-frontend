import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { BtcVaultBanners } from './BtcVaultBanners'
import type { ActionEligibility } from './services/ui/types'

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

const ELIGIBLE: ActionEligibility = {
  canDeposit: true,
  canWithdraw: true,
  depositBlockReason: '',
  withdrawBlockReason: '',
}

describe('BtcVaultBanners', () => {
  beforeEach(() => {
    mockUseAccount.mockReturnValue({ address: '0x123', isConnected: true })
    mockUseActionEligibility.mockReturnValue({ data: ELIGIBLE })
  })

  afterEach(() => {
    cleanup()
    vi.clearAllMocks()
  })

  it('shows WalletDisconnectedBanner when wallet is not connected', () => {
    mockUseAccount.mockReturnValue({ address: undefined, isConnected: false })
    render(<BtcVaultBanners />)

    expect(screen.getByTestId('WalletDisconnectedBanner')).toBeInTheDocument()
    expect(screen.queryByTestId('NotAuthorizedBanner')).not.toBeInTheDocument()
    expect(screen.queryByTestId('PauseBanner')).not.toBeInTheDocument()
  })

  it('shows NotAuthorizedBanner when user is not eligible', () => {
    mockUseActionEligibility.mockReturnValue({
      data: {
        canDeposit: false,
        canWithdraw: false,
        depositBlockReason: 'KYC required',
        withdrawBlockReason: '',
      },
    })
    render(<BtcVaultBanners />)

    expect(screen.getByTestId('NotAuthorizedBanner')).toBeInTheDocument()
    expect(screen.getByText('KYC required')).toBeInTheDocument()
    expect(screen.queryByTestId('PauseBanner')).not.toBeInTheDocument()
  })

  it('shows deposits paused banner when only deposits are paused', () => {
    mockUseActionEligibility.mockReturnValue({
      data: {
        canDeposit: false,
        canWithdraw: true,
        depositBlockReason: 'Deposits are currently paused',
        withdrawBlockReason: '',
      },
    })
    render(<BtcVaultBanners />)

    expect(screen.getByTestId('PauseBanner')).toBeInTheDocument()
    expect(screen.getByText('Deposits Paused')).toBeInTheDocument()
    expect(screen.queryByTestId('NotAuthorizedBanner')).not.toBeInTheDocument()
  })

  it('shows withdrawals paused banner when only withdrawals are paused', () => {
    mockUseActionEligibility.mockReturnValue({
      data: {
        canDeposit: true,
        canWithdraw: false,
        depositBlockReason: '',
        withdrawBlockReason: 'Withdrawals are currently paused',
      },
    })
    render(<BtcVaultBanners />)

    expect(screen.getByTestId('PauseBanner')).toBeInTheDocument()
    expect(screen.getByText('Withdrawals Paused')).toBeInTheDocument()
  })

  it('shows vault paused banner when both deposits and withdrawals are paused', () => {
    mockUseActionEligibility.mockReturnValue({
      data: {
        canDeposit: false,
        canWithdraw: false,
        depositBlockReason: 'Deposits are currently paused',
        withdrawBlockReason: 'Withdrawals are currently paused',
      },
    })
    render(<BtcVaultBanners />)

    expect(screen.getByTestId('PauseBanner')).toBeInTheDocument()
    expect(screen.getByText('Vault Paused')).toBeInTheDocument()
  })

  it('renders no banners when user is eligible and nothing is paused', () => {
    render(<BtcVaultBanners />)

    expect(screen.queryByTestId('WalletDisconnectedBanner')).not.toBeInTheDocument()
    expect(screen.queryByTestId('NotAuthorizedBanner')).not.toBeInTheDocument()
    expect(screen.queryByTestId('PauseBanner')).not.toBeInTheDocument()
  })

  it('shows both NotAuthorized and pause banners when user is ineligible and deposits are paused', () => {
    mockUseActionEligibility.mockReturnValue({
      data: {
        canDeposit: false,
        canWithdraw: false,
        depositBlockReason: 'KYC required',
        withdrawBlockReason: 'Withdrawals are currently paused',
      },
    })
    render(<BtcVaultBanners />)

    expect(screen.getByTestId('NotAuthorizedBanner')).toBeInTheDocument()
    expect(screen.getByTestId('PauseBanner')).toBeInTheDocument()
    expect(screen.getByText('Withdrawals Paused')).toBeInTheDocument()
  })

  it('renders nothing when eligibility data is not yet loaded', () => {
    mockUseActionEligibility.mockReturnValue({ data: undefined })
    render(<BtcVaultBanners />)

    expect(screen.queryByTestId('WalletDisconnectedBanner')).not.toBeInTheDocument()
    expect(screen.queryByTestId('NotAuthorizedBanner')).not.toBeInTheDocument()
    expect(screen.queryByTestId('PauseBanner')).not.toBeInTheDocument()
  })
})
