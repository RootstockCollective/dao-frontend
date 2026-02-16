import { SORT_DIRECTIONS } from './constants'

export type SortDirection = (typeof SORT_DIRECTIONS)[number]

export type BaseColumnId = string | number | symbol

type BaseRowId = Exclude<React.Key, bigint>

export interface Sort<ColumnId extends Column['id'] = Column['id']> {
  columnId: ColumnId | null // For now only one column can be sorted at a time
  direction: SortDirection
}

// Generic row data type that allows mapping column IDs to specific cell data types
export type RowData<
  ColumnId extends Column['id'] = Column['id'],
  CellDataMap extends Record<ColumnId, unknown> = Record<ColumnId, unknown>,
> = {
  [K in ColumnId]: K extends keyof CellDataMap ? CellDataMap[K] : unknown
}

export interface Row<
  ColumnId extends Column['id'] = Column['id'],
  RowId extends BaseRowId = BaseRowId,
  CellDataMap extends Record<ColumnId, unknown> = Record<ColumnId, unknown>,
> {
  id: RowId
  data: RowData<ColumnId, CellDataMap>
}

type SelectedRows<RowId extends Row['id'] = Row['id']> = Record<RowId, boolean>

export interface Column<ColumnId extends BaseColumnId = BaseColumnId> {
  id: ColumnId
  hidden: boolean
  sortable: boolean
}

export interface TableState<
  ColumnId extends Column['id'] = Column['id'],
  CellDataMap extends Record<ColumnId, unknown> = Record<ColumnId, unknown>,
> {
  columns: Column<ColumnId>[]
  rows: Row<ColumnId, BaseRowId, CellDataMap>[]
  sort: Sort<ColumnId>
  defaultSort: Sort<ColumnId>
  selectedRows: SelectedRows // may contain selections across pages
  loading: boolean
  error: string | null
}

export type TableAction<
  ColumnId extends Column['id'] = Column['id'],
  CellDataMap extends Record<ColumnId, unknown> = Record<ColumnId, unknown>,
> =
  | {
      type: 'TOGGLE_ROW_SELECTION'
      payload: Row<ColumnId, BaseRowId, CellDataMap>['id']
    }
  | {
      type: 'TOGGLE_COLUMN_VISIBILITY'
      payload: ColumnId
    }
  | {
      type: 'SET_COLUMN_VISIBILITY'
      payload: {
        columnId: ColumnId
        hidden: boolean
      }
    }
  | {
      type: 'SORT_BY_COLUMN'
      payload: {
        columnId: ColumnId | null
        direction: SortDirection | null
      }
    }
  | {
      type: 'SET_ROWS'
      payload: Row<ColumnId, BaseRowId, CellDataMap>[]
    }
  | {
      type: 'SET_COLUMNS'
      payload: Column<ColumnId>[]
    }
  | {
      type: 'SET_DEFAULT_SORT'
      payload: Sort<ColumnId>
    }
  | {
      type: 'SET_LOADING'
      payload: boolean
    }
  | {
      type: 'SET_ERROR'
      payload: string | null
    }
  | {
      type: 'SET_SELECTED_ROWS'
      payload: SelectedRows<Row<ColumnId, BaseRowId, CellDataMap>['id']>
    }
  | {
      type: 'SET_HIDDEN_COLUMNS'
      payload: ColumnId[]
    }

/**
 * Helper type to create a strongly typed table configuration
 *
 * @example
 * ```typescript
 * // Define your column IDs and cell data types
 * type MyColumnId = 'name' | 'age' | 'email' | 'actions'
 *
 * type MyCellDataMap = {
 *   name: { value: string; sortKey: string }
 *   age: { value: number; formatted: string }
 *   email: { value: string; isValid: boolean }
 *   actions: { buttons: Array<{ label: string; onClick: () => void }> }
 * }
 *
 * // Use the helper to create typed table interfaces
 * type MyTable = TypedTable<MyColumnId, MyCellDataMap>
 *
 * // Now you have strongly typed:
 * // - MyTable['State'] for TableState
 * // - MyTable['Action'] for TableAction
 * // - MyTable['Row'] for Row
 * // - MyTable['RowData'] for RowData
 * ```
 */
export interface TypedTable<ColumnId extends BaseColumnId, CellDataMap extends Record<ColumnId, unknown>> {
  ColumnId: ColumnId
  CellDataMap: CellDataMap
  State: TableState<ColumnId, CellDataMap>
  Action: TableAction<ColumnId, CellDataMap>
  Row: Row<ColumnId, BaseRowId, CellDataMap>
  RowData: RowData<ColumnId, CellDataMap>
  Column: Column<ColumnId>
}
