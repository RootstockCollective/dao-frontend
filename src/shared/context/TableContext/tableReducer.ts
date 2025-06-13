import { TableAction, TableState } from './types'

const toggleRowSelection = (state: TableState, action: TableAction) => {
  if (action.type !== 'TOGGLE_ROW_SELECTION') return state
  const { payload: id } = action
  return {
    ...state,
    selectedRows: {
      ...state.selectedRows,
      [id]: !state.selectedRows[id],
    },
  }
}

const toggleColumnVisibility = (state: TableState, action: TableAction) => {
  if (action.type !== 'TOGGLE_COLUMN_VISIBILITY') return state
  const { payload: id } = action
  return {
    ...state,
    columns: state.columns.map(column => (column.id === id ? { ...column, hidden: !column.hidden } : column)),
  }
}

/**
 * Sorts the table by the given column id and direction.
 * Currently only one column can be sorted at a time.
 * @param state
 * @param action
 * @returns new state
 */
const sortByColumn = (state: TableState, action: TableAction) => {
  if (action.type !== 'SORT_BY_COLUMN') return state
  const {
    payload: { id, direction },
  } = action
  return {
    ...state,
    sort: {
      by: id,
      direction,
    },
  }
}

const setRows = (state: TableState, action: TableAction) => {
  if (action.type !== 'SET_ROWS') return state
  const { payload: rows } = action
  return { ...state, rows }
}

const setColumns = (state: TableState, action: TableAction) => {
  if (action.type !== 'SET_COLUMNS') return state
  const { payload: columns } = action
  return { ...state, columns }
}

const setSelectedRows = (state: TableState, action: TableAction) => {
  if (action.type !== 'SET_SELECTED_ROWS') return state
  const { payload: selectedRows } = action
  return { ...state, selectedRows }
}

const setHiddenColumns = (state: TableState, action: TableAction) => {
  if (action.type !== 'SET_HIDDEN_COLUMNS') return state
  const { payload: hiddenColumnIds } = action
  return {
    ...state,
    columns: state.columns.map(column => ({
      ...column,
      hidden: hiddenColumnIds.includes(column.id),
    })),
  }
}

const setDefaultSort = (state: TableState, action: TableAction) => {
  if (action.type !== 'SET_DEFAULT_SORT') return state
  const { payload: sort } = action
  return { ...state, defaultSort: sort }
}

const setLoading = (state: TableState, action: TableAction) => {
  if (action.type !== 'SET_LOADING') return state
  const { payload: loading } = action
  return { ...state, loading }
}

const setError = (state: TableState, action: TableAction) => {
  if (action.type !== 'SET_ERROR') return state
  const { payload: error } = action
  return { ...state, error }
}

const actionMap = {
  TOGGLE_ROW_SELECTION: toggleRowSelection,
  TOGGLE_COLUMN_VISIBILITY: toggleColumnVisibility,
  SORT_BY_COLUMN: sortByColumn,
  SET_ROWS: setRows,
  SET_COLUMNS: setColumns,
  SET_SELECTED_ROWS: setSelectedRows,
  SET_HIDDEN_COLUMNS: setHiddenColumns,
  SET_DEFAULT_SORT: setDefaultSort,
  SET_LOADING: setLoading,
  SET_ERROR: setError,
} as const

export const tableReducer = (state: TableState, action: TableAction) => {
  return actionMap[action.type]?.(state, action) ?? state
}
