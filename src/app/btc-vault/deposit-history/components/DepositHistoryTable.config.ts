import type { Column, TypedTable } from '@/shared/context'

export type VisibleColumnId = 'depositWindow' | 'startDate' | 'endDate' | 'tvl' | 'apy'
type DataColumnId = 'fiatTvl'
export type ColumnId = VisibleColumnId | DataColumnId

const DATA_COLUMN_IDS: DataColumnId[] = ['fiatTvl']

export const PAGE_SIZE = 20

export const SORT_LABELS: Record<VisibleColumnId, string> = {
  depositWindow: 'Deposit Window',
  startDate: 'Start Date',
  endDate: 'End Date',
  tvl: 'TVL',
  apy: 'APY',
}

const VISIBLE_COLUMN_TRANSFORMS: Record<VisibleColumnId, string> = {
  depositWindow: 'flex-[0.8_1_6rem] min-w-[6rem]',
  startDate: 'flex-[1_1_8rem] min-w-[8rem]',
  endDate: 'flex-[1_1_8rem] min-w-[8rem]',
  tvl: 'flex-[1.5_1_10rem] min-w-[10rem]',
  apy: 'flex-[0.8_1_6rem] min-w-[6rem]',
}

export const COLUMN_TRANSFORMS: Record<ColumnId, string> = {
  ...VISIBLE_COLUMN_TRANSFORMS,
  ...Object.fromEntries(DATA_COLUMN_IDS.map(id => [id, 'hidden'])),
} as Record<ColumnId, string>

const VISIBLE_HEADERS: Column<VisibleColumnId>[] = [
  { id: 'depositWindow', hidden: false, sortable: false },
  { id: 'startDate', hidden: false, sortable: false },
  { id: 'endDate', hidden: false, sortable: false },
  { id: 'tvl', hidden: false, sortable: false },
  { id: 'apy', hidden: false, sortable: false },
]

export const DEFAULT_HEADERS: Column<ColumnId>[] = [
  ...VISIBLE_HEADERS,
  ...DATA_COLUMN_IDS.map((id): Column<DataColumnId> => ({ id, hidden: true, sortable: false })),
]

export interface DepositHistoryCellDataMap {
  depositWindow: string
  startDate: string
  endDate: string
  tvl: string
  apy: string
  fiatTvl: string | null
}

export type DepositHistoryTableType = TypedTable<ColumnId, DepositHistoryCellDataMap>
