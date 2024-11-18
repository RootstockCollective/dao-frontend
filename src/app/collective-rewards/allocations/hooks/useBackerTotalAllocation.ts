import { BackersManagerAbi } from '@/lib/abis/v2/BackersManagerAbi'
import { GaugeAbi } from '@/lib/abis/v2/GaugeAbi'
import { AVERAGE_BLOCKTIME } from '@/lib/constants'
import { BackersManagerAddress } from '@/lib/contracts'
import { Address } from 'viem'
import { useReadContract, useReadContracts } from 'wagmi'

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

export const useGetAllAllocationOf = (backer: Address, gauges: Address[]) => {
  const { data, isLoading, error } = useReadContracts({
    contracts: gauges.map(gauge => ({
      abi: GaugeAbi,
      address: gauge,
      functionName: 'allocationOf',
      args: [backer],
    })),
    query: {
      refetchInterval: AVERAGE_BLOCKTIME,
    },
  })

  return {
    data: data?.map(({ result }) => result as bigint),
    isLoading,
    error,
  }
}
