import { Column, Sort, TableState } from '@/shared/context'
import { TableActionsContext } from '@/shared/context/TableContext/TableActionsContext'
import { TableContext } from '@/shared/context/TableContext/TableContext'
import { tableReducer } from '@/shared/context/TableContext/tableReducer'
import type { Meta, StoryObj } from '@storybook/react'
import { FC, PropsWithChildren, useReducer } from 'react'
import { BuilderHeaderRow, ColumnId, DEFAULT_HEADERS } from './BuilderHeaderRow'

const meta = {
  title: 'Koto/Builders/Components/Table/BuilderHeaderRow',
  component: BuilderHeaderRow,
  parameters: {
    layout: 'fullscreen',
  },
  decorators: [
    (Story, { args }) => (
      <div className="p-4 bg-v3-bg-100">
        <table className="w-full">
          <thead>
            <Story />
          </thead>
        </table>
      </div>
    ),
  ],
} satisfies Meta<typeof BuilderHeaderRow>

export default meta
type Story = StoryObj<typeof meta>

// Mock table state factory
const createMockTableState = (
  sort: Sort<ColumnId> = { by: null, direction: null },
  columns: Column<ColumnId>[] = DEFAULT_HEADERS,
): TableState<ColumnId> => ({
  columns,
  rows: [],
  selectedRows: {},
  sort,
  defaultSort: { by: null, direction: null },
  loading: false,
  error: null,
})

// Custom TableProvider that accepts initial state
const CustomTableProvider: FC<PropsWithChildren<{ initialState: TableState<ColumnId> }>> = ({
  children,
  initialState: customInitialState,
}) => {
  const [state, dispatch] = useReducer(tableReducer, customInitialState)

  return (
    <TableContext value={state}>
      <TableActionsContext value={dispatch}>{children}</TableActionsContext>
    </TableContext>
  )
}

export const Default: Story = {
  render: () => (
    <div className="space-y-4">
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
        <h3 className="font-semibold text-blue-800 mb-2">Interactive Builder Header Row</h3>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Click any column header to sort (descending → ascending → no sort)</li>
          <li>• Watch the arrow icons change to show current sort state</li>
          <li>• Only one column can be sorted at a time</li>
          <li>• All columns except Actions are sortable</li>
        </ul>
      </div>
      <CustomTableProvider initialState={createMockTableState()}>
        <BuilderHeaderRow />
      </CustomTableProvider>
    </div>
  ),
}
