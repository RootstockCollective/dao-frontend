'use client'

import { NoContextProviderError } from '@/lib/errors/ContextError'
import { createContext, useContext } from 'react'
import { BaseColumnId, TableState } from '.'

export const initialState: TableState = {
  columns: [],
  rows: [],
  selectedRows: {},
  loading: false,
  error: null,
  sort: {
    columnId: null,
    direction: null,
  },
  defaultSort: {
    columnId: null,
    direction: null,
  },
}

export const TableContext = createContext<TableState | null>(null)

export const useTableContext = <
  ColumnId extends BaseColumnId = BaseColumnId,
  CellDataMap extends Record<ColumnId, unknown> = Record<ColumnId, unknown>,
>() => {
  const context = useContext(TableContext) as TableState<ColumnId, CellDataMap>
  if (!context) throw new NoContextProviderError('useTableContext', 'TableProvider')
  return context
}
