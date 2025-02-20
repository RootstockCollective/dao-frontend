import { createContext, FC, ReactNode, useContext, useMemo } from 'react'
import { useGetAddressBalances } from '@/app/user/Balances/hooks/useGetAddressBalances'
import { useGetSpecificPrices } from '@/app/user/Balances/hooks/useGetSpecificPrices'
import { GetPricesResult, TokenBalanceRecord } from '@/app/user/types'
import { RBTC, RIF, stRIF } from '@/lib/constants'
import { getTokenBalance } from '../balanceUtils'

interface BalancesContextValue {
  balances: TokenBalanceRecord
  prices: GetPricesResult
}

export const BalancesContext = createContext<BalancesContextValue>({
  balances: {
    [RBTC]: getTokenBalance(RBTC),
    [RIF]: getTokenBalance(RIF),
    [stRIF]: getTokenBalance(stRIF),
  },
  prices: {},
})

interface BalancesProviderProps {
  children: ReactNode
}

export const BalancesProvider: FC<BalancesProviderProps> = ({ children }) => {
  const balances = useGetAddressBalances()
  const prices = useGetSpecificPrices()

  return <BalancesContext.Provider value={{ balances, prices }}>{children}</BalancesContext.Provider>
}

export const useBalancesContext = () => useContext(BalancesContext)
