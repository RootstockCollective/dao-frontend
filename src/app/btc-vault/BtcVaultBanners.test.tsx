import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { cleanup, render, screen } from '@testing-library/react'

import { BtcVaultBanners } from './BtcVaultBanners'

const mockUseAccount = vi.fn()
const mockUseActionEligibility = vi.fn()
const mockUseEpochState = vi.fn()

vi.mock('wagmi', async importOriginal => {
  const actual = await importOriginal<typeof import('wagmi')>()
  return {
    ...actual,
    useAccount: () => mockUseAccount(),
  }
})

vi.mock('./hooks/useActionEligibility', () => ({
  useActionEligibility: (address: string | undefined) => mockUseActionEligibility(address),
}))

vi.mock('./hooks/useEpochState', () => ({
  useEpochState: () => mockUseEpochState(),
}))

vi.mock('./components/DepositWindowBanner', () => ({
  DepositWindowBanner: () => <div data-testid="DepositWindowBanner">Deposit Window</div>,
}))

vi.mock('@/shared/hooks/useIsDesktop', () => ({
  useIsDesktop: () => true,
}))

vi.mock('@/app/backing/components/DecorativeSquares', () => ({
  DecorativeSquares: () => null,
}))

describe('BtcVaultBanners', () => {
  const closedEpoch = {
    epochId: '1',
    status: 'closed' as const,
    statusSummary: 'Closed',
    isAcceptingRequests: false,
    endTime: 0,
    closesAtFormatted: '01 Jan 1970',
  }

  const openEpoch = {
    epochId: '2',
    status: 'open' as const,
    statusSummary: 'Closes in 5d',
    isAcceptingRequests: true,
    endTime: Math.floor(Date.now() / 1000) + 86400 * 6,
    closesAtFormatted: '23 Feb 2025',
  }

  beforeEach(() => {
    mockUseAccount.mockReturnValue({ address: undefined, isConnected: false })
    mockUseActionEligibility.mockReturnValue({ data: undefined })
    mockUseEpochState.mockReturnValue({ data: closedEpoch })
  })

  afterEach(() => {
    cleanup()
    vi.clearAllMocks()
  })

  it('renders disclosure banner when wallet is not connected', () => {
    mockUseAccount.mockReturnValue({ address: undefined, isConnected: false })
    render(<BtcVaultBanners />)

    expect(screen.getByTestId('DisclosureBanner')).toBeInTheDocument()
    expect(screen.getByText('DISCLOSURE')).toBeInTheDocument()
    expect(screen.getByTestId('DisclosureContent')).toBeInTheDocument()
  })

  it('does not render disclosure or DepositWindow banner when wallet is connected and eligible but epoch is closed', () => {
    mockUseAccount.mockReturnValue({ address: '0x123', isConnected: true })
    mockUseActionEligibility.mockReturnValue({
      data: {
        canDeposit: true,
        canWithdraw: true,
        depositBlockReason: '',
        withdrawBlockReason: '',
      },
    })
    mockUseEpochState.mockReturnValue({ data: closedEpoch })
    render(<BtcVaultBanners />)

    expect(screen.queryByTestId('DisclosureBanner')).not.toBeInTheDocument()
    expect(screen.queryByTestId('NotAuthorizedBanner')).not.toBeInTheDocument()
    expect(screen.queryByTestId('DepositWindowBanner')).not.toBeInTheDocument()
  })

  it('renders DepositWindowBanner when connected, eligible, and epoch is open', () => {
    mockUseAccount.mockReturnValue({ address: '0x123', isConnected: true })
    mockUseActionEligibility.mockReturnValue({
      data: {
        canDeposit: true,
        canWithdraw: true,
        depositBlockReason: '',
        withdrawBlockReason: '',
      },
    })
    mockUseEpochState.mockReturnValue({ data: openEpoch })
    render(<BtcVaultBanners />)

    expect(screen.getByTestId('DepositWindowBanner')).toBeInTheDocument()
    expect(screen.queryByTestId('DisclosureBanner')).not.toBeInTheDocument()
    expect(screen.queryByTestId('NotAuthorizedBanner')).not.toBeInTheDocument()
  })

  it('renders NotAuthorizedBanner when connected but not eligible', () => {
    mockUseAccount.mockReturnValue({ address: '0x123', isConnected: true })
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
    expect(screen.queryByTestId('DisclosureBanner')).not.toBeInTheDocument()
  })
})
