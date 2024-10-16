import { useQuery } from '@tanstack/react-query'
import { fetchNftsOwnedByAddressAndNFTAddress } from '@/app/user/Balances/actions'

export const useFetchNFTsOwned = (address: string, nftAddress: string) => {
  return useQuery({
    queryFn: () => fetchNftsOwnedByAddressAndNFTAddress(address, nftAddress),
    queryKey: ['nftOwned'],
    refetchInterval: 5000,
  })
}
