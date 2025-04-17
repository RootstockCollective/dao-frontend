import {
  useGetRewardDistributionFinishedLogs,
  useGetLastCycleDistribution,
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
    timestamp: 10n,
    cycleStart: DateTime.fromSeconds(startTimestamp),
    cycleNext: DateTime.fromSeconds(startTimestamp + duration),
    cycleDuration: Duration.fromObject({ seconds: duration }),
    fistCycleStart: DateTime.fromSeconds(startTimestamp),
    endDistributionWindow: DateTime.fromSeconds(distributionWindow),
  }
  const { cycleStart, cycleNext, cycleDuration } = cycle

  it('should return (from,to) = to next cycle start if there are no events', () => {
    vi.mocked(useGetRewardDistributionFinishedLogs).mockImplementation(() => {
      return {
        data: [],
        isLoading: false,
        error: null,
      }
    })

    const { data } = useGetLastCycleDistribution(cycle)

    expect(data).toEqual({
      fromTimestamp: cycleNext.toSeconds(),
      toTimestamp: cycleNext.toSeconds(),
    })
  })

  it('should return (from,to) = to next cycle start if there were not distributions in the current cycle', () => {
    const lastCycleStart = cycle.cycleStart.minus({ seconds: cycleDuration.as('seconds') })
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

    const { data } = useGetLastCycleDistribution(cycle)

    expect(data).toEqual({
      fromTimestamp: cycleNext.toSeconds(),
      toTimestamp: cycleNext.toSeconds(),
    })
  })

  it('should return (from = current cycle start, to = last event) if there were distributions in the current cycle', () => {
    const endDistributionTime = cycleStart.plus({ seconds: 100 })
    vi.mocked(useGetRewardDistributionFinishedLogs).mockImplementation(() => {
      return {
        data: [
          {
            timeStamp: endDistributionTime.toSeconds(),
          },
        ] as Log[],
        isLoading: false,
        error: null,
      }
    })

    const { data } = useGetLastCycleDistribution(cycle)

    expect(data).toEqual({
      fromTimestamp: cycleStart.toSeconds(),
      toTimestamp: endDistributionTime.toSeconds(),
    })
  })
})
