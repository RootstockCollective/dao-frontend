import { CycleTimeKeeperAbi } from '@/lib/abis/v2/CycleTimeKeeperAbi'
import { BackersManagerAddress } from '@/lib/contracts'
import { useReadContract } from 'wagmi'
import { AVERAGE_BLOCKTIME } from '@/lib/constants'

export const useGetCycleStartAndDuration = () => {
  const { data, isLoading, error } = useReadContract({
    address: BackersManagerAddress,
    abi: CycleTimeKeeperAbi,
    functionName: 'getCycleStartAndDuration',
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
