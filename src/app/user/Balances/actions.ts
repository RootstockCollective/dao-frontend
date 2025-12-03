import { GetAddressTokenResult, GetPricesResult } from '@/app/user/types'
import { axiosInstance } from '@/lib/utils'
import {
  fetchAddressTokensEndpoint,
  fetchNewAllocationEventEndpoint,
  fetchNFTsOwnedByAddressAndNftAddress,
  fetchPricesEndpoint,
  fetchProposalsCreatedByGovernorAddress,
  fetchVoteCastEventEndpoint,
  getNftHolders,
  getNftInfo,
  getTokenHoldersOfAddress,
} from '@/lib/endpoints'
import { tokenContracts, GovernorAddress, BackersManagerAddress } from '@/lib/contracts'
import {
  NextPageParams,
  NftHolderItem,
  ServerResponseV2,
  TokenHoldersResponse,
} from '@/app/user/Balances/types'
import { BackendEventByTopic0ResponseValue } from '@/shared/utils'
import { Address, isAddress, padHex } from 'viem'

const fetchAddressTokens = (address: string, chainId = 31) =>
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
        .replace(
          '{{addresses}}',
          Object.values(tokenContracts)
            .filter(address => address && isAddress(address))
            .join(','),
        )
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

export const fetchProposalCreated = (fromBlock = 0) =>
  axiosInstance.get<BackendEventByTopic0ResponseValue[]>(
    fetchProposalsCreatedByGovernorAddress
      .replace('{{address}}', GovernorAddress)
      .replace('{{fromBlock}}', fromBlock.toString()),
  )

//TODO: refactor this out of Balances folder as it does not related to Balances
// the suggestion is to move it up the folder in User or moving it to shared
export const fetchVoteCastEventByAccountAddress = (address: Address) =>
  axiosInstance.get<BackendEventByTopic0ResponseValue[]>(
    fetchVoteCastEventEndpoint
      .replace('{{address}}', GovernorAddress)
      .replace('{{topic1}}', padHex(address, { size: 32 })),
  )

export const fetchNewAllocationEventByAccountAddress = (address: Address) =>
  axiosInstance.get<BackendEventByTopic0ResponseValue[]>(
    fetchNewAllocationEventEndpoint
      .replace('{{address}}', BackersManagerAddress)
      .replace('{{topic1}}', padHex(address, { size: 32 })),
  )

export const fetchProposalsCreatedCached = () => axiosInstance.get('/proposals/api', { baseURL: '/' })

const fetchNftInfo = (address: string) => axiosInstance.get(getNftInfo.replace('{{nftAddress}}', address))

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
