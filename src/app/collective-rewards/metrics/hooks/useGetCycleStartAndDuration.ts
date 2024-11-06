import { CycleTimeKeeperAbi } from '@/lib/abis/v2/CycleTimeKeeperAbi'
import { BackersManagerAddress } from '@/lib/contracts'
import { useReadContract } from 'wagmi'

export const useGetCycleStartAndDuration = () => {
  const { data, isLoading, error } = useReadContract({
    address: BackersManagerAddress,
    abi: CycleTimeKeeperAbi,
    functionName: 'getCycleStartAndDuration',
    query: {
      refetchInterval: 30_000,
    },
  })

  return {
    data,
    isLoading,
    error,
  }
}
