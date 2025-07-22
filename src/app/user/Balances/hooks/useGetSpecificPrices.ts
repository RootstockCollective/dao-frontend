import { useMemo } from 'react'
import { useFetchPrices } from '@/app/user/Balances/hooks/useFetchPrices'
import { GetPricesResult } from '@/app/user/types'

const getDefaultPriceObject = (symbol: string, data?: GetPricesResult) => {
  if (data && data[symbol]) {
    return {
      price: data[symbol].price,
      lastUpdated: data[symbol].lastUpdated,
    }
  }
  return null
}

export const useGetSpecificPrices = (): GetPricesResult => {
  const query = useFetchPrices()

  return useMemo(
    () => ({
      RIF: getDefaultPriceObject('RIF', query.data),
      RBTC: getDefaultPriceObject('RBTC', query.data),
      stRIF: getDefaultPriceObject('RIF', query.data), // stRIF price is the same as RIF
      USDRIF: {
        price: 1,
        lastUpdated: new Date().toISOString(),
      },
    }),
    [query.data],
  )
}
