import { GaugeAbi } from '@/lib/abis/v2/GaugeAbi'
import { AVERAGE_BLOCKTIME } from '@/lib/constants'
import { Address } from 'viem'
import { useReadContract } from 'wagmi'

export const useGetRewardShares = (gauge: Address) => {
  const { data, isLoading, error } = useReadContract({
    address: gauge,
    abi: GaugeAbi,
    functionName: 'rewardShares',
    query: {
      refetchInterval: AVERAGE_BLOCKTIME,
    },
  })

  return {
    data,
    isLoading,
    error,
  }
}
