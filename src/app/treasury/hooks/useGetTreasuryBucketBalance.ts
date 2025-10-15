import { getTokenBalance } from '@/app/user/Balances/balanceUtils'
import { useGetAddressTokens } from '@/app/user/Balances/hooks/useGetAddressTokens'
import { RBTC, RIF, USDRIF } from '@/lib/tokens'
import { Address } from 'viem'
import { useAccount } from 'wagmi'

export const useGetTreasuryBucketBalance = (address: Address) => {
  const { chainId } = useAccount()
  const query = useGetAddressTokens(address, chainId as number)

  return {
    [RIF]: getTokenBalance(RIF, query.data),
    [USDRIF]: getTokenBalance(USDRIF, query.data),
    [RBTC]: getTokenBalance(RBTC, query.data),
  }
}
