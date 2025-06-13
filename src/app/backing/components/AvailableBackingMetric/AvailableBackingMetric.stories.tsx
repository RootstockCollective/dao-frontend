import type { Meta, StoryObj } from '@storybook/react'
import { AvailableBackingMetric } from './AvailableBackingMetric'

const meta: Meta<typeof AvailableBackingMetric> = {
  title: 'Backing/AvailableBackingMetric',
  component: AvailableBackingMetric,
  parameters: {
    layout: 'centered',
  },
}

export default meta
type Story = StoryObj<typeof AvailableBackingMetric>

export const WithAvailableBacking: Story = {
  args: {
    availableForBacking: 1000,
    availableBackingUSD: 50000,
    onStakeClick: () => console.log('Stake clicked'),
    onDistributeClick: () => console.log('Distribute clicked'),
  },
}

export const NoAvailableBacking: Story = {
  args: {
    availableForBacking: 0,
    availableBackingUSD: 0,
    onStakeClick: () => console.log('Stake clicked'),
  },
}
