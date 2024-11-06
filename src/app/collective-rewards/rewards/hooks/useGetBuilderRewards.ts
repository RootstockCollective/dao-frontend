import { GaugeAbi } from '@/lib/abis/v2/GaugeAbi'
import { Address } from 'viem'
import { useReadContract } from 'wagmi'

export const useGetBuilderRewards = (rewardToken: Address, gauge?: Address) => {
  const { data, isLoading, error } = useReadContract({
    address: gauge!,
    abi: GaugeAbi,
    functionName: 'builderRewards',
    args: [rewardToken],
    query: {
      refetchInterval: 30_000,
      enabled: !!gauge,
    },
  })

  return {
    data,
    isLoading,
    error,
  }
}
