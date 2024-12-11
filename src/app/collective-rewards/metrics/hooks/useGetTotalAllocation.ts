import { useGaugesGetFunction } from '../../shared'

export const useGetTotalAllocation = (gauges: any[]) => {
  const { data, isLoading, error } = useGaugesGetFunction(gauges, 'totalAllocation')

  const totalAllocations = Object.values(data).reduce((acc, allocation) => acc + allocation, 0n)
  return {
    data: totalAllocations,
    isLoading,
    error,
  }
}
