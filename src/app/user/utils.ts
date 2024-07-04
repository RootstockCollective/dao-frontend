import { useQuery } from '@tanstack/react-query'
import { useAccount } from 'wagmi'
import { fetchAddressTokens } from '@/app/user/Balances/actions'

export const useGetAddressTokens = () => {
  const { address /*chainId*/ } = useAccount()

  return useQuery({
    queryFn: () => fetchAddressTokens(address as string), // @TODO useChainId
    queryKey: ['tokens'],
  })
}

export const isValidNumber = (value: string) => {
  // Regular expression to check if the input is a number with one allowed decimal
  const regex = /^\d*\.?\d{0,2}$/
  return regex.test(value)
}
