import { unstable_cache } from 'next/cache'
import type { z } from 'zod'

import { BTC_VAULT_WHITELISTED_USER_COLUMNS } from '@/app/api/db/constants'
import { db } from '@/lib/db'

import { BtcVaultWhitelistedUsersSortFieldEnum } from '../schemas'

export type BtcVaultWhitelistedUsersSortField = z.infer<typeof BtcVaultWhitelistedUsersSortFieldEnum>

/** One row from state-sync `BtcVaultWhitelistedUser`. */
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

const TABLE_WHITELISTED_USER = 'BtcVaultWhitelistedUser'
const TABLE_WHITELISTED_USERS_COUNTER = 'BtcVaultWhitelistedUsersCounter'

/**
 * Counter row id (Bytes) — matches subgraph-style global id (`global` as UTF-8 bytes).
 * Adjust if your indexer stores a different `id` for the singleton counter.
 */
const WHITELIST_USERS_COUNTER_GLOBAL_ID = Buffer.from('global', 'utf8')

function bytesToHexLower(value: unknown): string {
  if (Buffer.isBuffer(value)) {
    return `0x${value.toString('hex')}`.toLowerCase()
  }
  if (typeof value === 'string') {
    const s = value.startsWith('0x') ? value.slice(2) : value
    return `0x${s}`.toLowerCase()
  }
  return String(value).toLowerCase()
}

function normalizeRow(raw: Record<string, unknown>): BtcVaultWhitelistedUserItem {
  return {
    id: bytesToHexLower(raw.id),
    account: bytesToHexLower(raw.account),
    lastUpdated: Number(raw.lastUpdated),
    status: String(raw.status ?? ''),
  }
}

async function countBtcVaultWhitelistedUsersUncached(): Promise<number> {
  const row = await db(TABLE_WHITELISTED_USERS_COUNTER)
    .where({ id: WHITELIST_USERS_COUNTER_GLOBAL_ID })
    .select('total')
    .first()

  if (!row) return 0

  return Number(row.total)
}

const getCachedBtcVaultWhitelistedUsersTotal = unstable_cache(
  countBtcVaultWhitelistedUsersUncached,
  ['btc-vault-whitelisted-users-total'],
  { revalidate: 120 },
)

/**
 * Fetches one page of `BtcVaultWhitelistedUser` from state-sync Postgres (usd-vault subgraph provider).
 */
export async function fetchBtcVaultWhitelistedUsersPage(params: {
  limit: number
  page: number
  sort_field: BtcVaultWhitelistedUsersSortField
  sort_direction: 'asc' | 'desc'
}): Promise<BtcVaultWhitelistedUsersPageResult> {
  const offset = (params.page - 1) * params.limit
  const { sort_field, sort_direction, limit } = params

  const baseQuery = db(TABLE_WHITELISTED_USER).select([...BTC_VAULT_WHITELISTED_USER_COLUMNS])

  const orderedQuery = baseQuery.clone().modify(qb => {
    if (sort_field === 'status') {
      qb.orderBy('status', sort_direction).orderBy('lastUpdated', 'desc').orderBy('account', 'asc')
    } else {
      qb.orderBy(sort_field, sort_direction).orderBy('id', 'asc')
    }
  })

  const [total, rows] = await Promise.all([
    getCachedBtcVaultWhitelistedUsersTotal(),
    orderedQuery.offset(offset).limit(limit),
  ])

  return {
    data: (rows as Record<string, unknown>[]).map(normalizeRow),
    total,
  }
}
