import { useQuery } from '@tanstack/react-query'
import { fetchPrices } from '@/app/my-holdings/sections/MyActivitiesAndBalances/components/Balances/actions'

export const useFetchPrices = () => {
  return useQuery({
    queryFn: fetchPrices,
    queryKey: ['prices'],
    refetchInterval: 5000,
  })
}
