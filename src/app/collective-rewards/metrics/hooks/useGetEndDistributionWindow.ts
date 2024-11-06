import { CycleTimeKeeperAbi } from '@/lib/abis/v2/CycleTimeKeeperAbi'
import { BackersManagerAddress } from '@/lib/contracts'
import { useReadContract } from 'wagmi'

export const useGetEndDistributionWindow = (timestamp: bigint) => {
  const { data, isLoading, error } = useReadContract({
    address: BackersManagerAddress,
    abi: CycleTimeKeeperAbi,
    functionName: 'endDistributionWindow',
    args: [timestamp],
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
