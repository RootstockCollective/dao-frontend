import { gql } from '@apollo/client'
import { unstable_cache } from 'next/cache'

import { btcVaultClient } from '@/shared/components/ApolloClient'

import type {
  BtcVaultWhitelistedUserItem,
  BtcVaultWhitelistedUsersPageResult,
  BtcVaultWhitelistedUsersSortField,
} from './types'

const BTC_VAULT_WHITELISTED_USERS_PAGE = gql`
  query BtcVaultWhitelistedUsersPage(
    $first: Int!
    $skip: Int!
    $orderBy: BtcVaultWhitelistedUser_orderBy!
    $orderDirection: OrderDirection!
  ) {
    btcVaultWhitelistedUsers(first: $first, skip: $skip, orderBy: $orderBy, orderDirection: $orderDirection) {
      account
      id
      lastUpdated
      status
    }
  }
`

const BTC_VAULT_WHITELISTED_USERS_COUNTER = gql`
  query BtcVaultWhitelistedUsersCounterQuery($id: ID!) {
    btcVaultWhitelistedUsersCounter(id: $id) {
      total
    }
  }
`

/** Subgraph `btcVaultWhitelistedUsersCounter` global id (GraphQL `ID`). */
const WHITELIST_USERS_COUNTER_GLOBAL_ID_SUBGRAPH = 'global'

/** Page size for subgraph full scans when sorting by `status` (in-memory sort). */
const WHITELIST_SUBGRAPH_SCAN_PAGE = 500

interface RawBtcVaultWhitelistedUserRow {
  id: string
  account: string
  lastUpdated: string | number
  status: string
}

function normalizeRowFromSubgraph(raw: RawBtcVaultWhitelistedUserRow): BtcVaultWhitelistedUserItem {
  return {
    id: raw.id,
    account: raw.account.toLowerCase(),
    lastUpdated: Number(raw.lastUpdated),
    status: raw.status,
  }
}

function compareStatusRows(
  a: BtcVaultWhitelistedUserItem,
  b: BtcVaultWhitelistedUserItem,
  direction: 'asc' | 'desc',
): number {
  const aStatus = a.status.trim().toUpperCase()
  const bStatus = b.status.trim().toUpperCase()
  const statusCmp = aStatus.localeCompare(bStatus)
  const primary = direction === 'asc' ? statusCmp : -statusCmp
  if (primary !== 0) return primary

  if (a.lastUpdated !== b.lastUpdated) return b.lastUpdated - a.lastUpdated
  return a.account.localeCompare(b.account)
}

async function countBtcVaultWhitelistedUsersFromSubgraphUncached(): Promise<number> {
  const result = await btcVaultClient.query<{
    btcVaultWhitelistedUsersCounter: { total: string } | null
  }>({
    query: BTC_VAULT_WHITELISTED_USERS_COUNTER,
    variables: { id: WHITELIST_USERS_COUNTER_GLOBAL_ID_SUBGRAPH },
    fetchPolicy: 'no-cache',
  })

  if (result.error) {
    throw result.error
  }

  const counter = result.data?.btcVaultWhitelistedUsersCounter
  if (!counter) return 0

  return Number(counter.total)
}

const getCachedBtcVaultWhitelistedUsersTotalFromSubgraph = unstable_cache(
  countBtcVaultWhitelistedUsersFromSubgraphUncached,
  ['btc-vault-whitelisted-users-total', 'subgraph'],
  { revalidate: 120 },
)

async function fetchAllWhitelistedUsersForStatusSortFromSubgraph(): Promise<BtcVaultWhitelistedUserItem[]> {
  let skip = 0
  const rows: BtcVaultWhitelistedUserItem[] = []

  for (;;) {
    const result = await btcVaultClient.query<{
      btcVaultWhitelistedUsers: RawBtcVaultWhitelistedUserRow[]
    }>({
      query: BTC_VAULT_WHITELISTED_USERS_PAGE,
      variables: {
        first: WHITELIST_SUBGRAPH_SCAN_PAGE,
        skip,
        orderBy: 'lastUpdated',
        orderDirection: 'desc',
      },
      fetchPolicy: 'no-cache',
    })

    if (result.error) {
      throw result.error
    }

    const chunk = result.data?.btcVaultWhitelistedUsers ?? []
    rows.push(...chunk.map(normalizeRowFromSubgraph))

    if (chunk.length < WHITELIST_SUBGRAPH_SCAN_PAGE) break
    skip += WHITELIST_SUBGRAPH_SCAN_PAGE
  }

  return rows
}

export async function fetchBtcVaultWhitelistedUsersPageFromSubgraph(params: {
  limit: number
  page: number
  sort_field: BtcVaultWhitelistedUsersSortField
  sort_direction: 'asc' | 'desc'
}): Promise<BtcVaultWhitelistedUsersPageResult> {
  const skip = (params.page - 1) * params.limit

  if (params.sort_field === 'status') {
    const [allRows, total] = await Promise.all([
      fetchAllWhitelistedUsersForStatusSortFromSubgraph(),
      getCachedBtcVaultWhitelistedUsersTotalFromSubgraph(),
    ])
    const sortedRows = [...allRows].sort((a, b) => compareStatusRows(a, b, params.sort_direction))
    return {
      data: sortedRows.slice(skip, skip + params.limit),
      total,
    }
  }

  const [pageResult, total] = await Promise.all([
    btcVaultClient.query<{
      btcVaultWhitelistedUsers: RawBtcVaultWhitelistedUserRow[]
    }>({
      query: BTC_VAULT_WHITELISTED_USERS_PAGE,
      variables: {
        first: params.limit,
        skip,
        orderBy: params.sort_field,
        orderDirection: params.sort_direction,
      },
      fetchPolicy: 'no-cache',
    }),
    getCachedBtcVaultWhitelistedUsersTotalFromSubgraph(),
  ])

  if (pageResult.error) {
    throw pageResult.error
  }

  const graphqlRows = pageResult.data?.btcVaultWhitelistedUsers
  if (graphqlRows === undefined) {
    throw new Error('Subgraph returned no btcVaultWhitelistedUsers data')
  }

  return {
    data: graphqlRows.map(normalizeRowFromSubgraph),
    total,
  }
}
