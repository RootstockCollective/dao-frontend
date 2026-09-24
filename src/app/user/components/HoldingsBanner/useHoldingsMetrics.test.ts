import { renderHook } from '@testing-library/react'
import { parseEther } from 'viem'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import Big from '@/lib/big'

import { useHoldingsMetrics } from './useHoldingsMetrics'

const mocks = vi.hoisted(() => ({
  prices: vi.fn(),
  fetchPrices: vi.fn(),
  balances: vi.fn(),
  rewards: vi.fn(),
  votingPower: vi.fn(),
  allocation: vi.fn(),
}))

vi.mock('wagmi', () => ({
  useAccount: () => ({ address: '0x00000000000000000000000000000000000000ab' }),
}))
vi.mock('@/shared/context/PricesContext', () => ({ usePricesContext: () => mocks.prices() }))
vi.mock('@/app/user/Balances/hooks/useFetchPrices', () => ({ useFetchPrices: () => mocks.fetchPrices() }))
vi.mock('@/app/user/Balances/hooks/useGetAddressBalances', () => ({
  useGetAddressBalances: () => mocks.balances(),
}))
vi.mock('@/app/collective-rewards/rewards', () => ({
  useBackerRewardsContext: () => mocks.rewards(),
  getUnclaimedRewards: () => ({ byToken: [], total: Big(12.5) }),
}))
vi.mock('@/app/collective-rewards/allocations/hooks', () => ({
  useGetVotingPower: () => mocks.votingPower(),
}))
vi.mock('@/shared/hooks/contracts', () => ({
  useReadBackersManager: (...args: unknown[]) => mocks.allocation(...args),
}))

const loaded = { isLoading: false, error: null }

describe('useHoldingsMetrics', () => {
  beforeEach(() => {
    mocks.prices.mockReturnValue({ prices: {} })
    mocks.fetchPrices.mockReturnValue(loaded)
    mocks.balances.mockReturnValue({ balances: {}, isBalancesLoading: false })
    mocks.rewards.mockReturnValue({ data: {}, ...loaded })
    mocks.votingPower.mockReturnValue({ data: parseEther('100'), ...loaded })
    mocks.allocation.mockReturnValue({ data: parseEther('40'), ...loaded })
  })

  it('reports every metric as ready once its sources have loaded', () => {
    const { result } = renderHook(() => useHoldingsMetrics())

    expect(result.current.unclaimedRewards).toMatchObject({ status: 'ready' })
    expect(result.current.unclaimedRewards.value.toNumber()).toBe(12.5)
    expect(result.current.availableBackingPercentage).toEqual({ value: 60, status: 'ready' })
    expect(result.current.portfolioValue.status).toBe('ready')
    expect(result.current.error).toBeNull()
  })

  it('keeps available backing loading until the allocation arrives, instead of flashing 100%', () => {
    mocks.allocation.mockReturnValue({ data: undefined, isLoading: true, error: null })

    const { result } = renderHook(() => useHoldingsMetrics())

    expect(result.current.availableBackingPercentage).toEqual({ value: 0, status: 'loading' })
    // No placeholder is passed, so a missing allocation can never read as "nothing allocated"
    expect(mocks.allocation.mock.calls[0][1]).not.toHaveProperty('placeholderData')
  })

  it('marks only the metrics fed by a failing source as errored', () => {
    const error = new Error('rewards down')
    mocks.rewards.mockReturnValue({ data: {}, isLoading: false, error })

    const { result } = renderHook(() => useHoldingsMetrics())

    expect(result.current.unclaimedRewards.status).toBe('error')
    expect(result.current.availableBackingPercentage.status).toBe('ready')
    expect(result.current.portfolioValue.status).toBe('ready')
    expect(result.current.error).toBe(error)
  })

  it('waits for prices before valuing the portfolio or the rewards', () => {
    mocks.fetchPrices.mockReturnValue({ isLoading: true, error: null })

    const { result } = renderHook(() => useHoldingsMetrics())

    expect(result.current.portfolioValue.status).toBe('loading')
    expect(result.current.unclaimedRewards.status).toBe('loading')
  })

  it('keeps available backing within 0-100% when the reads land a block apart', () => {
    mocks.allocation.mockReturnValue({ data: parseEther('120'), ...loaded })

    const { result } = renderHook(() => useHoldingsMetrics())

    expect(result.current.availableBackingPercentage.value).toBe(0)
  })
})
