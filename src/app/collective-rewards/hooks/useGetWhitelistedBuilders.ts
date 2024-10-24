import { SimplifiedRewardDistributorAbi } from '@/lib/abis/SimplifiedRewardDistributorAbi'
import { SimplifiedRewardDistributorAddress } from '@/lib/contracts'
import { useReadContract } from 'wagmi'

export const useGetWhitelistedBuilders = () => {
  const { data, isLoading, error } = useReadContract({
    abi: SimplifiedRewardDistributorAbi,
    address: SimplifiedRewardDistributorAddress,
    functionName: 'getWhitelistedBuildersArray',
    query: {
      // 30 seconds, it's the mean time required for a block to be included in RSKJ
      refetchInterval: 30_000,
      initialData: [],
    },
  })

  return {
    data,
    isLoading,
    error,
  }
}
