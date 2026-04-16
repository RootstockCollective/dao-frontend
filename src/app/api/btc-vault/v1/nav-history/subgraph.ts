import { gql } from '@apollo/client'
import { unstable_cache } from 'next/cache'

import { btcVaultClient } from '@/shared/components/ApolloClient'

import type {
  BtcVaultNavHistoryItem,
  BtcVaultNavHistoryPageResult,
  BtcVaultNavHistorySortField,
} from './types'

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
      requestsProcessed
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

/** Subgraph `btcVaultNavHistoryCounter` global id (GraphQL `ID`). */
const NAV_HISTORY_COUNTER_GLOBAL_ID_SUBGRAPH = 'global'

interface RawBtcVaultNavHistoryRow {
  id: string
  epochId: string | number
  reportedOffchainAssets: string | number
  processedAt: string | number
  requestsProcessed: string | number
  blockNumber: string | number
  transactionHash: string
}

function normalizeRowFromSubgraph(raw: RawBtcVaultNavHistoryRow): BtcVaultNavHistoryItem {
  return {
    id: raw.id,
    epochId: Number(raw.epochId),
    reportedOffchainAssets: String(raw.reportedOffchainAssets),
    processedAt: Number(raw.processedAt),
    requestsProcessed: Number(raw.requestsProcessed),
    blockNumber: Number(raw.blockNumber),
    transactionHash: raw.transactionHash.toLowerCase(),
  }
}

async function countBtcVaultNavHistoryFromSubgraphUncached(): Promise<number> {
  const result = await btcVaultClient.query<{
    btcVaultNavHistoryCounter: { total: string } | null
  }>({
    query: BTC_VAULT_NAV_HISTORY_COUNTER,
    variables: { id: NAV_HISTORY_COUNTER_GLOBAL_ID_SUBGRAPH },
    fetchPolicy: 'no-cache',
  })

  if (result.error) {
    throw result.error
  }

  const counter = result.data?.btcVaultNavHistoryCounter
  if (!counter) return 0

  return Number(counter.total)
}

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

  const graphqlRows = pageResult.data?.btcVaultNavHistories
  if (graphqlRows === undefined) {
    throw new Error('Subgraph returned no btcVaultNavHistories data')
  }

  return {
    data: graphqlRows.map(normalizeRowFromSubgraph),
    total,
  }
}
