import { DateTime } from 'luxon'
import moment from 'moment'
import { formatEther } from 'viem'

import { getFiatAmount } from '@/app/shared/formatter'
import Big from '@/lib/big'
import { formatCurrencyWithLabel, formatNumberWithCommas } from '@/lib/utils'

import { LOG_TYPE_LABELS } from './constants'
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

/** Date format: YYYY-MM-DD */
export function formatAuditLogDate(blockTimestamp: string | bigint): string {
  return DateTime.fromSeconds(Number(blockTimestamp), { zone: 'utc' }).setLocale('en').toFormat('LLL d, yyyy')
}

export function formatAuditLogDateForCsv(blockTimestamp: string | bigint): string {
  return moment.unix(Number(blockTimestamp)).format('YYYY-MM-DD')
}

export function logTypeToActionLabel(type: string): string {
  if (LOG_TYPE_LABELS[type]) return LOG_TYPE_LABELS[type]
  return type
    .split('_')
    .map(w => w.charAt(0) + w.slice(1).toLowerCase())
    .join(' ')
}
