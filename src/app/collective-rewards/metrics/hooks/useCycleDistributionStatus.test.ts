import { renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { useCycleDistributionStatus } from './useCycleDistributionStatus'

const CYCLE_START = 1_760_000_000n
const DISTRIBUTION_DURATION = 3_600
const END_DISTRIBUTION_WINDOW = CYCLE_START + BigInt(DISTRIBUTION_DURATION)
const CYCLE_NEXT = CYCLE_START + 1_209_600n
const NOW = CYCLE_START + 3_000n

type Read = { data?: unknown; isLoading: boolean; error: Error | null }

const mocks = vi.hoisted(() => ({
  reads: {} as Record<string, Read>,
  readArgs: {} as Record<string, unknown>,
  lastCycleRewards: { data: undefined as unknown, isLoading: false },
  now: 0n,
}))

vi.mock('./useIntervalTimestamp', () => ({ useIntervalTimestamp: () => mocks.now }))
vi.mock('@/shared/hooks/contracts', () => ({
  useReadBackersManager: ({ functionName, args }: { functionName: string; args?: unknown }) => {
    mocks.readArgs[functionName] = args
    return mocks.reads[functionName]
  },
}))
vi.mock('@/app/collective-rewards/shared/hooks/useGetLastCycleRewardsWithStateSync', () => ({
  useGetLastCycleRewardsWithStateSync: () => mocks.lastCycleRewards,
}))

const loaded = (data: unknown): Read => ({ data, isLoading: false, error: null })

const cycleRewards = (currentCycleStart: bigint, amount: string) => ({
  data: [
    {
      id: '0x01',
      currentCycleStart: Number(currentCycleStart),
      rewardPerToken: { '0xrif': amount, '0xusdrif': amount, '0xrbtc': amount },
    },
  ],
  isLoading: false,
})

const givenChain = ({
  periodFinish,
  onDistributionPeriod = false,
  now = NOW,
}: {
  periodFinish: bigint
  onDistributionPeriod?: boolean
  now?: bigint
}) => {
  mocks.now = now
  mocks.reads = {
    periodFinish: loaded(periodFinish),
    onDistributionPeriod: loaded(onDistributionPeriod),
    distributionDuration: loaded(DISTRIBUTION_DURATION),
    cycleStart: loaded(CYCLE_START),
  }
}

describe('useCycleDistributionStatus', () => {
  beforeEach(() => {
    givenChain({ periodFinish: CYCLE_NEXT })
    mocks.lastCycleRewards = cycleRewards(CYCLE_START, '1000')
  })

  it('is distributed once the reward period runs until the next cycle', () => {
    const { result } = renderHook(() => useCycleDistributionStatus())

    expect(result.current).toEqual({ data: 'distributed', isLoading: false })
  })

  it('is pending when the cycle started without a distribution and the window is still open', () => {
    givenChain({ periodFinish: CYCLE_START })

    const { result } = renderHook(() => useCycleDistributionStatus())

    expect(result.current.data).toBe('pending')
  })

  it('is missed when the distribution window closed without a distribution', () => {
    givenChain({ periodFinish: CYCLE_START, now: END_DISTRIBUTION_WINDOW })

    const { result } = renderHook(() => useCycleDistributionStatus())

    expect(result.current.data).toBe('missed')
  })

  it('stays pending while a batched distribution keeps running after the window closed', () => {
    givenChain({ periodFinish: CYCLE_START, onDistributionPeriod: true, now: END_DISTRIBUTION_WINDOW + 60n })

    const { result } = renderHook(() => useCycleDistributionStatus())

    expect(result.current.data).toBe('pending')
  })

  it('is not distributed when the period finishes exactly now', () => {
    givenChain({ periodFinish: NOW })

    const { result } = renderHook(() => useCycleDistributionStatus())

    expect(result.current.data).toBe('pending')
  })

  it('asks for the start of the cycle the current timestamp falls in', () => {
    renderHook(() => useCycleDistributionStatus())

    expect(mocks.readArgs.cycleStart).toEqual([NOW])
  })

  describe('when this cycle was distributed with an empty pot', () => {
    beforeEach(() => {
      mocks.lastCycleRewards = cycleRewards(CYCLE_START, '0')
    })

    it('is missed once the window closed', () => {
      givenChain({ periodFinish: CYCLE_NEXT, now: END_DISTRIBUTION_WINDOW })

      const { result } = renderHook(() => useCycleDistributionStatus())

      expect(result.current.data).toBe('missed')
    })

    it('is pending while the window is open, since a funded distribution can still follow', () => {
      const { result } = renderHook(() => useCycleDistributionStatus())

      expect(result.current.data).toBe('pending')
    })
  })

  it('ignores an empty distribution from a previous cycle', () => {
    mocks.lastCycleRewards = cycleRewards(CYCLE_START - 1_209_600n, '0')

    const { result } = renderHook(() => useCycleDistributionStatus())

    expect(result.current.data).toBe('distributed')
  })

  it('trusts the chain when state-sync has not indexed the distribution yet', () => {
    mocks.lastCycleRewards = { data: undefined, isLoading: false }

    const { result } = renderHook(() => useCycleDistributionStatus())

    expect(result.current).toEqual({ data: 'distributed', isLoading: false })
  })

  it('keeps loading a distributed cycle until its rewards arrive, instead of flashing 0.00', () => {
    mocks.lastCycleRewards = { data: undefined, isLoading: true }

    const { result } = renderHook(() => useCycleDistributionStatus())

    expect(result.current.isLoading).toBe(true)
  })

  it('has no status while the period finish loads, instead of reporting a pending distribution', () => {
    mocks.reads.periodFinish = { data: undefined, isLoading: true, error: null }

    const { result } = renderHook(() => useCycleDistributionStatus())

    expect(result.current).toEqual({ data: undefined, isLoading: true })
  })

  it('keeps loading an undistributed cycle until it can tell pending from missed', () => {
    givenChain({ periodFinish: CYCLE_START })
    mocks.reads.onDistributionPeriod = { data: undefined, isLoading: true, error: null }

    const { result } = renderHook(() => useCycleDistributionStatus())

    expect(result.current).toEqual({ data: undefined, isLoading: true })
  })

  it('has no status when an undistributed cycle cannot tell pending from missed', () => {
    givenChain({ periodFinish: CYCLE_START })
    mocks.reads.distributionDuration = { data: undefined, isLoading: false, error: new Error('rpc down') }

    const { result } = renderHook(() => useCycleDistributionStatus())

    expect(result.current).toEqual({ data: undefined, isLoading: false })
  })
})
