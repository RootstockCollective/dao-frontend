import { getEnvFlag } from '../FeatureFlag'
import { TableAction, TableState } from './types'

const toggleRowSelection = (state: TableState, { payload: id, type }: TableAction) => {
  if (type !== 'TOGGLE_ROW_SELECTION') return state
  return {
    ...state,
    selectedRows: {
      ...state.selectedRows,
      [id]: !state.selectedRows[id],
    },
  }
}

const toggleColumnVisibility = (state: TableState, { payload: id, type }: TableAction) => {
  if (type !== 'TOGGLE_COLUMN_VISIBILITY') return state
  return {
    ...state,
    columns: state.columns.map(column => (column.id === id ? { ...column, hidden: !column.hidden } : column)),
  }
}

const setColumnVisibility = (state: TableState, { payload, type }: TableAction) => {
  if (type !== 'SET_COLUMN_VISIBILITY') return state

  return {
    ...state,
    columns: state.columns.map(column =>
      column.id === payload.columnId ? { ...column, hidden: payload.hidden } : column,
    ),
  }
}

/**
 * Sorts the table by the given column id and direction.
 * Currently only one column can be sorted at a time.
 * @param state
 * @param action
 * @returns new state
 */
const sortByColumn = (state: TableState, { payload, type }: TableAction) => {
  if (type !== 'SORT_BY_COLUMN') return state

  const { columnId, direction } = payload

  return {
    ...state,
    sort: {
      columnId,
      direction,
    },
  }
}

const setRows = (state: TableState, { payload: rows, type }: TableAction) => {
  if (type !== 'SET_ROWS') return state
  return { ...state, rows }
}

const setColumns = (state: TableState, { payload: columns, type }: TableAction) => {
  if (type !== 'SET_COLUMNS') return state
  return { ...state, columns }
}

const setSelectedRows = (state: TableState, { payload: selectedRows, type }: TableAction) => {
  if (type !== 'SET_SELECTED_ROWS') return state
  return { ...state, selectedRows }
}

const setHiddenColumns = (state: TableState, { payload: hiddenColumnIds, type }: TableAction) => {
  if (type !== 'SET_HIDDEN_COLUMNS') return state
  return {
    ...state,
    columns: state.columns.map(column => ({
      ...column,
      hidden: hiddenColumnIds.includes(column.id),
    })),
  }
}

const setDefaultSort = (state: TableState, { payload: sort, type }: TableAction) => {
  if (type !== 'SET_DEFAULT_SORT') return state
  return { ...state, defaultSort: sort }
}

const setLoading = (state: TableState, { payload: loading, type }: TableAction) => {
  if (type !== 'SET_LOADING') return state
  return { ...state, loading }
}

const setError = (state: TableState, { payload: error, type }: TableAction) => {
  if (type !== 'SET_ERROR') return state
  return { ...state, error }
}

const actionMap: Record<TableAction['type'], (state: TableState, action: TableAction) => TableState> = {
  TOGGLE_ROW_SELECTION: toggleRowSelection,
  TOGGLE_COLUMN_VISIBILITY: toggleColumnVisibility,
  SET_COLUMN_VISIBILITY: setColumnVisibility,
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
  const debugEnabled = getEnvFlag('debug_logs')
  if (debugEnabled) {
    console.log('action', action)
    console.log('state', state)
  }
  const newState = actionMap[action.type]?.(state, action) ?? state
  if (debugEnabled) {
    console.log('newState', newState)
  }

  return newState
}
