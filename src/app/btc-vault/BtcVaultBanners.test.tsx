import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { cleanup, render, screen } from '@testing-library/react'

import { BtcVaultBanners } from './BtcVaultBanners'

const mockUseAccount = vi.fn()
const mockUseEpochState = vi.fn()
const mockUseKybStatus = vi.fn()

vi.mock('wagmi', async importOriginal => {
  const actual = await importOriginal<typeof import('wagmi')>()
  return {
    ...actual,
    useAccount: () => mockUseAccount(),
  }
})

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
    mockUseEpochState.mockReturnValue({ data: closedEpoch })
    mockUseKybStatus.mockReturnValue({
      status: 'passed' as const,
      submitKyb: vi.fn(),
    })
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

  it('renders deposit window above disclosure when wallet is not connected and epoch is open', () => {
    mockUseAccount.mockReturnValue({ address: undefined, isConnected: false })
    mockUseEpochState.mockReturnValue({ data: openEpoch })
    render(<BtcVaultBanners />)

    expect(screen.getByTestId('DisclosureBanner')).toBeInTheDocument()
    expect(screen.getByTestId('deposit-window-section')).toBeInTheDocument()
    expect(screen.getByText(/DEPOSIT WINDOW 2/)).toBeInTheDocument()
    expect(screen.getByText('DISCLOSURE')).toBeInTheDocument()
    expect(screen.getByTestId('DisclosureContent')).toBeInTheDocument()
    const depositSection = screen.getByTestId('deposit-window-section')
    const disclosure = screen.getByText('DISCLOSURE').closest('div')
    expect(disclosure).toBeInTheDocument()
    expect(depositSection.compareDocumentPosition(disclosure!)).toBe(Node.DOCUMENT_POSITION_FOLLOWING)
  })

  it('renders combined card with KYB-approved message when connected, KYB passed, and epoch is closed', () => {
    mockUseAccount.mockReturnValue({ address: '0x123', isConnected: true })
    mockUseEpochState.mockReturnValue({ data: closedEpoch })
    mockUseKybStatus.mockReturnValue({
      status: 'passed' as const,
      submitKyb: vi.fn(),
    })
    render(<BtcVaultBanners />)

    expect(screen.queryByTestId('DisclosureBanner')).not.toBeInTheDocument()
    expect(screen.getByTestId('btc-vault-eligibility-and-deposit-card')).toBeInTheDocument()
    expect(screen.getByText('KYB approved. Deposit window is currently closed.')).toBeInTheDocument()
    expect(screen.queryByTestId('deposit-window-section')).not.toBeInTheDocument()
  })

  it('renders combined card with deposit window when connected, KYB passed, and epoch is open', () => {
    mockUseAccount.mockReturnValue({ address: '0x123', isConnected: true })
    mockUseEpochState.mockReturnValue({ data: openEpoch })
    mockUseKybStatus.mockReturnValue({
      status: 'passed' as const,
      submitKyb: vi.fn(),
    })
    render(<BtcVaultBanners />)

    expect(screen.getByTestId('btc-vault-eligibility-and-deposit-card')).toBeInTheDocument()
    expect(screen.getByTestId('deposit-window-section')).toBeInTheDocument()
    expect(screen.getByText(/DEPOSIT WINDOW 2/)).toBeInTheDocument()
    expect(screen.queryByTestId('eligibility-banner-content')).not.toBeInTheDocument()
    expect(screen.queryByTestId('DisclosureBanner')).not.toBeInTheDocument()
  })

  it('shows eligibility section when connected and KYB status is none', () => {
    mockUseAccount.mockReturnValue({ address: '0x123', isConnected: true })
    mockUseKybStatus.mockReturnValue({
      status: 'none' as const,
      submitKyb: vi.fn(),
    })
    render(<BtcVaultBanners />)

    expect(screen.getByTestId('btc-vault-eligibility-and-deposit-card')).toBeInTheDocument()
    expect(screen.getByTestId('eligibility-banner-content')).toBeInTheDocument()
    expect(screen.getByText('Submit KYB')).toBeInTheDocument()
    expect(screen.getByText('ELIGIBILITY')).toBeInTheDocument()
  })

  it('shows eligibility section with Re-submit KYB when connected and KYB status is rejected', () => {
    mockUseAccount.mockReturnValue({ address: '0x123', isConnected: true })
    mockUseKybStatus.mockReturnValue({
      status: 'rejected' as const,
      rejectionReason: 'Document verification could not be completed.',
      submitKyb: vi.fn(),
    })
    render(<BtcVaultBanners />)

    expect(screen.getByTestId('btc-vault-eligibility-and-deposit-card')).toBeInTheDocument()
    expect(screen.getByTestId('eligibility-banner-content')).toBeInTheDocument()
    expect(screen.getByText('Re-submit KYB')).toBeInTheDocument()
    expect(screen.getByTestId('eligibility-banner-rejected-icon')).toBeInTheDocument()
  })

  it('shows both eligibility and deposit window when connected, KYB is none, and epoch is open', () => {
    mockUseAccount.mockReturnValue({ address: '0x123', isConnected: true })
    mockUseEpochState.mockReturnValue({ data: openEpoch })
    mockUseKybStatus.mockReturnValue({
      status: 'none' as const,
      submitKyb: vi.fn(),
    })
    render(<BtcVaultBanners />)

    expect(screen.getByTestId('btc-vault-eligibility-and-deposit-card')).toBeInTheDocument()
    expect(screen.getByTestId('eligibility-banner-content')).toBeInTheDocument()
    expect(screen.getByTestId('deposit-window-section')).toBeInTheDocument()
  })
})
