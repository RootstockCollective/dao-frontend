import { useReadGauges } from '@/shared/hooks/contracts'
import { Address } from 'viem'

export const useGetTotalAllocation = (gauges: Address[]) => {
  const { data, isLoading, error } = useReadGauges({ addresses: gauges, functionName: 'totalAllocation' })
  const totalAllocations = Object.values(data).reduce<bigint>(
    (acc, allocation) => acc + (allocation ?? 0n),
    0n,
  )

  return {
    data: totalAllocations,
    isLoading,
    error,
  }
}
