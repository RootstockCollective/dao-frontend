import { BackersManagerAbi } from '@/lib/abis/v2/BackersManagerAbi'
import { AVERAGE_BLOCKTIME } from '@/lib/constants'
import { BackersManagerAddress } from '@/lib/contracts'
import { useAccount, useReadContract } from 'wagmi'

export const useGetTotalPotentialReward = () => {
  const { address } = useAccount()
  const { data, isLoading, error } = useReadContract({
    address: BackersManagerAddress,
    abi: BackersManagerAbi,
    functionName: 'totalPotentialReward',
    query: {
      refetchInterval: AVERAGE_BLOCKTIME,
      enabled: !!address,
    },
  })

  return {
    data,
    isLoading,
    error,
  }
}
