import type { Meta, StoryObj } from '@storybook/nextjs'
import { BackerRewardsPercentage } from './BackerRewardsPercentage'

const meta: Meta<typeof BackerRewardsPercentage> = {
  title: 'Backing/BackerRewardsPercentage',
  component: BackerRewardsPercentage,
}

export default meta

type Story = StoryObj<typeof BackerRewardsPercentage>

export const Default: Story = {
  args: {
    currentPct: 50,
  },
}

export const WithDelta: Story = {
  args: {
    currentPct: 50,
    nextPct: 60,
  },
}
