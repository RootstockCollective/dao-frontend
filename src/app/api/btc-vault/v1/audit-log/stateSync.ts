import type { Knex } from 'knex'
import type { Address, Hex } from 'viem'

import { BTC_VAULT_AUDIT_LOG_COLUMNS } from '@/app/api/db/constants'
import type { AuditLogEntry } from '@/app/fund-admin/sections/audit-log/types'
import { db } from '@/lib/db'

import type { BtcVaultAuditLogPageResult, ParsedQuery } from './types'

const TABLE = 'BtcVaultLog'

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

function normalizeRow(raw: Record<string, unknown>): AuditLogEntry {
  return {
    id: String(raw.id),
    vault: bytesToHexLower(raw.vault) as Address,
    type: String(raw.type),
    amountInWei: raw.amountInWei != null ? BigInt(raw.amountInWei as string | number) : null,
    detail: (raw.detail as string) ?? null,
    isNative: raw.isNative != null ? Boolean(raw.isNative) : null,
    role: (raw.role as string) ?? null,
    actor: bytesToHexLower(raw.actor) as Address,
    from: raw.from != null ? (bytesToHexLower(raw.from) as Address) : null,
    destination: raw.destination != null ? (bytesToHexLower(raw.destination) as Address) : null,
    blockNumber: BigInt(raw.blockNumber as string | number),
    blockTimestamp: BigInt(raw.blockTimestamp as string | number),
    transactionHash: bytesToHexLower(raw.transactionHash) as Hex,
    logIndex: String(raw.logIndex),
  }
}

function applyShowFilters(qb: Knex.QueryBuilder, showFilters: ParsedQuery['show']): void {
  if (!showFilters?.length) return

  const selected = new Set(showFilters)
  const includeReason = selected.has('reason')
  const includeRbtc = selected.has('rbtc')
  const includeWrbtc = selected.has('wrbtc')

  if (includeReason) {
    qb.whereNotNull('detail')
  }

  if (includeRbtc && includeWrbtc) {
    qb.whereNotNull('amountInWei')
  } else if (includeRbtc) {
    qb.whereNotNull('amountInWei')
    qb.where(function () {
      this.where('isNative', true).orWhereNull('isNative')
    })
  } else if (includeWrbtc) {
    qb.whereNotNull('amountInWei')
    qb.where('isNative', false)
  }
}

function applyFilters(qb: Knex.QueryBuilder, params: ParsedQuery): void {
  if (params.type?.length) {
    qb.whereIn('type', params.type)
  }
  if (params.role?.length) {
    qb.whereIn('role', params.role)
  }
  applyShowFilters(qb, params.show)
}

async function countBtcVaultLogsFromStateSync(params: ParsedQuery): Promise<number> {
  const result = await db(TABLE)
    .modify(qb => applyFilters(qb, params))
    .count<{ count: string }>('* as count')
    .first()

  return Number(result?.count ?? 0)
}

export async function fetchBtcVaultAuditLogPageFromStateSync(
  params: ParsedQuery,
): Promise<BtcVaultAuditLogPageResult> {
  const offset = (params.page - 1) * params.limit
  const sortDirection = params.sort_direction === 'asc' ? 'asc' : 'desc'

  const [total, rows] = await Promise.all([
    countBtcVaultLogsFromStateSync(params),
    db(TABLE)
      .select([...BTC_VAULT_AUDIT_LOG_COLUMNS])
      .modify(qb => applyFilters(qb, params))
      .orderBy('blockTimestamp', sortDirection)
      .orderBy('id', 'asc')
      .offset(offset)
      .limit(params.limit),
  ])

  return {
    data: (rows as Record<string, unknown>[]).map(normalizeRow),
    total,
  }
}
