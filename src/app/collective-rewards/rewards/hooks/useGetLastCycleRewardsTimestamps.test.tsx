import {
  useGetRewardDistributionFinishedLogs,
  useGetLastCycleRewardsTimestamps,
  RewardDistributionFinishedEventLog,
} from '@/app/collective-rewards/rewards'
import { describe, expect, it, vi } from 'vitest'
import { Cycle } from '@/app/collective-rewards/metrics'
import { DateTime, Duration } from 'luxon'

vi.mock('@/app/collective-rewards/rewards/hooks/useGetRewardDistributionFinishedLogs', () => {
  return {
    useGetRewardDistributionFinishedLogs: vi.fn(),
  }
})

describe('useGetLastCycleRewardsTimestamps', () => {
  type Log = RewardDistributionFinishedEventLog[number] & { timeStamp: number }
  const startTimestamp = 1733011200 // 2024-12-01 00:00:00
  const duration = 1209600 //  14 days
  const distributionWindow = 3600 // 1 hour
  const cycle: Cycle = {
    cycleStart: DateTime.fromSeconds(startTimestamp),
    cycleNext: DateTime.fromSeconds(startTimestamp + duration),
    cycleDuration: Duration.fromObject({ seconds: duration }),
    fistCycleStart: DateTime.fromSeconds(startTimestamp),
    endDistributionWindow: DateTime.fromSeconds(distributionWindow),
  }
  const { cycleStart, cycleDuration } = cycle
  const lastCycleStart = cycle.cycleStart.minus({ seconds: cycleDuration.as('seconds') })

  it('should return a 0 time difference when there are no distributions', () => {
    vi.mocked(useGetRewardDistributionFinishedLogs).mockImplementation(() => {
      return {
        data: [],
        isLoading: false,
        error: null,
      }
    })

    const { data } = useGetLastCycleRewardsTimestamps(cycle)

    expect(data).toEqual({
      fromTimestamp: lastCycleStart.toSeconds(),
      toTimestamp: lastCycleStart.toSeconds(),
    })
  })

  it('should return a 0 time difference when there is only one distribution and happened in the previous cycle', () => {
    vi.mocked(useGetRewardDistributionFinishedLogs).mockImplementation(() => {
      return {
        data: [
          {
            timeStamp: lastCycleStart.toSeconds(),
          },
        ] as Log[],
        isLoading: false,
        error: null,
      }
    })

    const { data } = useGetLastCycleRewardsTimestamps(cycle)

    expect(data).toEqual({
      fromTimestamp: lastCycleStart.toSeconds(),
      toTimestamp: lastCycleStart.toSeconds(),
    })
  })

  it('should return from the last cycle start to cycle start when there is only one distribution and did not happen in this cycle', () => {
    vi.mocked(useGetRewardDistributionFinishedLogs).mockImplementation(() => {
      return {
        data: [
          {
            timeStamp: cycleStart.toSeconds(),
          },
        ] as Log[],
        isLoading: false,
        error: null,
      }
    })

    const { data } = useGetLastCycleRewardsTimestamps(cycle)

    expect(data).toEqual({
      fromTimestamp: lastCycleStart.toSeconds(),
      toTimestamp: cycleStart.toSeconds(),
    })
  })

  it('should return a 0 time difference when there is no distribution in this cycle', () => {
    const beforeLastCycleStart = lastCycleStart.minus({ seconds: cycleDuration.as('seconds') })
    vi.mocked(useGetRewardDistributionFinishedLogs).mockImplementation(() => {
      return {
        data: [
          {
            timeStamp: beforeLastCycleStart.toSeconds(),
          },
          {
            timeStamp: lastCycleStart.toSeconds(),
          },
        ] as Log[],
        isLoading: false,
        error: null,
      }
    })

    const { data } = useGetLastCycleRewardsTimestamps(cycle)

    expect(data).toEqual({
      fromTimestamp: lastCycleStart.toSeconds(),
      toTimestamp: lastCycleStart.toSeconds(),
    })
  })

  it('should return from the (last cycle start + 1) to cycle start when there are 2 consecutive distributions and one was in this cycle', () => {
    vi.mocked(useGetRewardDistributionFinishedLogs).mockImplementation(() => {
      return {
        data: [
          {
            timeStamp: lastCycleStart.toSeconds(),
          },
          {
            timeStamp: cycleStart.toSeconds(),
          },
        ] as Log[],
        isLoading: false,
        error: null,
      }
    })

    const { data } = useGetLastCycleRewardsTimestamps(cycle)

    expect(data).toEqual({
      fromTimestamp: lastCycleStart.toSeconds() + 1,
      toTimestamp: cycleStart.toSeconds(),
    })
  })

  it('should return from the last cycle start to cycle start when there are 2 distributions and one was in this cycle', () => {
    const beforeLastCycleStart = lastCycleStart.minus({ seconds: cycleDuration.as('seconds') })
    vi.mocked(useGetRewardDistributionFinishedLogs).mockImplementation(() => {
      return {
        data: [
          {
            timeStamp: beforeLastCycleStart.toSeconds(),
          },
          {
            timeStamp: cycleStart.toSeconds(),
          },
        ] as Log[],
        isLoading: false,
        error: null,
      }
    })

    const { data } = useGetLastCycleRewardsTimestamps(cycle)

    expect(data).toEqual({
      fromTimestamp: lastCycleStart.toSeconds(),
      toTimestamp: cycleStart.toSeconds(),
    })
  })
})
