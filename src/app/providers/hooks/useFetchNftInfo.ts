import { fetchNftInfo } from '@/app/user/Balances/actions'
import { useQuery } from '@tanstack/react-query'

export const useFetchNftInfo = (nftAddress: string) => {
  return useQuery({
    queryFn: () => fetchNftInfo(nftAddress),
    queryKey: ['nftInfo'],
  })
}
