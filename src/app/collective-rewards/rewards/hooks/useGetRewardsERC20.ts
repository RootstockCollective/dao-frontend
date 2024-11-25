import { RewardDistributorAbi } from '@/lib/abis/v2/RewardDistributorAbi'
import { AVERAGE_BLOCKTIME } from '@/lib/constants'
import { RewardDistributorAddress } from '@/lib/contracts'
import { useReadContract } from 'wagmi'

export const useGetRewardsERC20 = () => {
  return useReadContract({
    address: RewardDistributorAddress,
    abi: RewardDistributorAbi,
    functionName: 'defaultRewardTokenAmount',
    query: {
      refetchInterval: AVERAGE_BLOCKTIME,
    },
  })
}
