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
          'The dashboard header. These tiles follow the cycle selected anywhere on the page, so ' +
          'their labels name the cycle rather than assuming it is the open one.',
      },
    },
  },
}

export default meta

type Story = StoryObj<typeof meta>

/** The running cycle: "paid this cycle", a Builder count, and days remaining. */
export const RunningCycle: Story = {
  args: {
    cycle: mockCycleHistory[0],
    abiPct: 5,
    paidAllTime,
    buildersCount: 16,
    strifPrice: 0.0801,
    nowMs,
  },
}

/**
 * A settled cycle selected from the table. The labels name it, the date window replaces the
 * day counter, and the Builder count drops — today's roster cannot describe a past cycle.
 */
export const SettledCycle: Story = {
  args: {
    ...RunningCycle.args,
    cycle: mockCycleHistory[3],
  },
}

/** Without the indexed counts, Participants falls back rather than reporting a partial total. */
export const WithoutParticipantCounts: Story = {
  args: {
    ...RunningCycle.args,
    cycle: { ...mockCycleHistory[0], backersCount: null },
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
