import { useQuery } from '@tanstack/react-query'
import { fetchNftsOwnedByAddressAndNFTAddress } from '@/shared/api/nfts'

export const useFetchNFTsOwned = (address: string, nftAddress: string) => {
  return useQuery({
    queryFn: () => fetchNftsOwnedByAddressAndNFTAddress(address, nftAddress),
    queryKey: ['nftOwned'],
    refetchInterval: 5000,
  })
}
