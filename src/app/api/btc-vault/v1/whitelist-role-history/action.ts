import { gql } from '@apollo/client'
import { unstable_cache } from 'next/cache'
import type { z } from 'zod'

import { btcVaultClient } from '@/shared/components/ApolloClient'

import { BtcVaultWhitelistedUsersSortFieldEnum } from '../schemas'

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

/** Subgraph `BtcVaultWhitelistedUsersCounter` global row id (see entity schema). */
const WHITELIST_USERS_COUNTER_GLOBAL_ID = 'global'

export type BtcVaultWhitelistedUsersSortField = z.infer<typeof BtcVaultWhitelistedUsersSortFieldEnum>

/** One row from subgraph `btcVaultWhitelistedUsers`. */
export interface BtcVaultWhitelistedUserItem {
  id: string
  account: string
  lastUpdated: number
  status: string
}

export interface BtcVaultWhitelistedUsersPageResult {
  data: BtcVaultWhitelistedUserItem[]
  total: number
}

/** Page size for full-list subgraph scans (count + status sort). Not related to the UI table page size. */
const WHITELIST_SUBGRAPH_SCAN_PAGE = 500

async function countBtcVaultWhitelistedUsersUncached(): Promise<number> {
  const result = await btcVaultClient.query<{
    btcVaultWhitelistedUsersCounter: { total: string } | null
  }>({
    query: BTC_VAULT_WHITELISTED_USERS_COUNTER,
    variables: { id: WHITELIST_USERS_COUNTER_GLOBAL_ID },
    fetchPolicy: 'no-cache',
  })

  if (result.error) {
    throw result.error
  }

  const counter = result.data?.btcVaultWhitelistedUsersCounter
  if (!counter) return 0

  return Number(counter.total)
}

const getCachedBtcVaultWhitelistedUsersTotal = unstable_cache(
  countBtcVaultWhitelistedUsersUncached,
  ['btc-vault-whitelisted-users-total'],
  { revalidate: 120 },
)

interface RawBtcVaultWhitelistedUserRow {
  id: string
  account: string
  lastUpdated: string | number
  status: string
}

function normalizeRow(raw: RawBtcVaultWhitelistedUserRow): BtcVaultWhitelistedUserItem {
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

  // Deterministic tie-breakers so pagination is stable across requests.
  if (a.lastUpdated !== b.lastUpdated) return b.lastUpdated - a.lastUpdated
  return a.account.localeCompare(b.account)
}

async function fetchAllWhitelistedUsersForStatusSort(): Promise<BtcVaultWhitelistedUserItem[]> {
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
    rows.push(...chunk.map(normalizeRow))

    if (chunk.length < WHITELIST_SUBGRAPH_SCAN_PAGE) break
    skip += WHITELIST_SUBGRAPH_SCAN_PAGE
  }

  return rows
}

/**
 * Fetches one page of `btcVaultWhitelistedUsers` (current whitelist state per account).
 */
export async function fetchBtcVaultWhitelistedUsersPage(params: {
  limit: number
  page: number
  sort_field: BtcVaultWhitelistedUsersSortField
  sort_direction: 'asc' | 'desc'
}): Promise<BtcVaultWhitelistedUsersPageResult> {
  const skip = (params.page - 1) * params.limit

  if (params.sort_field === 'status') {
    const [allRows, total] = await Promise.all([
      fetchAllWhitelistedUsersForStatusSort(),
      getCachedBtcVaultWhitelistedUsersTotal(),
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
    getCachedBtcVaultWhitelistedUsersTotal(),
  ])

  if (pageResult.error) {
    throw pageResult.error
  }

  const rows = pageResult.data?.btcVaultWhitelistedUsers
  if (rows === undefined) {
    throw new Error('Subgraph returned no btcVaultWhitelistedUsers data')
  }

  return {
    data: rows.map(normalizeRow),
    total,
  }
}
