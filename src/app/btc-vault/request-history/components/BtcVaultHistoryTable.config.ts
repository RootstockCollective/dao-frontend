import type { Column, TypedTable } from '@/shared/context'

import type { RequestStatus, RequestType } from '../../services/types'
import type {
  DisplayRequestType,
  DisplayStatus,
  DisplayStatusLabel,
  StateHistoryEntry,
} from '../../services/ui/types'

/** Columns rendered as visible table headers. */
export type VisibleColumnId = 'type' | 'date' | 'amount' | 'status' | 'actions'

/** Data-only keys carried on each row but not rendered as columns. */
type DataColumnId =
  | 'fiatAmount'
  | 'claimTokenType'
  | 'displayStatusLabel'
  | 'requestStatus'
  | 'updatedAtFormatted'
  | 'createdAtFormatted'
  | 'finalizedAtFormatted'
  | 'requestType'
  | 'stateHistory'

export type ColumnId = VisibleColumnId | DataColumnId

const DATA_COLUMN_IDS: DataColumnId[] = [
  'fiatAmount',
  'claimTokenType',
  'displayStatusLabel',
  'requestStatus',
  'updatedAtFormatted',
  'createdAtFormatted',
  'finalizedAtFormatted',
  'requestType',
  'stateHistory',
]

export const PAGE_SIZE = 20

export const SORT_LABELS: Record<VisibleColumnId, string> = {
  type: 'Type',
  date: 'Date',
  amount: 'Amount',
  status: 'Status',
  actions: 'Actions',
}

const VISIBLE_COLUMN_TRANSFORMS: Record<VisibleColumnId, string> = {
  type: 'flex-[1_1_7rem] min-w-[7rem]',
  date: 'flex-[1_1_8rem] min-w-[8rem]',
  amount: 'flex-[1.5_1_10rem] min-w-[10rem]',
  status: 'flex-[1_1_7rem] min-w-[7rem]',
  actions: 'flex-[1_1_9rem] min-w-[9rem] justify-end pr-4',
}

export const COLUMN_TRANSFORMS: Record<ColumnId, string> = {
  ...VISIBLE_COLUMN_TRANSFORMS,
  ...Object.fromEntries(DATA_COLUMN_IDS.map(id => [id, 'hidden'])),
} as Record<ColumnId, string>

const VISIBLE_HEADERS: Column<VisibleColumnId>[] = [
  { id: 'type', hidden: false, sortable: false },
  { id: 'date', hidden: false, sortable: true },
  { id: 'amount', hidden: false, sortable: false },
  { id: 'status', hidden: false, sortable: false },
  { id: 'actions', hidden: false, sortable: false },
]

export const DEFAULT_HEADERS: Column<ColumnId>[] = [
  ...VISIBLE_HEADERS,
  ...DATA_COLUMN_IDS.map((id): Column<DataColumnId> => ({ id, hidden: true, sortable: false })),
]

export interface BtcVaultHistoryCellDataMap {
  type: DisplayRequestType
  date: string
  amount: string
  status: DisplayStatus
  actions: string
  fiatAmount: string | null
  claimTokenType: 'rbtc' | 'shares'
  displayStatusLabel: DisplayStatusLabel
  requestStatus: RequestStatus
  updatedAtFormatted: string
  createdAtFormatted: string
  finalizedAtFormatted: string | null
  requestType: RequestType
  stateHistory: StateHistoryEntry[]
}

export type BtcVaultHistoryTable = TypedTable<ColumnId, BtcVaultHistoryCellDataMap>
