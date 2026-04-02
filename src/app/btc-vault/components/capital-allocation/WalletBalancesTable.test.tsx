import { cleanup, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

import { useIsDesktop } from '@/shared/hooks/useIsDesktop'

import type { WalletBalanceDisplay } from '../../services/ui/types'
import { WalletBalancesTable } from './WalletBalancesTable'

vi.mock('@/shared/hooks/useIsDesktop', () => ({
  useIsDesktop: vi.fn(() => true),
}))

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

  beforeEach(() => {
    vi.mocked(useIsDesktop).mockReturnValue(true)
  })

  it('renders table with column headers showing totals for balance and percentage', () => {
    render(<WalletBalancesTable wallets={MOCK_WALLETS} />)

    expect(screen.getByTestId('wallet-balances-table')).toBeInTheDocument()
    expect(screen.getByTestId('wallet-balances-table')).toHaveClass('w-full', 'md:overflow-x-auto')
    expect(screen.getByTestId('wallet-grid-table')).toHaveClass('min-w-0', 'md:min-w-[540px]')
    expect(screen.getByText('On-chain wallet')).toBeInTheDocument()
    expect(screen.getByText('Tracking')).toBeInTheDocument()
    expect(screen.getByText('1069.99992')).toBeInTheDocument()
    expect(screen.getByText('$2256.00')).toBeInTheDocument()
    expect(screen.getByText('100.00%')).toBeInTheDocument()
  })

  it('sorts by percentage descending by default', () => {
    render(<WalletBalancesTable wallets={MOCK_WALLETS} />)

    const rows = screen.getAllByRole('row')
    const firstDataRow = rows[0]
    expect(within(firstDataRow).getByText('Fordefi 1')).toBeInTheDocument()
  })

  it('displays the first 5 wallets by default (sorted by % desc)', () => {
    render(<WalletBalancesTable wallets={MOCK_WALLETS} />)

    // Default sort: Fordefi 1 (96.49%), Fordefi 8 (0.51%), Fordefi 2-4 (0.5%)
    expect(screen.getByText('Fordefi 1')).toBeInTheDocument()
    expect(screen.getByText('Fordefi 8')).toBeInTheDocument()
    expect(screen.getByText('Fordefi 2')).toBeInTheDocument()
    expect(screen.queryByText('Fordefi 5')).not.toBeInTheDocument()
    expect(screen.queryByText('Fordefi 6')).not.toBeInTheDocument()
  })

  it('shows aggregated totals in column headers', () => {
    render(<WalletBalancesTable wallets={MOCK_WALLETS} />)

    expect(screen.queryByTestId('wallet-summary-row')).not.toBeInTheDocument()
    expect(screen.getByText('1069.99992')).toBeInTheDocument()
    expect(screen.getByText('$2256.00')).toBeInTheDocument()
    expect(screen.getByText('100.00%')).toBeInTheDocument()
  })

  it('shows "Show all wallets" button when wallets exceed default visible count', () => {
    render(<WalletBalancesTable wallets={MOCK_WALLETS} />)

    expect(screen.getByTestId('show-all-wallets-button')).toBeInTheDocument()
    expect(screen.getByTestId('show-all-wallets-button')).toHaveClass('h-11')
    expect(screen.getByText('Show all wallets')).toBeInTheDocument()
  })

  it('does not show "Show all wallets" button when wallets are within limit', () => {
    render(<WalletBalancesTable wallets={MOCK_WALLETS.slice(0, 3)} />)

    expect(screen.queryByTestId('show-all-wallets-button')).not.toBeInTheDocument()
  })

  it('clicking "Show all wallets" reveals all rows', async () => {
    render(<WalletBalancesTable wallets={MOCK_WALLETS} />)
    const user = userEvent.setup()

    // With default % desc sort, Fordefi 5 is outside first 5
    expect(screen.queryByText('Fordefi 5')).not.toBeInTheDocument()

    await user.click(screen.getByTestId('show-all-wallets-button'))

    expect(screen.getByText('Fordefi 5')).toBeInTheDocument()
    expect(screen.getByText('Fordefi 6')).toBeInTheDocument()
    expect(screen.getByText('Fordefi 7')).toBeInTheDocument()
    expect(screen.getByText('Show fewer wallets')).toBeInTheDocument()
  })

  it('renders empty state when wallets array is empty', () => {
    render(<WalletBalancesTable wallets={[]} />)

    expect(screen.getByTestId('wallet-balances-table')).toBeInTheDocument()
    expect(screen.getByText('No wallets configured')).toBeInTheDocument()
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
    expect(screen.getAllByText('$282.00').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText('96.49%').length).toBeGreaterThanOrEqual(1)
  })

  describe('sorting', () => {
    const SORT_WALLETS: WalletBalanceDisplay[] = [
      {
        label: 'Charlie Wallet',
        trackingPlatform: 'Nimbus',
        trackingUrl: 'https://app.nimbus.io',
        amountFormatted: '50.5',
        fiatAmountFormatted: '$5050.00 USD',
        percentFormatted: '30%',
      },
      {
        label: 'Alpha Wallet',
        trackingPlatform: 'Suivision',
        trackingUrl: 'https://suivision.xyz',
        amountFormatted: '200.0',
        fiatAmountFormatted: '$20000.00 USD',
        percentFormatted: '60%',
      },
      {
        label: 'Bravo Wallet',
        trackingPlatform: 'Nimbus',
        trackingUrl: 'https://app.nimbus.io',
        amountFormatted: '9.99',
        fiatAmountFormatted: '$999.00 USD',
        percentFormatted: '10%',
      },
    ]

    const getRowLabels = () =>
      screen
        .getAllByRole('row')
        .map(row => within(row).queryByText(/Wallet/)?.textContent)
        .filter(Boolean)

    it('clicking "On-chain wallet" header sorts rows alphabetically', async () => {
      const user = userEvent.setup()
      render(<WalletBalancesTable wallets={SORT_WALLETS} />)

      await user.click(screen.getByTestId('ColumnHeader-wallet'))

      const labelsAsc = getRowLabels()
      expect(labelsAsc).toEqual(['Alpha Wallet', 'Bravo Wallet', 'Charlie Wallet'])

      await user.click(screen.getByTestId('ColumnHeader-wallet'))

      const labelsDesc = getRowLabels()
      expect(labelsDesc).toEqual(['Charlie Wallet', 'Bravo Wallet', 'Alpha Wallet'])
    })

    it('clicking "Balance" header sorts rows by numeric amount', async () => {
      const user = userEvent.setup()
      render(<WalletBalancesTable wallets={SORT_WALLETS} />)

      await user.click(screen.getByTestId('ColumnHeader-balance'))

      const labelsAsc = getRowLabels()
      expect(labelsAsc).toEqual(['Bravo Wallet', 'Charlie Wallet', 'Alpha Wallet'])

      await user.click(screen.getByTestId('ColumnHeader-balance'))

      const labelsDesc = getRowLabels()
      expect(labelsDesc).toEqual(['Alpha Wallet', 'Charlie Wallet', 'Bravo Wallet'])
    })

    it('clicking "Percentage" header sorts rows by numeric percentage', async () => {
      const user = userEvent.setup()
      render(<WalletBalancesTable wallets={SORT_WALLETS} />)

      // Default state is already desc — first click clears, second click → asc
      await user.click(screen.getByTestId('ColumnHeader-percentage'))
      await user.click(screen.getByTestId('ColumnHeader-percentage'))

      const labelsAsc = getRowLabels()
      expect(labelsAsc).toEqual(['Bravo Wallet', 'Charlie Wallet', 'Alpha Wallet'])

      await user.click(screen.getByTestId('ColumnHeader-percentage'))

      const labelsDesc = getRowLabels()
      expect(labelsDesc).toEqual(['Alpha Wallet', 'Charlie Wallet', 'Bravo Wallet'])
    })

    it('sorting applies to all wallets, not just the visible subset', async () => {
      const user = userEvent.setup()
      const manyWallets: WalletBalanceDisplay[] = [
        ...MOCK_WALLETS.slice(0, 5),
        {
          label: 'AAA First',
          trackingPlatform: 'Nimbus',
          trackingUrl: 'https://app.nimbus.io',
          amountFormatted: '0.001',
          fiatAmountFormatted: '$0.10 USD',
          percentFormatted: '0.01%',
        },
      ]
      render(<WalletBalancesTable wallets={manyWallets} />)

      expect(screen.queryByText('AAA First')).not.toBeInTheDocument()

      await user.click(screen.getByTestId('ColumnHeader-wallet'))

      expect(screen.getByText('AAA First')).toBeInTheDocument()
    })
  })

  describe('mobile viewport (useIsDesktop false)', () => {
    beforeEach(() => {
      vi.mocked(useIsDesktop).mockReturnValue(false)
    })

    it('matches proposals mobile: no table header row; collapsed card shows wallet name only', () => {
      render(<WalletBalancesTable wallets={MOCK_WALLETS} />)

      expect(screen.queryAllByRole('columnheader')).toHaveLength(0)
      expect(screen.queryByTestId('ColumnHeader-wallet')).not.toBeInTheDocument()
      expect(screen.queryByText('On-chain wallet')).not.toBeInTheDocument()
      expect(screen.queryByText('1069.99992')).not.toBeInTheDocument()
      expect(screen.getByTestId('wallet-mobile-row-0')).toHaveTextContent('Fordefi 1')
    })

    it('uses expandable rows instead of GridTable and keeps full-width wrapper without overflow-x-auto', () => {
      render(<WalletBalancesTable wallets={MOCK_WALLETS} />)

      const wrapper = screen.getByTestId('wallet-balances-table')
      expect(wrapper).toHaveClass('w-full', 'md:overflow-x-auto')
      expect(wrapper.className.split(/\s+/).filter(Boolean)).not.toContain('overflow-x-auto')

      expect(screen.queryByTestId('wallet-grid-table')).not.toBeInTheDocument()
      expect(screen.getByTestId('wallet-balances-mobile')).toBeInTheDocument()
      expect(screen.getByTestId('wallet-mobile-row-0')).toBeInTheDocument()
    })

    it('keeps show-all working; tracking link is in expandable content after expand', async () => {
      const user = userEvent.setup()
      render(<WalletBalancesTable wallets={MOCK_WALLETS} />)

      expect(screen.getByTestId('show-all-wallets-button')).toHaveClass('h-11')

      expect(screen.queryAllByText('Fordefi 5')).toHaveLength(0)
      await user.click(screen.getByTestId('show-all-wallets-button'))
      expect(screen.getAllByText('Fordefi 5').length).toBeGreaterThanOrEqual(1)

      const firstRow = screen.getByTestId('wallet-mobile-row-0')
      await user.click(within(firstRow).getByTestId('ExpandableTrigger'))
      const nimbusLink = within(firstRow).getByRole('link', { name: 'Nimbus' })
      expect(nimbusLink).toHaveAttribute('href', 'https://app.nimbus.io')
    })
  })
})
