import type { Column, TypedTable } from '@/shared/context'

export type VisibleColumnId = 'reportedOffchainAssets' | 'requestsProcessedInEpoch' | 'processedAt'

type DataColumnId = 'fiatAmountFormatted' | 'transactionHashFull' | 'processedAtTimestamp'

export type NavColumnId = VisibleColumnId | DataColumnId

const DATA_COLUMN_IDS: DataColumnId[] = ['fiatAmountFormatted', 'transactionHashFull', 'processedAtTimestamp']

export const PAGE_SIZE = 20

export const SORT_LABELS: Record<VisibleColumnId, string> = {
  reportedOffchainAssets: 'NAV',
  requestsProcessedInEpoch: 'Requests processed',
  processedAt: 'Processed on',
}

const VISIBLE_COLUMN_TRANSFORMS: Record<VisibleColumnId, string> = {
  reportedOffchainAssets: 'flex-[1_1_8rem] min-w-[8rem]',
  requestsProcessedInEpoch: 'flex-[1_1_8rem] min-w-[8rem]',
  processedAt: 'flex-[1_1_8rem] min-w-[8rem]',
}

export const COLUMN_TRANSFORMS: Record<NavColumnId, string> = {
  ...VISIBLE_COLUMN_TRANSFORMS,
  ...Object.fromEntries(DATA_COLUMN_IDS.map(id => [id, 'hidden'])),
} as Record<NavColumnId, string>

const VISIBLE_HEADERS: Column<VisibleColumnId>[] = [
  { id: 'reportedOffchainAssets', hidden: false, sortable: false },
  { id: 'requestsProcessedInEpoch', hidden: false, sortable: true },
  { id: 'processedAt', hidden: false, sortable: true },
]

export const DEFAULT_HEADERS: Column<NavColumnId>[] = [
  ...VISIBLE_HEADERS,
  ...DATA_COLUMN_IDS.map((id): Column<DataColumnId> => ({ id, hidden: true, sortable: false })),
]

export interface NavHistoryCellDataMap {
  reportedOffchainAssets: string
  requestsProcessedInEpoch: string
  processedAt: string
  fiatAmountFormatted: string | null
  transactionHashFull: string
  processedAtTimestamp: number
}

export type NavHistoryTable = TypedTable<NavColumnId, NavHistoryCellDataMap>
