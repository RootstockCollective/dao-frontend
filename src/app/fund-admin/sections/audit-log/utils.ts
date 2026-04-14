import { DateTime } from 'luxon'
import { formatEther } from 'viem'

import { getFiatAmount } from '@/app/shared/formatter'
import Big from '@/lib/big'
import { formatCurrencyWithLabel, formatNumberWithCommas } from '@/lib/utils'

import { AUDIT_LOG_NAV_EPOCH_DETAIL_RE, LOG_TYPE_LABELS } from './constants'
import type { AuditLogEntry, AuditLogTableModel, AuditLogUserRole } from './types'

export function convertAuditEntriesToRows(entries: AuditLogEntry[]): AuditLogTableModel['Row'][] {
  return entries.map(entry => ({
    id: entry.id,
    data: {
      date: formatAuditLogDate(entry.blockTimestamp),
      action: logTypeToActionLabel(entry.type),
      value: formatAmountFromWei(entry.amountInWei ?? null),
      reason: entry.detail?.trim() ?? null,
      role: entry.role as AuditLogUserRole,
    },
  }))
}

/** Human-readable RBTC amount from wei (18 decimals). */
export function formatAmountFromWei(wei: string | bigint | null): string | null {
  if (wei == null) return null
  try {
    const asEther = formatEther(BigInt(wei.toString()))
    return formatNumberWithCommas(Big(asEther).toFixedNoTrailing(8))
  } catch {
    return null
  }
}

/** Fiat label for audit wei × RBTC/USD spot (zero wei → ~$0). */
export function formatAuditAmountUsd(amountWei: string | null, rbtcUsdPrice: number): string | null {
  if (amountWei == null || rbtcUsdPrice <= 0) return null
  try {
    BigInt(amountWei)
  } catch {
    return null
  }
  return formatCurrencyWithLabel(getFiatAmount(amountWei, rbtcUsdPrice))
}

function isNavEpochOnlyDetail(entry: AuditLogEntry): boolean {
  return entry.type === 'NAV_UPDATED' && AUDIT_LOG_NAV_EPOCH_DETAIL_RE.test(entry.detail?.trim() ?? '')
}

// --- CSV functions section ---

export function formatAuditLogDate(blockTimestamp: string | bigint): string {
  return DateTime.fromSeconds(Number(blockTimestamp), { zone: 'utc' }).setLocale('en').toFormat('LLL d, yyyy')
}

export function logTypeToActionLabel(type: string): string {
  if (LOG_TYPE_LABELS[type]) return LOG_TYPE_LABELS[type]
  return type
    .split('_')
    .map(w => w.charAt(0) + w.slice(1).toLowerCase())
    .join(' ')
}

export function auditLogCsvDetailColumn(detail: string | null): string {
  if (detail != null) return detail
  if (!detail || isNavEpochOnlyDetail(detail)) return ''
  return detail
}

export function auditLogFormattedTokenAmount(amountInWei: string | null): string | null {
  return formatAmountFromWei(amountInWei)
}
