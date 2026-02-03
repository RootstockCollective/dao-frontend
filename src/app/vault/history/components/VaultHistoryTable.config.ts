import { Column, Row, TypedTable } from '@/shared/context'
import { VaultHistoryTransaction } from '@/app/vault/history/utils/types'

export const TOKEN_SYMBOL = 'USDRIF'

/** Formats action type for display: "DEPOSIT" -> "Deposit" */
export const formatActionLabel = (action: string): string =>
  action.charAt(0).toUpperCase() + action.slice(1).toLowerCase()

const COLUMN_IDS = ['period', 'action', 'assets', 'total_usd', 'transactions', 'actions'] as const
export type ColumnId = (typeof COLUMN_IDS)[number]

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
  action: 'flex-[1_1_6rem] min-w-[6rem] justify-center',
  assets: 'flex-[1_1_7rem] min-w-[6rem]',
  total_usd: 'flex-[1_1_8rem] min-w-[8rem] justify-center',
  transactions: 'hidden',
  actions: 'flex-[1_1_7rem] min-w-[6rem] justify-end',
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

/** Common props for components that render vault history rows */
export interface VaultHistoryRowsProps {
  rows: Row<ColumnId, Row['id'], VaultHistoryCellDataMap>[]
}
