import { CycleTimeKeeperAbi } from '@/lib/abis/v2/CycleTimeKeeperAbi'
import { BackersManagerAddress } from '@/lib/contracts'
import { useReadContract } from 'wagmi'
import { AVERAGE_BLOCKTIME } from '@/lib/constants'

export const useGetCycleNext = (timestamp: bigint) => {
  const { data, isLoading, error } = useReadContract({
    address: BackersManagerAddress,
    abi: CycleTimeKeeperAbi,
    functionName: 'cycleNext',
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
