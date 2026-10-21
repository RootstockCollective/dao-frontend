import type { Meta, StoryObj } from '@storybook/nextjs'
import { useState } from 'react'

import {
  mockCycleHistory,
  mockCycleHistoryWithoutCounts,
  mockCycleHistoryWithUnknownBacking,
} from '../../fixtures/cycleHistory'
import { CycleHistoryTable, CycleHistoryTableProps } from './CycleHistoryTable'

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

export const Default: Story = {
  render: () => <SelectableTable cycles={mockCycleHistory} />,
}

/** Without a select handler the rows are inert. */
export const ReadOnly: Story = {
  args: { cycles: mockCycleHistory },
}

/** The split and Backers columns fall back to a dash while their sources lag. */
export const WithoutIndexedCounts: Story = {
  render: () => <SelectableTable cycles={mockCycleHistoryWithoutCounts} />,
}

/** Cycles older than the loaded snapshots show a dash for backing, not a zero. */
export const WithUnknownBacking: Story = {
  render: () => <SelectableTable cycles={mockCycleHistoryWithUnknownBacking} />,
}

export const Loading: Story = {
  args: { cycles: [], isLoading: true },
}

export const Empty: Story = {
  args: { cycles: [] },
}
