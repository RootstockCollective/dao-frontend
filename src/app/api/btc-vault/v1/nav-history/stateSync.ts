import { unstable_cache } from 'next/cache'

import { BTC_VAULT_NAV_HISTORY_COLUMNS } from '@/app/api/db/constants'
import { db } from '@/lib/db'

import type {
  BtcVaultNavHistoryItem,
  BtcVaultNavHistoryPageResult,
  BtcVaultNavHistorySortField,
} from './types'

const TABLE_NAV_HISTORY = 'BtcVaultNavHistory'
const TABLE_NAV_HISTORY_COUNTER = 'BtcVaultNavHistoryCounter'

/** Counter row id (Bytes) in Postgres — UTF-8 `global` (matches subgraph string id bytes). */
const NAV_HISTORY_COUNTER_GLOBAL_ID_DB = Buffer.from('global', 'utf8')

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

function normalizeRowFromStateSync(raw: Record<string, unknown>): BtcVaultNavHistoryItem {
  return {
    id: bytesToHexLower(raw.id),
    epochId: Number(raw.epochId),
    reportedOffchainAssets: String(raw.reportedOffchainAssets),
    processedAt: Number(raw.processedAt),
    requestsProcessedInEpoch: Number(
      raw.requestsProcessedInEpoch ?? (raw.requestsProcessed as number | undefined) ?? 0,
    ),
    blockNumber: Number(raw.blockNumber),
    transactionHash: bytesToHexLower(raw.transactionHash),
    deposits: [],
    redeems: [],
  }
}

async function countBtcVaultNavHistoryFromStateSyncUncached(): Promise<number> {
  const row = await db(TABLE_NAV_HISTORY_COUNTER)
    .where({ id: NAV_HISTORY_COUNTER_GLOBAL_ID_DB })
    .select('total')
    .first()

  if (!row) return 0
  return Number(row.total)
}

const getCachedBtcVaultNavHistoryTotalFromStateSync = unstable_cache(
  countBtcVaultNavHistoryFromStateSyncUncached,
  ['btc-vault-nav-history-total', 'state-sync'],
  { revalidate: 120 },
)

export async function fetchBtcVaultNavHistoryPageFromStateSync(params: {
  limit: number
  page: number
  sort_field: BtcVaultNavHistorySortField
  sort_direction: 'asc' | 'desc'
}): Promise<BtcVaultNavHistoryPageResult> {
  const offset = (params.page - 1) * params.limit
  const { sort_field, sort_direction, limit } = params

  const baseQuery = db(TABLE_NAV_HISTORY).select([...BTC_VAULT_NAV_HISTORY_COLUMNS])

  const orderedQuery = baseQuery.clone().modify(qb => {
    qb.orderBy(sort_field, sort_direction).orderBy('id', 'asc')
  })

  const [total, rows] = await Promise.all([
    getCachedBtcVaultNavHistoryTotalFromStateSync(),
    orderedQuery.offset(offset).limit(limit),
  ])

  return {
    data: (rows as Record<string, unknown>[]).map(normalizeRowFromStateSync),
    total,
  }
}
