import { useMemo } from 'react'
import { useFetchPrices } from '@/app/user/Balances/hooks/useFetchPrices'
import { GetPricesResult } from '@/app/user/types'

const getDefaultPriceObject = (symbol: string, data: GetPricesResult) => {
  let returnResult = { price: 0, lastUpdated: '' }
  if (data && symbol in data) {
    returnResult.price = data[symbol].price
    returnResult.lastUpdated = data[symbol].lastUpdated
  }
  return returnResult
}

// TODO get RBTC and stRIF prices
export const useGetSpecificPrices = (): GetPricesResult => {
  const query = useFetchPrices()

  const rif = useMemo(() => getDefaultPriceObject('RIF', query.data ?? {}), [query.data])

  return { rif, rbtc: { price: 0, lastUpdated: '' }, strif: { price: 0, lastUpdated: '' } }
}
