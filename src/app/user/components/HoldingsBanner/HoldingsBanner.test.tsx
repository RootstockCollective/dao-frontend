import { cleanup, render, screen, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import Big from '@/lib/big'

import { HoldingsBanner } from './HoldingsBanner'
import type { HoldingsMetricStatus } from './useHoldingsMetrics'

const mocks = vi.hoisted(() => ({
  account: vi.fn(),
  metrics: vi.fn(),
  handleErrors: vi.fn(),
}))

vi.mock('wagmi', () => ({ useAccount: () => mocks.account() }))
vi.mock('./useHoldingsMetrics', () => ({ useHoldingsMetrics: () => mocks.metrics() }))
vi.mock('@/app/collective-rewards/utils', () => ({ useHandleErrors: mocks.handleErrors }))
vi.mock('@/app/collective-rewards/rewards', () => ({
  BackerRewardsContextProvider: ({ children }: { children: React.ReactNode }) => children,
}))

const metrics = (status: HoldingsMetricStatus, error: Error | null = null) => ({
  unclaimedRewards: { value: Big(1234.5), status },
  availableBackingPercentage: { value: 60.4, status },
  portfolioValue: { value: Big(99), status },
  error,
})

describe('HoldingsBanner', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.account.mockReturnValue({ address: '0x00000000000000000000000000000000000000ab', isConnected: true })
  })

  afterEach(cleanup)

  it('holds a skeleton for every metric while loading, never a zero', () => {
    mocks.metrics.mockReturnValue(metrics('loading'))

    render(<HoldingsBanner />)

    expect(screen.getAllByTestId('HoldingsMetricSkeleton')).toHaveLength(3)
    expect(screen.getByTestId('HoldingsUnclaimedRewards')).toHaveAttribute('aria-busy', 'true')
    expect(screen.getByTestId('HoldingsMetrics')).not.toHaveTextContent('$0')
    expect(screen.getByTestId('HoldingsMetrics')).not.toHaveTextContent('%')
  })

  it('shows the values once they are ready', () => {
    mocks.metrics.mockReturnValue(metrics('ready'))

    render(<HoldingsBanner />)

    expect(screen.queryByTestId('HoldingsMetricSkeleton')).not.toBeInTheDocument()
    expect(screen.getByTestId('HoldingsUnclaimedRewards')).toHaveTextContent('1,234.5')
    expect(screen.getByTestId('HoldingsAvailableBacking')).toHaveTextContent('60%')
    expect(screen.getByTestId('HoldingsUnclaimedRewards')).toHaveAttribute('aria-busy', 'false')
  })

  it('shows a dash for a metric that failed and reports the error', () => {
    const error = new Error('rewards down')
    mocks.metrics.mockReturnValue({ ...metrics('ready', error), unclaimedRewards: { value: Big(0), status: 'error' } })

    render(<HoldingsBanner />)

    const unclaimed = screen.getByTestId('HoldingsUnclaimedRewards')
    expect(unclaimed).toHaveTextContent('—')
    expect(within(unclaimed).getByText('Unavailable')).toBeInTheDocument()
    expect(unclaimed).not.toHaveTextContent('$0')
    expect(mocks.handleErrors).toHaveBeenCalledWith({ error, title: 'Error loading your holdings' })
  })

  it('shows no metrics without a connected wallet', () => {
    mocks.account.mockReturnValue({ address: undefined, isConnected: false })

    render(<HoldingsBanner />)

    expect(screen.getByText('Holdings')).toBeInTheDocument()
    expect(screen.queryByTestId('HoldingsMetrics')).not.toBeInTheDocument()
    expect(mocks.metrics).not.toHaveBeenCalled()
  })
})
