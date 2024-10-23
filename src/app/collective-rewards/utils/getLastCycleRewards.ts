import { Address, isAddressEqual, parseEventLogs } from 'viem'
import { SimplifiedRewardDistributorAbi } from '@/lib/abis/SimplifiedRewardDistributorAbi'
import { getPreviousCycle } from '@/app/collective-rewards/utils/getLastCycle'

type EventLog = ReturnType<
  typeof parseEventLogs<typeof SimplifiedRewardDistributorAbi, true, 'RewardDistributed'>
>

type Log = EventLog[number]

export const getLastCycleRewards = (rewardDistributedLogs: EventLog, rewardToken?: Address) => {
  const { cycleStartTimestamp, cycleEndTimestamp } = getPreviousCycle()

  return rewardDistributedLogs.reduce((acc, event) => {
    const {
      timeStamp,
      args: { rewardToken_, amount_ },
    } = event as Log & { timeStamp: number }

    // Check the conditions
    if (
      (rewardToken && !isAddressEqual(rewardToken_, rewardToken)) ||
      timeStamp < cycleStartTimestamp.second ||
      timeStamp > cycleEndTimestamp.second
    ) {
      return acc // Skip invalid events
    }

    return acc + amount_
  }, 0n)
}
