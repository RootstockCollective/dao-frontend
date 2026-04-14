import { DateTime } from 'luxon'
import { formatEther } from 'viem'

import { formatSymbol, getFiatAmount } from '@/app/shared/formatter'
import Big from '@/lib/big'
import { RBTC } from '@/lib/constants'
import { getBtcVaultAuditLogEndpoint } from '@/lib/endpoints'
import { formatCurrencyWithLabel, formatNumberWithCommas } from '@/lib/utils'

import { LOG_TYPE_LABELS } from './constants'
import type { AuditLogEntry, AuditLogHistoryPageParams, AuditLogTableModel, AuditLogUserRole } from './types'

function buildAuditValueCell(amountInWei: AuditLogEntry['amountInWei'], rbtcUsdPrice: number) {
  if (amountInWei == null) return null
  const amountAsString = amountInWei.toString()
  return {
    formattedAmount: formatSymbol(amountAsString, RBTC),
    usdAmount: formatAuditAmountUsd(amountAsString, rbtcUsdPrice),
  }
}

export function convertAuditEntriesToRows(
  entries: AuditLogEntry[],
  rbtcUsdPrice: number,
): AuditLogTableModel['Row'][] {
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
  if (amountWei == null || rbtcUsdPrice <= 0) return null
  try {
    BigInt(amountWei)
  } catch {
    return null
  }
  return formatCurrencyWithLabel(getFiatAmount(amountWei, rbtcUsdPrice))
}

/** Date format: YYYY-MM-DD */
export function formatAuditLogDate(blockTimestamp: string | bigint): string {
  return DateTime.fromSeconds(Number(blockTimestamp), { zone: 'utc' }).setLocale('en').toFormat('LLL d, yyyy')
}

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
  return `${getBtcVaultAuditLogEndpoint}?${searchParams.toString()}`
}

export function logTypeToActionLabel(type: string): string {
  if (LOG_TYPE_LABELS[type]) return LOG_TYPE_LABELS[type]
  return type
    .split('_')
    .map(w => w.charAt(0) + w.slice(1).toLowerCase())
    .join(' ')
}
