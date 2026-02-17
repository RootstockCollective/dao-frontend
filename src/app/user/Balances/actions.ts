import { GetPricesResult } from '@/app/user/types'
import {
  fetchNewAllocationEventEndpoint,
  fetchPricesEndpoint,
  fetchProposalsCreatedByGovernorAddress,
  fetchVoteCastEventEndpoint,
  getNftHolders,
  getTokenHoldersOfAddress,
} from '@/lib/endpoints'
import { tokenContracts, GovernorAddress, BackersManagerAddress } from '@/lib/contracts'
import {
  NextPageParams,
  NftHolderItem,
  ServerResponseV2,
  TokenHoldersResponse,
} from '@/app/user/Balances/types'
import { Address, isAddress, padHex } from 'viem'
import { RIF_WALLET_SERVICES_URL } from '@/lib/constants'

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

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- event logs consumed by viem's parseEventLogs
export const fetchProposalsCreatedCached = async (): Promise<{ data: any }> => {
  const res = await fetch('/proposals/api')
  const data = await res.json()
  return { data }
}

export const fetchNftHoldersOfAddress = async (address: string, nextParams: NextPageParams | null) => {
  const params = nextParams ? `&nextPageParams=${encodeURIComponent(JSON.stringify(nextParams))}` : ''
  const url = `${rws}${getNftHolders.replace('{{address}}', address)}${params}`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`)
  const data: ServerResponseV2<NftHolderItem> = await res.json()
  if (data.error) {
    throw new Error(data.error)
  }
  return data
}

export const fetchTokenHoldersOfAddress = async (address: string, nextParams: NextPageParams | null) => {
  const params = nextParams ? `&nextPageParams=${encodeURIComponent(JSON.stringify(nextParams))}` : ''
  const url = `${rws}${getTokenHoldersOfAddress.replace('{{address}}', address)}${params}`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`)
  const data: ServerResponseV2<TokenHoldersResponse> = await res.json()
  if (data.error) {
    throw new Error(data.error)
  }
  return data
}
