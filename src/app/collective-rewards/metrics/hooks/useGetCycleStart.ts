import { config } from '@/config'
import { CycleTimeKeeperAbi } from '@/lib/abis/v2/CycleTimeKeeperAbi'
import { AVERAGE_BLOCKTIME } from '@/lib/constants'
import { BackersManagerAddress } from '@/lib/contracts'
import { useQuery } from '@tanstack/react-query'
import { useAccount } from 'wagmi'
import { readContract } from 'wagmi/actions'

export const useGetCycleStart = (timestamp: bigint) => {
  const { address } = useAccount()
  const { data, isLoading, error } = useQuery({
    queryFn: async () => {
      return readContract(config, {
        address: BackersManagerAddress,
        abi: CycleTimeKeeperAbi,
        functionName: 'cycleStart',
        args: [timestamp],
      })
    },
    queryKey: ['cycleStart'],
    refetchInterval: AVERAGE_BLOCKTIME,
    initialData: 0n,
    enabled: !!address,
  })

  return {
    data,
    isLoading,
    error,
  }
}
