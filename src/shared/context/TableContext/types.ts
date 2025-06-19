export type SortDirection = 'asc' | 'desc' | null

export type Sort = {
  by: Column['id'] | null // For now just one column can be sorted
  direction: SortDirection
}

export type RowData<T extends Record<string, unknown> = Record<string, unknown>> = T & {
  id: string
}

export type SelectedRows = Record<RowData['id'], boolean>

export type Column = {
  id: string
  label: string
  sublabel?: string
  hidden: boolean
  sortable: boolean
}

export type TableState = {
  columns: Column[]
  rows: RowData[]
  sort: Sort
  defaultSort: Sort
  selectedRows: SelectedRows // may contain selections across pages
  loading: boolean
  error: string | null
}

export type TableAction =
  | {
      type: 'TOGGLE_ROW_SELECTION'
      payload: RowData['id']
    }
  | {
      type: 'TOGGLE_COLUMN_VISIBILITY'
      payload: Column['id']
    }
  | {
      type: 'SORT_BY_COLUMN'
      payload: {
        id: Column['id']
        direction: SortDirection | null
      }
    }
  | {
      type: 'SET_ROWS'
      payload: RowData[]
    }
  | {
      type: 'SET_COLUMNS'
      payload: Column[]
    }
  | {
      type: 'SET_DEFAULT_SORT'
      payload: Sort
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
      payload: SelectedRows
    }
  | {
      type: 'SET_HIDDEN_COLUMNS'
      payload: Column['id'][]
    }
