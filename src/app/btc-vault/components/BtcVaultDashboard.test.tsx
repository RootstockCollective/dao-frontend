import { cleanup, render, screen } from '@testing-library/react'
import { TooltipProvider } from '@radix-ui/react-tooltip'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { ReactNode } from 'react'

import type { UserPositionDisplay } from '../services/ui/types'
import { BtcVaultDashboard } from './BtcVaultDashboard'

function Wrapper({ children }: { children: ReactNode }) {
  return <TooltipProvider>{children}</TooltipProvider>
}

const mockUseAccount = vi.fn()
const mockUseUserPosition = vi.fn()

vi.mock('wagmi', () => ({
  useAccount: () => mockUseAccount(),
}))

vi.mock('../hooks/useUserPosition/useUserPosition', () => ({
  useUserPosition: (address: string | undefined) => mockUseUserPosition(address),
}))

vi.mock('./BtcVaultActions', () => ({
  BtcVaultActions: () => <div data-testid="btc-vault-actions" />,
}))

const MOCK_DISPLAY: UserPositionDisplay = {
  rbtcBalanceFormatted: '2',
  vaultTokensFormatted: '5',
  positionValueFormatted: '5.1',
  percentOfVaultFormatted: '10.20%',
  vaultTokensRaw: 5_000_000_000_000_000_000n,
  rbtcBalanceRaw: 2_000_000_000_000_000_000n,
  totalDepositedPrincipalFormatted: '5',
  totalDepositedPrincipalRaw: 5_000_000_000_000_000_000n,
  currentEarningsFormatted: '0.1',
  totalBalanceFormatted: '5.1',
  totalBalanceRaw: 5_100_000_000_000_000_000n,
  yieldPercentToDateFormatted: '2.00%',
  fiatWalletBalance: '$47,500.00 USD',
  fiatVaultShares: '$121,125.00 USD',
  fiatPrincipalDeposited: '$118,750.00 USD',
  fiatTotalBalance: '$121,125.00 USD',
}

describe('BtcVaultDashboard', () => {
  beforeEach(() => {
    mockUseAccount.mockReturnValue({ address: '0x123', isConnected: true })
    mockUseUserPosition.mockReturnValue({ data: MOCK_DISPLAY, isLoading: false })
  })

  afterEach(() => {
    cleanup()
    vi.clearAllMocks()
  })

  it('renders MY METRICS title when connected', () => {
    render(<BtcVaultDashboard />, { wrapper: Wrapper })
    expect(screen.getByTestId('btc-vault-my-metrics-title')).toHaveTextContent('MY METRICS')
  })

  it('applies accent background to the entire dashboard section', () => {
    render(<BtcVaultDashboard />, { wrapper: Wrapper })
    expect(screen.getByTestId('btc-vault-dashboard')).toHaveClass('bg-v3-bg-accent-80')
  })

  it('renders 7 BalanceInfo metrics when connected with data', () => {
    render(<BtcVaultDashboard />, { wrapper: Wrapper })

    expect(screen.getByTestId('metric-wallet')).toBeInTheDocument()
    expect(screen.getByTestId('metric-vault-shares')).toBeInTheDocument()
    expect(screen.getByTestId('metric-share-of-vault')).toBeInTheDocument()
    expect(screen.getByTestId('metric-principal')).toBeInTheDocument()
    expect(screen.getByTestId('metric-earnings')).toBeInTheDocument()
    expect(screen.getByTestId('metric-total-balance')).toBeInTheDocument()
    expect(screen.getByTestId('metric-yield-percent')).toBeInTheDocument()
  })

  it('displays formatted amounts from useUserPosition data', () => {
    render(<BtcVaultDashboard />, { wrapper: Wrapper })

    expect(screen.getByTestId('metric-wallet')).toHaveTextContent('2')
    expect(screen.getByTestId('metric-vault-shares')).toHaveTextContent('5')
    expect(screen.getByTestId('metric-share-of-vault')).toHaveTextContent('10.20%')
    expect(screen.getByTestId('metric-principal')).toHaveTextContent('5')
    expect(screen.getByTestId('metric-earnings')).toHaveTextContent('0.1')
    expect(screen.getByTestId('metric-total-balance')).toHaveTextContent('5.1')
    expect(screen.getByTestId('metric-yield-percent')).toHaveTextContent('2.00%')
  })

  it('displays fiat amounts for applicable metrics', () => {
    render(<BtcVaultDashboard />, { wrapper: Wrapper })

    expect(screen.getByTestId('metric-wallet')).toHaveTextContent('$47,500.00 USD')
    expect(screen.getByTestId('metric-vault-shares')).toHaveTextContent('$121,125.00 USD')
    expect(screen.getByTestId('metric-principal')).toHaveTextContent('$118,750.00 USD')
    expect(screen.getByTestId('metric-total-balance')).toHaveTextContent('$121,125.00 USD')
  })

  it('shows pulsing zero placeholders when isLoading', () => {
    mockUseUserPosition.mockReturnValue({ data: undefined, isLoading: true })
    render(<BtcVaultDashboard />, { wrapper: Wrapper })

    const placeholders = screen.getAllByText('0')
    expect(placeholders.length).toBe(7)
    placeholders.forEach(el => {
      expect(el).toHaveClass('animate-pulse')
    })
  })

  it('shows zeros for empty position — no dashes', () => {
    const emptyDisplay: UserPositionDisplay = {
      rbtcBalanceFormatted: '0',
      vaultTokensFormatted: '0',
      positionValueFormatted: '0',
      percentOfVaultFormatted: '0.00%',
      vaultTokensRaw: 0n,
      rbtcBalanceRaw: 0n,
      totalDepositedPrincipalFormatted: '0',
      totalDepositedPrincipalRaw: 0n,
      currentEarningsFormatted: '0',
      totalBalanceFormatted: '0',
      totalBalanceRaw: 0n,
      yieldPercentToDateFormatted: '0.00%',
      fiatWalletBalance: '$0.00 USD',
      fiatVaultShares: '$0.00 USD',
      fiatPrincipalDeposited: '$0.00 USD',
      fiatTotalBalance: '$0.00 USD',
    }
    mockUseUserPosition.mockReturnValue({ data: emptyDisplay, isLoading: false })
    render(<BtcVaultDashboard />, { wrapper: Wrapper })

    expect(screen.getByTestId('metric-vault-shares')).toHaveTextContent('0')
    expect(screen.getByTestId('metric-share-of-vault')).toHaveTextContent('0.00%')
    expect(screen.getByTestId('metric-principal')).toHaveTextContent('0')
    expect(screen.getByTestId('metric-earnings')).toHaveTextContent('0')
    expect(screen.getByTestId('metric-total-balance')).toHaveTextContent('0')
    expect(screen.getByTestId('metric-yield-percent')).toHaveTextContent('0.00%')

    const dashboard = screen.getByTestId('btc-vault-dashboard')
    expect(dashboard.textContent).not.toContain('—')
    expect(dashboard.textContent).not.toContain('- ')
  })

  it('renders tooltip icons on all metrics that have tooltips', () => {
    render(<BtcVaultDashboard />, { wrapper: Wrapper })

    const metricsWithTooltips = [
      'metric-wallet',
      'metric-vault-shares',
      'metric-share-of-vault',
      'metric-earnings',
      'metric-total-balance',
      'metric-yield-percent',
    ]

    metricsWithTooltips.forEach(testId => {
      const metric = screen.getByTestId(testId)
      expect(metric.querySelector('[data-testid="TooltipIcon"]')).toBeInTheDocument()
    })
  })

  it('shows nav links with history icons when history exists', () => {
    render(<BtcVaultDashboard />, { wrapper: Wrapper })

    expect(screen.getByTestId('btc-vault-nav-links')).toBeInTheDocument()
    expect(screen.getByText('View history')).toBeInTheDocument()
    expect(screen.getByText('View yield history')).toBeInTheDocument()

    const icons = screen.getByTestId('btc-vault-nav-links').querySelectorAll('[aria-label="History Icon"]')
    expect(icons.length).toBe(2)
  })

  it('hides nav links when user has no vault tokens (no history)', () => {
    const emptyDisplay: UserPositionDisplay = {
      ...MOCK_DISPLAY,
      vaultTokensRaw: 0n,
    }
    mockUseUserPosition.mockReturnValue({ data: emptyDisplay, isLoading: false })
    render(<BtcVaultDashboard />, { wrapper: Wrapper })

    expect(screen.queryByTestId('btc-vault-nav-links')).not.toBeInTheDocument()
  })

  it('returns null when wallet is disconnected', () => {
    mockUseAccount.mockReturnValue({ address: undefined, isConnected: false })
    const { container } = render(<BtcVaultDashboard />)
    expect(container.innerHTML).toBe('')
  })

  it('returns null when address is undefined but isConnected is true', () => {
    mockUseAccount.mockReturnValue({ address: undefined, isConnected: true })
    const { container } = render(<BtcVaultDashboard />)
    expect(container.innerHTML).toBe('')
  })

  it('shows dashes for all metrics when useUserPosition returns an error', () => {
    mockUseUserPosition.mockReturnValue({ data: undefined, isLoading: false, isError: true })
    render(<BtcVaultDashboard />, { wrapper: Wrapper })

    const dashes = screen.getAllByText('—')
    expect(dashes.length).toBe(7)
  })
})
