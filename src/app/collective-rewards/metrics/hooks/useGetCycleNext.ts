import { CycleTimeKeeperAbi } from '@/lib/abis/v2/CycleTimeKeeperAbi'
import { BackersManagerAddress } from '@/lib/contracts'
import { AVERAGE_BLOCKTIME } from '@/lib/constants'
import { useQuery } from '@tanstack/react-query'
import { readContract } from 'wagmi/actions'
import { config } from '@/config'

export const useGetCycleNext = (timestamp: bigint) => {
  const { data, isLoading, error } = useQuery({
    queryFn: async () => {
      return readContract(config, {
        address: BackersManagerAddress,
        abi: CycleTimeKeeperAbi,
        functionName: 'cycleNext',
        args: [timestamp],
      })
    },
    queryKey: ['cycleNext'],
    refetchInterval: AVERAGE_BLOCKTIME,
    initialData: 0n,
  })

  return {
    data,
    isLoading,
    error,
  }
}
