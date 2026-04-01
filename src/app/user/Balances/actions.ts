'use server'

import type { Address, Hex } from 'viem'
import { isAddress, padHex } from 'viem'

import {
  NextPageParams,
  NftHolderItem,
  ServerResponseV2,
  TokenHoldersResponse,
} from '@/app/user/Balances/types'
import { GetPricesResult } from '@/app/user/types'
import { fetchLogsByTopic } from '@/lib/blockscout/fetchLogsByTopic'
import { RIF_WALLET_SERVICES_URL } from '@/lib/constants'
import { GovernorAddress, tokenContracts } from '@/lib/contracts'
import { fetchPricesEndpoint, getNftHolders, getTokenHoldersOfAddress } from '@/lib/endpoints'
import { BackendEventByTopic0ResponseValue } from '@/shared/utils'

const rws = RIF_WALLET_SERVICES_URL ?? ''

async function fetchRws<T = unknown>(path: string): Promise<{ data: T }> {
  const res = await fetch(`${rws}${path}`)
  if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`)
  const data = (await res.json()) as T
  return { data }
}

export const fetchPrices = async () => {
  return fetchRws<GetPricesResult>(
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
}

// keccak256('ProposalCreated(uint256,address,address[],uint256[],string[],bytes[],uint256,uint256,string)')
const PROPOSAL_CREATED_EVENT: Hex = '0x7d84a6263ae0d98d3329bd7b46bb4e8d6f98cd35a7adb45c274c8b7fd5ebd5e0'

export const fetchProposalCreated = async (fromBlock = 0) => {
  return fetchLogsByTopic({
    address: GovernorAddress,
    topic0: PROPOSAL_CREATED_EVENT,
    fromBlock: fromBlock.toString(),
  })
}

// keccak256('VoteCast(address,uint256,uint8,uint256,string)')
const CAST_VOTE_EVENT: Hex = '0xb8e138887d0aa13bab447e82de9d5c1777041ecd21ca36ba824ff1e6c07ddda4'

export const fetchVoteCastEventByAccountAddress = async (address: Address) => {
  return fetchLogsByTopic({
    address: GovernorAddress,
    topic0: CAST_VOTE_EVENT,
    topic1: padHex(address, { size: 32 }),
    topic0_1_opr: 'and',
  })
}

export const fetchProposalsCreatedCached = async (): Promise<{
  data: BackendEventByTopic0ResponseValue[]
}> => {
  const res = await fetch('/proposals/api')
  const data = (await res.json()) as BackendEventByTopic0ResponseValue[]
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
