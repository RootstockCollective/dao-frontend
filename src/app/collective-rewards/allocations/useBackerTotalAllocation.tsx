import { BackersManagerAbi } from '@/lib/abis/v2/BackersManagerAbi'
import { AVERAGE_BLOCKTIME } from '@/lib/constants'
import { BackersManagerAddress } from '@/lib/contracts'
import { Address } from 'viem'
import { useReadContract } from 'wagmi'

export const useBackerTotalAllocation = (backer: Address) => {
  const { data, isLoading, error } = useReadContract({
    abi: BackersManagerAbi,
    address: BackersManagerAddress,
    functionName: 'backerTotalAllocation',
    args: [backer],
    query: {
      refetchInterval: AVERAGE_BLOCKTIME,
      initialData: 0n,
    },
  })

  return {
    data,
    isLoading,
    error,
  }
}
