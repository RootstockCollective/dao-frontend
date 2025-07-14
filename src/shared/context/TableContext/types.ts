export const SORT_DIRECTIONS = [null, 'asc', 'desc'] as const

export type SortDirection = (typeof SORT_DIRECTIONS)[number]

export type BaseColumnId = string | number | symbol

export type BaseRowId = Exclude<React.Key, bigint>

export type Sort<ColumnId extends Column['id'] = Column['id']> = {
  columnId: ColumnId | null // For now only one column can be sorted at a time
  direction: SortDirection
}

export type RowData<ColumnId extends Column['id'] = Column['id'], DT extends unknown = unknown> = {
  [k in ColumnId]: DT // FIXME: just use Record<Column['id'], DT>
}

export type Row<ColumnId extends Column['id'] = Column['id'], RowId extends BaseRowId = BaseRowId> = {
  id: RowId
  data: RowData<ColumnId>
}

export type SelectedRows<RowId extends Row['id'] = Row['id']> = Record<RowId, boolean>

export type Column<ColumnId extends BaseColumnId = BaseColumnId> = {
  id: ColumnId
  hidden: boolean
  sortable: boolean
}

export type TableState<ColumnId extends Column['id'] = Column['id']> = {
  columns: Column<ColumnId>[]
  rows: Row<ColumnId>[]
  sort: Sort<ColumnId>
  defaultSort: Sort<ColumnId>
  selectedRows: SelectedRows // may contain selections across pages
  loading: boolean
  error: string | null
}

export type TableAction<ColumnId extends Column['id'] = Column['id']> =
  | {
      type: 'TOGGLE_ROW_SELECTION'
      payload: Row<ColumnId>['id']
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
      payload: Row<ColumnId>[]
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
      payload: SelectedRows<Row<ColumnId>['id']>
    }
  | {
      type: 'SET_HIDDEN_COLUMNS'
      payload: ColumnId[]
    }
