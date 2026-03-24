import { RBTC_VAULT_ADDRESS } from '@/lib/constants'

import type { BtcVaultHistoryDisplayStatus, BtcVaultHistoryItem } from '../../types'
import { tryDecodeLog } from './decode-logs'
import { fetchVaultLogsForTopics, topic0sForActionFilter } from './fetch-logs'
import { normalizeAddress, normalizeHistoryActionType, requireBlockscoutUrl } from './utils'

const CANCEL_ACTION_FOR_REQUEST: Record<string, string> = {
  DEPOSIT_REQUEST: 'DEPOSIT_CANCELLED',
  REDEEM_REQUEST: 'REDEEM_CANCELLED',
}

/**
 * Maps each action-type filter value to its base REQUEST action.
 * The Blockscout source only returns REQUEST rows (matching the subgraph behaviour);
 * non-REQUEST type filters map to the same base action.
 */
const ACTION_TO_BASE_REQUEST: Record<string, string> = {
  DEPOSIT_REQUEST: 'DEPOSIT_REQUEST',
  DEPOSIT_CLAIMABLE: 'DEPOSIT_REQUEST',
  DEPOSIT_CLAIMED: 'DEPOSIT_REQUEST',
  DEPOSIT_CANCELLED: 'DEPOSIT_REQUEST',
  REDEEM_REQUEST: 'REDEEM_REQUEST',
  REDEEM_CLAIMABLE: 'REDEEM_REQUEST',
  REDEEM_CLAIMED: 'REDEEM_REQUEST',
  REDEEM_CANCELLED: 'REDEEM_REQUEST',
  REDEEM_ACCEPTED: 'REDEEM_REQUEST',
}

/**
 * Identifies which REQUEST rows have been cancelled, returning the set of
 * cancelled REQUEST ids.
 *
 * The vault allows at most one active request per (controller, epochId).
 * A request is "cancelled" when a CANCEL event follows it before the next
 * REQUEST of the same type in the same epoch.
 */
function identifyCancelledRequestIds(allDirectRows: BtcVaultHistoryItem[]): Set<string> {
  const relevant = allDirectRows.filter(
    r =>
      r.action === 'DEPOSIT_REQUEST' ||
      r.action === 'REDEEM_REQUEST' ||
      r.action === 'DEPOSIT_CANCELLED' ||
      r.action === 'REDEEM_CANCELLED',
  )

  const groups = new Map<string, BtcVaultHistoryItem[]>()
  for (const row of relevant) {
    const type = row.action.startsWith('DEPOSIT') ? 'deposit' : 'redeem'
    const key = `${row.user}-${row.epochId}-${type}`
    let list = groups.get(key)
    if (!list) {
      list = []
      groups.set(key, list)
    }
    list.push(row)
  }

  const cancelledIds = new Set<string>()
  for (const events of groups.values()) {
    events.sort((a, b) => a.timestamp - b.timestamp || a.id.localeCompare(b.id))

    const requestStack: BtcVaultHistoryItem[] = []
    for (const ev of events) {
      if (ev.action === 'DEPOSIT_REQUEST' || ev.action === 'REDEEM_REQUEST') {
        requestStack.push(ev)
      } else if (
        requestStack.length > 0 &&
        ev.action === CANCEL_ACTION_FOR_REQUEST[requestStack[requestStack.length - 1]!.action]
      ) {
        cancelledIds.add(requestStack.pop()!.id)
      }
    }
  }

  return cancelledIds
}

/**
 * Deduplicates DEPOSIT_CANCELLED rows that originate from paired
 * DepositRequestCancelled + NativeDepositRequestCancelled events in the same tx.
 */
function deduplicateCancelRows(rows: BtcVaultHistoryItem[]): BtcVaultHistoryItem[] {
  const seen = new Set<string>()
  return rows.filter(row => {
    if (row.action !== 'DEPOSIT_CANCELLED') return true
    const key = `${row.user}-${row.epochId}-${row.transactionHash}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

/**
 * Fetches vault contract logs from Blockscout, decodes per-user events,
 * and returns only REQUEST rows (DEPOSIT_REQUEST / REDEEM_REQUEST) — one per
 * operation — matching the subgraph's output shape.
 *
 * Cancelled requests are pre-enriched with `displayStatus: 'cancelled'` so
 * the RPC enrichment step can skip them (the vault returns 0/0 for cancelled
 * requests, which would incorrectly map to 'successful').
 *
 * Non-REQUEST type filters (e.g. `deposit_claimable`) are mapped to the base
 * REQUEST action so logs are still fetched; the final status-based narrowing
 * happens after RPC enrichment in the API route layer.
 */
export async function fetchBtcVaultHistoryFromBlockscout(params: {
  limit: number
  page: number
  sort_field: 'timestamp' | 'assets'
  sort_direction: 'asc' | 'desc'
  type?: string[]
  address?: string
}): Promise<{
  items: (BtcVaultHistoryItem & { displayStatus?: BtcVaultHistoryDisplayStatus })[]
  total: number
}> {
  const baseUrl = requireBlockscoutUrl()
  const vaultAddress = normalizeAddress(RBTC_VAULT_ADDRESS)
  if (!vaultAddress || vaultAddress === '0x') {
    throw new Error('RBTC vault address is not configured')
  }

  const originalActionFilter = params.type?.length
    ? new Set(params.type.map(normalizeHistoryActionType))
    : null
  const userFilter = params.address ? normalizeAddress(params.address) : null

  const topic0s = topic0sForActionFilter(originalActionFilter)
  const rawItems = await fetchVaultLogsForTopics(baseUrl, vaultAddress, topic0s)

  let directRows: BtcVaultHistoryItem[] = []
  for (const raw of rawItems) {
    const row = tryDecodeLog(raw)
    if (!row) continue
    if (userFilter && row.user !== userFilter) continue
    directRows.push(row)
  }

  directRows = deduplicateCancelRows(directRows)

  const cancelledIds = identifyCancelledRequestIds(directRows)

  const baseActionFilter = originalActionFilter
    ? new Set([...originalActionFilter].map(a => ACTION_TO_BASE_REQUEST[a] ?? a))
    : null

  const requestRows = directRows.filter(r => {
    if (r.action !== 'DEPOSIT_REQUEST' && r.action !== 'REDEEM_REQUEST') return false
    if (baseActionFilter && !baseActionFilter.has(r.action)) return false
    return true
  })

  const collected: (BtcVaultHistoryItem & { displayStatus?: BtcVaultHistoryDisplayStatus })[] =
    requestRows.map(row => {
      if (cancelledIds.has(row.id)) {
        return { ...row, displayStatus: 'cancelled' as const }
      }
      return { ...row }
    })

  const dir = params.sort_direction === 'asc' ? 1 : -1
  collected.sort((a, b) => {
    if (params.sort_field === 'assets') {
      const av = BigInt(a.assets || '0')
      const bv = BigInt(b.assets || '0')
      if (av === bv) return (a.timestamp - b.timestamp) * dir
      return av < bv ? -dir : dir
    }
    if (a.timestamp === b.timestamp) return a.id.localeCompare(b.id) * dir
    return (a.timestamp - b.timestamp) * dir
  })

  const total = collected.length
  const start = (params.page - 1) * params.limit
  const items = collected.slice(start, start + params.limit)

  return { items, total }
}
