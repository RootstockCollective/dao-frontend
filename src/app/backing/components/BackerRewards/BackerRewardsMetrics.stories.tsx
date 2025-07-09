import type { Meta, StoryObj } from '@storybook/react'
import { BackerRewardsMetrics } from './BackerRewardsMetrics'

const meta: Meta<typeof BackerRewardsMetrics> = {
  title: 'Koto/Backing/Components/BackerRewardsMetrics',
  component: BackerRewardsMetrics,
  parameters: {
    layout: 'centered',
  },
}

export default meta
type Story = StoryObj<typeof BackerRewardsMetrics>

export const Default: Story = {
  args: {},
}
