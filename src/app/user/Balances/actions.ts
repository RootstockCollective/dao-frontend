import { GetAddressTokenResult, GetPricesResult } from '@/app/user/types'
import { axiosInstance } from '@/lib/utils'
import { fetchAddressTokensEndpoint, fetchPricesEndpoint } from '@/lib/endpoints'
import { currentEnvContracts } from '@/lib/contracts'

export const fetchAddressTokens = (address: string, chainId = 31) =>
  axiosInstance
    .get<GetAddressTokenResult>(
      fetchAddressTokensEndpoint.replace('{{chainId}}', chainId.toString()).replace('{{address}}', address),
    )
    .then(({ data }) => data)

// Prices

export const fetchPrices = () =>
  axiosInstance
    .get<GetPricesResult>(
      fetchPricesEndpoint
        .replace('{{addresses}}', Object.values(currentEnvContracts).join(','))
        .replace('{{convert}}', 'USD'),
    )
    .then(({ data: prices }) => {
      const pricesReturn: GetPricesResult = {}
      for (const contract in prices) {
        const contractFromEnv = (
          Object.keys(currentEnvContracts) as Array<keyof typeof currentEnvContracts>
        ).find(contractName => currentEnvContracts[contractName] === contract)
        if (contractFromEnv) {
          pricesReturn[contractFromEnv] = prices[contract]
        }
      }
      return pricesReturn
    })
