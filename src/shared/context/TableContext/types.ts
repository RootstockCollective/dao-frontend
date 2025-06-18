export type SortDirection = 'asc' | 'desc' | null

export type Sort<Id extends Column['id'] = Column['id']> = {
  by: Id | null // For now just one column can be sorted
  direction: SortDirection
}

export type RowData<
  ColumnId extends Column['id'] = Column['id'],
  T extends Record<ColumnId, unknown> = Record<ColumnId, unknown>,
> = T & {
  id: ColumnId
}

export type SelectedRows<Id extends string = string> = Record<Id, boolean>

export type Column<Id extends string = string, Type extends string = string> = {
  id: Id
  type: Type
  hidden: boolean
  sortable: boolean
}

export type TableState<ColumnId extends Column['id'] = Column['id'], ColumnType extends string = string> = {
  columns: Column<ColumnId, ColumnType>[]
  rows: RowData<ColumnId>[]
  sort: Sort
  defaultSort: Sort
  selectedRows: SelectedRows // may contain selections across pages
  loading: boolean
  error: string | null
}

export type TableAction<ColumnId extends Column['id'] = Column['id'], ColumnType extends string = string> =
  | {
      type: 'TOGGLE_ROW_SELECTION'
      payload: RowData<ColumnId>['id']
    }
  | {
      type: 'TOGGLE_COLUMN_VISIBILITY'
      payload: ColumnId
    }
  | {
      type: 'SORT_BY_COLUMN'
      payload: {
        id: ColumnId | null
        direction: SortDirection | null
      }
    }
  | {
      type: 'SET_ROWS'
      payload: RowData<ColumnId>[]
    }
  | {
      type: 'SET_COLUMNS'
      payload: Column<ColumnId, ColumnType>[]
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
      payload: SelectedRows<ColumnId>
    }
  | {
      type: 'SET_HIDDEN_COLUMNS'
      payload: ColumnId[]
    }
