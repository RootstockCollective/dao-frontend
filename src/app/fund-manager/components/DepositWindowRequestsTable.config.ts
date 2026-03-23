import type { Column, TypedTable } from '@/shared/context'

import type { RequestStatus } from './StatusBadge'

/** Columns rendered as visible table headers. */
export type VisibleColumnId = 'date' | 'investor' | 'entity' | 'type' | 'amount' | 'status'

/** Data-only keys carried on each row but not rendered as columns. */
type DataColumnId = 'fiatAmount' | 'tokenSymbol' | 'user' | 'requestType' | 'timestamp'

export type ColumnId = VisibleColumnId | DataColumnId

const DATA_COLUMN_IDS: DataColumnId[] = ['fiatAmount', 'tokenSymbol', 'user', 'requestType', 'timestamp']

export const PAGE_SIZE = 20

export const SORT_LABELS: Record<VisibleColumnId, string> = {
  date: 'Date',
  investor: 'Investor',
  entity: 'Entity',
  type: 'Type',
  amount: 'Amount',
  status: 'Status',
}

const VISIBLE_COLUMN_TRANSFORMS: Record<VisibleColumnId, string> = {
  date: 'flex-[1_1_8rem] min-w-[8rem]',
  investor: 'flex-[1_1_8rem] min-w-[8rem]',
  entity: 'flex-[1_1_8rem] min-w-[8rem]',
  type: 'flex-[0.8_1_6rem] min-w-[6rem]',
  amount: 'flex-[0.8_1_6rem] min-w-[6rem] justify-center',
  status: 'flex-[1_1_7rem] min-w-[7rem] justify-center',
}

export const COLUMN_TRANSFORMS: Record<ColumnId, string> = {
  ...VISIBLE_COLUMN_TRANSFORMS,
  ...Object.fromEntries(DATA_COLUMN_IDS.map(id => [id, 'hidden'])),
} as Record<ColumnId, string>

const VISIBLE_HEADERS: Column<VisibleColumnId>[] = [
  { id: 'date', hidden: false, sortable: true },
  { id: 'investor', hidden: false, sortable: true },
  { id: 'entity', hidden: false, sortable: true },
  { id: 'type', hidden: false, sortable: true },
  { id: 'amount', hidden: false, sortable: true },
  { id: 'status', hidden: false, sortable: true },
]

export const DEFAULT_HEADERS: Column<ColumnId>[] = [
  ...VISIBLE_HEADERS,
  ...DATA_COLUMN_IDS.map((id): Column<DataColumnId> => ({ id, hidden: true, sortable: false })),
]

export interface DepositWindowCellDataMap {
  date: string
  investor: string
  entity: string
  type: string
  amount: string
  status: RequestStatus
  fiatAmount: string | null
  tokenSymbol: string
  user: string
  requestType: string
  timestamp: number
}

export type DepositWindowTable = TypedTable<ColumnId, DepositWindowCellDataMap>
