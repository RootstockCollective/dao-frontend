import { useQuery } from '@tanstack/react-query'
import { AVERAGE_BLOCKTIME } from '@/lib/constants'
import { AbiData, useGetABI } from './useGetABI'

export const useGetMetricsAbiWithStateSync = () => {
  const {
    data: abiData,
    isLoading: abiDataIsLoading,
    error: abiDataError,
  } = useQuery<AbiData, Error>({
    queryFn: async () => {
      const response = await fetch('/api/metrics/abi/context')
      if (!response.ok) {
        throw new Error('Failed to fetch ABI data')
      }
      return response.json()
    },
    queryKey: ['abiData'],
    refetchInterval: AVERAGE_BLOCKTIME,
  })

  const data = useGetABI(abiData)

  return {
    data,
    isLoading: abiDataIsLoading,
    error: abiDataError,
  }
}
