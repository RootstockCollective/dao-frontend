import { createContext, ReactNode, useContext, useMemo } from 'react'

import { useGetAddressBalances } from '@/app/user/Balances/hooks/useGetAddressBalances'
import { useGetSpecificPrices } from '@/app/user/Balances/hooks/useGetSpecificPrices'
import { GetPricesResult, TokenBalanceRecord } from '@/app/user/types'
import { RBTC, RIF, STRIF, USDRIF, USDT0 } from '@/lib/constants'

import { getTokenBalance } from '../balanceUtils'

interface BalancesContextValue {
  balances: TokenBalanceRecord
  isBalancesLoading: boolean
  /** True while a re-read is in flight, including one over balances already on screen. */
  isBalancesFetching: boolean
  prices: GetPricesResult
  /**
   * Forces an immediate re-read of every balance. The polls are on a block-time interval,
   * which is far too slow for a screen the user is actively waiting on — anything that knows
   * funds should have landed by now (a finished transaction, a returning tab, a "check again"
   * click) should call this rather than wait out the interval.
   */
  refetchBalances: () => void
}

const BalancesContext = createContext<BalancesContextValue>({
  balances: {
    [RBTC]: getTokenBalance(RBTC),
    [RIF]: getTokenBalance(RIF),
    [STRIF]: getTokenBalance(STRIF),
    [USDRIF]: getTokenBalance(USDRIF),
    [USDT0]: getTokenBalance(USDT0),
  },
  isBalancesLoading: true,
  isBalancesFetching: false,
  prices: {},
  refetchBalances: () => {},
})

interface BalancesProviderProps {
  children: ReactNode
}

export const BalancesProvider = ({ children }: BalancesProviderProps) => {
  const { balances, isBalancesLoading, isBalancesFetching, refetchBalances } = useGetAddressBalances()
  const prices = useGetSpecificPrices()

  const value = useMemo(
    () => ({ balances, isBalancesLoading, isBalancesFetching, prices, refetchBalances }),
    [balances, isBalancesLoading, isBalancesFetching, prices, refetchBalances],
  )

  return <BalancesContext.Provider value={value}>{children}</BalancesContext.Provider>
}

export const useBalancesContext = () => useContext(BalancesContext)
