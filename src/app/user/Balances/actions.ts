import { GetAddressTokenResult, GetPricesResult } from '@/app/user/types'
import { axiosInstance } from '@/lib/utils'
import {
  fetchAddressTokensEndpoint,
  fetchNFTsOwnedByAddressAndNftAddress,
  fetchPricesEndpoint,
  fetchProposalsCreatedByGovernorAddress,
  getNftInfo,
  getTokenHoldersOfAddress,
} from '@/lib/endpoints'
import { tokenContracts, GovernorAddress } from '@/lib/contracts'
import { NftMeta } from '@/shared/types'
import { ipfsGateways } from '@/config'
import { NextPageParams, ServerResponseV2, TokenHoldersResponse } from '@/app/user/Balances/types'

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

// Fetch NFTs owned by address
/*
 Expected response:
 [
    {
        "owner": "0xA1B1201B1f6EF7a5D589feD4E2cC4441276156B1",
        "token": {
            "address": "0xa3076bcaCc7112B7fa7c5A87CF32275296d85D64",
            "holders": 23,
            "totalSupply": 23,
            "name": "RIF DAO Early Adopters",
            "symbol": "RDEA",
            "type": "ERC-721",
            "iconUrl": null
        },
        "animationUrl": null,
        "externalAppUrl": "https://dapp.testnet.dao.rif.technology/",
        "id": "3",
        "imageUrl": "https://ipfs.io/ipfs/QmWKQETSTakBUGtLS4VtpYrk2siemgDvGQUmJewWV1XHSJ",
        "isUnique": true,
        "metadata": {
            "creator": "Rootstock Labs",
            "description": "Navigating through the vast networks, EchoNaut is a beacon of futuristic progress and digital exploration.",
            "external_url": "https://dapp.testnet.dao.rif.technology/",
            "image": "ipfs://QmWKQETSTakBUGtLS4VtpYrk2siemgDvGQUmJewWV1XHSJ",
            "name": "EchoNaut"
        }
    }
]

OR

[] (empty array)
*/
export const fetchNftsOwnedByAddressAndNFTAddress = (address: string, nftAddress: string) =>
  axiosInstance
    .get<{}>(
      fetchNFTsOwnedByAddressAndNftAddress
        .replace('{{address}}', address)
        .replace('{{nftAddress}}', nftAddress),
    )
    .then(({ data }) => data)
    .catch(error => console.log(error))

export interface BackendEventByTopic0ResponseValue {
  address: string
  blockNumber: string
  data: string
  gasPrice: string
  gasUsed: string
  logIndex: string
  timeStamp: string
  topics: Array<null | string>
  transactionHash: string
  transactionIndex: string
}

export const fetchProposalCreated = (fromBlock = 0) =>
  axiosInstance.get<BackendEventByTopic0ResponseValue[]>(
    fetchProposalsCreatedByGovernorAddress
      .replace('{{address}}', GovernorAddress)
      .replace('{{fromBlock}}', fromBlock.toString()),
  )

export const fetchProposalsCreatedCached = () => axiosInstance.get('/proposals/api', { baseURL: '/' })

export function fetchIpfsUri(uri: string, responseType?: 'json'): Promise<NftMeta>
export function fetchIpfsUri(uri: string, responseType?: 'blob'): Promise<Blob>
export async function fetchIpfsUri(
  ipfsUri: string,
  responseType: 'json' | 'blob' = 'json',
): Promise<NftMeta | Blob> {
  return Promise.any(
    ipfsGateways.map(async gateway => {
      const httpsUrl = ipfsUri.replace('ipfs://', gateway)
      const { data } = await axiosInstance.get(httpsUrl, { responseType })
      return data
    }),
  )
}

export const fetchNftInfo = (address: string) =>
  axiosInstance.get(getNftInfo.replace('{{nftAddress}}', address))

export const fetchTokenHoldersOfAddress = (address: string, nextParams: NextPageParams | null) =>
  axiosInstance
    .get<
      ServerResponseV2<TokenHoldersResponse>
    >(getTokenHoldersOfAddress.replace('{{address}}', address), { params: nextParams })
    .then(res => res.data)
