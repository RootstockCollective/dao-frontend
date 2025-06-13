import type { Meta, StoryObj } from '@storybook/react'
import { BackingMetrics } from './BackingMetrics'

const meta: Meta<typeof BackingMetrics> = {
  title: 'Backing/BackingMetrics',
  component: BackingMetrics,
  parameters: {
    layout: 'centered',
  },
}

export default meta
type Story = StoryObj<typeof BackingMetrics>

export const WithMetrics: Story = {
  args: {
    availableForBacking: 1000,
    availableBackingUSD: 50000,
    totalBacking: 5000,
    onStakeClick: () => console.log('Stake clicked'),
    onDistributeClick: () => console.log('Distribute clicked'),
  },
}

export const NoAvailableBacking: Story = {
  args: {
    availableForBacking: 0,
    availableBackingUSD: 0,
    totalBacking: 5000,
    onStakeClick: () => console.log('Stake clicked'),
  },
}

export const NoBacking: Story = {
  args: {
    availableForBacking: 0,
    availableBackingUSD: 0,
    totalBacking: 0,
    onStakeClick: () => console.log('Stake clicked'),
  },
}
