import type { Meta, StoryObj } from '@storybook/react'
import { PendingAllocation } from './PendingAllocation'

const meta: Meta<typeof PendingAllocation> = {
  title: 'Backing/PendingAllocation',
  component: PendingAllocation,
  decorators: [
    Story => (
      <div className="p-8 pt-[200px] relative min-h-[300px]">
        <Story />
      </div>
    ),
  ],
}

export default meta

type Story = StoryObj<typeof PendingAllocation>

export const Default: Story = {
  args: {
    pendingBacking: '1000',
    currentBacking: '5000',
  },
}

export const CustomAllocation: Story = {
  args: {
    pendingBacking: '50000',
    currentBacking: '100000',
  },
}
