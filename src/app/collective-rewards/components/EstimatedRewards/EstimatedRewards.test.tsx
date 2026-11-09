import { TooltipProvider } from '@radix-ui/react-tooltip'
import { cleanup, render, screen } from '@testing-library/react'
import { DateTime } from 'luxon'
import { parseEther } from 'viem'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { TOKENS } from '@/lib/tokens'

import { EstimatedRewards } from './EstimatedRewards'

const CYCLE_START = 1_760_000_000

const mocks = vi.hoisted(() => ({
  distributionStatus: vi.fn(),
  lastCycleRewards: vi.fn(),
  cycle: { cycleStart: 0, isLoading: false, error: null as Error | null },
}))

vi.mock('@/app/collective-rewards/metrics', async importOriginal => ({
  ...(await importOriginal<typeof import('@/app/collective-rewards/metrics')>()),
  useCycleContext: () => ({
    data: { cycleStart: DateTime.fromSeconds(mocks.cycle.cycleStart) },
    isLoading: mocks.cycle.isLoading,
    error: mocks.cycle.error,
  }),
  useCycleDistributionStatus: () => mocks.distributionStatus(),
}))
vi.mock('@/app/collective-rewards/shared/hooks', () => ({
  useGetLastCycleRewardsWithStateSync: () => mocks.lastCycleRewards(),
  useGetLastCycleRewardsFromChain: () => mocks.lastCycleRewards(),
}))
vi.mock('@/app/collective-rewards/utils', () => ({ useHandleErrors: vi.fn() }))
vi.mock('@/shared/context/PricesContext', () => ({
  usePricesContext: () => ({ prices: { [TOKENS.rif.symbol]: { price: 0.1 } } }),
}))

const distribution = (currentCycleStart: number, rif = parseEther('25')) => ({
  id: String(currentCycleStart),
  currentCycleStart,
  rewardPerToken: { [TOKENS.rif.address.toLowerCase()]: rif.toString() },
})

const lastCycleRewards = (...data: ReturnType<typeof distribution>[]) => ({
  data,
  isLoading: false,
  error: null,
})

const renderMetric = () =>
  render(
    <TooltipProvider>
      <EstimatedRewards />
    </TooltipProvider>,
  )

describe('EstimatedRewards', () => {
  afterEach(cleanup)

  beforeEach(() => {
    mocks.cycle = { cycleStart: CYCLE_START, isLoading: false, error: null }
    mocks.distributionStatus.mockReturnValue({ data: 'distributed', isLoading: false })
    mocks.lastCycleRewards.mockReturnValue(lastCycleRewards(distribution(CYCLE_START)))
  })

  it('shows the rewards distributed at the start of this cycle', () => {
    renderMetric()

    expect(screen.getByText(/2\.50/)).toBeInTheDocument()
    expect(screen.queryByTestId('DistributionPending')).not.toBeInTheDocument()
  })

  it.each(['pending', 'missed'])('shows "Distribution pending" instead of 0.00 when it is %s', status => {
    mocks.distributionStatus.mockReturnValue({ data: status, isLoading: false })
    mocks.lastCycleRewards.mockReturnValue(lastCycleRewards(distribution(CYCLE_START - 1_209_600)))

    renderMetric()

    expect(screen.getByText('Distribution pending')).toBeInTheDocument()
    expect(screen.queryByText(/0\.00/)).not.toBeInTheDocument()
  })

  it('adds up every distribution of this cycle, instead of showing only the last, empty one', () => {
    mocks.lastCycleRewards.mockReturnValue(
      lastCycleRewards(
        distribution(CYCLE_START + 92, 0n),
        distribution(CYCLE_START + 60),
        distribution(CYCLE_START - 1_209_600),
      ),
    )

    renderMetric()

    expect(screen.getByText(/2\.50/)).toBeInTheDocument()
  })

  it('waits for the cycle to be read, instead of adding up every past distribution', () => {
    mocks.cycle = { cycleStart: 0, isLoading: true, error: null }
    mocks.lastCycleRewards.mockReturnValue(
      lastCycleRewards(distribution(CYCLE_START), distribution(CYCLE_START - 1_209_600)),
    )

    renderMetric()

    expect(screen.queryByText(/5\.00/)).not.toBeInTheDocument()
    expect(screen.queryByText(/2\.50/)).not.toBeInTheDocument()
  })

  it('shows 0.00 when the cycle read failed, instead of loading forever or adding up every past distribution', () => {
    mocks.cycle = { cycleStart: 0, isLoading: false, error: new Error('rpc down') }
    mocks.lastCycleRewards.mockReturnValue(
      lastCycleRewards(distribution(CYCLE_START), distribution(CYCLE_START - 1_209_600)),
    )

    renderMetric()

    expect(screen.getByText(/0\.00/)).toBeInTheDocument()
    expect(screen.queryByText(/5\.00/)).not.toBeInTheDocument()
  })

  it('falls back to the amount when the distribution status is unknown', () => {
    mocks.distributionStatus.mockReturnValue({ data: undefined, isLoading: false })

    renderMetric()

    expect(screen.getByText(/2\.50/)).toBeInTheDocument()
    expect(screen.queryByTestId('DistributionPending')).not.toBeInTheDocument()
  })

  it('treats a malformed amount as 0 instead of crashing the metric', () => {
    mocks.lastCycleRewards.mockReturnValue({
      data: [
        { ...distribution(CYCLE_START), rewardPerToken: { [TOKENS.rif.address.toLowerCase()]: 'oops' } },
      ],
      isLoading: false,
      error: null,
    })

    renderMetric()

    expect(screen.getByText(/0\.00/)).toBeInTheDocument()
  })
})
