import { BackersManagerAbi } from '@/lib/abis/v2/BackersManagerAbi'
import { AVERAGE_BLOCKTIME } from '@/lib/constants'
import { BackersManagerAddress } from '@/lib/contracts'
import { useReadContract } from 'wagmi'

export const useGetTotalPotentialReward = () => {
  const { data, isLoading, error } = useReadContract({
    address: BackersManagerAddress,
    abi: BackersManagerAbi,
    functionName: 'totalPotentialReward',
    query: {
      refetchInterval: AVERAGE_BLOCKTIME,
    },
  })

  return {
    data: data ? BigInt(data.toString()) : null,
    isLoading,
    error,
  }
}
