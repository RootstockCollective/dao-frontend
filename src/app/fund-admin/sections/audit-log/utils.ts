import { formatEther } from 'viem'

import { getFiatAmount } from '@/app/shared/formatter'
import { formatCurrencyWithLabel } from '@/lib/utils'

import { AUDIT_LOG_NAV_EPOCH_DETAIL_RE, AUDIT_LOG_NAV_UPDATED_ACTION_LABEL } from './constants'
import type { AuditLogEntry } from './types'

/** Subgraph `amount`: valid uint string in wei, including `"0"`; null if missing or invalid. */
export function parseSubgraphAmountWei(raw: string | null | undefined): string | null {
  if (raw == null) return null
  const trimmed = raw.trim()
  if (trimmed === '') return null
  try {
    BigInt(trimmed)
    return trimmed
  } catch {
    return null
  }
}

/** Human-readable RBTC amount from wei (18 decimals). */
export function formatAuditTokenAmountFromWei(wei: string | null): string | null {
  if (wei == null) return null
  try {
    const asEther = formatEther(BigInt(wei))
    const n = Number(asEther)
    if (!Number.isFinite(n)) return asEther
    return n.toLocaleString('en-US', { maximumFractionDigits: 8 })
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
  return (
    entry.action === AUDIT_LOG_NAV_UPDATED_ACTION_LABEL &&
    AUDIT_LOG_NAV_EPOCH_DETAIL_RE.test(entry.detail?.trim() ?? '')
  )
}

/** `detail` for the Value/Reason cell when there is no token row (suppress NAV-only epoch line). */
export function auditLogValueReasonDetail(entry: AuditLogEntry): string | null {
  if (entry.tokenAmount != null) return null
  const text = entry.detail?.trim()
  if (!text || isNavEpochOnlyDetail(entry)) return null
  return text
}

/** CSV "Value/Reason" column: full `detail` when a token row exists; else same rules as the cell. */
export function auditLogCsvDetailColumn(entry: AuditLogEntry): string {
  if (entry.tokenAmount != null) return entry.detail ?? ''
  return auditLogValueReasonDetail(entry) ?? ''
}
