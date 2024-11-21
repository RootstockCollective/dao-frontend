import { GaugeAbi } from '@/lib/abis/v2/GaugeAbi'
import { AVERAGE_BLOCKTIME } from '@/lib/constants'
import { Address } from 'viem'
import { useReadContracts } from 'wagmi'

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
