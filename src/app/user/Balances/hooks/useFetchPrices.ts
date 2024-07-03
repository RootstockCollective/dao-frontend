import { useQuery } from '@tanstack/react-query'
import { fetchPrices } from '@/app/user/Balances/actions'

export const useFetchPrices = () => {
  return useQuery({
    queryFn: fetchPrices,
    queryKey: ['prices']
  })
}
