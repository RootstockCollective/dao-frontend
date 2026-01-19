import { useMemo } from 'react'
import { formatCurrency, formatCurrencyWithLabel } from '@/lib/utils'
import { Row } from '@/shared/context/TableContext/types'
import { ColumnId, TransactionHistoryCellDataMap } from '../config'

export type TransactionRow = Row<ColumnId, Row['id'], TransactionHistoryCellDataMap>

/**
 * Sanitizes a USD string value for numerical calculation.
 * Handles edge cases like empty values, "<" prefix for small amounts, and comma-separated numbers.
 */
const sanitizeUsdValue = (raw: string | null | undefined): number => {
  if (!raw) return 0
  if (raw.startsWith('<')) return 0.0001
  const sanitized = raw.replace(/,/g, '')
  const parsed = Number(sanitized)
  return Number.isNaN(parsed) ? 0 : parsed
}

/**
 * Calculates the total USD amount from transaction rows.
 * Handles both single USD values and arrays of USD values.
 */
const calculateTotalUsd = (rows: TransactionRow[]): number => {
  return rows.reduce((acc, row) => {
    const usd = row.data.total_amount.usd
    const values = Array.isArray(usd) ? usd : [usd]
    return acc + values.reduce((subtotal, val) => subtotal + sanitizeUsdValue(val), 0)
  }, 0)
}

/**
 * Hook to calculate the total USD amount from transaction rows.
 * Returns a formatted currency string.
 *
 * @param rows - Array of transaction rows
 * @returns Formatted total USD amount string (e.g., "1,234.56")
 */
export const useTotalAmount = (rows: TransactionRow[]): string => {
  return useMemo(() => {
    if (!rows.length) return ''

    const sum = calculateTotalUsd(rows)
    return formatCurrency(sum, { showCurrencySymbol: false })
  }, [rows])
}
