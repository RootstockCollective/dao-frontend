import type { Meta, StoryObj } from '@storybook/react'
import { BackingShareCell } from './BackingShareCell'

const meta = {
  title: 'Koto/Builders/Table/Cell/AllocationCell',
  component: BackingShareCell,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    backingSharePct: {
      control: { type: 'range', min: 0, max: 100, step: 0.01 },
      description: 'Allocation percentage (0-100)',
    },
  },
  decorators: [
    Story => (
      <div className="w-96 h-32 border-2 border-yellow">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof BackingShareCell>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    backingSharePct: 500000000000000000n,
  },
}
