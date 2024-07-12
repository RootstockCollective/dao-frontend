import { useGetAddressTokens } from '@/app/user/Balances/hooks/useGetAddressTokens'
import { useMemo } from 'react'
import { getTokenBalance } from '@/app/user/Balances/balanceUtils'
import { TokenBalanceRecord } from '@/app/user/types'
import { useAccount } from 'wagmi'

export const useGetAddressBalances = (): TokenBalanceRecord => {
  const { address, chainId } = useAccount()

  const query = useGetAddressTokens(address as string, chainId as number)

  return useMemo(
    () => ({
      RIF: getTokenBalance('RIF', query.data),
      rBTC: getTokenBalance('rBTC', query.data),
      stRIF: getTokenBalance('stRIF', query.data),
    }),
    [query.data],
  )
}
