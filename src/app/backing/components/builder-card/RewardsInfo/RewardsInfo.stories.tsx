import { RewardsInfo } from './RewardsInfo'
import type { Meta, StoryObj } from '@storybook/react'

const meta: Meta<typeof RewardsInfo> = {
  title: 'Backing/RewardsInfo',
  component: RewardsInfo,
}

export default meta
type Story = StoryObj<typeof RewardsInfo>

export const Default: Story = {
  args: {
    builderRewardPct: 50,
  },
}

export const WithEstimatedRewards: Story = {
  args: {
    builderRewardPct: 50,
    estimatedRewards: '300.00 USD',
  },
}

export const WithIncreaseNextRewardPct: Story = {
  args: {
    builderRewardPct: 50,
    builderNextRewardPct: 60,
    estimatedRewards: '300.00 USD',
  },
}

export const WithDecreaseNextRewardPct: Story = {
  args: {
    builderRewardPct: 50,
    builderNextRewardPct: 40,
    estimatedRewards: '300.00 USD',
  },
}
