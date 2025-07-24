import { fetchNftInfo } from '@/app/my-holdings/sections/MyActivitiesAndBalances/components/Balances/actions'
import { useQuery } from '@tanstack/react-query'

export const useFetchNftInfo = (nftAddress: string) => {
  return useQuery({
    queryFn: () => fetchNftInfo(nftAddress),
    queryKey: ['nftInfo'],
  })
}
