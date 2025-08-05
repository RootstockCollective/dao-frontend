import { useQuery } from '@tanstack/react-query'
import { getCachedABIData } from '../actions/abiAction'
import { AVERAGE_BLOCKTIME } from '@/lib/constants'
import { useGetABI } from './useGetABI'

export const useGetMetricsAbiWithGraph = () => {
  const {
    data: abiData,
    isLoading: abiDataIsLoading,
    error: abiDataError,
  } = useQuery({
    queryFn: () => getCachedABIData(),
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
