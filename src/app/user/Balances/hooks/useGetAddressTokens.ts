import { useAccount } from 'wagmi'
import { useQuery } from '@tanstack/react-query'
import { fetchAddressTokens } from '@/app/user/Balances/actions'

export const useGetAddressTokens = () => {
  const { address, chainId } = useAccount()

  return useQuery({
    queryFn: () => fetchAddressTokens(address as string, chainId),
    queryKey: ['tokens'],
    refetchInterval: 5000,
  })
}
