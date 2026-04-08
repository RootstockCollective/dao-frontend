import { useQuery } from '@tanstack/react-query'

import { fetchPrices } from '@/app/user/Balances/actions'

const FIVE_MINUTES_MS = 5 * 60 * 1000

export const useFetchPrices = () => {
  return useQuery({
    queryFn: fetchPrices,
    queryKey: ['prices'],
    refetchInterval: FIVE_MINUTES_MS,
    staleTime: FIVE_MINUTES_MS,
  })
}
