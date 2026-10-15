import { ALL_ACTION_TYPES } from '@/app/api/btc-vault/v1/schemas'
import { db } from '@/lib/db'

import { mapActionToDisplayStatus } from '../mapActionToDisplayStatus'
import type { BtcVaultHistoryItem, BtcVaultHistoryItemWithStatus, BtcVaultHistoryQueryParams } from '../types'
import type { BtcVaultHistorySource } from './types'

const TABLE_HISTORY = 'BtcVaultHistory'
const TABLE_HISTORY_COUNTER = 'BtcVaultHistoryCounter'

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

/**
 * `Bytes` columns come back as Buffers holding the UTF-8 bytes of the subgraph's string, so this
 * is a decode, not a hex render. (`nav-history/stateSync.ts` hex-renders the same kind of column,
 * which produces an 86-character string — that one is wrong.)
 */
function fromDbBytes(value: unknown): string {
  if (Buffer.isBuffer(value)) return value.toString('utf8').toLowerCase()
  return String(value).toLowerCase()
}

function normalizeRow(raw: Record<string, unknown>): BtcVaultHistoryItem {
  return {
    id: fromDbBytes(raw.id),
    user: fromDbBytes(raw.user),
    action: String(raw.action),
    status: raw.status === null || raw.status === undefined ? undefined : String(raw.status),
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
      'status',
      'assets',
      'shares',
      'epochId',
      'timestamp',
      'blockNumber',
      'transactionHash',
    )
    .whereIn('action', actions)
    .orderBy(sort_field, sort_direction)
    // Ties on timestamp are the norm — several vault actions share a block. Without a second key
    // Postgres may order two LIMIT/OFFSET queries differently, duplicating one row across pages
    // and dropping another. Same tiebreak as nav-history and audit-log.
    .orderBy('id', 'asc')
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
 * Resolves `displayStatus` from the status the row already carries.
 *
 * `BtcVaultHistory.status` is a non-null `BtcRequestStatus` in the subgraph and is rewritten on
 * every lifecycle transition, so no lookup into the request tables is needed. That also avoids
 * rebuilding request ids, which are `<controller>-<epochId>-<nonce>` — a detail worth not
 * duplicating. Non-request actions map from the action name, as in the other sources.
 */
function withDisplayStatus(
  items: BtcVaultHistoryItem[],
  mapActionOnly: (item: BtcVaultHistoryItem) => BtcVaultHistoryItemWithStatus,
): BtcVaultHistoryItemWithStatus[] {
  return items.map((item): BtcVaultHistoryItemWithStatus => {
    if (item.action !== 'DEPOSIT_REQUEST' && item.action !== 'REDEEM_REQUEST') {
      return { ...item, displayStatus: mapActionToDisplayStatus(item.action) }
    }

    switch (item.status?.toUpperCase()) {
      case 'CLAIMABLE':
        return {
          ...item,
          displayStatus: item.action === 'DEPOSIT_REQUEST' ? 'open_to_claim' : 'claim_pending',
        }
      case 'ACCEPTED':
        return { ...item, displayStatus: 'approved' }
      case 'CLAIMED':
        return { ...item, displayStatus: 'successful' }
      case 'CANCELLED':
        return { ...item, displayStatus: 'cancelled' }
      case 'PENDING':
        return { ...item, displayStatus: 'pending' }
      default:
        // No status on the row: fall back rather than assert a lifecycle we did not read.
        return mapActionOnly(item)
    }
  })
}

export interface GetFromStateSyncSourceOptions {
  /** Used for rows that carry no status, matching the other sources' degraded behaviour. */
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

      // A source that has nothing must not answer for one that might. `total` is the counter, so
      // an empty page with a non-zero total is a legitimate past-the-end request and is kept;
      // empty with nothing counted means this database cannot serve the route — an unpopulated
      // table, a sync that has not caught up, the wrong environment — and the cascade should move
      // on to The Graph instead of rendering an empty history.
      if (items.length === 0 && total === 0) {
        throw new Error('state-sync has no BTC vault history rows for this query')
      }

      return { items, total }
    },
    async enrichWithStatus(items: BtcVaultHistoryItem[]) {
      return withDisplayStatus(items, mapActionOnly)
    },
  }
}
