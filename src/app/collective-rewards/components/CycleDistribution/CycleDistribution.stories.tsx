import type { Meta, StoryObj } from '@storybook/nextjs'

import { mockCycleHistory, mockRunningCycle } from '../../fixtures/cycleHistory'
import { CycleDistribution } from './CycleDistribution'

const meta: Meta<typeof CycleDistribution> = {
  title: 'Collective Rewards/CycleDistribution',
  component: CycleDistribution,
  parameters: { layout: 'padded' },
  decorators: [
    Story => (
      <div className="max-w-[420px]">
        <Story />
      </div>
    ),
  ],
}

export default meta

type Story = StoryObj<typeof meta>

/** The running cycle, where the Builder count is known and both averages render. */
export const RunningCycle: Story = {
  args: {
    cycle: mockRunningCycle,
    buildersCount: 16,
  },
}

/**
 * A settled cycle. We have no historical Builder count, so the per-Builder average is
 * dropped rather than computed from today's roster.
 */
export const SettledCycle: Story = {
  args: {
    cycle: mockCycleHistory[3],
  },
}

/** Before the NotifyReward events land there is no split to show, so the section is omitted. */
export const WithoutSplit: Story = {
  args: {
    cycle: { ...mockRunningCycle, backersShare: null, backersCount: null },
  },
}

export const Loading: Story = {
  args: {
    cycle: mockRunningCycle,
    isLoading: true,
  },
}
