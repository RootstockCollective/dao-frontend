import type { Meta, StoryObj } from '@storybook/react'
import { AllocationBarCell } from './AllocationBarCell'

const meta = {
  title: 'Builders/Table/AllocationBarCell',
  component: AllocationBarCell,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    allocationPct: {
      control: { type: 'range', min: 0, max: 100, step: 0.01 },
      description: 'Allocation percentage (0-100)',
    },
  },
  decorators: [
    Story => (
      <div className="w-96 h-32">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof AllocationBarCell>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    allocationPct: 50,
  },
}
