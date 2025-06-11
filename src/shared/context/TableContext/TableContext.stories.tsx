import type { Meta, StoryObj } from '@storybook/react'
import { FC, useEffect, useMemo, useState } from 'react'
import { useTableActionsContext, useTableContext, withTableContext } from './index'
import { Column } from './types'

// Mock data for the story
const sampleColumns: Column[] = [
  { id: 'id', label: 'ID', sortable: true, hidden: false },
  { id: 'name', label: 'Name', sortable: true, hidden: false },
  { id: 'email', label: 'Email', sortable: true, hidden: false },
  { id: 'role', label: 'Role', sortable: false, hidden: false },
  { id: 'status', label: 'Status', sortable: true, hidden: false },
  { id: 'lastLogin', label: 'Last Login', sortable: true, hidden: false },
]

const sampleData = [
  {
    id: 'user-1',
    name: 'Alice Johnson',
    email: 'alice.johnson@company.com',
    role: 'Admin',
    status: 'Active',
    lastLogin: '2024-01-15',
  },
  {
    id: 'user-2',
    name: 'Bob Smith',
    email: 'bob.smith@company.com',
    role: 'User',
    status: 'Active',
    lastLogin: '2024-01-14',
  },
  {
    id: 'user-3',
    name: 'Charlie Brown',
    email: 'charlie.brown@company.com',
    role: 'Manager',
    status: 'Inactive',
    lastLogin: '2024-01-10',
  },
  {
    id: 'user-4',
    name: 'Diana Prince',
    email: 'diana.prince@company.com',
    role: 'User',
    status: 'Pending',
    lastLogin: '2024-01-12',
  },
  {
    id: 'user-5',
    name: 'Ethan Hunt',
    email: 'ethan.hunt@company.com',
    role: 'Admin',
    status: 'Active',
    lastLogin: '2024-01-16',
  },
]

// Control Panel Component
const TableControlPanel: FC = () => {
  const dispatch = useTableActionsContext()
  const [customError, setCustomError] = useState('')

  const simulateLoading = () => {
    dispatch({ type: 'SET_LOADING', payload: true })
    setTimeout(() => {
      dispatch({ type: 'SET_LOADING', payload: false })
    }, 2000)
  }

  const simulateError = () => {
    const errorMessage = customError || 'Failed to load table data'
    dispatch({ type: 'SET_ERROR', payload: errorMessage })
  }

  const resetTable = () => {
    dispatch({ type: 'SET_ROWS', payload: sampleData })
    dispatch({ type: 'SET_COLUMNS', payload: sampleColumns })
    dispatch({ type: 'SET_SELECTED_ROWS', payload: {} })
    dispatch({ type: 'SET_HIDDEN_COLUMNS', payload: [] })
    dispatch({ type: 'SORT_BY_COLUMN', payload: { id: 'name', direction: 'asc' } })
    dispatch({ type: 'SET_LOADING', payload: false })
    dispatch({ type: 'SET_ERROR', payload: null })
  }

  const addMoreData = () => {
    const { rows } = useTableContext()
    const newUsers = [
      {
        id: `user-${Date.now()}`,
        name: 'John Doe',
        email: 'john.doe@company.com',
        role: 'User',
        status: 'Active',
        lastLogin: '2024-01-17',
      },
    ]
    dispatch({ type: 'SET_ROWS', payload: [...rows, ...newUsers] })
  }

  return (
    <div className="bg-yellow-50 p-4 rounded-lg mb-6">
      <h3 className="text-lg font-semibold mb-4">Story Controls</h3>

      {/* Main Action Buttons */}
      <div className="flex flex-wrap gap-2 mb-4">
        <button
          onClick={simulateLoading}
          className="bg-blue-500 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded text-sm"
        >
          Simulate Loading
        </button>
        <button
          onClick={simulateError}
          className="bg-red-500 hover:bg-red-700 text-white font-medium py-2 px-4 rounded text-sm"
        >
          Simulate Error
        </button>
        <button
          onClick={resetTable}
          className="bg-green-500 hover:bg-green-700 text-white font-medium py-2 px-4 rounded text-sm"
        >
          Reset Table
        </button>
        <button
          onClick={addMoreData}
          className="bg-purple-500 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded text-sm"
        >
          Add More Data
        </button>
      </div>

      {/* Quick Sort Demo */}
      <div className="mb-4">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Quick Sort Demo</h4>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => dispatch({ type: 'SORT_BY_COLUMN', payload: { id: 'name', direction: 'asc' } })}
            className="bg-indigo-500 hover:bg-indigo-700 text-white font-medium py-1 px-3 rounded text-xs"
          >
            Sort by Name ↑
          </button>
          <button
            onClick={() => dispatch({ type: 'SORT_BY_COLUMN', payload: { id: 'email', direction: 'desc' } })}
            className="bg-indigo-500 hover:bg-indigo-700 text-white font-medium py-1 px-3 rounded text-xs"
          >
            Sort by Email ↓
          </button>
          <button
            onClick={() => dispatch({ type: 'SORT_BY_COLUMN', payload: { id: 'status', direction: 'asc' } })}
            className="bg-indigo-500 hover:bg-indigo-700 text-white font-medium py-1 px-3 rounded text-xs"
          >
            Sort by Status ↑
          </button>
          <button
            onClick={() =>
              dispatch({ type: 'SORT_BY_COLUMN', payload: { id: 'lastLogin', direction: 'desc' } })
            }
            className="bg-indigo-500 hover:bg-indigo-700 text-white font-medium py-1 px-3 rounded text-xs"
          >
            Sort by Last Login ↓
          </button>
        </div>
      </div>

      {/* Custom Error Input */}
      <div className="flex items-center space-x-2">
        <input
          type="text"
          placeholder="Custom error message"
          value={customError}
          onChange={e => setCustomError(e.target.value)}
          className="border border-gray-300 rounded px-3 py-1 text-sm"
        />
        <span className="text-sm text-gray-500">(optional)</span>
      </div>
    </div>
  )
}

// Main Interactive Table Component
const InteractiveTableComponent: FC = () => {
  const { columns, rows, selectedRows, sort, loading, error } = useTableContext()
  const dispatch = useTableActionsContext()

  // Initialize data on component mount
  useEffect(() => {
    dispatch({ type: 'SET_COLUMNS', payload: sampleColumns })
    dispatch({ type: 'SET_ROWS', payload: sampleData })
    dispatch({ type: 'SORT_BY_COLUMN', payload: { id: 'name', direction: 'asc' } })
  }, [dispatch])

  const hiddenColumns = columns.filter(col => col.hidden).map(col => col.id)
  const visibleColumns = columns.filter(col => !col.hidden)
  const selectedCount = Object.values(selectedRows).filter(Boolean).length
  const isAllSelected = selectedCount === rows.length && rows.length > 0

  // Apply sorting to rows
  const sortedRows = useMemo(() => {
    if (!sort?.by || !sort.direction) return rows

    const sorted = [...rows].sort((a, b) => {
      const aValue = a[sort.by as keyof typeof a]
      const bValue = b[sort.by as keyof typeof b]

      // Handle different data types
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        const comparison = aValue.toLowerCase().localeCompare(bValue.toLowerCase())
        return sort.direction === 'asc' ? comparison : -comparison
      }

      // For dates or numbers, convert to string for comparison
      const aStr = String(aValue || '')
      const bStr = String(bValue || '')
      const comparison = aStr.localeCompare(bStr)
      return sort.direction === 'asc' ? comparison : -comparison
    })

    return sorted
  }, [rows, sort])

  // Event handlers
  const handleSort = (columnId: string) => {
    const currentDirection = sort?.by === columnId ? sort.direction : null
    const newDirection = currentDirection === 'asc' ? 'desc' : 'asc'
    dispatch({ type: 'SORT_BY_COLUMN', payload: { id: columnId, direction: newDirection } })
  }

  const handleRowSelect = (rowId: string) => {
    dispatch({ type: 'TOGGLE_ROW_SELECTION', payload: rowId })
  }

  const handleSelectAll = () => {
    if (isAllSelected) {
      dispatch({ type: 'SET_SELECTED_ROWS', payload: {} })
    } else {
      const allSelected = sortedRows.reduce((acc, row) => ({ ...acc, [row.id]: true }), {})
      dispatch({ type: 'SET_SELECTED_ROWS', payload: allSelected })
    }
  }

  const handleColumnToggle = (columnId: string) => {
    dispatch({ type: 'TOGGLE_COLUMN_VISIBILITY', payload: columnId })
  }

  // Loading state
  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p className="mt-4 text-gray-600">Loading table data...</p>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-md">
        <div className="flex items-center">
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Error</h3>
            <div className="mt-2 text-sm text-red-700">
              <p>{error}</p>
            </div>
            <div className="mt-4">
              <button
                onClick={() => dispatch({ type: 'SET_ERROR', payload: null })}
                className="bg-red-100 hover:bg-red-200 text-red-800 font-medium py-1 px-3 rounded text-sm"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Main table view
  return (
    <div className="space-y-6">
      {/* Table Controls Section */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="text-lg font-semibold mb-4">Table Controls</h3>

        {/* Selection Info */}
        <div className="mb-4">
          <p className="text-sm text-gray-600">
            Selected: <span className="font-medium">{selectedCount}</span> of{' '}
            <span className="font-medium">{rows.length}</span> rows
          </p>
          <button
            onClick={handleSelectAll}
            className="mt-2 bg-blue-500 hover:bg-blue-700 text-white font-medium py-1 px-3 rounded text-sm"
          >
            {isAllSelected ? 'Deselect All' : 'Select All'}
          </button>
        </div>

        {/* Column Visibility Controls */}
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Column Visibility</h4>
          <div className="flex flex-wrap gap-2">
            {columns.map(column => (
              <label key={column.id} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={!column.hidden}
                  onChange={() => handleColumnToggle(column.id)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">{column.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Sort Info */}
        <div className="mb-4">
          <p className="text-sm text-gray-600">
            {sort?.by ? (
              <>
                Sorted by: <span className="font-medium">{sort.by}</span> (
                <span className="font-medium">{sort.direction}</span>)
              </>
            ) : (
              'No sorting applied'
            )}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            💡 Click any sortable column header to sort by that column. Click again to reverse order.
          </p>
        </div>
      </div>

      {/* Data Table */}
      <div className="overflow-x-auto bg-white shadow rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <input
                  type="checkbox"
                  checked={isAllSelected}
                  onChange={handleSelectAll}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </th>
              {visibleColumns.map(column => (
                <th
                  key={column.id}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {column.sortable ? (
                    <button
                      onClick={() => handleSort(column.id)}
                      className={`group inline-flex items-center space-x-1 hover:text-gray-900 transition-colors ${
                        sort?.by === column.id
                          ? 'text-blue-600 font-semibold'
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                      title={`Sort by ${column.label} ${
                        sort?.by === column.id
                          ? `(currently ${sort.direction === 'asc' ? 'ascending' : 'descending'})`
                          : ''
                      }`}
                    >
                      <span>{column.label}</span>
                      <span className="text-xs opacity-70">
                        {sort?.by === column.id ? (
                          <span className="text-blue-600 font-bold">
                            {sort.direction === 'asc' ? '↑' : '↓'}
                          </span>
                        ) : (
                          <span className="group-hover:opacity-100 opacity-30">⇅</span>
                        )}
                      </span>
                    </button>
                  ) : (
                    <span className="text-gray-500">{column.label}</span>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedRows.map(row => (
              <tr key={row.id} className={`hover:bg-gray-50 ${selectedRows[row.id] ? 'bg-blue-50' : ''}`}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <input
                    type="checkbox"
                    checked={!!selectedRows[row.id]}
                    onChange={() => handleRowSelect(row.id)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </td>
                {visibleColumns.map(column => (
                  <td key={column.id} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {String(row[column.id as keyof typeof row] || '')}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// Main Story Component
const InteractiveTableStory: FC = () => (
  <div className="max-w-6xl mx-auto p-6">
    <h1 className="text-3xl font-bold mb-6">Interactive Table Context</h1>
    <p className="text-gray-600 mb-6">
      This story demonstrates all features of the TableContext including sorting, column visibility, row
      selection, loading states, and error handling. Use the controls below to interact with the table.
    </p>
    <TableControlPanel />
    <InteractiveTableComponent />
  </div>
)

// Wrapped component with context
const TableContextStory = withTableContext(InteractiveTableStory)

// Storybook Meta Configuration
const meta = {
  title: 'Context/TableContext',
  component: TableContextStory,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: `
The TableContext provides a comprehensive state management solution for interactive tables with features like:

- **Row Selection**: Select individual rows or use "Select All" functionality
- **Column Sorting**: Click column headers to sort (ascending/descending)
- **Column Visibility**: Show/hide columns dynamically
- **Loading States**: Display loading indicators during data fetching
- **Error Handling**: Graceful error display with dismissible messages
- **Flexible Data**: Support for any row/column structure

## Usage

Wrap your table component with \`withTableContext\` and use the provided hooks:
- \`useTableContext()\` - Access table state
- \`useTableActionsContext()\` - Dispatch table actions

## Features Demonstrated

This interactive story shows all table context capabilities with realistic data and controls.
        `,
      },
    },
  },
} satisfies Meta<typeof TableContextStory>

export default meta

type Story = StoryObj<typeof meta>

// Single Interactive Story
export const Interactive: Story = {
  name: 'Interactive Table Context',
  parameters: {
    docs: {
      description: {
        story: `
A fully interactive table demonstrating all TableContext features:

- **Multi-Column Sorting**: Click column headers to sort by different columns (Name, Email, Status, Last Login)
- **Visual Sort Indicators**: Active column highlighted in blue with ↑/↓ arrows
- **Row Selection**: Individual checkboxes + "Select All" functionality
- **Column Visibility**: Toggle any column on/off with checkboxes
- **Loading States**: Test loading spinner with "Simulate Loading" button
- **Error Handling**: Test error states with custom error messages
- **Data Management**: Add more data and see it properly sorted
- **Quick Sort Demo**: Use preset buttons to quickly sort by different columns

The table maintains state across all interactions and provides visual feedback for all actions.
        `,
      },
    },
  },
}
