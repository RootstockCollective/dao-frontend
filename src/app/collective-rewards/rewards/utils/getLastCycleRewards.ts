import { GaugeNotifyRewardEventLog } from '@/app/collective-rewards/rewards'
import { Cycle } from '@/app/collective-rewards/metrics/context/CycleContext'

type Log = GaugeNotifyRewardEventLog[number]
type CycleRewards = {
  builderAmount: bigint
  backersAmount: bigint
}

export const getLastCycleRewards = (cycle: Cycle, notifyRewardLogs?: GaugeNotifyRewardEventLog) => {
  const { cycleDuration, endDistributionWindow, cycleStart } = cycle
  const distributionWindow = endDistributionWindow.diff(cycleStart)
  const lastCycleStart = cycleStart.minus({ millisecond: +cycleDuration.as('millisecond') })
  const lastCycleAfterDistribution = lastCycleStart.plus({ millisecond: +distributionWindow })

  if (!notifyRewardLogs) {
    return { builderAmount: 0n, sponsorsAmount: 0n }
  }

  return notifyRewardLogs.reduce<CycleRewards>(
    (acc, event) => {
      const {
        timeStamp,
        args: { backersAmount_, builderAmount_ },
      } = event as Log & { timeStamp: number }

      // Check if the event is in the last cycle
      if (
        timeStamp > lastCycleAfterDistribution.toSeconds() &&
        timeStamp < endDistributionWindow.toSeconds()
      ) {
        acc.builderAmount += builderAmount_
        acc.backersAmount += backersAmount_
      }

      return acc
    },
    { builderAmount: 0n, backersAmount: 0n },
  )
}
