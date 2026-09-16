import { ALL_ACTION_TYPES } from '@/app/api/btc-vault/v1/schemas'
import { db } from '@/lib/db'

import { mapActionToDisplayStatus } from '../mapActionToDisplayStatus'
import type { BtcVaultHistoryItem, BtcVaultHistoryItemWithStatus, BtcVaultHistoryQueryParams } from '../types'
import type { BtcVaultHistorySource } from './types'

const TABLE_HISTORY = 'BtcVaultHistory'
const TABLE_HISTORY_COUNTER = 'BtcVaultHistoryCounter'
const TABLE_DEPOSIT_REQUEST = 'BtcDepositRequest'
const TABLE_REDEEM_REQUEST = 'BtcRedeemRequest'

/** Counter row covering every user, mirroring the subgraph's `global` counter id. */
const GLOBAL_COUNTER_ID = 'global'

const ACTION_TYPE_TO_COUNTER_COLUMN: Record<string, string> = {
  DEPOSIT_REQUEST: 'depositRequests',
  DEPOSIT_CLAIMABLE: 'depositsClaimable',
  DEPOSIT_CLAIMED: 'depositsClaimed',
  DEPOSIT_CANCELLED: 'depositsCancelled',
  REDEEM_REQUEST: 'redeemRequests',
  REDEEM_CLAIMABLE: 'redeemsClaimable',
  REDEEM_CLAIMED: 'redeemsClaimed',
  REDEEM_CANCELLED: 'redeemsCancelled',
  REDEEM_ACCEPTED: 'redeemsAccepted',
}

/**
 * Encodes a value for comparison against a state-sync `Bytes` column (Postgres `bytea`).
 *
 * The one precedent in this repo is `nav-history/stateSync.ts`, which matches the subgraph's
 * `global` string id with `Buffer.from('global', 'utf8')` — so a `Bytes` column holds the UTF-8
 * bytes of whatever string the subgraph returned, `0x` prefix included for address-shaped values.
 *
 * @remarks Getting this wrong returns an empty result rather than an error, so it must be checked
 * against a populated database before this source is trusted ahead of the subgraph.
 */
function toDbBytes(value: string): Buffer {
  return Buffer.from(value, 'utf8')
}

/** `Bytes` columns come back as Buffers; render them the way the subgraph would. */
function fromDbBytes(value: unknown): string {
  if (Buffer.isBuffer(value)) return value.toString('utf8').toLowerCase()
  return String(value).toLowerCase()
}

function normalizeRow(raw: Record<string, unknown>): BtcVaultHistoryItem {
  return {
    id: fromDbBytes(raw.id),
    user: fromDbBytes(raw.user),
    action: String(raw.action),
    assets: String(raw.assets),
    shares: String(raw.shares),
    epochId: String(raw.epochId),
    timestamp: Number(raw.timestamp),
    blockNumber: String(raw.blockNumber),
    transactionHash: fromDbBytes(raw.transactionHash),
  }
}

async function fetchHistoryPage(params: BtcVaultHistoryQueryParams): Promise<BtcVaultHistoryItem[]> {
  const { limit, page, sort_field, sort_direction, type, address } = params
  const actions = type ? type.map(t => t.toUpperCase()) : [...ALL_ACTION_TYPES]

  const query = db(TABLE_HISTORY)
    .select(
      'id',
      'user',
      'action',
      'assets',
      'shares',
      'epochId',
      'timestamp',
      'blockNumber',
      'transactionHash',
    )
    .whereIn('action', actions)
    .orderBy(sort_field, sort_direction)
    .limit(limit)
    .offset((page - 1) * limit)

  if (address) {
    query.where('user', toDbBytes(address.toLowerCase()))
  }

  const rows = await query
  return rows.map(normalizeRow)
}

/**
 * Total matching rows, read from the pre-aggregated counter rather than `count(*)`.
 *
 * The counter has one column per action type, so a filtered total is the sum of those columns —
 * the same arithmetic the subgraph source does, kept here so both sources page identically.
 */
async function fetchHistoryTotal(address: string | undefined, type?: string[]): Promise<number> {
  const counterId = address ? address.toLowerCase() : GLOBAL_COUNTER_ID

  const row = await db(TABLE_HISTORY_COUNTER)
    .where({ id: toDbBytes(counterId) })
    .first()
  if (!row) return 0

  if (!type || type.length === 0) return Number(row.total)

  return type.reduce((sum, t) => {
    const column = ACTION_TYPE_TO_COUNTER_COLUMN[t.toUpperCase()]
    return column ? sum + Number(row[column] ?? 0) : sum
  }, 0)
}

/**
 * Resolves `displayStatus` for `*_REQUEST` rows from the request tables.
 *
 * Request ids are `<user>-<epochId>`, matching how the subgraph builds them. Every other action
 * maps straight from the action name and needs no lookup.
 */
async function enrichWithRequestStatus(
  items: BtcVaultHistoryItem[],
): Promise<BtcVaultHistoryItemWithStatus[]> {
  const depositIds = new Set<string>()
  const redeemIds = new Set<string>()

  for (const item of items) {
    const id = `${item.user.toLowerCase()}-${item.epochId}`
    if (item.action === 'DEPOSIT_REQUEST') depositIds.add(id)
    else if (item.action === 'REDEEM_REQUEST') redeemIds.add(id)
  }

  const statusById = new Map<string, string>()

  const loadStatuses = async (table: string, ids: Set<string>) => {
    if (ids.size === 0) return
    const rows = await db(table)
      .select('id', 'status')
      .whereIn('id', [...ids].map(toDbBytes))
    for (const row of rows) {
      statusById.set(fromDbBytes(row.id), String(row.status))
    }
  }

  await Promise.all([
    loadStatuses(TABLE_DEPOSIT_REQUEST, depositIds),
    loadStatuses(TABLE_REDEEM_REQUEST, redeemIds),
  ])

  return items.map((item): BtcVaultHistoryItemWithStatus => {
    if (item.action !== 'DEPOSIT_REQUEST' && item.action !== 'REDEEM_REQUEST') {
      return { ...item, displayStatus: mapActionToDisplayStatus(item.action) }
    }

    const id = `${item.user.toLowerCase()}-${item.epochId}`
    const status = statusById.get(id)?.toUpperCase()

    if (status === 'CLAIMABLE') {
      return { ...item, displayStatus: item.action === 'DEPOSIT_REQUEST' ? 'open_to_claim' : 'claim_pending' }
    }
    if (status === 'ACCEPTED') return { ...item, displayStatus: 'approved' }
    if (status === 'CLAIMED') return { ...item, displayStatus: 'successful' }
    if (status === 'CANCELLED') return { ...item, displayStatus: 'cancelled' }
    return { ...item, displayStatus: 'pending' }
  })
}

export interface GetFromStateSyncSourceOptions {
  /** Used when the request-status lookup fails, matching the other sources' degraded behaviour. */
  mapActionOnly: (item: BtcVaultHistoryItem) => BtcVaultHistoryItemWithStatus
}

/**
 * state-sync history source: page and total from Postgres, status enrichment from the request
 * tables in the same database. Sits ahead of The Graph and Blockscout so the shared Blockscout
 * queue never sees this route in the steady state.
 */
export function getFromStateSyncSource(options: GetFromStateSyncSourceOptions): BtcVaultHistorySource {
  const { mapActionOnly } = options
  return {
    name: 'state-sync',
    async fetchPageAndTotal(params: BtcVaultHistoryQueryParams) {
      const [items, total] = await Promise.all([
        fetchHistoryPage(params),
        fetchHistoryTotal(params.address, params.type),
      ])
      return { items, total }
    },
    async enrichWithStatus(items: BtcVaultHistoryItem[]) {
      try {
        return await enrichWithRequestStatus(items)
      } catch (error) {
        console.warn('[btc-vault] state-sync enrichment failed; using action-only displayStatus', error)
        return items.map(mapActionOnly)
      }
    },
  }
}
