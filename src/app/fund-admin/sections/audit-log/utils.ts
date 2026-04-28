import { DateTime } from 'luxon'
import { formatEther } from 'viem'

import { formatSymbol, getFiatAmount } from '@/app/shared/formatter'
import type { ActiveFilter } from '@/components/FilterSideBar/types'
import Big from '@/lib/big'
import { RBTC } from '@/lib/constants'
import { getBtcVaultAuditLogEndpoint } from '@/lib/endpoints'
import { formatCurrencyWithLabel, formatNumberWithCommas } from '@/lib/utils'
import type { Row } from '@/shared/context'

import {
  AUDIT_LOG_ROLE_FILTERS,
  AUDIT_LOG_SHOW_FILTERS,
  AUDIT_LOG_TYPE_FILTERS,
  LOG_TYPE_LABELS,
} from './constants'
import type {
  AuditLogApiEntry,
  AuditLogApiFilters,
  AuditLogCellDataMap,
  AuditLogHistoryPageParams,
  AuditLogShowFilter,
  AuditLogUserRole,
  ColumnId,
} from './types'

const VALID_TYPE_FILTERS = new Set<string>(AUDIT_LOG_TYPE_FILTERS.map(({ value }) => value))
const VALID_ROLE_FILTERS = new Set<AuditLogUserRole>(AUDIT_LOG_ROLE_FILTERS.map(({ value }) => value))
const VALID_SHOW_FILTERS = new Set<AuditLogShowFilter>(AUDIT_LOG_SHOW_FILTERS.map(({ value }) => value))

function buildAuditValueCell(amountInWei: string | null, rbtcUsdPrice: number): AuditLogCellDataMap['value'] {
  if (amountInWei == null) return null
  return {
    formattedAmount: formatSymbol(amountInWei, RBTC),
    usdAmount: formatAuditAmountUsd(amountInWei, rbtcUsdPrice),
  }
}

export function convertAuditEntriesToRows(
  entries: AuditLogApiEntry[],
  rbtcUsdPrice: number,
): Row<ColumnId, string, AuditLogCellDataMap>[] {
  return entries.map(entry => ({
    id: entry.id,
    data: {
      date: formatAuditLogDate(entry.blockTimestamp),
      action: logTypeToActionLabel(entry.type),
      value: buildAuditValueCell(entry.amountInWei, rbtcUsdPrice),
      reason: entry.detail?.trim() ?? null,
      role: entry.role as AuditLogUserRole | null,
    },
  }))
}

/** RBTC / WRBTC amount from wei */
export function formatAmountFromWei(wei: string | bigint | null, decimalPlaces = 8): string | null {
  if (wei == null) return null
  try {
    const asEther = formatEther(BigInt(wei.toString()))
    return formatNumberWithCommas(Big(asEther).toFixedNoTrailing(decimalPlaces))
  } catch {
    return null
  }
}

export function formatAuditAmountUsd(amountWei: string | null, rbtcUsdPrice: number): string | null {
  if (amountWei == null || amountWei === '0' || rbtcUsdPrice <= 0) return null
  try {
    BigInt(amountWei)
  } catch {
    return null
  }
  return formatCurrencyWithLabel(getFiatAmount(amountWei, rbtcUsdPrice))
}

/** Date format: LLL d, yyyy (e.g. "Jan 1, 2025") */
export function formatAuditLogDate(blockTimestamp: string | bigint): string {
  return DateTime.fromSeconds(Number(blockTimestamp), { zone: 'utc' }).setLocale('en').toFormat('LLL d, yyyy')
}

/** Date format: YYYY-MM-DD */
export function formatAuditLogDateForCsv(blockTimestamp: string | bigint): string {
  return DateTime.fromSeconds(Number(blockTimestamp), { zone: 'utc' }).toFormat('yyyy-MM-dd')
}

export function buildAuditLogUrl(params: AuditLogHistoryPageParams): string {
  const searchParams = new URLSearchParams()
  searchParams.set('page', String(params.page))
  searchParams.set('limit', String(params.limit))
  if (params.sortField && params.sortDirection) {
    searchParams.set('sort_field', params.sortField)
    searchParams.set('sort_direction', params.sortDirection)
  }
  params.filters?.type?.forEach(type => searchParams.append('type', type))
  params.filters?.role?.forEach(role => searchParams.append('role', role))
  params.filters?.show?.forEach(show => searchParams.append('show', show))
  return `${getBtcVaultAuditLogEndpoint}?${searchParams.toString()}`
}

export function toAuditLogApiFilters(activeFilters: ActiveFilter[]): AuditLogApiFilters | undefined {
  if (!activeFilters.length) return undefined

  const valuesOf = (groupId: string) =>
    activeFilters.filter(filter => filter.groupId === groupId).map(filter => filter.option.value)

  const type = [...new Set(valuesOf('type'))].filter((value): value is string =>
    VALID_TYPE_FILTERS.has(value),
  )
  const role = [...new Set(valuesOf('role'))].filter((value): value is AuditLogUserRole =>
    VALID_ROLE_FILTERS.has(value as AuditLogUserRole),
  )
  const show = [...new Set(valuesOf('show'))].filter((value): value is AuditLogShowFilter =>
    VALID_SHOW_FILTERS.has(value as AuditLogShowFilter),
  )

  if (!type.length && !role.length && !show.length) return undefined

  return {
    ...(type.length ? { type } : {}),
    ...(role.length ? { role } : {}),
    ...(show.length ? { show } : {}),
  }
}

export function logTypeToActionLabel(type: string): string {
  if (LOG_TYPE_LABELS[type]) return LOG_TYPE_LABELS[type]
  return type
    .split('_')
    .map(w => w.charAt(0) + w.slice(1).toLowerCase())
    .join(' ')
}
