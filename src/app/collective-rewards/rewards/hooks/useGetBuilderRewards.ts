import { GaugeAbi } from '@/lib/abis/v2/GaugeAbi'
import { Address } from 'viem'
import { useReadContract } from 'wagmi'
import { AVERAGE_BLOCKTIME } from '@/lib/constants'

export const useGetBuilderRewards = (rewardToken: Address, gauge: Address) => {
  const { data, isLoading, error } = useReadContract({
    address: gauge,
    abi: GaugeAbi,
    functionName: 'builderRewards',
    args: [rewardToken],
    query: {
      refetchInterval: AVERAGE_BLOCKTIME,
      enabled: !!gauge,
    },
  })

  return {
    data,
    isLoading,
    error,
  }
}
