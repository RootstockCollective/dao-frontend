import { NoContextProviderError } from '@/lib/errors/ContextError'
import { createContext, Dispatch, useContext } from 'react'
import { TableAction } from './types'

export const TableActionsContext = createContext<Dispatch<TableAction> | null>(null)

export const useTableActionsContext = () => {
  const context = useContext(TableActionsContext)
  if (!context) {
    throw new NoContextProviderError('useTableActionsContext', 'TableProvider')
  }

  return context
}
