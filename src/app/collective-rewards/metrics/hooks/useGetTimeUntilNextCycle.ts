import { CycleTimeKeeperAbi } from '@/lib/abis/v2/CycleTimeKeeperAbi'
import { BackersManagerAddress } from '@/lib/contracts'
import { AVERAGE_BLOCKTIME } from '@/lib/constants'
import { useReadContract } from 'wagmi'

export const useGetTimeUntilNextCycle = (timestamp: bigint) => {
  const { data, isLoading, error } = useReadContract({
    address: BackersManagerAddress,
    abi: CycleTimeKeeperAbi,
    functionName: 'timeUntilNextCycle',
    args: [timestamp],
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
