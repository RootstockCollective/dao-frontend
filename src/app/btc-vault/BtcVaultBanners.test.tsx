import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { cleanup, render, screen } from '@testing-library/react'

import { BtcVaultBanners } from './BtcVaultBanners'

const mockUseAccount = vi.fn()
const mockUseActionEligibility = vi.fn()
const mockUseEpochState = vi.fn()
const mockUseKybStatus = vi.fn()

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

vi.mock('./hooks/useKybStatus', () => ({
  useKybStatus: () => mockUseKybStatus(),
}))

vi.mock('@/shared/hooks/useIsDesktop', () => ({
  useIsDesktop: () => true,
}))

vi.mock('@/app/backing/components/DecorativeSquares', () => ({
  DecorativeSquares: () => null,
}))

vi.mock('@/components/Countdown/Countdown', () => ({
  Countdown: () => <span data-testid="countdown">5d 23h 59m</span>,
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
    mockUseKybStatus.mockReturnValue({ status: 'passed' as const })
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

  it('does not render combined card when wallet is connected, eligible, KYB passed, and epoch is closed', () => {
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
    mockUseKybStatus.mockReturnValue({ status: 'passed' as const })
    render(<BtcVaultBanners />)

    expect(screen.queryByTestId('DisclosureBanner')).not.toBeInTheDocument()
    expect(screen.queryByTestId('NotAuthorizedBanner')).not.toBeInTheDocument()
    expect(screen.queryByTestId('btc-vault-eligibility-and-deposit-card')).not.toBeInTheDocument()
  })

  it('renders combined card with deposit window when connected, eligible, KYB passed, and epoch is open', () => {
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
    mockUseKybStatus.mockReturnValue({ status: 'passed' as const })
    render(<BtcVaultBanners />)

    expect(screen.getByTestId('btc-vault-eligibility-and-deposit-card')).toBeInTheDocument()
    expect(screen.getByTestId('deposit-window-section')).toBeInTheDocument()
    expect(screen.getByText(/DEPOSIT WINDOW 2/)).toBeInTheDocument()
    expect(screen.queryByTestId('eligibility-banner-content')).not.toBeInTheDocument()
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

  it('shows eligibility section when KYB status is none', () => {
    mockUseAccount.mockReturnValue({ address: '0x123', isConnected: true })
    mockUseActionEligibility.mockReturnValue({
      data: {
        canDeposit: true,
        canWithdraw: true,
        depositBlockReason: '',
        withdrawBlockReason: '',
      },
    })
    mockUseKybStatus.mockReturnValue({ status: 'none' as const })
    render(<BtcVaultBanners />)

    expect(screen.getByTestId('btc-vault-eligibility-and-deposit-card')).toBeInTheDocument()
    expect(screen.getByTestId('eligibility-banner-content')).toBeInTheDocument()
    expect(screen.getByText('Submit KYB')).toBeInTheDocument()
    expect(screen.getByText('ELIGIBILITY')).toBeInTheDocument()
  })

  it('shows eligibility section with Re-submit KYB when KYB status is rejected', () => {
    mockUseAccount.mockReturnValue({ address: '0x123', isConnected: true })
    mockUseActionEligibility.mockReturnValue({
      data: {
        canDeposit: true,
        canWithdraw: true,
        depositBlockReason: '',
        withdrawBlockReason: '',
      },
    })
    mockUseKybStatus.mockReturnValue({
      status: 'rejected' as const,
      rejectionReason: 'Document verification could not be completed.',
    })
    render(<BtcVaultBanners />)

    expect(screen.getByTestId('btc-vault-eligibility-and-deposit-card')).toBeInTheDocument()
    expect(screen.getByTestId('eligibility-banner-content')).toBeInTheDocument()
    expect(screen.getByText('Re-submit KYB')).toBeInTheDocument()
    expect(screen.getByTestId('eligibility-banner-rejected-icon')).toBeInTheDocument()
  })

  it('shows both eligibility and deposit window when KYB is none and epoch is open', () => {
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
    mockUseKybStatus.mockReturnValue({ status: 'none' as const })
    render(<BtcVaultBanners />)

    expect(screen.getByTestId('btc-vault-eligibility-and-deposit-card')).toBeInTheDocument()
    expect(screen.getByTestId('eligibility-banner-content')).toBeInTheDocument()
    expect(screen.getByTestId('deposit-window-section')).toBeInTheDocument()
  })
})
