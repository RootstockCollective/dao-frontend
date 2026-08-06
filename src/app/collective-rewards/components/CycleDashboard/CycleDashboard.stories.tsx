import type { Meta, StoryObj } from '@storybook/nextjs'

import { mockCycleHistory, mockCycleHistoryWithoutCounts } from '../../fixtures/cycleHistory'
import { CycleDashboardContent } from './CycleDashboardContent'

const meta: Meta<typeof CycleDashboardContent> = {
  title: 'Collective Rewards/CycleDashboard',
  component: CycleDashboardContent,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'The dashboard as it appears on the page: chart and distribution panel share a ' +
          'selected cycle with the history table below, so picking a row reloads everything above it.',
      },
    },
  },
}

export default meta

type Story = StoryObj<typeof meta>

/** Opens on the running cycle. Selecting a row or a chart point moves everything together. */
export const Default: Story = {
  args: {
    cycles: mockCycleHistory,
    buildersCount: 16,
  },
}

/** Degraded sources: the split and Backer columns fall back to dashes, the rest still renders. */
export const WithoutIndexedCounts: Story = {
  args: {
    cycles: mockCycleHistoryWithoutCounts,
  },
}

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
