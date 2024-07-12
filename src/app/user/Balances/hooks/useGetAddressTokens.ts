import { useAccount } from 'wagmi'
import { useQuery } from '@tanstack/react-query'
import { fetchAddressTokens } from '@/app/user/Balances/actions'
import { Address } from 'viem'

export const useGetAddressTokens = (address: string, chainId: number) => {
  return useQuery({
    queryFn: () => fetchAddressTokens(address as string, chainId),
    queryKey: [`${address}_${chainId}`],
    refetchInterval: 5000,
  })
}
