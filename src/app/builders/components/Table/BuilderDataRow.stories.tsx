import { Builder } from '@/app/collective-rewards/types'
import { Column, RowData, SelectedRows, useTableActionsContext } from '@/shared/context'
import { TableProvider } from '@/shared/context/TableContext/TableProvider'
import type { Meta, StoryObj } from '@storybook/react'
import { useEffect } from 'react'
import { Address } from 'viem'
import { BuilderDataRow } from './BuilderDataRow'
import { ColumnId, ColumnType, DEFAULT_HEADERS } from './BuildersTable'

// Mock Builder data
const createMockBuilder = (overrides: Partial<Builder> = {}): Builder => ({
  address: '0x1234567890123456789012345678901234567890' as Address,
  builderName: 'Example Builder',
  proposal: {
    id: 1n,
    name: 'Build Amazing DApp',
    description: 'A revolutionary decentralized application',
    date: '2024-01-15',
  },
  stateFlags: {
    activated: true,
    kycApproved: true,
    communityApproved: true,
    paused: false,
    revoked: false,
  },
  gauge: '0x9876543210987654321098765432109876543210' as Address,
  backerRewardPercentage: {
    previous: 15n,
    active: 20n,
    next: 25n,
    cooldown: 7n,
  },
  ...overrides,
})

// Create mock row data with all required column properties
const createMockRowData = (builder: Builder): RowData<ColumnId> =>
  ({
    id: builder.address as ColumnId,
    selector: true,
    builder: builder.builderName,
    backing: 'mock-backing',
    rewards_percentage: builder.backerRewardPercentage?.active?.toString() || '0',
    rewards_past_cycle: builder.backerRewardPercentage?.previous?.toString() || '0',
    rewards_upcoming: builder.backerRewardPercentage?.next?.toString() || '0',
    allocations: 'mock-allocations',
    actions: 'mock-actions',
    // Include all Builder properties
    ...builder,
  }) as RowData<ColumnId>

// Mock data for different states
const activeBuilder = createMockBuilder({
  builderName: 'Active Builder',
  stateFlags: {
    activated: true,
    kycApproved: true,
    communityApproved: true,
    paused: false,
    revoked: false,
  },
  backerRewardPercentage: {
    previous: 15n,
    active: 20n,
    next: 25n,
    cooldown: 7n,
  },
})

const inactiveBuilder = createMockBuilder({
  address: '0x2234567890123456789012345678901234567890' as Address,
  builderName: 'Inactive Builder',
  stateFlags: {
    activated: false,
    kycApproved: true,
    communityApproved: false,
    paused: false,
    revoked: false,
  },
  backerRewardPercentage: {
    previous: 25n,
    active: 10n,
    next: 5n,
    cooldown: 14n,
  },
})

const pausedBuilder = createMockBuilder({
  address: '0x3234567890123456789012345678901234567890' as Address,
  builderName: 'Paused Builder',
  stateFlags: {
    activated: true,
    kycApproved: true,
    communityApproved: true,
    paused: true,
    revoked: false,
  },
  backerRewardPercentage: {
    previous: 30n,
    active: 0n,
    next: 0n,
    cooldown: 0n,
  },
})

// Wrapper component that sets up context
const BuilderDataRowWrapper = ({
  row,
  columns,
  selectedRows = {},
}: {
  row: RowData<ColumnId>
  columns: Column<ColumnId, ColumnType>[]
  selectedRows?: Record<string, boolean>
}) => {
  const dispatch = useTableActionsContext<ColumnId, ColumnType>()

  useEffect(() => {
    dispatch({
      type: 'SET_COLUMNS',
      payload: columns,
    })
    dispatch({
      type: 'SET_ROWS',
      payload: [row],
    })
    dispatch({
      type: 'SET_SELECTED_ROWS',
      payload: selectedRows as SelectedRows<ColumnId>,
    })
  }, [dispatch, columns, row, selectedRows])

  return (
    <div className="w-full bg-white text-black">
      <table className="w-full table-fixed border-collapse">
        <tbody className="text-gray-900">
          <BuilderDataRow row={row} columns={columns} />
        </tbody>
      </table>
    </div>
  )
}

const meta: Meta<typeof BuilderDataRow> = {
  title: 'Builders/BuilderDataRow',
  component: BuilderDataRow,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
  decorators: [
    Story => (
      <TableProvider>
        <Story />
      </TableProvider>
    ),
  ],
}

export default meta

type Story = StoryObj<typeof BuilderDataRow>

export const ActiveBuilder: Story = {
  render: () => <BuilderDataRowWrapper row={createMockRowData(activeBuilder)} columns={DEFAULT_HEADERS} />,
}

export const ActiveBuilderSelected: Story = {
  render: () => (
    <BuilderDataRowWrapper
      row={createMockRowData(activeBuilder)}
      columns={DEFAULT_HEADERS}
      selectedRows={{ [activeBuilder.address]: true }}
    />
  ),
}

export const InactiveBuilder: Story = {
  render: () => <BuilderDataRowWrapper row={createMockRowData(inactiveBuilder)} columns={DEFAULT_HEADERS} />,
}

export const PausedBuilder: Story = {
  render: () => <BuilderDataRowWrapper row={createMockRowData(pausedBuilder)} columns={DEFAULT_HEADERS} />,
}

export const WithLimitedColumns: Story = {
  render: () => {
    const limitedColumns: Column<ColumnId, ColumnType>[] = [
      { id: 'selector', type: 'selector', hidden: false, sortable: false },
      { id: 'builder', type: 'builder', hidden: false, sortable: true },
      { id: 'rewards_percentage', type: 'rewards', hidden: false, sortable: true },
      { id: 'actions', type: 'actions', hidden: false, sortable: false },
    ]

    return <BuilderDataRowWrapper row={createMockRowData(activeBuilder)} columns={limitedColumns} />
  },
}

export const WithHiddenColumns: Story = {
  render: () => {
    const columnsWithHidden: Column<ColumnId, ColumnType>[] = DEFAULT_HEADERS.map(col => ({
      ...col,
      hidden: col.id === 'backing' || col.id === 'allocations',
    }))

    return <BuilderDataRowWrapper row={createMockRowData(activeBuilder)} columns={columnsWithHidden} />
  },
}

export const MultipleRows: Story = {
  render: () => {
    const builders = [activeBuilder, inactiveBuilder, pausedBuilder]

    const MultipleRowsWrapper = () => {
      const dispatch = useTableActionsContext<ColumnId, ColumnType>()

      useEffect(() => {
        dispatch({
          type: 'SET_COLUMNS',
          payload: DEFAULT_HEADERS,
        })
        dispatch({
          type: 'SET_ROWS',
          payload: builders.map(createMockRowData),
        })
        dispatch({
          type: 'SET_SELECTED_ROWS',
          payload: { [inactiveBuilder.address]: true } as SelectedRows<ColumnId>,
        })
      }, [dispatch])

      return (
        <div className="w-full bg-white text-black">
          <table className="w-full table-fixed border-collapse">
            <tbody className="text-gray-900">
              {builders.map(builder => (
                <BuilderDataRow
                  key={builder.address}
                  row={createMockRowData(builder)}
                  columns={DEFAULT_HEADERS}
                />
              ))}
            </tbody>
          </table>
        </div>
      )
    }

    return <MultipleRowsWrapper />
  },
}
