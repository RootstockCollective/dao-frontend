import type { Column, TypedTable } from '@/shared/context'

export type WhitelistStatus = 'Whitelisted' | 'De-whitelisted'

/** Columns rendered as visible table headers. */
export type VisibleColumnId = 'address' | 'institution' | 'date' | 'status'

/** Hidden columns: data-only or toggled by hover. */
type HiddenColumnId = 'fullAddress' | 'actions'

export type ColumnId = VisibleColumnId | HiddenColumnId

export const PAGE_SIZE = 20

export const SORT_LABELS: Record<VisibleColumnId, string> = {
  address: 'Address',
  institution: 'Institution',
  date: 'Date',
  status: 'Status',
}

const VISIBLE_COLUMN_TRANSFORMS: Record<VisibleColumnId, string> = {
  address: 'flex-[1_1_10rem] min-w-[10rem]',
  institution: 'flex-[1_1_10rem] min-w-[10rem]',
  date: 'flex-[1_1_8rem] min-w-[8rem]',
  status: 'flex-[0.8_1_7rem] min-w-[7rem] justify-center',
}

export const COLUMN_TRANSFORMS: Record<ColumnId, string> = {
  ...VISIBLE_COLUMN_TRANSFORMS,
  fullAddress: 'hidden',
  actions: 'flex-[0.8_1_7rem] min-w-[7rem] justify-center',
}

const VISIBLE_HEADERS: Column<VisibleColumnId>[] = [
  { id: 'address', hidden: false, sortable: true },
  { id: 'institution', hidden: false, sortable: false },
  { id: 'date', hidden: false, sortable: true },
  { id: 'status', hidden: false, sortable: true },
]

export const DEFAULT_HEADERS: Column<ColumnId>[] = [
  ...VISIBLE_HEADERS,
  { id: 'fullAddress', hidden: true, sortable: false },
  { id: 'actions', hidden: true, sortable: false },
]

export interface WhitelistCellDataMap {
  address: string
  institution: string
  date: string
  status: WhitelistStatus
  fullAddress: string
  actions: null
}

export type WhitelistTable = TypedTable<ColumnId, WhitelistCellDataMap>
