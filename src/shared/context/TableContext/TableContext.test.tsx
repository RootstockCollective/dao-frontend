import { NoContextProviderError } from '@/lib/errors/ContextError'
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import React, { FC, useContext } from 'react'
import { afterEach, describe, expect, it } from 'vitest'
import { useTableActionsContext, useTableContext, withTableContext } from '.'
import { TableActionsContext } from './TableActionsContext'
import { TableContext, initialState } from './TableContext'

afterEach(() => {
  cleanup()
})

// Helper function to parse JSON from test elements
const parseTestElementData = (testId: string) => {
  const element = screen.getByTestId(testId)
  return JSON.parse(element.textContent || '{}')
}

describe('TableContext Hook Usage', () => {
  describe('useTableContext', () => {
    const ContextDisplayComponent: FC = () => {
      const context = useTableContext()
      return <div data-testid="context-data">{JSON.stringify(context)}</div>
    }
    it('throws error when used outside TableProvider', () => {
      expect(() => render(<ContextDisplayComponent />)).toThrow(
        new NoContextProviderError('useTableContext', 'TableProvider'),
      )
    })

    it('provides initial state when wrapped with TableProvider', async () => {
      const WrappedComponent = withTableContext(ContextDisplayComponent)
      render(<WrappedComponent />)

      await waitFor(() => {
        expect(screen.getByTestId('context-data')).toBeInTheDocument()
      })

      const contextData = parseTestElementData('context-data')
      expect(contextData).toEqual(initialState)
    })
  })

  describe('useTableActionsContext', () => {
    const DispatcherTestComponent: FC = () => {
      useTableActionsContext()
      return <div data-testid="dispatcher-available">Dispatcher is available</div>
    }

    it('throws error when used outside TableProvider', () => {
      expect(() => render(<DispatcherTestComponent />)).toThrow()
    })

    it('provides dispatch function when wrapped with TableProvider', async () => {
      const WrappedComponent = withTableContext(DispatcherTestComponent)
      render(<WrappedComponent />)

      await waitFor(() => {
        expect(screen.getByTestId('dispatcher-available')).toBeInTheDocument()
      })
    })
  })
})

describe('TableProvider Integration', () => {
  const DirectContextAccessComponent: FC = () => {
    const context = useContext(TableContext)
    const dispatcher = useContext(TableActionsContext)

    return (
      <div>
        <div data-testid="direct-context">{context ? JSON.stringify(context) : 'null'}</div>
        <div data-testid="direct-dispatcher">{typeof dispatcher === 'function' ? 'available' : 'null'}</div>
      </div>
    )
  }
  it('provides both context and dispatcher together', async () => {
    const CombinedTestComponent: FC = () => {
      const context = useTableContext()
      const dispatch = useTableActionsContext()

      return (
        <div>
          <div data-testid="context-available">Context available</div>
          <div data-testid="dispatcher-available">Dispatcher available</div>
          <div data-testid="context-data">{JSON.stringify(context)}</div>
          <div data-testid="dispatcher-data">{JSON.stringify(dispatch)}</div>
        </div>
      )
    }

    const WrappedComponent = withTableContext(CombinedTestComponent)
    render(<WrappedComponent />)

    await waitFor(() => {
      expect(screen.getByTestId('context-available')).toBeInTheDocument()
      expect(screen.getByTestId('dispatcher-available')).toBeInTheDocument()
    })

    const contextData = parseTestElementData('context-data')
    expect(contextData).toEqual(initialState)

    const dispatcher = parseTestElementData('dispatcher-data')
    expect(dispatcher).toBeDefined()
  })

  it('supports direct context access with provider', async () => {
    const WrappedComponent = withTableContext(DirectContextAccessComponent)
    render(<WrappedComponent />)

    await waitFor(() => {
      expect(screen.getByTestId('direct-context')).toHaveTextContent(JSON.stringify(initialState))
      expect(screen.getByTestId('direct-dispatcher')).toHaveTextContent('available')
    })
  })

  it('returns null for direct context access without provider', () => {
    render(<DirectContextAccessComponent />)

    expect(screen.getByTestId('direct-context')).toHaveTextContent('null')
    expect(screen.getByTestId('direct-dispatcher')).toHaveTextContent('null')
  })
})

describe('withTableContext HOC', () => {
  it('wraps component with TableProvider functionality', async () => {
    const SimpleComponent: FC = () => <div data-testid="simple">Simple Component</div>
    const WrappedComponent = withTableContext(SimpleComponent)

    render(<WrappedComponent />)

    await waitFor(() => {
      expect(screen.getByTestId('simple')).toBeInTheDocument()
    })
  })
})

describe('Table Actions and State Management', () => {
  const RowSelectionTestComponent: FC<{ rowId: string }> = ({ rowId }) => {
    const dispatch = useTableActionsContext()
    const { selectedRows } = useTableContext()

    const toggleRowSelection = () => {
      dispatch({ type: 'TOGGLE_ROW_SELECTION', payload: rowId })
    }

    return (
      <div>
        <div data-testid="selected-rows">{JSON.stringify(selectedRows)}</div>
        <button data-testid="toggle-row" onClick={toggleRowSelection}>
          Toggle Row {rowId}
        </button>
      </div>
    )
  }
  describe('Row Selection', () => {
    const testRowId = 'test-row-123'

    it('toggles row selection on TOGGLE_ROW_SELECTION action', async () => {
      const WrappedComponent = withTableContext(() => <RowSelectionTestComponent rowId={testRowId} />)
      render(<WrappedComponent />)

      // Initially no rows selected
      expect(parseTestElementData('selected-rows')).toEqual({})

      // Click to select row
      fireEvent.click(screen.getByTestId('toggle-row'))

      await waitFor(() => {
        const selectedRows = parseTestElementData('selected-rows')
        expect(selectedRows[testRowId]).toBe(true)
      })
    })

    it('toggles row selection back to unselected on second click', async () => {
      const WrappedComponent = withTableContext(() => <RowSelectionTestComponent rowId={testRowId} />)
      render(<WrappedComponent />)

      const toggleButton = screen.getByTestId('toggle-row')

      // First click - select row
      fireEvent.click(toggleButton)
      await waitFor(() => {
        const selectedRows = parseTestElementData('selected-rows')
        expect(selectedRows[testRowId]).toBe(true)
      })

      // Second click - deselect row
      fireEvent.click(toggleButton)
      await waitFor(() => {
        const selectedRows = parseTestElementData('selected-rows')
        expect(selectedRows[testRowId]).toBe(false)
      })
    })
  })

  describe('Column Visibility', () => {
    const ColumnVisibilityTestComponent: FC<{ columnId: string }> = ({ columnId }) => {
      const dispatch = useTableActionsContext()
      const { columns } = useTableContext()

      const toggleColumnVisibility = () => {
        dispatch({ type: 'TOGGLE_COLUMN_VISIBILITY', payload: columnId })
      }

      const hiddenColumns = columns.filter(col => col.hidden).map(col => col.id)

      return (
        <div>
          <div data-testid="hidden-columns">{JSON.stringify(hiddenColumns)}</div>
          <button data-testid="toggle-column" onClick={toggleColumnVisibility}>
            Toggle Column {columnId}
          </button>
        </div>
      )
    }
    const testColumnId = 'test-column-456'

    it('starts with empty hiddenColumns array', async () => {
      const WrappedComponent = withTableContext(() => (
        <ColumnVisibilityTestComponent columnId={testColumnId} />
      ))
      render(<WrappedComponent />)

      await waitFor(() => {
        const hiddenColumns = parseTestElementData('hidden-columns')
        expect(hiddenColumns).toEqual([])
      })
    })

    it('adds column to hiddenColumns when toggled for the first time', async () => {
      const TestComponentWithColumns: FC = () => {
        const dispatch = useTableActionsContext()
        React.useEffect(() => {
          dispatch({
            type: 'SET_COLUMNS',
            payload: [{ id: testColumnId, sortable: true, hidden: false }],
          })
        }, [dispatch])
        return <ColumnVisibilityTestComponent columnId={testColumnId} />
      }

      const WrappedComponent = withTableContext(TestComponentWithColumns)
      render(<WrappedComponent />)

      // Initially no hidden columns
      expect(parseTestElementData('hidden-columns')).toEqual([])

      // Click to hide column
      fireEvent.click(screen.getByTestId('toggle-column'))

      // Column should now be hidden
      await waitFor(() => {
        const hiddenColumns = parseTestElementData('hidden-columns')
        expect(hiddenColumns).toContain(testColumnId)
        expect(hiddenColumns).toHaveLength(1)
      })
    })

    it('removes column from hiddenColumns when toggled back to visible', async () => {
      const TestComponentWithColumns: FC = () => {
        const dispatch = useTableActionsContext()
        React.useEffect(() => {
          dispatch({
            type: 'SET_COLUMNS',
            payload: [{ id: testColumnId, sortable: true, hidden: false }],
          })
        }, [dispatch])
        return <ColumnVisibilityTestComponent columnId={testColumnId} />
      }

      const WrappedComponent = withTableContext(TestComponentWithColumns)
      render(<WrappedComponent />)

      const toggleButton = screen.getByTestId('toggle-column')

      // First click - hide column
      fireEvent.click(toggleButton)
      await waitFor(() => {
        const hiddenColumns = parseTestElementData('hidden-columns')
        expect(hiddenColumns).toContain(testColumnId)
      })

      // Second click - show column again
      fireEvent.click(toggleButton)
      await waitFor(() => {
        const hiddenColumns = parseTestElementData('hidden-columns')
        expect(hiddenColumns).not.toContain(testColumnId)
        expect(hiddenColumns).toHaveLength(0)
      })
    })

    it('handles multiple columns being hidden independently', async () => {
      const MultiColumnTestComponent: FC = () => {
        const dispatch = useTableActionsContext()
        const { columns } = useTableContext()

        React.useEffect(() => {
          dispatch({
            type: 'SET_COLUMNS',
            payload: [
              { id: 'col1', sortable: true, hidden: false },
              { id: 'col2', sortable: true, hidden: false },
            ],
          })
        }, [dispatch])

        const toggleColumn1 = () => dispatch({ type: 'TOGGLE_COLUMN_VISIBILITY', payload: 'col1' })
        const toggleColumn2 = () => dispatch({ type: 'TOGGLE_COLUMN_VISIBILITY', payload: 'col2' })

        const hiddenColumns = columns.filter(col => col.hidden).map(col => col.id)

        return (
          <div>
            <div data-testid="hidden-columns">{JSON.stringify(hiddenColumns)}</div>
            <button data-testid="toggle-col-1" onClick={toggleColumn1}>
              Toggle Col 1
            </button>
            <button data-testid="toggle-col-2" onClick={toggleColumn2}>
              Toggle Col 2
            </button>
          </div>
        )
      }

      const WrappedComponent = withTableContext(MultiColumnTestComponent)
      render(<WrappedComponent />)

      // Hide first column
      fireEvent.click(screen.getByTestId('toggle-col-1'))
      await waitFor(() => {
        const hiddenColumns = parseTestElementData('hidden-columns')
        expect(hiddenColumns).toContain('col1')
        expect(hiddenColumns).toHaveLength(1)
      })

      // Hide second column
      fireEvent.click(screen.getByTestId('toggle-col-2'))
      await waitFor(() => {
        const hiddenColumns = parseTestElementData('hidden-columns')
        expect(hiddenColumns).toContain('col1')
        expect(hiddenColumns).toContain('col2')
        expect(hiddenColumns).toHaveLength(2)
      })

      // Show first column while keeping second hidden
      fireEvent.click(screen.getByTestId('toggle-col-1'))
      await waitFor(() => {
        const hiddenColumns = parseTestElementData('hidden-columns')
        expect(hiddenColumns).not.toContain('col1')
        expect(hiddenColumns).toContain('col2')
        expect(hiddenColumns).toHaveLength(1)
      })
    })
  })

  describe('Column Sorting', () => {
    const SortTestComponent: FC<{ columnId: string; direction: 'asc' | 'desc' }> = ({
      columnId,
      direction,
    }) => {
      const dispatch = useTableActionsContext()
      const { sort } = useTableContext()

      const applySorting = () => {
        dispatch({ type: 'SORT_BY_COLUMN', payload: { columnId: columnId, direction } })
      }

      return (
        <div>
          <div data-testid="sort-state">{JSON.stringify(sort)}</div>
          <button data-testid="apply-sort" onClick={applySorting}>
            Sort by {columnId} ({direction})
          </button>
        </div>
      )
    }
    const testColumnId = 'test-column-789'

    it('updates sort state when SORT_BY_COLUMN action is dispatched', async () => {
      const WrappedComponent = withTableContext(() => (
        <SortTestComponent columnId={testColumnId} direction="asc" />
      ))
      render(<WrappedComponent />)

      // Initially no sorting applied
      expect(parseTestElementData('sort-state')).toEqual({ columnId: null, direction: null })

      // Apply ascending sort
      fireEvent.click(screen.getByTestId('apply-sort'))

      await waitFor(() => {
        const sortState = parseTestElementData('sort-state')
        expect(sortState).toEqual({ columnId: testColumnId, direction: 'asc' })
      })
    })

    it('can update sort direction', async () => {
      const WrappedComponent = withTableContext(() => (
        <SortTestComponent columnId={testColumnId} direction="desc" />
      ))
      render(<WrappedComponent />)

      // Apply descending sort
      fireEvent.click(screen.getByTestId('apply-sort'))

      await waitFor(() => {
        const sortState = parseTestElementData('sort-state')
        expect(sortState).toEqual({ columnId: testColumnId, direction: 'desc' })
      })
    })
  })

  describe('Unknown Actions', () => {
    const UnknownActionTestComponent: FC = () => {
      const dispatch = useTableActionsContext()
      const context = useTableContext()

      const dispatchUnknownAction = () => {
        dispatch({ type: 'UNKNOWN_ACTION', payload: 'test' } as any)
      }

      return (
        <div>
          <div data-testid="context-state">{JSON.stringify(context)}</div>
          <button data-testid="unknown-action" onClick={dispatchUnknownAction}>
            Dispatch Unknown Action
          </button>
        </div>
      )
    }
    it('maintains original state when unknown action is dispatched', async () => {
      const WrappedComponent = withTableContext(UnknownActionTestComponent)
      render(<WrappedComponent />)

      // Get initial state
      const initialContextData = parseTestElementData('context-state')

      // Dispatch unknown action
      fireEvent.click(screen.getByTestId('unknown-action'))

      // State should remain unchanged
      await waitFor(() => {
        const contextData = parseTestElementData('context-state')
        expect(contextData).toEqual(initialContextData)
      })
    })
  })

  describe('Table Data Updates', () => {
    describe('SET_ROWS', () => {
      const SetRowsTestComponent: FC = () => {
        const dispatch = useTableActionsContext()
        const { rows } = useTableContext()

        const setTestRows = () => {
          const testRows = [
            { id: 'row1', data: { name: 'Test Row 1', value: 100 } },
            { id: 'row2', data: { name: 'Test Row 2', value: 200 } },
          ]
          dispatch({ type: 'SET_ROWS', payload: testRows })
        }

        const clearRows = () => {
          dispatch({ type: 'SET_ROWS', payload: [] })
        }

        return (
          <div>
            <div data-testid="rows-data">{JSON.stringify(rows)}</div>
            <button data-testid="set-rows" onClick={setTestRows}>
              Set Test Rows
            </button>
            <button data-testid="clear-rows" onClick={clearRows}>
              Clear Rows
            </button>
          </div>
        )
      }

      it('updates rows when SET_ROWS action is dispatched', async () => {
        const WrappedComponent = withTableContext(SetRowsTestComponent)
        render(<WrappedComponent />)

        // Initially empty rows
        expect(parseTestElementData('rows-data')).toEqual([])

        // Set test rows
        fireEvent.click(screen.getByTestId('set-rows'))

        await waitFor(() => {
          const rowsData = parseTestElementData('rows-data')
          expect(rowsData).toEqual([
            { id: 'row1', data: { name: 'Test Row 1', value: 100 } },
            { id: 'row2', data: { name: 'Test Row 2', value: 200 } },
          ])
        })
      })

      it('can clear rows by setting empty array', async () => {
        const WrappedComponent = withTableContext(SetRowsTestComponent)
        render(<WrappedComponent />)

        // Set rows first
        fireEvent.click(screen.getByTestId('set-rows'))
        await waitFor(() => {
          const rowsData = parseTestElementData('rows-data')
          expect(rowsData).toHaveLength(2)
        })

        // Clear rows
        fireEvent.click(screen.getByTestId('clear-rows'))
        await waitFor(() => {
          const rowsData = parseTestElementData('rows-data')
          expect(rowsData).toEqual([])
        })
      })
    })

    describe('SET_COLUMNS', () => {
      const SetColumnsTestComponent: FC = () => {
        const dispatch = useTableActionsContext()
        const { columns } = useTableContext()

        const setTestColumns = () => {
          const testColumns = [
            { id: 'name', sortable: true, hidden: false },
            { id: 'value', sortable: true, hidden: false },
            { id: 'status', sortable: false, hidden: false },
          ]
          dispatch({ type: 'SET_COLUMNS', payload: testColumns })
        }

        return (
          <div>
            <div data-testid="columns-data">{JSON.stringify(columns)}</div>
            <button data-testid="set-columns" onClick={setTestColumns}>
              Set Test Columns
            </button>
          </div>
        )
      }

      it('updates columns when SET_COLUMNS action is dispatched', async () => {
        const WrappedComponent = withTableContext(SetColumnsTestComponent)
        render(<WrappedComponent />)

        // Initially empty columns
        expect(parseTestElementData('columns-data')).toEqual([])

        // Set test columns
        fireEvent.click(screen.getByTestId('set-columns'))

        await waitFor(() => {
          const columnsData = parseTestElementData('columns-data')
          expect(columnsData).toEqual([
            { id: 'name', sortable: true, hidden: false },
            { id: 'value', sortable: true, hidden: false },
            { id: 'status', sortable: false, hidden: false },
          ])
        })
      })
    })

    describe('SET_SELECTED_ROWS', () => {
      const SetSelectedRowsTestComponent: FC = () => {
        const dispatch = useTableActionsContext()
        const { selectedRows } = useTableContext()

        const setSelectedRows = () => {
          const selection = { row1: true, row3: true, row5: false }
          dispatch({ type: 'SET_SELECTED_ROWS', payload: selection })
        }

        const clearSelection = () => {
          dispatch({ type: 'SET_SELECTED_ROWS', payload: {} })
        }

        return (
          <div>
            <div data-testid="selected-rows-data">{JSON.stringify(selectedRows)}</div>
            <button data-testid="set-selected" onClick={setSelectedRows}>
              Set Selected Rows
            </button>
            <button data-testid="clear-selected" onClick={clearSelection}>
              Clear Selection
            </button>
          </div>
        )
      }

      it('updates selected rows when SET_SELECTED_ROWS action is dispatched', async () => {
        const WrappedComponent = withTableContext(SetSelectedRowsTestComponent)
        render(<WrappedComponent />)

        // Initially no selection
        expect(parseTestElementData('selected-rows-data')).toEqual({})

        // Set selected rows
        fireEvent.click(screen.getByTestId('set-selected'))

        await waitFor(() => {
          const selectedRowsData = parseTestElementData('selected-rows-data')
          expect(selectedRowsData).toEqual({ row1: true, row3: true, row5: false })
        })
      })

      it('can clear selection by setting empty object', async () => {
        const WrappedComponent = withTableContext(SetSelectedRowsTestComponent)
        render(<WrappedComponent />)

        // Set selection first
        fireEvent.click(screen.getByTestId('set-selected'))
        await waitFor(() => {
          const selectedRowsData = parseTestElementData('selected-rows-data')
          expect(Object.keys(selectedRowsData)).toHaveLength(3)
        })

        // Clear selection
        fireEvent.click(screen.getByTestId('clear-selected'))
        await waitFor(() => {
          const selectedRowsData = parseTestElementData('selected-rows-data')
          expect(selectedRowsData).toEqual({})
        })
      })
    })

    describe('SET_HIDDEN_COLUMNS', () => {
      const SetHiddenColumnsTestComponent: FC = () => {
        const dispatch = useTableActionsContext()
        const { columns } = useTableContext()

        React.useEffect(() => {
          dispatch({
            type: 'SET_COLUMNS',
            payload: [
              { id: 'col1', sortable: true, hidden: false },
              { id: 'col2', sortable: true, hidden: false },
              { id: 'col3', sortable: true, hidden: false },
              { id: 'col4', sortable: true, hidden: false },
              { id: 'col5', sortable: true, hidden: false },
            ],
          })
        }, [dispatch])

        const setHiddenColumns = () => {
          const hidden = ['col1', 'col3', 'col5']
          dispatch({ type: 'SET_HIDDEN_COLUMNS', payload: hidden })
        }

        const showAllColumns = () => {
          dispatch({ type: 'SET_HIDDEN_COLUMNS', payload: [] })
        }

        const hiddenColumns = columns.filter(col => col.hidden).map(col => col.id)

        return (
          <div>
            <div data-testid="hidden-columns-data">{JSON.stringify(hiddenColumns)}</div>
            <button data-testid="set-hidden" onClick={setHiddenColumns}>
              Hide Columns
            </button>
            <button data-testid="show-all" onClick={showAllColumns}>
              Show All Columns
            </button>
          </div>
        )
      }

      it('updates hidden columns when SET_HIDDEN_COLUMNS action is dispatched', async () => {
        const WrappedComponent = withTableContext(SetHiddenColumnsTestComponent)
        render(<WrappedComponent />)

        // Initially no hidden columns
        expect(parseTestElementData('hidden-columns-data')).toEqual([])

        // Set hidden columns
        fireEvent.click(screen.getByTestId('set-hidden'))

        await waitFor(() => {
          const hiddenColumnsData = parseTestElementData('hidden-columns-data')
          expect(hiddenColumnsData).toEqual(['col1', 'col3', 'col5'])
        })
      })

      it('can show all columns by setting empty array', async () => {
        const WrappedComponent = withTableContext(SetHiddenColumnsTestComponent)
        render(<WrappedComponent />)

        // Hide columns first
        fireEvent.click(screen.getByTestId('set-hidden'))
        await waitFor(() => {
          const hiddenColumnsData = parseTestElementData('hidden-columns-data')
          expect(hiddenColumnsData).toHaveLength(3)
        })

        // Show all columns
        fireEvent.click(screen.getByTestId('show-all'))
        await waitFor(() => {
          const hiddenColumnsData = parseTestElementData('hidden-columns-data')
          expect(hiddenColumnsData).toEqual([])
        })
      })
    })

    describe('SET_DEFAULT_SORT', () => {
      const SetDefaultSortTestComponent: FC = () => {
        const dispatch = useTableActionsContext()
        const { defaultSort } = useTableContext()

        const setDefaultSort = () => {
          const sort = { columnId: 'name', direction: 'asc' as const }
          dispatch({ type: 'SET_DEFAULT_SORT', payload: sort })
        }

        const clearDefaultSort = () => {
          const sort = { columnId: null, direction: null }
          dispatch({ type: 'SET_DEFAULT_SORT', payload: sort })
        }

        return (
          <div>
            <div data-testid="default-sort-data">{JSON.stringify(defaultSort)}</div>
            <button data-testid="set-default-sort" onClick={setDefaultSort}>
              Set Default Sort
            </button>
            <button data-testid="clear-default-sort" onClick={clearDefaultSort}>
              Clear Default Sort
            </button>
          </div>
        )
      }

      it('updates default sort when SET_DEFAULT_SORT action is dispatched', async () => {
        const WrappedComponent = withTableContext(SetDefaultSortTestComponent)
        render(<WrappedComponent />)

        // Initially no default sort
        expect(parseTestElementData('default-sort-data')).toEqual({ columnId: null, direction: null })

        // Set default sort
        fireEvent.click(screen.getByTestId('set-default-sort'))

        await waitFor(() => {
          const defaultSortData = parseTestElementData('default-sort-data')
          expect(defaultSortData).toEqual({ columnId: 'name', direction: 'asc' })
        })
      })

      it('can clear default sort', async () => {
        const WrappedComponent = withTableContext(SetDefaultSortTestComponent)
        render(<WrappedComponent />)

        // Set default sort first
        fireEvent.click(screen.getByTestId('set-default-sort'))
        await waitFor(() => {
          const defaultSortData = parseTestElementData('default-sort-data')
          expect(defaultSortData.columnId).toBe('name')
        })

        // Clear default sort
        fireEvent.click(screen.getByTestId('clear-default-sort'))
        await waitFor(() => {
          const defaultSortData = parseTestElementData('default-sort-data')
          expect(defaultSortData).toEqual({ columnId: null, direction: null })
        })
      })
    })

    describe('SET_LOADING', () => {
      const SetLoadingTestComponent: FC = () => {
        const dispatch = useTableActionsContext()
        const { loading } = useTableContext()

        const setLoading = () => {
          dispatch({ type: 'SET_LOADING', payload: true })
        }

        const setNotLoading = () => {
          dispatch({ type: 'SET_LOADING', payload: false })
        }

        return (
          <div>
            <div data-testid="loading-state">{JSON.stringify(loading)}</div>
            <button data-testid="set-loading" onClick={setLoading}>
              Set Loading
            </button>
            <button data-testid="set-not-loading" onClick={setNotLoading}>
              Set Not Loading
            </button>
          </div>
        )
      }

      it('updates loading state when SET_LOADING action is dispatched', async () => {
        const WrappedComponent = withTableContext(SetLoadingTestComponent)
        render(<WrappedComponent />)

        // Initially not loading
        expect(parseTestElementData('loading-state')).toBe(false)

        // Set loading
        fireEvent.click(screen.getByTestId('set-loading'))

        await waitFor(() => {
          const loadingState = parseTestElementData('loading-state')
          expect(loadingState).toBe(true)
        })

        // Set not loading
        fireEvent.click(screen.getByTestId('set-not-loading'))

        await waitFor(() => {
          const loadingState = parseTestElementData('loading-state')
          expect(loadingState).toBe(false)
        })
      })
    })

    describe('SET_ERROR', () => {
      const SetErrorTestComponent: FC = () => {
        const dispatch = useTableActionsContext()
        const { error } = useTableContext()

        const setError = () => {
          dispatch({ type: 'SET_ERROR', payload: 'Something went wrong!' })
        }

        const clearError = () => {
          dispatch({ type: 'SET_ERROR', payload: null })
        }

        return (
          <div>
            <div data-testid="error-state">{JSON.stringify(error)}</div>
            <button data-testid="set-error" onClick={setError}>
              Set Error
            </button>
            <button data-testid="clear-error" onClick={clearError}>
              Clear Error
            </button>
          </div>
        )
      }

      it('updates error state when SET_ERROR action is dispatched', async () => {
        const WrappedComponent = withTableContext(SetErrorTestComponent)
        render(<WrappedComponent />)

        // Initially no error
        expect(parseTestElementData('error-state')).toBe(null)

        // Set error
        fireEvent.click(screen.getByTestId('set-error'))

        await waitFor(() => {
          const errorState = parseTestElementData('error-state')
          expect(errorState).toBe('Something went wrong!')
        })

        // Clear error
        fireEvent.click(screen.getByTestId('clear-error'))

        await waitFor(() => {
          const errorState = parseTestElementData('error-state')
          expect(errorState).toBe(null)
        })
      })
    })
  })
})
