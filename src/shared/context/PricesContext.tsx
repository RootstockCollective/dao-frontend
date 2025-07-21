'use client'

import { useGetSpecificPrices } from '@/app/user/Balances/hooks/useGetSpecificPrices'
import { GetPricesResult } from '@/app/user/types'
import { createContext, FC, ReactNode, useContext, useMemo } from 'react'

interface PricesContextProps {
  prices: GetPricesResult
}

export const PricesContext = createContext<PricesContextProps>({
  prices: {},
})

interface Props {
  children: ReactNode
}

export const PricesContextProvider = ({ children }: Props) => {
  const prices = useGetSpecificPrices()

  const valueOfContext = useMemo(() => ({ prices }), [prices])

  return <PricesContext.Provider value={valueOfContext}>{children}</PricesContext.Provider>
}

export const usePricesContext = () => useContext(PricesContext)

export const withPricesContextProvider = <P extends object>(Component: FC<P>) => {
  return function WrapperComponent(props: P) {
    return (
      <PricesContextProvider>
        <Component {...props} />
      </PricesContextProvider>
    )
  }
}
