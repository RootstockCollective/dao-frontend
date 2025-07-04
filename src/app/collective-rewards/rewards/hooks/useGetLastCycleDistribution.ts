import { Cycle } from '@/app/collective-rewards/metrics'
import {
  RewardDistributionFinishedEventLog,
  useGetRewardDistributionFinishedLogs,
} from '@/app/collective-rewards/rewards'

type Log = RewardDistributionFinishedEventLog[number] & { timeStamp: number }
export const useGetLastCycleDistribution = ({ cycleStart, cycleNext }: Cycle) => {
  const { data: rewardDistributionFinished, isLoading, error } = useGetRewardDistributionFinishedLogs()

  const [lastEvent] = rewardDistributionFinished.slice(-1) as Log[]

  if (!cycleNext || !cycleStart) {
    return {
      data: {
        fromTimestamp: 0,
        toTimestamp: 0,
      },
    }
  }

  let fromTimestamp = cycleNext.toSeconds()
  let toTimestamp = cycleNext.toSeconds()

  if (lastEvent && lastEvent.timeStamp >= cycleStart.toSeconds()) {
    fromTimestamp = cycleStart.toSeconds()
    toTimestamp = lastEvent.timeStamp
  }

  return {
    data: {
      fromTimestamp,
      toTimestamp,
    },
    isLoading,
    error,
  }
}
