import { Column, TypedTable } from '@/shared/context'
import { Address } from 'viem'
import { Builder } from '@/app/collective-rewards/types'

const COLUMN_IDS = ['cycle', 'date', 'from_to', 'type', 'amount', 'total_amount'] as const
export type ColumnId = (typeof COLUMN_IDS)[number]

export const PAGE_SIZE = 20

export const SORT_LABELS: Record<ColumnId, string> = {
  cycle: 'Cycle',
  date: 'Date',
  from_to: 'From/To',
  type: 'Type',
  amount: 'Amount',
  total_amount: 'Total Amount',
}

export const COLUMN_TRANSFORMS: Record<ColumnId, string> = {
  cycle: 'flex-[1_1_4rem] min-w-[4rem] justify-center',
  date: 'flex-[1_1_8rem] min-w-[8rem]',
  from_to: 'flex-[1_1_12rem] min-w-[12rem]',
  type: 'flex-[1_1_6rem] min-w-[6rem] justify-center',
  amount: 'flex-[1_1_7rem] min-w-[6rem]',
  total_amount: 'flex-[1_1_8rem] min-w-[8rem] justify-center',
}

export const DEFAULT_HEADERS: Column<ColumnId>[] = [
  {
    id: 'cycle',
    hidden: false,
    sortable: true,
  },
  {
    id: 'date',
    hidden: false,
    sortable: true,
  },
  {
    id: 'from_to',
    hidden: false,
    sortable: false,
  },
  {
    id: 'type',
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
]

export type GroupedTransactionDetail = {
  id: string
  builder?: Builder
  builderAddress?: string
  blockTimestamp: string
  amounts: Array<{ address: string; value: string; symbol: string }>
  usdValue: string | string[]
  increased?: boolean
}

export type TransactionHistoryCellDataMap = {
  cycle: { cycle: string | null }
  date: { timestamp: string; formatted: string }
  from_to: {
    builder?: Builder
    builderAddress?: string
    type: 'Claim' | 'Back'
    isGrouped?: boolean
    groupedDetails?: GroupedTransactionDetail[]
  }
  type: { type: 'Claim' | 'Back'; increased?: boolean }
  amount: {
    amounts: Array<{ address: Address; value: string; symbol: string }>
    type: 'Claim' | 'Back'
    increased?: boolean
  }
  total_amount: { usd: string | string[] }
}

export type TransactionHistoryTable = TypedTable<ColumnId, TransactionHistoryCellDataMap>
