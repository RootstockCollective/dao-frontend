import { useGetAddressTokens } from '@/app/user/Balances/hooks/useGetAddressTokens'
import { useMemo } from 'react'
import { getTokenBalance } from '@/app/user/Balances/balanceUtils'
import { useAccount } from 'wagmi'
import { Address } from 'viem'
import { RBTC, RIF, stRIF, USDRIF } from '@/lib/constants'

export const useGetAddressBalances = () => {
  const { address, chainId } = useAccount()

  const { data, isLoading: isBalancesLoading } = useGetAddressTokens(address as Address, chainId as number)

  return useMemo(
    () => ({
      isBalancesLoading,
      balances: {
        RIF: getTokenBalance(RIF, data),
        RBTC: getTokenBalance(RBTC, data),
        stRIF: getTokenBalance(stRIF, data),
        USDRIF: getTokenBalance(USDRIF, data),
      },
    }),
    [data, isBalancesLoading],
  )
}
