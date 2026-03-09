import { cleanup, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest'

import type { WalletBalanceDisplay } from '../../services/ui/types'

import { WalletBalancesTable } from './WalletBalancesTable'

beforeAll(() => {
  global.ResizeObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  }))
})

const MOCK_WALLETS: WalletBalanceDisplay[] = [
  {
    label: 'Fordefi 1',
    trackingPlatform: 'Nimbus',
    trackingUrl: 'https://app.nimbus.io',
    amountFormatted: '999.99999',
    fiatAmountFormatted: '$282.00 USD',
    percentFormatted: '96.49%',
  },
  {
    label: 'Fordefi 2',
    trackingPlatform: 'Nimbus',
    trackingUrl: 'https://app.nimbus.io',
    amountFormatted: '9.99999',
    fiatAmountFormatted: '$282.00 USD',
    percentFormatted: '0.5%',
  },
  {
    label: 'Fordefi 3',
    trackingPlatform: 'Suivision',
    trackingUrl: 'https://suivision.xyz',
    amountFormatted: '9.99999',
    fiatAmountFormatted: '$282.00 USD',
    percentFormatted: '0.5%',
  },
  {
    label: 'Fordefi 4',
    trackingPlatform: 'Nimbus',
    trackingUrl: 'https://app.nimbus.io',
    amountFormatted: '9.99999',
    fiatAmountFormatted: '$282.00 USD',
    percentFormatted: '0.5%',
  },
  {
    label: 'Fordefi 5',
    trackingPlatform: 'Nimbus',
    trackingUrl: 'https://app.nimbus.io',
    amountFormatted: '9.99999',
    fiatAmountFormatted: '$282.00 USD',
    percentFormatted: '0.5%',
  },
  {
    label: 'Fordefi 6',
    trackingPlatform: 'Nimbus',
    trackingUrl: 'https://app.nimbus.io',
    amountFormatted: '9.99999',
    fiatAmountFormatted: '$282.00 USD',
    percentFormatted: '0.5%',
  },
  {
    label: 'Fordefi 7',
    trackingPlatform: 'Nimbus',
    trackingUrl: 'https://app.nimbus.io',
    amountFormatted: '9.99999',
    fiatAmountFormatted: '$282.00 USD',
    percentFormatted: '0.5%',
  },
  {
    label: 'Fordefi 8',
    trackingPlatform: 'Nimbus',
    trackingUrl: 'https://app.nimbus.io',
    amountFormatted: '9.99999',
    fiatAmountFormatted: '$282.00 USD',
    percentFormatted: '0.51%',
  },
]

describe('WalletBalancesTable', () => {
  afterEach(() => {
    cleanup()
  })

  it('renders table with column headers', () => {
    render(<WalletBalancesTable wallets={MOCK_WALLETS} />)

    expect(screen.getByTestId('wallet-balances-table')).toBeInTheDocument()
    expect(screen.getByText('On-chain wallets')).toBeInTheDocument()
    expect(screen.getByText('Tracking')).toBeInTheDocument()
    expect(screen.getByText('Balance')).toBeInTheDocument()
    expect(screen.getByText('Percentage')).toBeInTheDocument()
  })

  it('displays the first 5 wallets by default', () => {
    render(<WalletBalancesTable wallets={MOCK_WALLETS} />)

    expect(screen.getByText('Fordefi 1')).toBeInTheDocument()
    expect(screen.getByText('Fordefi 5')).toBeInTheDocument()
    expect(screen.queryByText('Fordefi 6')).not.toBeInTheDocument()
    expect(screen.queryByText('Fordefi 8')).not.toBeInTheDocument()
  })

  it('renders summary row with aggregated totals', () => {
    render(<WalletBalancesTable wallets={MOCK_WALLETS} />)

    const summary = screen.getByTestId('wallet-summary-row')
    expect(summary).toBeInTheDocument()
    expect(within(summary).getByText('100.00%')).toBeInTheDocument()
    expect(within(summary).getByText('1069.99992')).toBeInTheDocument()
    expect(within(summary).getByText('$2256.00 USD')).toBeInTheDocument()
  })

  it('shows "Show all wallets" button when wallets exceed default visible count', () => {
    render(<WalletBalancesTable wallets={MOCK_WALLETS} />)

    expect(screen.getByTestId('show-all-wallets-button')).toBeInTheDocument()
    expect(screen.getByText('Show all wallets')).toBeInTheDocument()
  })

  it('does not show "Show all wallets" button when wallets are within limit', () => {
    render(<WalletBalancesTable wallets={MOCK_WALLETS.slice(0, 3)} />)

    expect(screen.queryByTestId('show-all-wallets-button')).not.toBeInTheDocument()
  })

  it('clicking "Show all wallets" reveals all rows', async () => {
    render(<WalletBalancesTable wallets={MOCK_WALLETS} />)
    const user = userEvent.setup()

    expect(screen.queryByText('Fordefi 8')).not.toBeInTheDocument()

    await user.click(screen.getByTestId('show-all-wallets-button'))

    expect(screen.getByText('Fordefi 6')).toBeInTheDocument()
    expect(screen.getByText('Fordefi 7')).toBeInTheDocument()
    expect(screen.getByText('Fordefi 8')).toBeInTheDocument()
    expect(screen.getByText('Show fewer wallets')).toBeInTheDocument()
  })

  it('renders empty state when wallets array is empty', () => {
    render(<WalletBalancesTable wallets={[]} />)

    expect(screen.getByTestId('wallet-balances-table')).toBeInTheDocument()
    expect(screen.getByText('No wallets configured')).toBeInTheDocument()
    expect(screen.queryByTestId('wallet-summary-row')).not.toBeInTheDocument()
    expect(screen.queryByTestId('wallet-grid-table')).not.toBeInTheDocument()
  })

  it('tracking links open in new tab with correct href', () => {
    render(<WalletBalancesTable wallets={MOCK_WALLETS.slice(0, 3)} />)

    const nimbusLink = screen.getByTestId('tracking-link-0')
    expect(nimbusLink).toHaveAttribute('href', 'https://app.nimbus.io')
    expect(nimbusLink).toHaveAttribute('target', '_blank')

    const suivisionLink = screen.getByTestId('tracking-link-2')
    expect(suivisionLink).toHaveAttribute('href', 'https://suivision.xyz')
    expect(suivisionLink).toHaveAttribute('target', '_blank')
  })

  it('renders wallet amounts and fiat values', () => {
    render(<WalletBalancesTable wallets={MOCK_WALLETS.slice(0, 1)} />)

    expect(screen.getAllByText('999.99999').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText('$282.00 USD').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText('96.49%').length).toBeGreaterThanOrEqual(1)
  })
})
