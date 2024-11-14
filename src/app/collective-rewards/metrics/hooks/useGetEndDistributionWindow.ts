import { CycleTimeKeeperAbi } from '@/lib/abis/v2/CycleTimeKeeperAbi'
import { BackersManagerAddress } from '@/lib/contracts'
import { useReadContract } from 'wagmi'
import { AVERAGE_BLOCKTIME } from '@/lib/constants'

export const useGetEndDistributionWindow = (timestamp: bigint) => {
  const { data, isLoading, error } = useReadContract({
    address: BackersManagerAddress,
    abi: CycleTimeKeeperAbi,
    functionName: 'endDistributionWindow',
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