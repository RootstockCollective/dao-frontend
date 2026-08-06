import type { Meta, StoryObj } from '@storybook/nextjs'
import { useState } from 'react'

import { mockCycleHistory } from '../../fixtures/cycleHistory'
import { CycleHistoryEntry } from '../../types'
import { CycleBackingChart, CycleBackingChartProps } from './CycleBackingChart'

/** Extends the 10-cycle fixture backwards so the wider ranges have something to show. */
const extendedHistory: CycleHistoryEntry[] = (() => {
  const oldest = mockCycleHistory[mockCycleHistory.length - 1]
  const cycleLength = oldest.end.getTime() - oldest.start.getTime()

  const older = Array.from({ length: 26 }, (_, index) => {
    const offset = (index + 1) * cycleLength
    // A slow climb with a mid-series dip, so the wider ranges aren't a flat line.
    const drift = 1 - (index + 1) * 0.022 + Math.sin(index / 2) * 0.03

    return {
      ...oldest,
      cycleNumber: oldest.cycleNumber - (index + 1),
      start: new Date(oldest.start.getTime() - offset),
      end: new Date(oldest.end.getTime() - offset),
      backing: BigInt(Math.round(Number(oldest.backing) * drift)),
      status: 'settled' as const,
    }
  })

  return [...mockCycleHistory, ...older]
})()

/** Holds the selection so clicking a point updates the header, like the real page. */
const SelectableChart = (props: Omit<CycleBackingChartProps, 'selectedCycle' | 'onSelectCycle'>) => {
  const [selectedCycle, setSelectedCycle] = useState<number | null>(null)

  return <CycleBackingChart {...props} selectedCycle={selectedCycle} onSelectCycle={setSelectedCycle} />
}

const meta: Meta<typeof CycleBackingChart> = {
  title: 'Collective Rewards/CycleBackingChart',
  component: CycleBackingChart,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Total stRIF backing indexed by cycle rather than by month. The range toggle trims the ' +
          'series; clicking a point selects that cycle for the cards around it.',
      },
    },
  },
}

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => <SelectableChart cycles={extendedHistory} />,
}

/** Only ten cycles exist, so "6 months" and "All" render the same series. */
export const ShortHistory: Story = {
  render: () => <SelectableChart cycles={mockCycleHistory} />,
}

/** With 36 cycles the X labels thin out instead of overlapping. */
export const AllCycles: Story = {
  render: () => <SelectableChart cycles={extendedHistory} defaultRange="all" />,
}

export const Loading: Story = {
  args: { cycles: [], isLoading: true },
}
