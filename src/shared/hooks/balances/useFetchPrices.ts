import { useQuery } from '@tanstack/react-query'
import { fetchPrices } from '@/shared/api/balances/actions'

export const useFetchPrices = () => {
  return useQuery({
    queryFn: fetchPrices,
    queryKey: ['prices'],
    refetchInterval: 5000,
  })
}
