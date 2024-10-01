import { Address, parseEventLogs } from 'viem'
import { SimplifiedRewardDistributorAbi } from '@/lib/abis/SimplifiedRewardDistributorAbi'
import { getPreviousEpochCycle } from '@/app/bim/utils/getLastEpochCycle'

type EventLog = ReturnType<
  typeof parseEventLogs<typeof SimplifiedRewardDistributorAbi, true, 'RewardDistributed'>
>

export const getLastRewardValid = (rewardDistributedLogs: EventLog, rewardToken?: Address) => {
  const lastLog = rewardDistributedLogs[rewardDistributedLogs.length - 1]
  if (!lastLog) {
    return 0n
  }

  if (rewardToken && lastLog.args.rewardToken_ !== rewardToken) {
    return 0n
  }

  const { epochStartTimestamp, epochEndTimestamp } = getPreviousEpochCycle()
  // @ts-ignore
  if (lastLog.timeStamp < epochStartTimestamp || lastLog.timeStamp > epochEndTimestamp) {
    return 0n
  }

  return lastLog.args.amount_
}
