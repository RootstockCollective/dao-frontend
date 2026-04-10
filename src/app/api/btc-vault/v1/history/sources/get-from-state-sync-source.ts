import { ALL_ACTION_TYPES } from '@/app/api/btc-vault/v1/schemas'
import { db } from '@/lib/db'

import { mapActionToDisplayStatus } from '../mapActionToDisplayStatus'
import type { BtcVaultHistoryItem, BtcVaultHistoryItemWithStatus, BtcVaultHistoryQueryParams } from '../types'
import type { BtcVaultHistorySource } from './types'

const TABLE_HISTORY = 'BtcVaultHistory'
const TABLE_COUNTER = 'BtcVaultHistoryCounter'
const TABLE_DEPOSIT_REQUEST = 'BtcDepositRequest'
const TABLE_REDEEM_REQUEST = 'BtcRedeemRequest'

const ACTION_TYPE_TO_COUNTER_FIELD: Record<string, string> = {
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

interface CounterEntity {
  total: string
  depositRequests: string
  depositsClaimable: string
  depositsClaimed: string
  depositsCancelled: string
  redeemRequests: string
  redeemsClaimable: string
  redeemsClaimed: string
  redeemsCancelled: string
  redeemsAccepted: string
}

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

function normalizeHistoryRow(raw: Record<string, unknown>): BtcVaultHistoryItem {
  return {
    id: String(raw.id),
    user: bytesToHexLower(raw.user),
    action: String(raw.action),
    assets: String(raw.assets),
    shares: String(raw.shares),
    epochId: String(raw.epochId),
    timestamp: Number(raw.timestamp),
    blockNumber: String(raw.blockNumber),
    transactionHash: bytesToHexLower(raw.transactionHash),
  }
}

function mapActionOnly(item: BtcVaultHistoryItem): BtcVaultHistoryItemWithStatus {
  return { ...item, displayStatus: mapActionToDisplayStatus(item.action) }
}

export async function queryBtcVaultHistoryFromStateSync(
  params: BtcVaultHistoryQueryParams,
): Promise<BtcVaultHistoryItem[]> {
  const { limit, page, sort_field, sort_direction, type, address } = params
  const offset = (page - 1) * limit
  const actionFilter = type ? type.map(t => t.toUpperCase()) : [...ALL_ACTION_TYPES]

  const rows = await db(TABLE_HISTORY)
    .select([
      'id',
      'user',
      'action',
      'assets',
      'shares',
      'epochId',
      'timestamp',
      'blockNumber',
      'transactionHash',
    ])
    .modify(qb => {
      qb.whereIn('action', actionFilter)
      if (address) {
        qb.andWhere('user', Buffer.from(address.slice(2), 'hex'))
      }
    })
    .orderBy(sort_field, sort_direction)
    .orderBy('id', 'asc')
    .offset(offset)
    .limit(limit)

  return (rows as Record<string, unknown>[]).map(normalizeHistoryRow)
}

export async function queryBtcVaultHistoryCountFromStateSync(
  address: string,
  type?: string[],
): Promise<number> {
  const row = await db(TABLE_COUNTER).where({ id: address.toLowerCase() }).first<CounterEntity>()
  if (!row) return 0

  if (!type || type.length === 0) {
    return Number(row.total)
  }

  return type.reduce((sum, t) => {
    const field = ACTION_TYPE_TO_COUNTER_FIELD[t.toUpperCase()]
    if (!field) return sum
    return sum + Number(row[field as keyof CounterEntity])
  }, 0)
}

export async function enrichHistoryWithRequestStatusFromStateSync(
  history: BtcVaultHistoryItem[],
): Promise<BtcVaultHistoryItemWithStatus[]> {
  const depositIds = new Set<string>()
  const redeemIds = new Set<string>()

  for (const item of history) {
    const id = `${item.user.toLowerCase()}-${item.epochId}`
    if (item.action === 'DEPOSIT_REQUEST') depositIds.add(id)
    else if (item.action === 'REDEEM_REQUEST') redeemIds.add(id)
  }

  const [depositRows, redeemRows] = await Promise.all([
    depositIds.size
      ? db(TABLE_DEPOSIT_REQUEST)
          .whereIn('id', [...depositIds])
          .select(['id', 'status'])
      : Promise.resolve([]),
    redeemIds.size
      ? db(TABLE_REDEEM_REQUEST)
          .whereIn('id', [...redeemIds])
          .select(['id', 'status'])
      : Promise.resolve([]),
  ])

  const depositStatusById: Record<string, string> = {}
  for (const row of depositRows as Array<{ id: string; status: string }>) {
    depositStatusById[row.id] = row.status
  }

  const redeemStatusById: Record<string, string> = {}
  for (const row of redeemRows as Array<{ id: string; status: string }>) {
    redeemStatusById[row.id] = row.status
  }

  return history.map((item): BtcVaultHistoryItemWithStatus => {
    const result: BtcVaultHistoryItemWithStatus = { ...item }
    if (item.action === 'DEPOSIT_REQUEST' || item.action === 'REDEEM_REQUEST') {
      const id = `${item.user.toLowerCase()}-${item.epochId}`
      const rawStatus = item.action === 'DEPOSIT_REQUEST' ? depositStatusById[id] : redeemStatusById[id]
      const status = rawStatus?.toUpperCase()
      if (status === 'CLAIMABLE') {
        result.displayStatus = item.action === 'DEPOSIT_REQUEST' ? 'open_to_claim' : 'claim_pending'
      } else if (status === 'ACCEPTED') {
        result.displayStatus = 'approved'
      } else if (status === 'CLAIMED') {
        result.displayStatus = 'successful'
      } else if (status === 'CANCELLED') {
        result.displayStatus = 'cancelled'
      } else {
        result.displayStatus = 'pending'
      }
    } else {
      result.displayStatus = mapActionToDisplayStatus(item.action)
    }
    return result
  })
}

export function getFromStateSyncSource(): BtcVaultHistorySource {
  return {
    name: 'state-sync',
    async fetchPageAndTotal(params: BtcVaultHistoryQueryParams) {
      const [items, total] = await Promise.all([
        queryBtcVaultHistoryFromStateSync(params),
        queryBtcVaultHistoryCountFromStateSync(params.address ?? 'global', params.type),
      ])
      return { items, total }
    },
    async enrichWithStatus(items: BtcVaultHistoryItem[]) {
      try {
        return await enrichHistoryWithRequestStatusFromStateSync(items)
      } catch (error) {
        console.warn('[btc-vault] State-sync enrichment failed; using action-only displayStatus', error)
        return items.map(mapActionOnly)
      }
    },
  }
}
