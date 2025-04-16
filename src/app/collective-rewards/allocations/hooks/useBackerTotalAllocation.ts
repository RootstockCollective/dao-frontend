import { BackersManagerAbi } from '@/lib/abis/v2/BackersManagerAbi'
import { AVERAGE_BLOCKTIME } from '@/lib/constants'
import { BackersManagerAddress } from '@/lib/contracts'
import { Address, zeroAddress } from 'viem'
import { useReadContract } from 'wagmi'

export const useBackerTotalAllocation = (backer?: Address) => {
  const { data, isLoading, error } = useReadContract({
    abi: BackersManagerAbi,
    address: BackersManagerAddress,
    functionName: 'backerTotalAllocation',
    args: [backer ?? zeroAddress],
    query: {
      refetchInterval: AVERAGE_BLOCKTIME,
      initialData: 0n,
      enabled: !!backer,
    },
  })

  return {
    data,
    isLoading,
    error,
  }
}
