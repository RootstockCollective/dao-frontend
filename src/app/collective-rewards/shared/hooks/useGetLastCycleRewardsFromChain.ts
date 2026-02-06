import { CycleData } from './useGetABI'
import { useGetRewardDistributionRewardsLogs } from './useGetRewardsDistributionRewards'
import { TOKENS } from '@/lib/tokens'

export const useGetLastCycleRewardsFromChain = () => {
  const { data: rewardDistributionRewardsLogs, isLoading, error } = useGetRewardDistributionRewardsLogs()

  const cycles = rewardDistributionRewardsLogs
    .sort((a, b) => Number(b.timeStamp) - Number(a.timeStamp))
    .map(log => ({
      id: log.blockNumber.toString(),
      currentCycleStart: log.timeStamp,
      rewardPerToken: {
        [TOKENS.rif.address.toLowerCase()]: log.args.rifAmount_.toString(),
        [TOKENS.rbtc.address.toLowerCase()]: log.args.nativeAmount_.toString(),
        [TOKENS.usdrif.address.toLowerCase()]: log.args.usdrifAmount_.toString(),
      },
    })) as CycleData[]

  return { data: cycles, isLoading, error }
}
