import { createContext, FC, ReactNode, useContext } from 'react'
import { useGetAddressBalances } from '@/app/user/Balances/hooks/useGetAddressBalances'
import { useGetSpecificPrices } from '@/app/user/Balances/hooks/useGetSpecificPrices'
import { GetPricesResult, TokenBalanceRecord } from '@/app/user/types'
import { RBTC, RIF, STRIF, USDRIF, USDT0 } from '@/lib/constants'
import { getTokenBalance } from '../balanceUtils'

interface BalancesContextValue {
  balances: TokenBalanceRecord
  isBalancesLoading: boolean
  prices: GetPricesResult
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
  prices: {},
})

interface BalancesProviderProps {
  children: ReactNode
}

export const BalancesProvider: FC<BalancesProviderProps> = ({ children }) => {
  const { balances, isBalancesLoading } = useGetAddressBalances()
  const prices = useGetSpecificPrices()

  return (
    <BalancesContext.Provider value={{ balances, isBalancesLoading, prices }}>
      {children}
    </BalancesContext.Provider>
  )
}

export const useBalancesContext = () => useContext(BalancesContext)
