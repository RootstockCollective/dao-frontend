import { CycleTimeKeeperAbi } from '@/lib/abis/v2/CycleTimeKeeperAbi'
import { AVERAGE_BLOCKTIME } from '@/lib/constants'
import { BackersManagerAddress } from '@/lib/contracts'
import { useAccount, useReadContract } from 'wagmi'

export const useGetCycleStartAndDuration = () => {
  const { address } = useAccount()
  const { data, isLoading, error } = useReadContract({
    address: BackersManagerAddress,
    abi: CycleTimeKeeperAbi,
    functionName: 'getCycleStartAndDuration',
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
