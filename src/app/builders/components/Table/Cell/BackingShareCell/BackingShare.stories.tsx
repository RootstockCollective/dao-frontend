import type { Meta, StoryObj } from '@storybook/nextjs'
import { BackingShareCell } from './BackingShare'

const meta = {
  title: 'Koto/Builders/Table/Cell/BackingShareCell',
  component: BackingShareCell,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    backingPercentage: {
      control: { type: 'range', min: 0, max: 100, step: 0.01 },
      description: 'Backing share percentage (0-100)',
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
    backingPercentage: 50,
  },
}
