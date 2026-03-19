import { TooltipProvider } from '@radix-ui/react-tooltip'
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { RBTC } from '@/lib/constants'

import { BtcVaultMetrics } from './BtcVaultMetrics'

const renderWithProviders = () =>
  render(
    <TooltipProvider>
      <BtcVaultMetrics />
    </TooltipProvider>,
  )

const mockUseVaultMetrics = vi.fn()
const mockUseEpochState = vi.fn()
const mockPrices: Record<string, { price: number }> = {}

vi.mock('../hooks/useVaultMetrics', () => ({
  useVaultMetrics: () => mockUseVaultMetrics(),
}))

vi.mock('../hooks/useEpochState', () => ({
  useEpochState: () => mockUseEpochState(),
}))

vi.mock('@/shared/context', () => ({
  usePricesContext: () => ({ prices: mockPrices }),
}))

describe('BtcVaultMetrics', () => {
  afterEach(() => {
    cleanup()
    for (const key of Object.keys(mockPrices)) {
      delete mockPrices[key]
    }
  })

  const defaultMetrics = {
    tvlFormatted: '50',
    apyFormatted: '8.50',
    pricePerShareFormatted: '1.02',
    timestamp: 1709000000,
    tvlRaw: 50_000_000_000_000_000_000n,
    pricePerShareRaw: 1_020_000_000_000_000_000n,
  }

  /** Epoch open with endTime 23 Feb 2025 00:00 UTC → "closing on February 23" */
  const defaultEpochOpen = {
    epochId: '1',
    status: 'open' as const,
    statusSummary: 'Closes in 1m 0s',
    isAcceptingRequests: true,
    endTime: 1740268800,
    closesAtFormatted: '23 Feb 2025',
  }

  beforeEach(() => {
    mockUseVaultMetrics.mockReturnValue({
      data: defaultMetrics,
      isLoading: false,
    })
    mockUseEpochState.mockReturnValue({
      data: defaultEpochOpen,
      isLoading: false,
    })
  })

  it('renders exactly four metric columns and the history link', () => {
    renderWithProviders()

    expect(screen.getByTestId('btc-vault-metrics-content')).toBeInTheDocument()
    expect(screen.getByTestId('btc-vault-tvl')).toBeInTheDocument()
    expect(screen.getByTestId('btc-vault-apy')).toBeInTheDocument()
    expect(screen.getByTestId('btc-vault-deposit-window')).toBeInTheDocument()
    expect(screen.getByTestId('btc-vault-price-per-share')).toBeInTheDocument()
    expect(screen.getByTestId('btc-vault-metrics-history-link')).toBeInTheDocument()
  })

  it('shows APY (est.) label', () => {
    renderWithProviders()

    expect(screen.getByTestId('btc-vault-apy')).toHaveTextContent('APY (est.)')
  })

  it('displays Deposit window with epochId and closing on date when epoch is open', () => {
    renderWithProviders()

    const depositWindow = screen.getByTestId('btc-vault-deposit-window')
    expect(depositWindow).toHaveTextContent('Deposit window 1')
    expect(depositWindow).toHaveTextContent('closing on February 23')
  })

  it('displays TVL with value, percentage (or placeholder), and token symbol', () => {
    renderWithProviders()

    const tvl = screen.getByTestId('btc-vault-tvl')
    expect(tvl).toHaveTextContent('50')
    expect(tvl).toHaveTextContent(RBTC)
    expect(tvl).toHaveTextContent('—')
  })

  it('displays TVL with tvlPercentFormatted when provided', () => {
    mockUseVaultMetrics.mockReturnValue({
      data: { ...defaultMetrics, tvlPercentFormatted: '12.34%' },
      isLoading: false,
    })

    renderWithProviders()

    const tvl = screen.getByTestId('btc-vault-tvl')
    expect(tvl).toHaveTextContent('50')
    expect(tvl).toHaveTextContent('12.34%')
  })

  it('shows Last updated on under APY from metrics timestamp', () => {
    renderWithProviders()

    const apy = screen.getByTestId('btc-vault-apy')
    expect(apy).toHaveTextContent('Last updated on')
    expect(apy).toHaveTextContent('Feb 27, 2024')
  })

  it('shows USD fiat amounts when rBTC price is available', () => {
    mockPrices[RBTC] = { price: 50000 }

    renderWithProviders()

    const tvl = screen.getByTestId('btc-vault-tvl')
    expect(tvl).toHaveTextContent('$')
    expect(tvl).toHaveTextContent('USD')

    const pps = screen.getByTestId('btc-vault-price-per-share')
    expect(pps).toHaveTextContent('$')
    expect(pps).toHaveTextContent('USD')
  })

  it('displays Price per Share with token symbol', () => {
    renderWithProviders()

    const pps = screen.getByTestId('btc-vault-price-per-share')
    expect(pps).toHaveTextContent('1.02')
    expect(pps).toHaveTextContent(RBTC)
  })

  it('does not show fiat amounts when rBTC price is unavailable', () => {
    renderWithProviders()

    const tvl = screen.getByTestId('btc-vault-tvl')
    expect(tvl).not.toHaveTextContent('USD')

    const pps = screen.getByTestId('btc-vault-price-per-share')
    expect(pps).not.toHaveTextContent('USD')
  })

  it('shows deposit window placeholder when epoch is not open', () => {
    mockUseEpochState.mockReturnValue({
      data: {
        ...defaultEpochOpen,
        status: 'settling',
        isAcceptingRequests: false,
      },
      isLoading: false,
    })

    renderWithProviders()

    const depositWindow = screen.getByTestId('btc-vault-deposit-window')
    expect(depositWindow).toHaveTextContent('Deposit window 1')
    expect(depositWindow).toHaveTextContent('—')
    expect(depositWindow).not.toHaveTextContent('closing on')
  })

  it('renders View history link', () => {
    renderWithProviders()

    const link = screen.getByTestId('btc-vault-metrics-history-link')
    expect(link).toHaveTextContent('View history')
    expect(link).toHaveAttribute('href', '/btc-vault/deposit-history')
  })

  it('shows error message when useVaultMetrics returns error', () => {
    mockUseVaultMetrics.mockReturnValue({
      data: null,
      isLoading: false,
      error: new Error('Failed to load metrics'),
    })

    renderWithProviders()

    const errorEl = screen.getByTestId('btc-vault-metrics-error')
    expect(errorEl).toBeInTheDocument()
    expect(errorEl).toHaveTextContent(/failed to load metrics/i)
  })

  it('shows placeholders when metrics are loading', () => {
    mockUseVaultMetrics.mockReturnValue({
      data: undefined,
      isLoading: true,
    })

    renderWithProviders()

    expect(screen.getByTestId('btc-vault-tvl')).toHaveTextContent('...')
    expect(screen.getByTestId('btc-vault-price-per-share')).toHaveTextContent('...')
  })
})
