import { createContext, FC, ReactNode, useCallback, useContext, useState } from 'react'

export interface TableSelections {
  [key: string]: boolean
}

interface TableState {
  selections: TableSelections
  selectedCount: number
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
    selectedCount: 0,
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

  const selectedCount = Object.values(selections).filter(Boolean).length

  const selectRow = useCallback((rowId: string) => {
    setSelections({ [rowId]: true })
  }, [])

  const toggleRowSelection = useCallback((rowId: string) => {
    setSelections(prev => ({
      ...prev,
      [rowId]: !prev[rowId],
    }))
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
      selectedCount,
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
