import type { ReactNode } from 'react'
import { describe, it, expect, beforeAll, vi } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import { TooltipProvider } from '@radix-ui/react-tooltip'
import { CapitalAllocationDonutChart } from './CapitalAllocationDonutChart'
import type { CapitalAllocationDisplay } from '@/app/btc-vault/services/ui/types'

function renderWithTooltip(ui: ReactNode) {
  return render(<TooltipProvider>{ui}</TooltipProvider>)
}

beforeAll(() => {
  global.ResizeObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  }))
})

const mockData50_25_25: CapitalAllocationDisplay = {
  categories: [
    { label: 'Deployed capital', amountFormatted: '0.52', percentFormatted: '50%', fiatAmountFormatted: '$25,000.00 USD' },
    { label: 'Liquidity reserve', amountFormatted: '0.26', percentFormatted: '25%', fiatAmountFormatted: '$12,500.00 USD' },
    { label: 'Unallocated capital', amountFormatted: '0.26', percentFormatted: '25%', fiatAmountFormatted: '$12,500.00 USD' },
  ],
  wallets: [],
}

const mockData80_10_10: CapitalAllocationDisplay = {
  categories: [
    { label: 'Deployed capital', amountFormatted: '0.80', percentFormatted: '80%', fiatAmountFormatted: '$40,000.00 USD' },
    { label: 'Liquidity reserve', amountFormatted: '0.10', percentFormatted: '10%', fiatAmountFormatted: '$5,000.00 USD' },
    { label: 'Unallocated capital', amountFormatted: '0.10', percentFormatted: '10%', fiatAmountFormatted: '$5,000.00 USD' },
  ],
  wallets: [],
}

const mockData100_0_0: CapitalAllocationDisplay = {
  categories: [
    { label: 'Deployed capital', amountFormatted: '1.00', percentFormatted: '100%', fiatAmountFormatted: '$50,000.00 USD' },
    { label: 'Liquidity reserve', amountFormatted: '0', percentFormatted: '0%', fiatAmountFormatted: '$0.00 USD' },
    { label: 'Unallocated capital', amountFormatted: '0', percentFormatted: '0%', fiatAmountFormatted: '$0.00 USD' },
  ],
  wallets: [],
}

describe('CapitalAllocationDonutChart', () => {
  it('renders donut chart and legend when given mock data with three categories', () => {
    renderWithTooltip(<CapitalAllocationDonutChart data={mockData50_25_25} isAnimationActive={false} />)

    expect(screen.getAllByTestId('capital-allocation-donut-chart').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByTestId('capital-allocation-legend').length).toBeGreaterThanOrEqual(1)
  })

  it('legend shows correct labels and formatted values for each category', () => {
    renderWithTooltip(<CapitalAllocationDonutChart data={mockData50_25_25} isAnimationActive={false} />)

    const legends = screen.getAllByTestId('capital-allocation-legend')
    const legend = legends[0]
    expect(within(legend).getByText('Deployed capital')).toBeInTheDocument()
    expect(within(legend).getByText('Liquidity reserve')).toBeInTheDocument()
    expect(within(legend).getByText('Unallocated capital')).toBeInTheDocument()

    expect(within(legend).getByText('0.52')).toBeInTheDocument()
    expect(within(legend).getByText('50%')).toBeInTheDocument()
    expect(within(legend).getByText('$25,000.00 USD')).toBeInTheDocument()

    expect(within(legend).getAllByText('0.26').length).toBeGreaterThanOrEqual(1)
    expect(within(legend).getAllByText('25%').length).toBeGreaterThanOrEqual(1)
    expect(within(legend).getAllByText('$12,500.00 USD').length).toBeGreaterThanOrEqual(1)
  })

  it('renders legend items with data-testid per category', () => {
    renderWithTooltip(<CapitalAllocationDonutChart data={mockData50_25_25} isAnimationActive={false} />)

    expect(screen.getAllByTestId('legend-deployed-capital').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByTestId('legend-liquidity-reserve').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByTestId('legend-unallocated-capital').length).toBeGreaterThanOrEqual(1)
  })

  it('handles one category 100% and others 0%', () => {
    renderWithTooltip(<CapitalAllocationDonutChart data={mockData100_0_0} isAnimationActive={false} />)

    expect(screen.getAllByTestId('capital-allocation-donut-chart').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByTestId('capital-allocation-legend').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText('Deployed capital').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText('Liquidity reserve').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText('Unallocated capital').length).toBeGreaterThanOrEqual(1)
  })

  it('renders empty state when all categories are zero', () => {
    const mockDataAllZero: CapitalAllocationDisplay = {
      categories: [
        { label: 'Deployed capital', amountFormatted: '0', percentFormatted: '0%', fiatAmountFormatted: '$0.00 USD' },
        { label: 'Liquidity reserve', amountFormatted: '0', percentFormatted: '0%', fiatAmountFormatted: '$0.00 USD' },
        { label: 'Unallocated capital', amountFormatted: '0', percentFormatted: '0%', fiatAmountFormatted: '$0.00 USD' },
      ],
      wallets: [],
    }

    const { container } = renderWithTooltip(
      <CapitalAllocationDonutChart data={mockDataAllZero} isAnimationActive={false} />,
    )

    expect(within(container).getAllByTestId('capital-allocation-donut-chart').length).toBeGreaterThanOrEqual(1)
    expect(within(container).getAllByTestId('capital-allocation-empty').length).toBeGreaterThanOrEqual(1)
    expect(within(container).getAllByText('No capital allocated yet').length).toBeGreaterThanOrEqual(1)
    expect(within(container).queryAllByTestId('capital-allocation-legend')).toHaveLength(0)
  })

  it('renders with custom className and data-testid', () => {
    renderWithTooltip(
      <CapitalAllocationDonutChart
        data={mockData80_10_10}
        className="custom-class"
        data-testid="custom-donut"
        isAnimationActive={false}
      />,
    )

    const wrappers = screen.getAllByTestId('custom-donut')
    expect(wrappers.length).toBeGreaterThanOrEqual(1)
    expect(wrappers[0]).toBeInTheDocument()
    expect(wrappers[0]).toHaveClass('custom-class')
  })
})
