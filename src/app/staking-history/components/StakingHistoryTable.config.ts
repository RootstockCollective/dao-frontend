import { Column, TypedTable } from '@/shared/context'
import { StakingHistoryTransaction } from '@/app/staking-history/utils/types'

const _COLUMN_IDS = ['period', 'action', 'amount', 'total_amount', 'transactions', 'actions'] as const
export type ColumnId = (typeof _COLUMN_IDS)[number]

export const PAGE_SIZE = 20

export const SORT_LABELS: Record<ColumnId, string> = {
  period: 'Date',
  action: 'Type',
  amount: 'Amount',
  total_amount: 'Total Amount(USD)',
  transactions: 'Transactions',
  actions: 'Actions',
}

export const COLUMN_TRANSFORMS: Record<ColumnId, string> = {
  period: 'flex-[1_1_8rem] min-w-[8rem]',
  action: 'flex-[1_1_6rem] min-w-[6rem] justify-center',
  amount: 'flex-[1_1_7rem] min-w-[6rem]',
  total_amount: 'flex-[1_1_8rem] min-w-[8rem] justify-center',
  transactions: 'flex-[1_1_7rem] min-w-[6rem]',
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
    id: 'amount',
    hidden: false,
    sortable: false,
  },
  {
    id: 'total_amount',
    hidden: false,
    sortable: true,
  },
  {
    id: 'actions',
    hidden: false,
    sortable: false,
  },
]

export type StakingHistoryCellDataMap = {
  period: string
  action: 'STAKE' | 'UNSTAKE'
  amount: string
  total_amount: string
  transactions: StakingHistoryTransaction[]
  actions: string
}

export type StakingHistoryTable = TypedTable<ColumnId, StakingHistoryCellDataMap>
