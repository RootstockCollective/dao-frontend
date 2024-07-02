import { GetAddressTokenResult, GetPricesResult } from '@/app/user/types'
import { axiosInstance } from '@/lib/utils'
import { fetchAddressTokensEndpoint, fetchPricesEndpoint } from '@/lib/endpoints'
import { tokenContractsSymbolMap } from '@/lib/contracts'

export const fetchAddressTokens = (address: string, chainId = 31) => axiosInstance.get<GetAddressTokenResult>(
  fetchAddressTokensEndpoint
    .replace('{{chainId}}', chainId.toString())
    .replace('{{address}}', address)
)
  .then(({ data }) => data)

// Prices

export const fetchPrices = () => axiosInstance.get<GetPricesResult>(
  fetchPricesEndpoint
  .replace('{{addresses}}', Object.keys(tokenContractsSymbolMap).join(','))
  .replace('{{convert}}', 'USD')
)
  .then(({ data: prices }) => {
    const pricesReturn: GetPricesResult = {}
    for (const contract in prices) {
      if (contract in tokenContractsSymbolMap) {
        pricesReturn[tokenContractsSymbolMap[contract]] = prices[contract]
      }
    }
    return pricesReturn
  })
