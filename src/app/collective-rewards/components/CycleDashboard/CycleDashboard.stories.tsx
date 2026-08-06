import type { Meta, StoryObj } from '@storybook/nextjs'
import { useState } from 'react'

import Big from '@/lib/big'

import { mockCycleHistory, mockCycleHistoryWithoutCounts } from '../../fixtures/cycleHistory'
import { CycleHistoryEntry } from '../../types'
import { DashboardMetricsContent } from '../DashboardMetrics/DashboardMetricsContent'
import { CycleDashboardContent } from './CycleDashboardContent'

const BUILDERS_COUNT = 16
const nowMs = mockCycleHistory[0].start.getTime() + 10 * 24 * 60 * 60 * 1000

/**
 * Mirrors the page: one piece of selection state feeding the metric tiles and the dashboard,
 * so the story shows what "select a row to load it above" actually loads.
 */
const SelectableDashboard = ({ cycles }: { cycles: CycleHistoryEntry[] }) => {
  const [selectedNumber, setSelectedNumber] = useState<number | null>(null)
  const selectedCycle = cycles.find(({ cycleNumber }) => cycleNumber === selectedNumber) ?? cycles[0]
  const paidAllTime = cycles.reduce((acc, { rewardsFiat }) => acc.add(rewardsFiat), Big(0))

  return (
    <div className="flex flex-col gap-2">
      <DashboardMetricsContent
        cycle={selectedCycle}
        abiPct={5}
        paidAllTime={paidAllTime}
        buildersCount={BUILDERS_COUNT}
        strifPrice={0.0801}
        nowMs={nowMs}
      />
      <CycleDashboardContent
        cycles={cycles}
        selectedCycle={selectedCycle}
        onSelectCycle={setSelectedNumber}
        buildersCount={BUILDERS_COUNT}
      />
    </div>
  )
}

const meta: Meta<typeof CycleDashboardContent> = {
  title: 'Collective Rewards/CycleDashboard',
  component: CycleDashboardContent,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Chart, distribution panel, history table and the metric tiles above them all read one ' +
          'selected cycle. Picking a row or a chart point moves every one of them together.',
      },
    },
  },
}

export default meta

type Story = StoryObj<typeof meta>

/** Select a settled row and watch the tiles above relabel themselves. */
export const Default: Story = {
  render: () => <SelectableDashboard cycles={mockCycleHistory} />,
}

/** Degraded sources: the split and Backer columns fall back to dashes, the rest still renders. */
export const WithoutIndexedCounts: Story = {
  render: () => <SelectableDashboard cycles={mockCycleHistoryWithoutCounts} />,
}

/** The distribution column holds its place instead of collapsing to an empty gap. */
export const Loading: Story = {
  args: {
    cycles: [],
    isLoading: true,
  },
}

export const Empty: Story = {
  args: {
    cycles: [],
  },
}
