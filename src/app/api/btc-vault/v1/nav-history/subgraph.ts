import { gql } from '@apollo/client'
import { unstable_cache } from 'next/cache'

import { btcVaultClient } from '@/shared/components/ApolloClient'

import type {
  BtcVaultNavHistoryItem,
  BtcVaultNavHistoryPageResult,
  BtcVaultNavHistorySortField,
} from './types'

/**
 * Per-request paged query — graph-node owns ORDER BY / LIMIT / OFFSET. Mirrors the
 * `btcVaultWhitelistedUsers` paging pattern; total count is sourced from the counter entity below.
 *
 * Tie-break note: graph-node only accepts a single `orderBy`, so rows that share the same primary
 * value are ordered by graph-node's default (entity id). This differs from `stateSync` which
 * tie-breaks on `id ASC` explicitly.
 */
const BTC_VAULT_NAV_HISTORY_PAGE = gql`
  query BtcVaultNavHistoryPage(
    $first: Int!
    $skip: Int!
    $orderBy: BtcVaultNavHistory_orderBy!
    $orderDirection: OrderDirection!
  ) {
    btcVaultNavHistories(first: $first, skip: $skip, orderBy: $orderBy, orderDirection: $orderDirection) {
      id
      epochId
      reportedOffchainAssets
      processedAt
      requestsProcessedInEpoch
      blockNumber
      transactionHash
    }
  }
`

const BTC_VAULT_NAV_HISTORY_COUNTER = gql`
  query BtcVaultNavHistoryCounterQuery($id: ID!) {
    btcVaultNavHistoryCounter(id: $id) {
      total
    }
  }
`

/** Subgraph `BtcVaultNavHistoryCounter` global row id (matches the `'global'` convention used elsewhere). */
const NAV_HISTORY_COUNTER_GLOBAL_ID = 'global'

export interface RawBtcVaultNavHistoryRow {
  id: string
  epochId: string | number
  reportedOffchainAssets: string | number
  processedAt: string | number
  blockNumber: string | number
  transactionHash: string
  requestsProcessedInEpoch?: string | number
  requestsProcessed?: string | number
}

function normalizeRowFromSubgraph(raw: RawBtcVaultNavHistoryRow): BtcVaultNavHistoryItem {
  return {
    id: raw.id.toLowerCase(),
    epochId: Number(raw.epochId),
    reportedOffchainAssets: String(raw.reportedOffchainAssets),
    processedAt: Number(raw.processedAt),
    requestsProcessedInEpoch: Number(raw.requestsProcessedInEpoch ?? raw.requestsProcessed ?? 0),
    blockNumber: Number(raw.blockNumber),
    transactionHash: raw.transactionHash.toLowerCase(),
    deposits: [],
    redeems: [],
  }
}

async function countBtcVaultNavHistoryFromSubgraphUncached(): Promise<number> {
  const result = await btcVaultClient.query<{
    btcVaultNavHistoryCounter: { total: string | number } | null
  }>({
    query: BTC_VAULT_NAV_HISTORY_COUNTER,
    variables: { id: NAV_HISTORY_COUNTER_GLOBAL_ID },
    fetchPolicy: 'no-cache',
  })

  if (result.error) {
    throw result.error
  }

  const counter = result.data?.btcVaultNavHistoryCounter
  if (!counter) return 0

  return Number(counter.total)
}

/**
 * Counter is the only thing we cache here — page queries stay live so navigation reflects the
 * latest indexed rows. 120 s revalidate matches the state-sync counter cache.
 */
const getCachedBtcVaultNavHistoryTotalFromSubgraph = unstable_cache(
  countBtcVaultNavHistoryFromSubgraphUncached,
  ['btc-vault-nav-history-total', 'subgraph'],
  { revalidate: 120 },
)

export async function fetchBtcVaultNavHistoryPageFromSubgraph(params: {
  limit: number
  page: number
  sort_field: BtcVaultNavHistorySortField
  sort_direction: 'asc' | 'desc'
}): Promise<BtcVaultNavHistoryPageResult> {
  const skip = (params.page - 1) * params.limit

  const [pageResult, total] = await Promise.all([
    btcVaultClient.query<{
      btcVaultNavHistories: RawBtcVaultNavHistoryRow[]
    }>({
      query: BTC_VAULT_NAV_HISTORY_PAGE,
      variables: {
        first: params.limit,
        skip,
        orderBy: params.sort_field,
        orderDirection: params.sort_direction,
      },
      fetchPolicy: 'no-cache',
    }),
    getCachedBtcVaultNavHistoryTotalFromSubgraph(),
  ])

  if (pageResult.error) {
    throw pageResult.error
  }

  const rows = pageResult.data?.btcVaultNavHistories
  if (rows === undefined) {
    throw new Error('Subgraph returned no btcVaultNavHistories data')
  }

  return {
    data: rows.map(normalizeRowFromSubgraph),
    total,
  }
}
