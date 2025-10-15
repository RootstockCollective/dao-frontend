import {
  NextPageParams,
  NftHolderItem,
  ServerResponseV2,
  TokenHoldersResponse,
} from '@/app/user/Balances/types'
import { GetPricesResult, Price } from '@/app/user/types'
import { BackersManagerAddress, GovernorAddress } from '@/lib/contracts'
import {
  fetchNewAllocationEventEndpoint,
  fetchPricesEndpoint,
  fetchProposalsCreatedByGovernorAddress,
  fetchVoteCastEventEndpoint,
  getNftHolders,
  getNftInfo,
  getTokenHoldersOfAddress
} from '@/lib/endpoints'
import { TOKENS } from '@/lib/tokens'
import { axiosInstance } from '@/lib/utils'
import { BackendEventByTopic0ResponseValue } from '@/shared/utils'
import { Address, padHex } from 'viem'

// Prices

export const fetchPrices = () =>
  axiosInstance
    .get<Record<Address, Price | null>>(
      fetchPricesEndpoint
        .replace('{{addresses}}', Object.values(TOKENS).map(({ address }) => address).join(','))
        .replace('{{convert}}', 'USD'),
    )
    .then(({ data: prices }) => {
      return (Object.entries(prices) as [Address, Price][]).reduce((acc, [contractAddress, price]) => {
        const supportedToken = Object.values(TOKENS).find(({ address }) => address === contractAddress)
        if (!!supportedToken) {
          acc[supportedToken.symbol] = price
        }

        return acc
      }, {} as GetPricesResult)
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
