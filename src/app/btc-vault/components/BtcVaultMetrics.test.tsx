import { TooltipProvider } from '@radix-ui/react-tooltip'
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { BtcVaultMetrics } from './BtcVaultMetrics'

const renderWithProviders = () =>
  render(
    <TooltipProvider>
      <BtcVaultMetrics />
    </TooltipProvider>,
  )

const mockUseVaultMetrics = vi.fn()
const mockUseEpochState = vi.fn()

vi.mock('../hooks/useVaultMetrics', () => ({
  useVaultMetrics: () => mockUseVaultMetrics(),
}))

vi.mock('../hooks/useEpochState', () => ({
  useEpochState: () => mockUseEpochState(),
}))

describe('BtcVaultMetrics', () => {
  afterEach(() => {
    cleanup()
  })

  const defaultMetrics = {
    tvlFormatted: '50',
    apyFormatted: '8.50',
    navFormatted: '1.02',
    timestamp: 1709000000,
  }

  const defaultEpoch = {
    epochId: '1',
    status: 'open' as const,
    statusSummary: 'Closes in 5m',
    isAcceptingRequests: true,
    endTime: Math.floor(Date.now() / 1000) + 86400,
    closesAtFormatted: '23 Feb 2025',
  }

  beforeEach(() => {
    mockUseVaultMetrics.mockReturnValue({
      data: defaultMetrics,
      isLoading: false,
    })
    mockUseEpochState.mockReturnValue({
      data: defaultEpoch,
      isLoading: false,
    })
  })

  it('renders all five overview elements without wallet connection', () => {
    renderWithProviders()

    expect(screen.getByTestId('btc-vault-metrics-content')).toBeInTheDocument()
    expect(screen.getAllByTestId('btc-vault-tvl')[0]).toBeInTheDocument()
    expect(screen.getAllByTestId('btc-vault-apy')[0]).toBeInTheDocument()
    expect(screen.getAllByTestId('btc-vault-nav')[0]).toBeInTheDocument()
    expect(screen.getByTestId('btc-vault-apy-disclosure')).toBeInTheDocument()
    expect(screen.getByTestId('btc-vault-epoch-state')).toBeInTheDocument()
  })

  it('displays TVL and NAV with rBTC', () => {
    renderWithProviders()

    const tvl = screen.getAllByTestId('btc-vault-tvl')[0]
    const nav = screen.getAllByTestId('btc-vault-nav')[0]
    expect(tvl).toHaveTextContent('50')
    expect(tvl).toHaveTextContent('rBTC')
    expect(nav).toHaveTextContent('1.02')
    expect(nav).toHaveTextContent('rBTC')
  })

  it('shows APY with estimated / non-guaranteed disclaimer', () => {
    renderWithProviders()

    expect(screen.getAllByTestId('btc-vault-apy')[0]).toHaveTextContent('8.50')
    expect(screen.getAllByTestId('apy-disclaimer')[0]).toHaveTextContent(
      'estimated / non-guaranteed',
    )
  })

  it('shows NAV last update timestamp', () => {
    renderWithProviders()

    const navUpdated = screen.getAllByTestId('nav-last-updated')[0]
    expect(navUpdated).toHaveTextContent('Updated')
    expect(navUpdated.textContent).toMatch(/2024/)
  })

  it('shows pending indicator when epoch status is closed', () => {
    mockUseEpochState.mockReturnValue({
      data: {
        ...defaultEpoch,
        status: 'closed',
        isAcceptingRequests: false,
        statusSummary: 'Settling',
      },
      isLoading: false,
    })

    renderWithProviders()

    expect(screen.getAllByTestId('nav-pending-indicator')[0]).toHaveTextContent(
      'Pending',
    )
  })

  it('shows pending indicator when epoch status is settling', () => {
    mockUseEpochState.mockReturnValue({
      data: {
        ...defaultEpoch,
        status: 'settling',
        isAcceptingRequests: false,
        statusSummary: 'Settling',
      },
      isLoading: false,
    })

    renderWithProviders()

    expect(screen.getAllByTestId('nav-pending-indicator')[0]).toHaveTextContent(
      'Pending',
    )
  })

  it('does not show pending indicator when epoch is open', () => {
    renderWithProviders()

    expect(screen.queryByTestId('nav-pending-indicator')).not.toBeInTheDocument()
  })

  it('shows Open – accepting requests when epoch is open', () => {
    renderWithProviders()

    expect(screen.getAllByTestId('epoch-state-value')[0]).toHaveTextContent(
      'Open – accepting requests',
    )
  })

  it('shows Closed – settling when epoch is not accepting requests', () => {
    mockUseEpochState.mockReturnValue({
      data: {
        ...defaultEpoch,
        status: 'closed',
        isAcceptingRequests: false,
        statusSummary: 'Settling',
      },
      isLoading: false,
    })

    renderWithProviders()

    expect(screen.getAllByTestId('epoch-state-value')[0]).toHaveTextContent(
      'Closed – settling',
    )
  })

  it('displays auto-compound disclosure', () => {
    renderWithProviders()

    expect(screen.getByTestId('btc-vault-apy-disclosure')).toHaveTextContent(
      'Yield is automatically compounded into the vault NAV.',
    )
  })

  it('shows placeholders when metrics are loading', () => {
    mockUseVaultMetrics.mockReturnValue({
      data: undefined,
      isLoading: true,
    })

    renderWithProviders()

    expect(screen.getAllByTestId('btc-vault-tvl')[0]).toHaveTextContent('...')
    expect(screen.getAllByTestId('btc-vault-nav')[0]).toHaveTextContent('...')
  })
})
