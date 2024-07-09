import { useMemo } from 'react'
import { useFetchPrices } from '@/app/user/Balances/hooks/useFetchPrices'
import { GetPricesResult } from '@/app/user/types'

const getDefaultPriceObject = (symbol: string, data?: GetPricesResult) => {
  let returnResult = { price: 1, lastUpdated: '' }
  if (data && symbol in data) {
    returnResult.price = data[symbol].price
    returnResult.lastUpdated = data[symbol].lastUpdated
  }
  return returnResult
}

// TODO get RBTC and stRIF prices
export const useGetSpecificPrices = (): GetPricesResult => {
  const query = useFetchPrices()

  return useMemo(
    () => ({
      RIF: getDefaultPriceObject('RIF', query.data),
      rBTC: getDefaultPriceObject('rBTC', query.data),
      stRIF: getDefaultPriceObject('stRIF', query.data),
    }),
    [query.data],
  )
}
