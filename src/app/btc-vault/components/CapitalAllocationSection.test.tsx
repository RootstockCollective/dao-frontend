import type { ReactNode } from 'react'
import { cleanup, render, screen } from '@testing-library/react'
import { TooltipProvider } from '@radix-ui/react-tooltip'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, it, expect, vi, beforeAll, beforeEach } from 'vitest'

import { RBTC } from '@/lib/constants'

import type { CapitalAllocationDisplay } from '../services/ui/types'

vi.mock('../hooks/useCapitalAllocation', () => ({
  useCapitalAllocation: vi.fn(),
}))

vi.mock('@/components/Switch', () => {
  const React = require('react')
  return {
    Switch: ({
      children,
      checked,
      onCheckedChange,
      ...rest
    }: {
      children: React.ReactNode
      checked: boolean
      onCheckedChange: (v: boolean) => void
      'data-testid'?: string
    }) =>
      React.createElement(
        'button',
        {
          role: 'switch',
          'aria-checked': checked,
          'data-testid': rest['data-testid'],
          onClick: () => onCheckedChange(!checked),
        },
        children,
      ),
    SwitchThumb: () => null,
  }
})

beforeAll(() => {
  global.ResizeObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  }))
})

import { useCapitalAllocation } from '../hooks/useCapitalAllocation'
import { CapitalAllocationSection } from './CapitalAllocationSection'

const mockedUseCapitalAllocation = vi.mocked(useCapitalAllocation)

function Wrapper({ children }: { children: ReactNode }) {
  return <TooltipProvider>{children}</TooltipProvider>
}

const MOCK_DATA: CapitalAllocationDisplay = {
  categories: [
    {
      label: 'Deployed capital',
      amountFormatted: '0.52',
      percentFormatted: '50%',
      fiatAmountFormatted: '$26,000.00 USD',
    },
    {
      label: 'Liquidity reserve',
      amountFormatted: '0.26',
      percentFormatted: '25%',
      fiatAmountFormatted: '$13,000.00 USD',
    },
    {
      label: 'Unallocated capital',
      amountFormatted: '0.26',
      percentFormatted: '25%',
      fiatAmountFormatted: '$13,000.00 USD',
    },
  ],
}

describe('CapitalAllocationSection', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    cleanup()
  })

  it('renders three metric cards with correct labels when toggle is OFF', () => {
    mockedUseCapitalAllocation.mockReturnValue({
      data: MOCK_DATA,
      isLoading: false,
      isError: false,
    } as ReturnType<typeof useCapitalAllocation>)

    render(<CapitalAllocationSection />, { wrapper: Wrapper })

    expect(screen.getByTestId('capital-allocation-section')).toBeInTheDocument()
    expect(screen.getByText('CAPITAL ALLOCATION TRANSPARENCY')).toBeInTheDocument()
    expect(screen.getByTestId('capital-allocation-undetailed')).toBeInTheDocument()

    expect(screen.getByTestId('metric-deployed-capital')).toBeInTheDocument()
    expect(screen.getByTestId('metric-liquidity-reserve')).toBeInTheDocument()
    expect(screen.getByTestId('metric-unallocated-capital')).toBeInTheDocument()
  })

  it('displays formatted amounts with rBTC symbol, separator, percentages, and fiat values', () => {
    mockedUseCapitalAllocation.mockReturnValue({
      data: MOCK_DATA,
      isLoading: false,
      isError: false,
    } as ReturnType<typeof useCapitalAllocation>)

    render(<CapitalAllocationSection />, { wrapper: Wrapper })

    const deployed = screen.getByTestId('metric-deployed-capital')
    expect(deployed).toHaveTextContent('0.52')
    expect(deployed).toHaveTextContent(RBTC)
    expect(deployed).toHaveTextContent('|')
    expect(deployed).toHaveTextContent('50%')
    expect(deployed).toHaveTextContent('$26,000.00 USD')

    const reserve = screen.getByTestId('metric-liquidity-reserve')
    expect(reserve).toHaveTextContent('0.26')
    expect(reserve).toHaveTextContent('25%')
    expect(reserve).toHaveTextContent('$13,000.00 USD')

    const unallocated = screen.getByTestId('metric-unallocated-capital')
    expect(unallocated).toHaveTextContent('0.26')
    expect(unallocated).toHaveTextContent('25%')
    expect(unallocated).toHaveTextContent('$13,000.00 USD')
  })

  it('toggle defaults to OFF (undetailed view visible)', () => {
    mockedUseCapitalAllocation.mockReturnValue({
      data: MOCK_DATA,
      isLoading: false,
      isError: false,
    } as ReturnType<typeof useCapitalAllocation>)

    render(<CapitalAllocationSection />, { wrapper: Wrapper })

    const toggle = screen.getByTestId('detailed-view-toggle')
    expect(toggle).toHaveAttribute('aria-checked', 'false')
    expect(screen.getByTestId('capital-allocation-undetailed')).toBeInTheDocument()
    expect(screen.queryByTestId('capital-allocation-detailed')).not.toBeInTheDocument()
  })

  it('toggling ON shows detailed placeholder and hides metric cards', async () => {
    mockedUseCapitalAllocation.mockReturnValue({
      data: MOCK_DATA,
      isLoading: false,
      isError: false,
    } as ReturnType<typeof useCapitalAllocation>)

    render(<CapitalAllocationSection />, { wrapper: Wrapper })
    const user = userEvent.setup()

    const toggle = screen.getByTestId('detailed-view-toggle')
    await user.click(toggle)

    expect(screen.getByTestId('capital-allocation-detailed')).toBeInTheDocument()
    expect(screen.queryByTestId('capital-allocation-undetailed')).not.toBeInTheDocument()
  })

  it('returns null when hook returns an error', () => {
    mockedUseCapitalAllocation.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
    } as ReturnType<typeof useCapitalAllocation>)

    const { container } = render(<CapitalAllocationSection />)
    expect(container.innerHTML).toBe('')
  })

  it('returns null when not loading and data is undefined', () => {
    mockedUseCapitalAllocation.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: false,
    } as ReturnType<typeof useCapitalAllocation>)

    const { container } = render(<CapitalAllocationSection />)
    expect(container.innerHTML).toBe('')
  })

  it('shows loading placeholders when data is loading', () => {
    mockedUseCapitalAllocation.mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
    } as ReturnType<typeof useCapitalAllocation>)

    render(<CapitalAllocationSection />, { wrapper: Wrapper })

    expect(screen.getByTestId('capital-allocation-section')).toBeInTheDocument()
    expect(screen.getByTestId('metric-loading-0')).toBeInTheDocument()
    expect(screen.getByTestId('metric-loading-1')).toBeInTheDocument()
    expect(screen.getByTestId('metric-loading-2')).toBeInTheDocument()
  })

  it('renders the "Detailed view" label next to the toggle', () => {
    mockedUseCapitalAllocation.mockReturnValue({
      data: MOCK_DATA,
      isLoading: false,
      isError: false,
    } as ReturnType<typeof useCapitalAllocation>)

    render(<CapitalAllocationSection />, { wrapper: Wrapper })

    expect(screen.getByText('Detailed view')).toBeInTheDocument()
  })

  it('renders Contract Addresses and Fees Info sections with labels', () => {
    mockedUseCapitalAllocation.mockReturnValue({
      data: MOCK_DATA,
      isLoading: false,
      isError: false,
    } as ReturnType<typeof useCapitalAllocation>)

    render(<CapitalAllocationSection />, { wrapper: Wrapper })

    expect(screen.getByTestId('capital-allocation-contract-addresses')).toBeInTheDocument()
    expect(screen.getByText('CONTRACT ADDRESSES')).toBeInTheDocument()
    expect(screen.getByText('Vault address')).toBeInTheDocument()
    expect(screen.getByText('Share token contract')).toBeInTheDocument()

    expect(screen.getByTestId('capital-allocation-fees-info')).toBeInTheDocument()
    expect(screen.getByText('FEES INFO')).toBeInTheDocument()
    expect(screen.getByText('Deposit fee')).toBeInTheDocument()
    expect(screen.getByText('Redemption fee')).toBeInTheDocument()
    expect(screen.getByText('Annual management fee')).toBeInTheDocument()
    expect(screen.getByText('Performance fee')).toBeInTheDocument()
  })

  it('renders fee placeholder values in Fees Info section', () => {
    mockedUseCapitalAllocation.mockReturnValue({
      data: MOCK_DATA,
      isLoading: false,
      isError: false,
    } as ReturnType<typeof useCapitalAllocation>)

    render(<CapitalAllocationSection />, { wrapper: Wrapper })

    expect(screen.getByTestId('fee-deposit')).toHaveTextContent('15%')
    expect(screen.getByTestId('fee-redemption')).toHaveTextContent('15%')
    expect(screen.getByTestId('fee-annual-management')).toHaveTextContent('15%')
    expect(screen.getByTestId('fee-performance')).toHaveTextContent('15%')
  })
})
