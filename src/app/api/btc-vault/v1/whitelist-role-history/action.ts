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

const BTC_VAULT_WHITELISTED_USERS_IDS_BATCH = gql`
  query BtcVaultWhitelistedUsersIds($skip: Int!, $first: Int!) {
    btcVaultWhitelistedUsers(skip: $skip, first: $first) {
      id
    }
  }
`

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

const COUNT_BATCH = 500
const COUNT_MAX_SKIP = 50_000
const STATUS_SORT_BATCH = 500
const STATUS_SORT_MAX_SKIP = 50_000

async function countBtcVaultWhitelistedUsersUncached(): Promise<number> {
  let skip = 0
  let total = 0
  for (;;) {
    const result = await btcVaultClient.query<{
      btcVaultWhitelistedUsers: { id: string }[]
    }>({
      query: BTC_VAULT_WHITELISTED_USERS_IDS_BATCH,
      variables: { skip, first: COUNT_BATCH },
      fetchPolicy: 'no-cache',
    })

    if (result.error) {
      throw result.error
    }

    const chunk = result.data?.btcVaultWhitelistedUsers ?? []
    total += chunk.length
    if (chunk.length < COUNT_BATCH) break
    skip += COUNT_BATCH
    if (skip >= COUNT_MAX_SKIP) break
  }
  return total
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
        first: STATUS_SORT_BATCH,
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

    if (chunk.length < STATUS_SORT_BATCH) break
    skip += STATUS_SORT_BATCH
    if (skip >= STATUS_SORT_MAX_SKIP) break
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
    const allRows = await fetchAllWhitelistedUsersForStatusSort()
    const sortedRows = allRows.sort((a, b) => compareStatusRows(a, b, params.sort_direction))
    return {
      data: sortedRows.slice(skip, skip + params.limit),
      total: allRows.length,
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
