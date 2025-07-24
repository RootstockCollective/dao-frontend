import { GetAddressTokenResult } from '@/app/my-holdings/types'
import { axiosInstance } from '@/lib/utils'
import {
  fetchAddressTokensEndpoint,
  fetchPricesEndpoint,
  getNftHolders,
  getTokenHoldersOfAddress,
} from '@/lib/endpoints'
import { tokenContracts } from '@/lib/contracts'
import {
  NextPageParams,
  NftHolderItem,
  ServerResponseV2,
  TokenHoldersResponse,
} from '@/app/my-holdings/sections/MyActivitiesAndBalances/components/Balances/types'
import { GetPricesResult } from '@/shared/types'

export const fetchAddressTokens = (address: string, chainId = 31) =>
  axiosInstance
    .get<GetAddressTokenResult>(
      fetchAddressTokensEndpoint.replace('{{chainId}}', chainId.toString()).replace('{{address}}', address),
    )
    .then(({ data }) => data)

export const fetchPrices = () =>
  axiosInstance
    .get<GetPricesResult>(
      fetchPricesEndpoint
        .replace('{{addresses}}', Object.values(tokenContracts).join(','))
        .replace('{{convert}}', 'USD'),
    )
    .then(({ data: prices }) => {
      const pricesReturn: GetPricesResult = {}
      for (const contract in prices) {
        const contractFromEnv = (Object.keys(tokenContracts) as Array<keyof typeof tokenContracts>).find(
          contractName => tokenContracts[contractName] === contract,
        )
        if (contractFromEnv) {
          pricesReturn[contractFromEnv] = prices[contract]
        }
      }
      return pricesReturn
    })

export const fetchNftHoldersOfAddress = async (address: string, nextParams: NextPageParams | null) => {
  const { data } = await axiosInstance.get<ServerResponseV2<NftHolderItem>>(
    getNftHolders.replace('{{address}}', address),
    { params: { nextPageParams: nextParams } },
  )
  if (data.error) {
    throw new Error(data.error)
  }
  return data
}

export const fetchTokenHoldersOfAddress = async (address: string, nextParams: NextPageParams | null) => {
  const { data } = await axiosInstance.get<ServerResponseV2<TokenHoldersResponse>>(
    getTokenHoldersOfAddress.replace('{{address}}', address),
    { params: { nextPageParams: nextParams } },
  )
  if (data.error) {
    throw new Error(data.error)
  }
  return data
}
