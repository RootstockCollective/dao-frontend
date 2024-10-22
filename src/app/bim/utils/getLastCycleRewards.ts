import { Address, isAddressEqual, parseEventLogs } from 'viem'
import { SimplifiedRewardDistributorAbi } from '@/lib/abis/SimplifiedRewardDistributorAbi'
import { getPreviousEpochCycle } from '@/app/bim/utils/getLastEpochCycle'

type EventLog = ReturnType<
  typeof parseEventLogs<typeof SimplifiedRewardDistributorAbi, true, 'RewardDistributed'>
>

type Log = EventLog[number]

export const getLastCycleRewards = (rewardDistributedLogs: EventLog, rewardToken?: Address) => {
  const { epochStartTimestamp, epochEndTimestamp } = getPreviousEpochCycle()

  return rewardDistributedLogs.reduce((acc, event) => {
    const {
      timeStamp,
      args: { rewardToken_, amount_ },
    } = event as Log & { timeStamp: number }

    // Check the conditions
    if (
      (rewardToken && !isAddressEqual(rewardToken_, rewardToken)) ||
      timeStamp < epochStartTimestamp.second ||
      timeStamp > epochEndTimestamp.second
    ) {
      return acc // Skip invalid events
    }

    return acc + amount_
  }, 0n)
}
