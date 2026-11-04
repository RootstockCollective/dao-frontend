import type { Meta, StoryObj } from '@storybook/nextjs'
import { useState } from 'react'

import { mockCycleHistory, mockCycleHistoryWithUnknownBacking } from '../../fixtures/cycleHistory'
import { CycleHistoryEntry } from '../../types'
import { CycleBackingChart, CycleBackingChartProps } from './CycleBackingChart'

const extendedHistory: CycleHistoryEntry[] = (() => {
  const oldest = mockCycleHistory[mockCycleHistory.length - 1]
  const cycleLength = oldest.end.getTime() - oldest.start.getTime()

  const older = Array.from({ length: 26 }, (_, index) => {
    const offset = (index + 1) * cycleLength
    const drift = 1 - (index + 1) * 0.022 + Math.sin(index / 2) * 0.03

    const cycleNumber = oldest.cycleNumber - (index + 1)

    return {
      ...oldest,
      id: `cycle-${cycleNumber}`,
      cycleNumber,
      start: new Date(oldest.start.getTime() - offset),
      end: new Date(oldest.end.getTime() - offset),
      backing: BigInt(Math.round(Number(oldest.backing ?? 0n) * drift)),
      status: 'settled' as const,
    }
  })

  return [...mockCycleHistory, ...older]
})()

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

export const ShortHistory: Story = {
  render: () => <SelectableChart cycles={mockCycleHistory} />,
}

export const AllCycles: Story = {
  render: () => <SelectableChart cycles={extendedHistory} defaultRange="all" />,
}

/** Unknown backing leaves a gap in the area rather than a drop to zero. */
export const WithUnknownBacking: Story = {
  render: () => <SelectableChart cycles={mockCycleHistoryWithUnknownBacking} />,
}

export const Loading: Story = {
  args: { cycles: [], isLoading: true },
}
