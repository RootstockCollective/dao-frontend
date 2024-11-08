import { SimplifiedRewardDistributorAbi } from '@/lib/abis/SimplifiedRewardDistributorAbi'
import { SimplifiedRewardDistributorAddress } from '@/lib/contracts'
import { useReadContract } from 'wagmi'

export const useGetWhitelistedBuildersLength = () => {
  const { data, isLoading, error } = useReadContract({
    abi: SimplifiedRewardDistributorAbi,
    address: SimplifiedRewardDistributorAddress,
    functionName: 'getWhitelistedBuildersLength',
    query: {
      // 30 seconds, it's the mean time required for a block to be included in RSKJ
      refetchInterval: 30_000,
      initialData: 0n,
    },
  })

  return {
    data,
    isLoading,
    error,
  }
}
