import { RewardsInfo, RewardsInfoProps } from './RewardsInfo'
import type { Meta, StoryObj } from '@storybook/react'

const meta: Meta<typeof RewardsInfo> = {
  title: 'Backing/RewardsInfo',
  component: RewardsInfo,
}

export default meta
type Story = StoryObj<typeof RewardsInfo>

const defaultArgs: RewardsInfoProps = {
  current: 50n,
  next: 60n,
  cooldownEndTime: 1717987200n,
}

export const Default: Story = {
  args: defaultArgs,
}

export const WithEstimatedRewards: Story = {
  args: {
    ...defaultArgs,
    estimatedRewards: '300.00 USD',
  },
}

export const WithIncreaseNextRewardPct: Story = {
  args: {
    ...defaultArgs,
    // @ts-expect-error: Storybook cannot serialize bigint
    next: 60,
    estimatedRewards: '300.00 USD',
  },
}

export const WithDecreaseNextRewardPct: Story = {
  args: {
    ...defaultArgs,
    estimatedRewards: '300.00 USD',
  },
}
