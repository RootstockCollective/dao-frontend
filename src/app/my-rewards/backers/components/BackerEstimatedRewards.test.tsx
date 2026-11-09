import { TooltipProvider } from '@radix-ui/react-tooltip'
import { cleanup, render, screen } from '@testing-library/react'
import { parseEther } from 'viem'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { TOKENS } from '@/lib/tokens'

import { BackerEstimatedRewards } from './BackerEstimatedRewards'

const mocks = vi.hoisted(() => ({
  distributionStatus: vi.fn(),
  estimatedRewards: vi.fn(),
}))

vi.mock('@/app/collective-rewards/metrics', async importOriginal => ({
  ...(await importOriginal<typeof import('@/app/collective-rewards/metrics')>()),
  useCycleDistributionStatus: () => mocks.distributionStatus(),
}))
vi.mock('@/app/collective-rewards/utils', () => ({ useHandleErrors: vi.fn() }))
vi.mock('../hooks/useBackerEstimatedRewards', () => ({
  useBackerEstimatedRewards: () => mocks.estimatedRewards(),
}))
vi.mock('@/shared/context', () => ({
  usePricesContext: () => ({ prices: { [TOKENS.rif.symbol]: { price: 0.1 } } }),
}))

const tokenRewards = (amount: bigint, isLoading = false) => ({ amount, isLoading, error: null })

const renderCard = () =>
  render(
    <TooltipProvider>
      <BackerEstimatedRewards />
    </TooltipProvider>,
  )

describe('BackerEstimatedRewards', () => {
  afterEach(cleanup)

  beforeEach(() => {
    mocks.distributionStatus.mockReturnValue({ data: 'distributed', isLoading: false })
    mocks.estimatedRewards.mockReturnValue({
      rif: tokenRewards(parseEther('25')),
      rbtc: tokenRewards(0n),
      usdrif: tokenRewards(0n),
    })
  })

  it('shows the estimate once the cycle was distributed', () => {
    renderCard()

    expect(screen.getByText(/2\.50/)).toBeInTheDocument()
    expect(screen.queryByTestId('DistributionPending')).not.toBeInTheDocument()
  })

  it.each(['pending', 'missed'])('shows "Distribution pending" instead of 0.00 when it is %s', status => {
    mocks.distributionStatus.mockReturnValue({ data: status, isLoading: false })
    mocks.estimatedRewards.mockReturnValue({
      rif: tokenRewards(0n),
      rbtc: tokenRewards(0n),
      usdrif: tokenRewards(0n),
    })

    renderCard()

    expect(screen.getByText('Distribution pending')).toBeInTheDocument()
    expect(screen.queryByText(/0\.00/)).not.toBeInTheDocument()
  })

  it('falls back to the estimate when the distribution status is unknown', () => {
    mocks.distributionStatus.mockReturnValue({ data: undefined, isLoading: false })

    renderCard()

    expect(screen.getByText(/2\.50/)).toBeInTheDocument()
    expect(screen.queryByTestId('DistributionPending')).not.toBeInTheDocument()
  })

  it('keeps loading until the distribution status arrives, instead of flashing the estimate', () => {
    mocks.distributionStatus.mockReturnValue({ data: undefined, isLoading: true })

    renderCard()

    expect(screen.queryByText(/2\.50/)).not.toBeInTheDocument()
    expect(screen.queryByTestId('DistributionPending')).not.toBeInTheDocument()
  })
})
