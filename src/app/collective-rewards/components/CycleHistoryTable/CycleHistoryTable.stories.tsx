import type { Meta, StoryObj } from '@storybook/nextjs'
import { useState } from 'react'

import { mockCycleHistory, mockCycleHistoryWithoutCounts } from '../../fixtures/cycleHistory'
import { CycleHistoryTable, CycleHistoryTableProps } from './CycleHistoryTable'

/** Holds the selection so the story behaves like the real page. */
const SelectableTable = (props: Omit<CycleHistoryTableProps, 'selectedCycle' | 'onSelectCycle'>) => {
  const [selectedCycle, setSelectedCycle] = useState<number | null>(props.cycles[0]?.cycleNumber ?? null)

  return <CycleHistoryTable {...props} selectedCycle={selectedCycle} onSelectCycle={setSelectedCycle} />
}

const meta: Meta<typeof CycleHistoryTable> = {
  title: 'Collective Rewards/CycleHistoryTable',
  component: CycleHistoryTable,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Cycle-by-cycle history for the Collective Rewards dashboard. Selecting a row drives the ' +
          'cards and chart above it. USD figures are valued at current prices — we keep no price ' +
          'history, so a settled cycle is re-valued whenever the market moves.',
      },
    },
  },
}

export default meta

type Story = StoryObj<typeof meta>

/** The full table, with row selection wired up. */
export const Default: Story = {
  render: () => <SelectableTable cycles={mockCycleHistory} />,
}

/** Without a select handler the rows are inert and the hint disappears. */
export const ReadOnly: Story = {
  args: { cycles: mockCycleHistory },
}

/**
 * The split and Backers columns come from sources that can lag behind `/api/cycles`.
 * They fall back to a dash rather than showing a misleading zero.
 */
export const WithoutIndexedCounts: Story = {
  render: () => <SelectableTable cycles={mockCycleHistoryWithoutCounts} />,
}

export const Loading: Story = {
  args: { cycles: [], isLoading: true },
}

export const Empty: Story = {
  args: { cycles: [] },
}
