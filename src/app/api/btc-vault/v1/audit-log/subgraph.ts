import { gql } from '@apollo/client'
import { unstable_cache } from 'next/cache'
import type { Address, Hex } from 'viem'

import type { AuditLogEntry } from '@/app/fund-admin/sections/audit-log/types'
import { btcVaultClient } from '@/shared/components/ApolloClient'

import type { BtcVaultAuditLogPageResult, ParsedQuery } from './types'

const BTC_VAULT_AUDIT_LOGS_PAGE = gql`
  query BtcVaultAuditLogsPage(
    $first: Int!
    $skip: Int!
    $orderBy: BtcVaultLog_orderBy!
    $orderDirection: OrderDirection!
    $where: BtcVaultLog_filter
  ) {
    btcVaultLogs(
      first: $first
      skip: $skip
      orderBy: $orderBy
      orderDirection: $orderDirection
      where: $where
    ) {
      id
      vault
      type
      amountInWei
      detail
      isNative
      role
      actor
      from
      destination
      blockNumber
      blockTimestamp
      transactionHash
      logIndex
    }
  }
`

const BTC_VAULT_AUDIT_LOGS_COUNT_CHUNK = gql`
  query BtcVaultAuditLogsCountChunk($first: Int!, $skip: Int!, $where: BtcVaultLog_filter) {
    btcVaultLogs(first: $first, skip: $skip, where: $where) {
      id
    }
  }
`

const COUNT_PAGE_SIZE = 1000
const COUNT_MAX_SKIP = 100_000

interface BtcVaultLogRaw {
  id: string
  vault: string
  type: string
  amountInWei: string | null
  detail: string | null
  isNative: boolean | null
  role: string | null
  actor: string
  from: string | null
  destination: string | null
  blockNumber: string
  blockTimestamp: string
  transactionHash: string
  logIndex: string
}

function mapLogRowToEntry(row: BtcVaultLogRaw): AuditLogEntry {
  return {
    id: row.id,
    vault: row.vault as Address,
    type: row.type,
    amountInWei: row.amountInWei ? BigInt(row.amountInWei) : null,
    detail: row.detail ?? null,
    isNative: row.isNative ?? null,
    role: row.role,
    actor: row.actor as Address,
    from: (row.from ?? null) as Address | null,
    destination: (row.destination ?? null) as Address | null,
    blockNumber: BigInt(row.blockNumber),
    blockTimestamp: BigInt(row.blockTimestamp),
    transactionHash: row.transactionHash as Hex,
    logIndex: row.logIndex,
  }
}

function auditLogOrderBy(): string {
  return 'blockTimestamp'
}

function auditLogOrderDirection(sortDirection: 'asc' | 'desc' | undefined): 'asc' | 'desc' {
  return sortDirection === 'asc' ? 'asc' : 'desc'
}

function buildShowClause(showFilters: ParsedQuery['show']): Record<string, unknown> | undefined {
  if (!showFilters?.length) return undefined

  const selected = new Set(showFilters)
  const includeReason = selected.has('reason')
  const includeRbtc = selected.has('rbtc')
  const includeWrbtc = selected.has('wrbtc')
  const clauses: Record<string, unknown>[] = []

  if (includeReason) {
    clauses.push({ detail_not: null })
  }

  if (includeRbtc && includeWrbtc) {
    clauses.push({ amountInWei_not: null })
  } else if (includeRbtc) {
    clauses.push({
      or: [
        { amountInWei_not: null, isNative: true },
        { amountInWei_not: null, isNative: null },
      ],
    })
  } else if (includeWrbtc) {
    clauses.push({ amountInWei_not: null, isNative: false })
  }

  if (!clauses.length) return undefined
  return clauses.length === 1 ? clauses[0] : { or: clauses }
}

function buildAuditLogWhereFilter(params: ParsedQuery): Record<string, unknown> | undefined {
  const clauses: Record<string, unknown>[] = []

  if (params.type?.length) {
    clauses.push({ type_in: params.type })
  }
  if (params.role?.length) {
    clauses.push({ role_in: params.role })
  }

  const showClause = buildShowClause(params.show)
  if (showClause) {
    clauses.push(showClause)
  }

  if (!clauses.length) return undefined
  return clauses.length === 1 ? clauses[0] : { and: clauses }
}

async function countBtcVaultLogsUncached(whereFilter?: Record<string, unknown>): Promise<number> {
  let skip = 0
  let total = 0
  for (;;) {
    const result = await btcVaultClient.query<{ btcVaultLogs: { id: string }[] }>({
      query: BTC_VAULT_AUDIT_LOGS_COUNT_CHUNK,
      variables: { first: COUNT_PAGE_SIZE, skip, where: whereFilter },
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

export async function fetchBtcVaultAuditLogPageFromSubgraph(
  params: ParsedQuery,
): Promise<BtcVaultAuditLogPageResult> {
  const orderBy = auditLogOrderBy()
  const orderDirection = auditLogOrderDirection(params.sort_direction)
  const skip = (params.page - 1) * params.limit
  const whereFilter = buildAuditLogWhereFilter(params)

  const [pageResult, total] = await Promise.all([
    btcVaultClient.query<{ btcVaultLogs: BtcVaultLogRaw[] }>({
      query: BTC_VAULT_AUDIT_LOGS_PAGE,
      variables: {
        first: params.limit,
        skip,
        orderBy,
        orderDirection,
        where: whereFilter,
      },
      fetchPolicy: 'no-cache',
    }),
    whereFilter ? countBtcVaultLogsUncached(whereFilter) : getCachedBtcVaultLogsTotal(),
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
