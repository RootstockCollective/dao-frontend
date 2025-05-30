import { RewardsInfo, RewardsInfoProps } from './RewardsInfo'
import type { Meta, StoryObj } from '@storybook/react'

const meta: Meta<typeof RewardsInfo> = {
  title: 'Backing/RewardsInfo',
  component: RewardsInfo,
}

export default meta
type Story = StoryObj<typeof RewardsInfo>

const defaultArgs: RewardsInfoProps = {
  // @ts-expect-error: Storybook cannot serialize bigint
  previous: 50,
  // @ts-expect-error: Storybook cannot serialize bigint
  next: 40,
  // @ts-expect-error: Storybook cannot serialize bigint
  cooldown: 0,
  // @ts-expect-error: Storybook cannot serialize bigint
  active: 50,
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
