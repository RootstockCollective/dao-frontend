import type { Meta, StoryObj } from '@storybook/react'
import * as RadixTooltip from '@radix-ui/react-tooltip'
import { AvailableBackingMetric } from './AvailableBackingMetric'

const meta: Meta<typeof AvailableBackingMetric> = {
  title: 'Koto/Backing/Components/AvailableBackingMetric',
  component: AvailableBackingMetric,
  parameters: {
    layout: 'centered',
  },
  decorators: [
    Story => (
      <RadixTooltip.Provider>
        <Story />
      </RadixTooltip.Provider>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof AvailableBackingMetric>

export const WithAvailableBacking: Story = {
  args: {
    availableForBacking: 1000,
    availableBackingUSD: 50000,
    onStakeClick: () => alert('Stake clicked'),
    onDistributeClick: () => alert('Distribute clicked'),
  },
}

export const NoAvailableBacking: Story = {
  args: {
    availableForBacking: 0,
    availableBackingUSD: 0,
    onStakeClick: () => alert('Stake clicked'),
  },
}
