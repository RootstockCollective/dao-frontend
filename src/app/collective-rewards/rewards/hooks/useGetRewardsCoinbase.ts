import { RewardDistributorAbi } from '@/lib/abis/v2/RewardDistributorAbi'
import { AVERAGE_BLOCKTIME } from '@/lib/constants'
import { RewardDistributorAddress } from '@/lib/contracts'
import { useAccount, useReadContract } from 'wagmi'

export const useGetRewardsCoinbase = () => {
  const { address } = useAccount()

  return useReadContract({
    address: RewardDistributorAddress,
    abi: RewardDistributorAbi,
    functionName: 'defaultRewardCoinbaseAmount',
    query: {
      refetchInterval: AVERAGE_BLOCKTIME,
      enabled: !!address,
    },
  })
}
