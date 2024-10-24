import { SimplifiedRewardDistributorAbi } from '@/lib/abis/SimplifiedRewardDistributorAbi'
import { SimplifiedRewardDistributorAddress } from '@/lib/contracts'
import { Address } from 'viem'
import { useReadContract } from 'wagmi'

export const useGetIsWhitelistedBuilder = (builder: Address) => {
  const { data, isLoading, error } = useReadContract({
    abi: SimplifiedRewardDistributorAbi,
    address: SimplifiedRewardDistributorAddress,
    functionName: 'isWhitelisted',
    args: [builder],
    query: {
      // 30 seconds, it's the mean time required for a block to be included in RSKJ
      refetchInterval: 30_000,
      initialData: false,
    },
  })

  return {
    data,
    isLoading,
    error,
  }
}
