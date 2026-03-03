import { useQuery } from '@tanstack/react-query'

import { getCachedABIData } from '../actions/fetchABIData'
import { useGetABI } from './useGetABI'

export const useGetMetricsAbiWithGraph = () => {
  const {
    data: abiData,
    isLoading: abiDataIsLoading,
    error: abiDataError,
  } = useQuery({
    queryFn: () => getCachedABIData(),
    queryKey: ['abiData'],
  })

  const data = useGetABI(abiData)

  return {
    data,
    isLoading: abiDataIsLoading,
    error: abiDataError,
  }
}
