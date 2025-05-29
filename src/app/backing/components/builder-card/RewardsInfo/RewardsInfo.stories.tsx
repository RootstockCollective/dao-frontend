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
    previous: BigInt(50),
    next: BigInt(40),
    cooldown: BigInt(0),
    active: BigInt(50),
  },
}

export const WithEstimatedRewards: Story = {
  args: {
    previous: BigInt(50),
    next: BigInt(40),
    cooldown: BigInt(0),
    active: BigInt(50),
    estimatedRewards: '300.00 USD',
  },
}

export const WithIncreaseNextRewardPct: Story = {
  args: {
    previous: BigInt(50),
    next: BigInt(60),
    cooldown: BigInt(0),
    active: BigInt(50),
    estimatedRewards: '300.00 USD',
  },
}

export const WithDecreaseNextRewardPct: Story = {
  args: {
    previous: BigInt(50),
    next: BigInt(40),
    cooldown: BigInt(0),
    active: BigInt(50),
    estimatedRewards: '300.00 USD',
  },
}
