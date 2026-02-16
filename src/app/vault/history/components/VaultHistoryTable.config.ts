import { useMemo } from 'react'
import { Column, TypedTable, useTableContext } from '@/shared/context'
import { VaultHistoryTransaction } from '@/app/vault/history/utils/types'
import Big from '@/lib/big'

export const TOKEN_SYMBOL = 'USDRIF'

/** Formats action type for display: "DEPOSIT" -> "Deposit" */
export const formatActionLabel = (action: string): string =>
  action.charAt(0).toUpperCase() + action.slice(1).toLowerCase()

export type ColumnId = 'period' | 'action' | 'assets' | 'total_usd' | 'transactions' | 'actions'

export const PAGE_SIZE = 20

export const SORT_LABELS: Record<ColumnId, string> = {
  period: 'Date',
  action: 'Type',
  assets: 'Amount',
  total_usd: 'Total (USD)',
  transactions: 'Transactions',
  actions: 'Actions',
}

export const COLUMN_TRANSFORMS: Record<ColumnId, string> = {
  period: 'flex-[1_1_8rem] min-w-[8rem]',
  action: 'flex-[1_1_6rem] min-w-[6rem]',
  assets: 'flex-[1_1_7rem] min-w-[6rem]',
  total_usd: 'flex-[1_1_8rem] min-w-[8rem]',
  transactions: 'hidden',
  actions: 'flex-[1_1_7rem] min-w-[6rem]',
}

/** Explicit content alignment for columns that need non-default (left) alignment */
export const COLUMN_CONTENT_ALIGN: Partial<Record<ColumnId, string>> = {
  total_usd: 'justify-end',
}

export const DEFAULT_HEADERS: Column<ColumnId>[] = [
  {
    id: 'period',
    hidden: false,
    sortable: true,
  },
  {
    id: 'action',
    hidden: false,
    sortable: true,
  },
  {
    id: 'assets',
    hidden: false,
    sortable: false,
  },
  {
    id: 'total_usd',
    hidden: false,
    sortable: true,
  },
  {
    id: 'actions',
    hidden: false,
    sortable: false,
  },
]

export type VaultHistoryCellDataMap = {
  period: string
  action: 'DEPOSIT' | 'WITHDRAW'
  assets: string
  total_usd: string
  transactions: VaultHistoryTransaction[]
  actions: string
}

export type VaultHistoryTable = TypedTable<ColumnId, VaultHistoryCellDataMap>

/** Typed wrapper over useTableContext with memoized totalAmount for visible rows */
export const useVaultHistoryTable = () => {
  const context = useTableContext<ColumnId, VaultHistoryCellDataMap>()

  const totalAmount = useMemo(
    () =>
      context.rows.length > 0
        ? context.rows.reduce((sum, row) => sum.plus(row.data.total_usd || '0'), Big(0)).toFixed(2)
        : null,
    [context.rows],
  )

  return { ...context, totalAmount }
}
