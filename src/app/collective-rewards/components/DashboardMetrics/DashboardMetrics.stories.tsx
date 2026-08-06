import type { Meta, StoryObj } from '@storybook/nextjs'

import Big from '@/lib/big'

import { mockCycleHistory } from '../../fixtures/cycleHistory'
import { DashboardMetricsContent } from './DashboardMetricsContent'

const paidAllTime = mockCycleHistory.reduce((acc, { rewardsFiat }) => acc.add(rewardsFiat), Big(0))

/** Day 11 of the running cycle, matching the design. */
const nowMs = mockCycleHistory[0].start.getTime() + 10 * 24 * 60 * 60 * 1000

const meta: Meta<typeof DashboardMetricsContent> = {
  title: 'Collective Rewards/DashboardMetrics',
  component: DashboardMetricsContent,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'The dashboard header: the ABI figure alongside four tiles describing the running cycle. ' +
          'Every number here comes from the same cycle history that feeds the table below it.',
      },
    },
  },
}

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    runningCycle: mockCycleHistory[0],
    abiPct: 5,
    paidAllTime,
    buildersCount: 16,
    strifPrice: 0.0801,
    nowMs,
  },
}

/** Without the indexed counts, Participants falls back rather than reporting a partial total. */
export const WithoutParticipantCounts: Story = {
  args: {
    ...Default.args,
    runningCycle: { ...mockCycleHistory[0], backersCount: null },
    buildersCount: null,
  },
}

export const Loading: Story = {
  args: {
    abiPct: 0,
    paidAllTime: Big(0),
    strifPrice: 0,
    isLoading: true,
  },
}
