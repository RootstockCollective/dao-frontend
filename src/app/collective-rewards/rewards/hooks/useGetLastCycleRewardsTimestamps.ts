import { Cycle } from '@/app/collective-rewards/metrics'
import {
  RewardDistributionFinishedEventLog,
  useGetRewardDistributionFinishedLogs,
} from '@/app/collective-rewards/rewards'

type Log = RewardDistributionFinishedEventLog[number] & { timeStamp: number }
export const useGetLastCycleRewardsTimestamps = ({ cycleStart, cycleDuration, cycleNext }: Cycle) => {
  const {
    data: rewardDistributionFinished,
    isLoading: rewardDistributionFinishedLoading,
    error: rewardDistributionFinishedError,
  } = useGetRewardDistributionFinishedLogs()

  const isLoading = rewardDistributionFinishedLoading
  const error = rewardDistributionFinishedError

  const lastCycleStart = cycleStart.minus({ seconds: cycleDuration.as('seconds') })
  const [penultimateEvent, lastEvent] = rewardDistributionFinished.slice(-2) as Log[]

  let fromTimestamp = lastCycleStart.toSeconds()
  let toTimestamp = lastCycleStart.toSeconds()

  if (penultimateEvent && !lastEvent && penultimateEvent.timeStamp >= cycleStart.toSeconds()) {
    toTimestamp = +penultimateEvent.timeStamp
  } else if (penultimateEvent && lastEvent) {
    if (penultimateEvent.timeStamp >= lastCycleStart.toSeconds()) {
      fromTimestamp = +penultimateEvent.timeStamp + 1 // We add 1 second to avoid including the previous cycle
    }
    if (lastEvent.timeStamp >= cycleStart.toSeconds()) {
      toTimestamp = +lastEvent.timeStamp
    }
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
