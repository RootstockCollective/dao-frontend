import { createContext, FC, ReactNode, useCallback, useContext, useState } from 'react'

export interface TableSelections {
  [key: string]: boolean
}

interface TableState {
  selections: TableSelections
  selectedRowId: string | null
}

interface TableActions {
  selectRow: (rowId: string) => void
  toggleRowSelection: (rowId: string) => void
  clearSelections: () => void
  isRowSelected: (rowId: string) => boolean
}

interface TableContextType {
  state: TableState
  actions: TableActions
}

const DEFAULT_CONTEXT: TableContextType = {
  state: {
    selections: {},
    selectedRowId: null,
  },
  actions: {
    selectRow: () => {},
    toggleRowSelection: () => {},
    clearSelections: () => {},
    isRowSelected: () => false,
  },
}

const TableContext = createContext<TableContextType>(DEFAULT_CONTEXT)

export const TableContextProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [selections, setSelections] = useState<TableSelections>({})

  const selectedRowId = Object.keys(selections).find(key => selections[key]) || null

  const selectRow = useCallback((rowId: string) => {
    setSelections({ [rowId]: true })
  }, [])

  const toggleRowSelection = useCallback((rowId: string) => {
    setSelections(prev => {
      // If the row is currently selected, deselect it
      if (prev[rowId]) {
        return {}
      }
      // Otherwise, select only this row (clear all others)
      return { [rowId]: true }
    })
  }, [])

  const clearSelections = useCallback(() => {
    setSelections({})
  }, [])

  const isRowSelected = useCallback(
    (rowId: string) => {
      return !!selections[rowId]
    },
    [selections],
  )

  const contextValue: TableContextType = {
    state: {
      selections,
      selectedRowId,
    },
    actions: {
      selectRow,
      toggleRowSelection,
      clearSelections,
      isRowSelected,
    },
  }

  return <TableContext.Provider value={contextValue}>{children}</TableContext.Provider>
}

export const useTableContext = () => {
  const context = useContext(TableContext)
  if (!context) {
    throw new Error('useTableContext must be used within a TableContextProvider')
  }
  return context
}
