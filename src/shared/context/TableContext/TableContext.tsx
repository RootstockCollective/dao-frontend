'use client'

import { NoContextProviderError } from '@/lib/errors/ContextError'
import { createContext, useContext } from 'react'
import { TableState } from '.'

export const initialState: TableState = {
  columns: [],
  rows: [],
  selectedRows: {},
  loading: false,
  error: null,
  sort: {
    by: null,
    direction: null,
  },
  defaultSort: {
    by: null,
    direction: null,
  },
}

export const TableContext = createContext<TableState | null>(null)

export const useTableContext = () => {
  const context = useContext(TableContext)
  if (!context) throw new NoContextProviderError('TableContext', 'TableProvider')
  return context
}
