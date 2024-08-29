import { useGetAddressTokens } from '@/app/user/Balances/hooks/useGetAddressTokens'
import { useMemo } from 'react'
import { getTokenBalance } from '@/app/user/Balances/balanceUtils'
import { TokenBalanceRecord } from '@/app/user/types'
import { useAccount } from 'wagmi'
import { Address } from 'viem'

export const useGetAddressBalances = (): TokenBalanceRecord => {
  const { address, chainId } = useAccount()

  const query = useGetAddressTokens(address as Address, chainId as number)

  return useMemo(
    () => ({
      RIF: getTokenBalance('RIF', query.data),
      RBTC: getTokenBalance('RBTC', query.data),
      stRIF: getTokenBalance('stRIF', query.data),
    }),
    [query.data],
  )
}
