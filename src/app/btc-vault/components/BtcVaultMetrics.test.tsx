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
const mockPrices: Record<string, { price: number }> = {}

vi.mock('../hooks/useVaultMetrics', () => ({
  useVaultMetrics: () => mockUseVaultMetrics(),
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

  beforeEach(() => {
    mockUseVaultMetrics.mockReturnValue({
      data: defaultMetrics,
      isLoading: false,
    })
  })

  it('renders exactly three metrics and the history link', () => {
    renderWithProviders()

    expect(screen.getByTestId('btc-vault-metrics-content')).toBeInTheDocument()
    expect(screen.getByTestId('btc-vault-tvl')).toBeInTheDocument()
    expect(screen.getByTestId('btc-vault-apy')).toBeInTheDocument()
    expect(screen.getByTestId('btc-vault-price-per-share')).toBeInTheDocument()
    expect(screen.getByTestId('btc-vault-metrics-history-link')).toBeInTheDocument()
    expect(screen.queryByTestId('btc-vault-deposit-window')).not.toBeInTheDocument()
  })

  it('displays TVL with token symbol', () => {
    renderWithProviders()

    const tvl = screen.getByTestId('btc-vault-tvl')
    expect(tvl).toHaveTextContent('50')
    expect(tvl).toHaveTextContent(RBTC)
  })

  it('displays Price Per Share with token symbol', () => {
    renderWithProviders()

    const pps = screen.getByTestId('btc-vault-price-per-share')
    expect(pps).toHaveTextContent('1.02')
    expect(pps).toHaveTextContent(RBTC)
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

  it('does not show fiat amounts when rBTC price is unavailable', () => {
    renderWithProviders()

    const tvl = screen.getByTestId('btc-vault-tvl')
    expect(tvl).not.toHaveTextContent('USD')

    const pps = screen.getByTestId('btc-vault-price-per-share')
    expect(pps).not.toHaveTextContent('USD')
  })

  it('shows APY with tooltip disclaimer', () => {
    renderWithProviders()

    expect(screen.getByTestId('btc-vault-apy')).toHaveTextContent('8.50')
  })

  it('renders View request history link', () => {
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
