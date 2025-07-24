'use client'
import { createContext, FC, ReactNode, useContext } from 'react'
import { useGetAddressBalances } from '@/shared/hooks/balances'
import { useGetSpecificPrices } from '@/shared/hooks/useGetSpecificPrices'
import { TokenBalanceRecord } from '@/app/my-holdings/types'
import { GetPricesResult } from '@/shared/types'
import { RBTC, RIF, stRIF, USDRIF } from '@/lib/constants'
import { getTokenBalance } from '../sections/Balances/balanceUtils'

interface BalancesContextValue {
  balances: TokenBalanceRecord
  isBalancesLoading: boolean
  prices: GetPricesResult
}

export const BalancesContext = createContext<BalancesContextValue>({
  balances: {
    [RBTC]: getTokenBalance(RBTC),
    [RIF]: getTokenBalance(RIF),
    [stRIF]: getTokenBalance(stRIF),
    [USDRIF]: getTokenBalance(USDRIF),
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
