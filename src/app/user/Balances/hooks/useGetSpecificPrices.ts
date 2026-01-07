import { useMemo } from 'react'
import { useFetchPrices } from '@/app/user/Balances/hooks/useFetchPrices'
import { GetPricesResult } from '@/app/user/types'
import { RIF, RBTC, STRIF, USDRIF, USDT0, TRIF } from '@/lib/constants'

type TokenSymbol = typeof RIF | typeof RBTC

const getDefaultPriceObject = (symbol: TokenSymbol, data: GetPricesResult | undefined) => {
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
      [TRIF]: getDefaultPriceObject(RIF, query.data),
      [RIF]: getDefaultPriceObject(RIF, query.data),
      [RBTC]: getDefaultPriceObject(RBTC, query.data),
      [STRIF]: getDefaultPriceObject(RIF, query.data), // stRIF price is the same as RIF
      [USDRIF]: {
        price: 1, // Assuming 1:1 USD parity for USDRIF
        lastUpdated: new Date().toISOString(),
      },
      [USDT0]: {
        price: 1, // Assuming 1:1 USD parity for USDT0
        lastUpdated: new Date().toISOString(),
      },
    }),
    [query.data],
  )
}
