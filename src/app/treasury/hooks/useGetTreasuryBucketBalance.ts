import { useGetAddressTokens } from '@/app/my-holdings/sections/MyActivitiesAndBalances/components/Balances/hooks/useGetAddressTokens'
import { useAccount } from 'wagmi'
import { getTokenBalance } from '@/app/my-holdings/sections/MyActivitiesAndBalances/components/Balances/balanceUtils'
import { Address } from 'viem'

export const useGetTreasuryBucketBalance = (address: Address) => {
  const { chainId } = useAccount()
  const query = useGetAddressTokens(address, chainId as number)

  return {
    RIF: getTokenBalance('RIF', query.data),
    USDRIF: getTokenBalance('USDRIF', query.data),
    RBTC: getTokenBalance('RBTC', query.data),
  }
}
