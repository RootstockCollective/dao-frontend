import { useQuery } from '@tanstack/react-query'
import { useAccount } from 'wagmi'
import { fetchAddressTokens } from '@/app/user/Balances/actions'

export const useGetAddressTokens = () => {
  const { address, /*chainId*/ } = useAccount()

  return useQuery({
    queryFn: () => fetchAddressTokens(address as string), // @TODO useChainId
    queryKey: ['tokens']
  })
}
