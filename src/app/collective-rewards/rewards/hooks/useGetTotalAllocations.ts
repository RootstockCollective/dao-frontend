import { GaugeAbi } from '@/lib/abis/v2/GaugeAbi'
import { AVERAGE_BLOCKTIME } from '@/lib/constants'
import { useMemo } from 'react'
import { Address } from 'viem'
import { useReadContracts } from 'wagmi'

export const useGetTotalAllocations = (gauges: Address[]) => {
  const totalAllocationCalls = useMemo(
    () =>
      gauges?.map(
        gauge =>
          ({
            address: gauge,
            abi: GaugeAbi,
            functionName: 'totalAllocation',
            args: [],
          }) as const,
      ),
    [gauges],
  )
  const {
    data: allocationsResult,
    isLoading,
    error,
  } = useReadContracts<Address[]>({
    contracts: totalAllocationCalls,
    query: {
      refetchInterval: AVERAGE_BLOCKTIME,
    },
  })
  const allocations = allocationsResult?.map(allocation => allocation.result as bigint)
  const sum = useMemo(() => allocations?.reduce((acc, allocation) => acc + allocation, 0n), [allocations])
  const allocationsPercentage = useMemo(
    () => (allocations && sum ? allocations?.map(allocation => (allocation / sum) * 100n) : []),
    [allocations, sum],
  )

  return {
    data: { allocations, allocationsPercentage, sum },
    isLoading,
    error,
  }
}
