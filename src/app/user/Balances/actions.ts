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
import { fetchLogsByTopic } from '@/lib/blockscout/fetch-logs-by-topic'
import { BLOCKSCOUT_URL, RBTC, RIF, STRIF, USDRIF, USDT0 } from '@/lib/constants'
import { GovernorAddress, tokenContracts } from '@/lib/contracts'

// CoinMarketCap IDs for tokens that have market prices.
// Keys must match tokenContracts keys (RBTC is 'tRBTC' on testnet, 'rBTC' on mainnet).
const CMC_TOKEN_IDS: Record<string, number> = {
  [RBTC]: 3626,
  [RIF]: 3701,
  [USDT0]: 825, // USDT
}

// Tokens with a fixed $1.0 price (stablecoins)
const STABLECOIN_TOKENS = new Set([USDRIF])

// Tokens that mirror another token's price
const MIRROR_TOKENS: Record<string, string> = {
  [STRIF]: RIF, // staked RIF, 1:1 ratio
}

interface CmcQuote {
  quote: {
    USD: {
      price: number
      last_updated: string
    }
  }
}

interface CmcResponse {
  data: Record<string, CmcQuote>
}

// CoinMarketCap free tier: 10,000 calls/month ≈ 1 call every 5 minutes.
// next.revalidate on the fetch() call caches the response across requests.
const CMC_REVALIDATE_SECONDS = 5 * 60
const FETCH_TIMEOUT_MS = 10_000

export const fetchPrices = async (): Promise<GetPricesResult> => {
  const cmcKey = process.env.COIN_MARKET_CAP_KEY
  const tokenNames = Object.keys(tokenContracts) as Array<keyof typeof tokenContracts>
  const now = new Date().toISOString()
  const result: GetPricesResult = {}

  for (const name of tokenNames) {
    if (STABLECOIN_TOKENS.has(String(name))) {
      result[name] = { price: 1.0, lastUpdated: now }
    }
  }

  const idsToFetch = tokenNames.filter(name => CMC_TOKEN_IDS[name]).map(name => CMC_TOKEN_IDS[name])
  const idToName = Object.fromEntries(
    tokenNames.filter(name => CMC_TOKEN_IDS[name]).map(name => [CMC_TOKEN_IDS[name].toString(), name]),
  )

  if (idsToFetch.length > 0 && cmcKey) {
    const url = `https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest?id=${idsToFetch.join(',')}&convert=USD`
    const res = await fetch(url, {
      headers: { 'X-CMC_PRO_API_KEY': cmcKey },
      next: { revalidate: CMC_REVALIDATE_SECONDS },
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    })
    if (res.ok) {
      const { data } = (await res.json()) as CmcResponse
      for (const [id, quote] of Object.entries(data)) {
        const tokenName = idToName[id]
        if (tokenName) {
          result[tokenName] = {
            price: quote.quote.USD.price,
            lastUpdated: quote.quote.USD.last_updated,
          }
        }
      }
    }
  } else if (idsToFetch.length > 0 && !cmcKey && process.env.PRICES_API_URL) {
    console.log('No COIN_MARKET_CAP_KEY defined — falling back to', process.env.PRICES_API_URL)
    const res = await fetch(process.env.PRICES_API_URL, {
      next: { revalidate: CMC_REVALIDATE_SECONDS },
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    })
    if (res.ok) {
      const remote = (await res.json()) as GetPricesResult
      Object.assign(result, remote)
    }
  }

  for (const [mirror, source] of Object.entries(MIRROR_TOKENS)) {
    if (tokenNames.includes(mirror as keyof typeof tokenContracts) && result[source]) {
      result[mirror] = result[source]
    }
  }

  return result
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

function buildPaginationParams(nextParams: NextPageParams | null): string {
  if (!nextParams) return ''
  const searchParams = new URLSearchParams()
  for (const [key, value] of Object.entries(nextParams)) {
    if (value != null) searchParams.set(key, String(value))
  }
  const qs = searchParams.toString()
  return qs ? `&${qs}` : ''
}

interface BlockscoutNftInstance {
  id: string
  owner: { hash: string; ens_domain_name?: string }
  image_url: string | null
  metadata: NftHolderItem['metadata'] | null
}

export const fetchNftHoldersOfAddress = async (
  address: string,
  nextParams: NextPageParams | null,
): Promise<ServerResponseV2<NftHolderItem>> => {
  if (!isAddress(address)) {
    throw new Error(`Invalid address: ${address}`)
  }
  const pagination = buildPaginationParams(nextParams)
  const url = `${BLOCKSCOUT_URL}/api/v2/tokens/${address}/instances?${pagination}`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`)
  const data = (await res.json()) as {
    items: BlockscoutNftInstance[]
    next_page_params: NextPageParams | null
  }
  return {
    items: data.items.map(item => ({
      owner: item.owner.hash,
      id: item.id,
      image_url: item.image_url ?? '',
      metadata: item.metadata ?? { creator: '', description: '', external_url: '', image: '', name: '' },
      ens_domain_name: item.owner.ens_domain_name,
    })),
    next_page_params: data.next_page_params,
  }
}

export const fetchTokenHoldersOfAddress = async (
  address: string,
  nextParams: NextPageParams | null,
): Promise<ServerResponseV2<TokenHoldersResponse>> => {
  if (!isAddress(address)) {
    throw new Error(`Invalid address: ${address}`)
  }
  const pagination = buildPaginationParams(nextParams)
  const url = `${BLOCKSCOUT_URL}/api/v2/tokens/${address}/holders?${pagination}`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`)
  const data: ServerResponseV2<TokenHoldersResponse> = await res.json()
  return data
}
