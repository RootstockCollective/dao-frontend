import { useGetAddressTokens } from '@/app/user/Balances/hooks/useGetAddressTokens'
import { useAccount } from 'wagmi'
import { getTokenBalance } from '@/app/user/Balances/balanceUtils'
import { Address } from 'viem'

export const useGetTreasuryBucketBalance = (address: Address) => {
  const { chainId } = useAccount()
  const query = useGetAddressTokens(address, chainId as number)

  return {
    RIF: getTokenBalance('RIF', query.data),
    rBTC: getTokenBalance('rBTC', query.data),
  }
}
