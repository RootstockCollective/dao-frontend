import { RewardDistributorAbi } from '@/lib/abis/v2/RewardDistributorAbi'
import { AVERAGE_BLOCKTIME } from '@/lib/constants'
import { RewardDistributorAddress } from '@/lib/contracts'
import { useReadContract } from 'wagmi'

export const useGetRewardsCoinbase = () => {
  return useReadContract({
    address: RewardDistributorAddress,
    abi: RewardDistributorAbi,
    functionName: 'defaultRewardCoinbaseAmount',
    query: {
      refetchInterval: AVERAGE_BLOCKTIME,
    },
  })
}
