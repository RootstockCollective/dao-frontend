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
    expect(screen.getByTestId('MyMetricsTitle')).toHaveTextContent('MY METRICS')
  })

  it('renders 7 BalanceInfo metrics when connected with data', () => {
    render(<BtcVaultDashboard />, { wrapper: Wrapper })

    expect(screen.getByTestId('Metric-Wallet')).toBeInTheDocument()
    expect(screen.getByTestId('Metric-VaultShares')).toBeInTheDocument()
    expect(screen.getByTestId('Metric-ShareOfVault')).toBeInTheDocument()
    expect(screen.getByTestId('Metric-Principal')).toBeInTheDocument()
    expect(screen.getByTestId('Metric-Earnings')).toBeInTheDocument()
    expect(screen.getByTestId('Metric-TotalBalance')).toBeInTheDocument()
    expect(screen.getByTestId('Metric-YieldPercent')).toBeInTheDocument()
  })

  it('displays formatted amounts from useUserPosition data', () => {
    render(<BtcVaultDashboard />, { wrapper: Wrapper })

    expect(screen.getByTestId('Metric-Wallet')).toHaveTextContent('2')
    expect(screen.getByTestId('Metric-VaultShares')).toHaveTextContent('5')
    expect(screen.getByTestId('Metric-ShareOfVault')).toHaveTextContent('10.20%')
    expect(screen.getByTestId('Metric-Principal')).toHaveTextContent('5')
    expect(screen.getByTestId('Metric-Earnings')).toHaveTextContent('0.1')
    expect(screen.getByTestId('Metric-TotalBalance')).toHaveTextContent('5.1')
    expect(screen.getByTestId('Metric-YieldPercent')).toHaveTextContent('2.00%')
  })

  it('displays fiat amounts for applicable metrics', () => {
    render(<BtcVaultDashboard />, { wrapper: Wrapper })

    expect(screen.getByTestId('Metric-Wallet')).toHaveTextContent('$47,500.00 USD')
    expect(screen.getByTestId('Metric-VaultShares')).toHaveTextContent('$121,125.00 USD')
    expect(screen.getByTestId('Metric-Principal')).toHaveTextContent('$118,750.00 USD')
    expect(screen.getByTestId('Metric-TotalBalance')).toHaveTextContent('$121,125.00 USD')
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
})
