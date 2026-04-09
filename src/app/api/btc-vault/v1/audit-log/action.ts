import { gql } from '@apollo/client'
import { DateTime } from 'luxon'
import { unstable_cache } from 'next/cache'
import { formatEther } from 'viem'
import type { z } from 'zod'

import type { AuditLogEntry, AuditLogUserRole } from '@/app/fund-admin/sections/audit-log/types'
import { btcVaultClient } from '@/shared/components/ApolloClient'

import { BtcVaultAuditLogQuerySchema, type BtcVaultAuditLogSortField } from '../schemas'

type ParsedQuery = z.infer<typeof BtcVaultAuditLogQuerySchema>

export interface BtcVaultAuditLogPageResult {
  data: AuditLogEntry[]
  total: number
}

const BTC_VAULT_AUDIT_LOGS_PAGE = gql`
  query BtcVaultAuditLogsPage(
    $first: Int!
    $skip: Int!
    $orderBy: BtcVaultLog_orderBy!
    $orderDirection: OrderDirection!
  ) {
    btcVaultLogs(first: $first, skip: $skip, orderBy: $orderBy, orderDirection: $orderDirection) {
      id
      type
      detail
      amount
      isNative
      role
      blockTimestamp
    }
  }
`

const BTC_VAULT_AUDIT_LOGS_COUNT_CHUNK = gql`
  query BtcVaultAuditLogsCountChunk($first: Int!, $skip: Int!) {
    btcVaultLogs(first: $first, skip: $skip) {
      id
    }
  }
`

const LOG_TYPE_LABELS: Record<string, string> = {
  PAUSED_DEPOSITS: 'Paused deposits',
  RESUMED_DEPOSITS: 'Resumed deposits',
  PAUSED_REDEEMS: 'Paused redeems',
  RESUMED_REDEEMS: 'Resumed redeems',
  NAV_UPDATED: 'NAV updated',
  TRANSFER_TO_MANAGER_WALLET: 'Transfer to manager wallet',
  VAULT_DEPOSIT: 'Vault deposit',
  TOP_UP_BUFFER: 'Top up buffer',
  TOP_UP_SYNTHETIC_YIELD: 'Top up synthetic yield',
  SYNTHETIC_YIELD_UPDATED: 'Synthetic yield updated',
  BUFFER_UPDATED: 'Buffer updated',
}

const FUND_MANAGER_LOG_TYPES = new Set([
  'NAV_UPDATED',
  'TRANSFER_TO_MANAGER_WALLET',
  'VAULT_DEPOSIT',
  'TOP_UP_BUFFER',
  'TOP_UP_SYNTHETIC_YIELD',
  'SYNTHETIC_YIELD_UPDATED',
  'BUFFER_UPDATED',
])

const COUNT_PAGE_SIZE = 1000
const COUNT_MAX_SKIP = 100_000

interface RawBtcVaultLogRow {
  id: string
  type: string
  detail: string | null
  amount: string | null
  isNative: boolean | null
  role: string | null
  blockTimestamp: string
}

function logTypeToActionLabel(type: string): string {
  if (LOG_TYPE_LABELS[type]) return LOG_TYPE_LABELS[type]
  return type
    .split('_')
    .map(w => w.charAt(0) + w.slice(1).toLowerCase())
    .join(' ')
}

// TODO: Review this once the subgraph provides the role field
function mapUserFromLog(logType: string, roleFromSubgraph: string | null): AuditLogUserRole {
  if (roleFromSubgraph) {
    const r = roleFromSubgraph.trim().toLowerCase()
    if (r.includes('fund') && r.includes('manager')) return 'Fund Manager'
    if (r.includes('admin')) return 'Admin'
  }
  return FUND_MANAGER_LOG_TYPES.has(logType) ? 'Fund Manager' : 'Admin'
}

function formatAuditTokenAmount(raw: string | null | undefined): string | null {
  if (raw == null || raw === '0') return null
  try {
    const wei = BigInt(raw)
    if (wei === 0n) return null
    const asEther = formatEther(wei)
    const n = Number(asEther)
    if (!Number.isFinite(n)) return asEther
    return n.toLocaleString('en-US', { maximumFractionDigits: 8 })
  } catch {
    return null
  }
}

function mapLogRowToEntry(row: RawBtcVaultLogRow): AuditLogEntry {
  const ts = Number(row.blockTimestamp)
  const date =
    Number.isFinite(ts) && ts > 0
      ? DateTime.fromSeconds(ts, { zone: 'utc' }).setLocale('en').toFormat('LLL d, yyyy')
      : ''

  return {
    id: row.id,
    date,
    action: logTypeToActionLabel(row.type),
    valueReason: row.detail,
    tokenAmount: formatAuditTokenAmount(row.amount),
    usdAmount: null,
    user: mapUserFromLog(row.type, row.role),
  }
}

function auditLogOrderBy(field: BtcVaultAuditLogSortField | undefined): string {
  if (field === 'action') return 'type'
  if (field === 'role') return 'role'
  return 'blockTimestamp'
}

function auditLogOrderDirection(sortDirection: 'asc' | 'desc' | undefined): 'asc' | 'desc' {
  return sortDirection === 'asc' ? 'asc' : 'desc'
}

async function countBtcVaultLogsUncached(): Promise<number> {
  let skip = 0
  let total = 0
  for (;;) {
    const result = await btcVaultClient.query<{ btcVaultLogs: { id: string }[] }>({
      query: BTC_VAULT_AUDIT_LOGS_COUNT_CHUNK,
      variables: { first: COUNT_PAGE_SIZE, skip },
      fetchPolicy: 'no-cache',
    })

    if (result.error) {
      throw result.error
    }

    const chunk = result.data?.btcVaultLogs ?? []
    total += chunk.length
    if (chunk.length < COUNT_PAGE_SIZE) break
    skip += COUNT_PAGE_SIZE
    if (skip > COUNT_MAX_SKIP) break
  }

  return total
}

const getCachedBtcVaultLogsTotal = unstable_cache(countBtcVaultLogsUncached, ['btc-vault-audit-log-total'], {
  revalidate: 120,
})

async function fetchBtcVaultAuditLogFromSubgraph(params: ParsedQuery): Promise<BtcVaultAuditLogPageResult> {
  const orderBy = auditLogOrderBy(params.sort_field)
  const orderDirection = auditLogOrderDirection(params.sort_direction)
  const skip = (params.page - 1) * params.limit

  const [pageResult, total] = await Promise.all([
    btcVaultClient.query<{ btcVaultLogs: RawBtcVaultLogRow[] }>({
      query: BTC_VAULT_AUDIT_LOGS_PAGE,
      variables: {
        first: params.limit,
        skip,
        orderBy,
        orderDirection,
      },
      fetchPolicy: 'no-cache',
    }),
    getCachedBtcVaultLogsTotal(),
  ])

  if (pageResult.error) {
    throw pageResult.error
  }

  const rows = pageResult.data?.btcVaultLogs ?? []

  return {
    data: rows.map(mapLogRowToEntry),
    total,
  }
}

/**
 * One page of BTC vault audit log from subgraph `btcVaultLogs`.
 */
export async function fetchBtcVaultAuditLogPage(params: ParsedQuery): Promise<BtcVaultAuditLogPageResult> {
  return fetchBtcVaultAuditLogFromSubgraph(params)
}
