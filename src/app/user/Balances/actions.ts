import { Address, getAddress, isAddress, padHex } from 'viem'

import {
  NextPageParams,
  NftHolderItem,
  ServerResponseV2,
  TokenHoldersResponse,
} from '@/app/user/Balances/types'
import { GetPricesResult } from '@/app/user/types'
import { RIF_WALLET_SERVICES_URL } from '@/lib/constants'
import { BackersManagerAddress, GovernorAddress, tokenContracts } from '@/lib/contracts'
import {
  fetchNewAllocationEventEndpoint,
  fetchPricesEndpoint,
  fetchProposalsCreatedByGovernorAddress,
  fetchVoteCastEventEndpoint,
  getNftHolders,
  getTokenHoldersOfAddress,
} from '@/lib/endpoints'
import { BackendEventByTopic0ResponseValue } from '@/shared/utils'

const rws = RIF_WALLET_SERVICES_URL ?? ''

async function fetchRws<T = unknown>(path: string): Promise<{ data: T }> {
  const res = await fetch(`${rws}${path}`)
  if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`)
  const data = (await res.json()) as T
  return { data }
}

export const fetchPrices = () =>
  fetchRws<GetPricesResult>(
    fetchPricesEndpoint
      .replace(
        '{{addresses}}',
        Object.values(tokenContracts)
          .filter(address => address && isAddress(address))
          .join(','),
      )
      .replace('{{convert}}', 'USD'),
  ).then(({ data: prices }) => {
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
  fetchRws(
    fetchProposalsCreatedByGovernorAddress
      .replace('{{address}}', GovernorAddress)
      .replace('{{fromBlock}}', fromBlock.toString()),
  )

//TODO: refactor this out of Balances folder as it does not related to Balances
// the suggestion is to move it up the folder in User or moving it to shared
export const fetchVoteCastEventByAccountAddress = (address: Address) =>
  fetchRws(
    fetchVoteCastEventEndpoint
      .replace('{{address}}', GovernorAddress)
      .replace('{{topic1}}', padHex(address, { size: 32 })),
  )

export const fetchNewAllocationEventByAccountAddress = (address: Address) =>
  fetchRws(
    fetchNewAllocationEventEndpoint
      .replace('{{address}}', BackersManagerAddress)
      .replace('{{topic1}}', padHex(address, { size: 32 })),
  )

export const fetchProposalsCreatedCached = async (): Promise<{
  data: BackendEventByTopic0ResponseValue[]
}> => {
  const res = await fetch('/proposals/api')
  const data = (await res.json()) as BackendEventByTopic0ResponseValue[]
  return { data }
}

async function fetchHoldersOfAddress<T>(
  endpoint: string,
  address: string,
  nextParams: NextPageParams | null,
) {
  const sanitizedAddress = getAddress(address)
  const params = nextParams ? `&nextPageParams=${encodeURIComponent(JSON.stringify(nextParams))}` : ''
  const { data } = await fetchRws<ServerResponseV2<T>>(
    `${endpoint.replace('{{address}}', sanitizedAddress)}${params}`,
  )
  if (data.error) {
    throw new Error(data.error)
  }
  return data
}

export const fetchNftHoldersOfAddress = (address: string, nextParams: NextPageParams | null) =>
  fetchHoldersOfAddress<NftHolderItem>(getNftHolders, address, nextParams)

export const fetchTokenHoldersOfAddress = (address: string, nextParams: NextPageParams | null) =>
  fetchHoldersOfAddress<TokenHoldersResponse>(getTokenHoldersOfAddress, address, nextParams)
