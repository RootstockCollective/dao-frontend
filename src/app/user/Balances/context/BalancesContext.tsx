import { createContext, FC, ReactNode, useContext, useMemo } from 'react'
import { useGetAddressBalances } from '@/app/user/Balances/hooks/useGetAddressBalances'
import { useGetSpecificPrices } from '@/app/user/Balances/hooks/useGetSpecificPrices'
import { GetPricesResult, TokenBalanceRecord } from '@/app/user/types'

interface BalancesContextValue {
  balances: TokenBalanceRecord
  prices: GetPricesResult
}

export const BalancesContext = createContext<BalancesContextValue>({
  balances: {},
  prices: {},
})

interface BalancesProviderProps {
  children: ReactNode
}

export const BalancesProvider: FC<BalancesProviderProps> = ({ children }) => {
  const balances = useGetAddressBalances()
  const prices = useGetSpecificPrices()

  const valueOfContext = useMemo(
    () => ({
      balances,
      prices,
    }),
    [balances, prices],
  )

  return <BalancesContext.Provider value={valueOfContext}>{children}</BalancesContext.Provider>
}

export const useBalancesContext = () => useContext(BalancesContext)
