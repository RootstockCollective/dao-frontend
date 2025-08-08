'use client'

import { NoContextProviderError } from '@/lib/errors/ContextError'
import { createContext, Dispatch, useContext } from 'react'
import { BaseColumnId, TableAction } from './types'

export const TableActionsContext = createContext<Dispatch<TableAction> | null>(null)

export const useTableActionsContext = <
  ColumnId extends BaseColumnId = BaseColumnId,
  CellDataMap extends Record<ColumnId, unknown> = Record<ColumnId, unknown>,
>() => {
  const context = useContext(TableActionsContext) as Dispatch<TableAction<ColumnId, CellDataMap>>
  if (!context) {
    throw new NoContextProviderError('useTableActionsContext', 'TableProvider')
  }

  return context
}
