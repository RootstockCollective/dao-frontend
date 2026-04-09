import { unstable_cache } from 'next/cache'

import { BTC_VAULT_WHITELISTED_USER_COLUMNS } from '@/app/api/db/constants'
import { db } from '@/lib/db'

import type {
  BtcVaultWhitelistedUserItem,
  BtcVaultWhitelistedUsersPageResult,
  BtcVaultWhitelistedUsersSortField,
} from './types'

const TABLE_WHITELISTED_USER = 'BtcVaultWhitelistedUser'
const TABLE_WHITELISTED_USERS_COUNTER = 'BtcVaultWhitelistedUsersCounter'

/** Counter row id (Bytes) in Postgres — UTF-8 `global` (matches subgraph string id bytes). */
const WHITELIST_USERS_COUNTER_GLOBAL_ID_DB = Buffer.from('global', 'utf8')

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

function normalizeRowFromStateSync(raw: Record<string, unknown>): BtcVaultWhitelistedUserItem {
  return {
    id: bytesToHexLower(raw.id),
    account: bytesToHexLower(raw.account),
    lastUpdated: Number(raw.lastUpdated),
    status: String(raw.status ?? ''),
  }
}

async function countBtcVaultWhitelistedUsersFromStateSyncUncached(): Promise<number> {
  const row = await db(TABLE_WHITELISTED_USERS_COUNTER)
    .where({ id: WHITELIST_USERS_COUNTER_GLOBAL_ID_DB })
    .select('total')
    .first()

  if (!row) return 0

  return Number(row.total)
}

const getCachedBtcVaultWhitelistedUsersTotalFromStateSync = unstable_cache(
  countBtcVaultWhitelistedUsersFromStateSyncUncached,
  ['btc-vault-whitelisted-users-total', 'state-sync'],
  { revalidate: 120 },
)

export async function fetchBtcVaultWhitelistedUsersPageFromStateSync(params: {
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
    getCachedBtcVaultWhitelistedUsersTotalFromStateSync(),
    orderedQuery.offset(offset).limit(limit),
  ])

  return {
    data: (rows as Record<string, unknown>[]).map(normalizeRowFromStateSync),
    total,
  }
}
