import type { Meta, StoryObj } from '@storybook/react'
import { RewardsCell } from './RewardsCell'

const meta: Meta<typeof RewardsCell> = {
  title: 'Builders/Table/RewardsCell',
  component: RewardsCell,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    usdValue: {
      control: { type: 'number' },
      description: 'Total estimated rewards in USD',
    },
    rbtcValue: {
      control: { type: 'text' },
      description: 'Total estimated RBTC rewards in wei (as bigint)',
    },
    rifValue: {
      control: { type: 'text' },
      description: 'Total estimated RIF rewards in wei (as bigint)',
    },
  },
}

export default meta

type Story = StoryObj<typeof RewardsCell>

export const Default: Story = {
  args: {
    usdValue: 1250.5,
    rbtcValue: BigInt(1000000000000000000), // 1 RBTC in wei
    rifValue: BigInt(500000000000000000000), // 500 RIF in wei
  },
  render: args => (
    <div className="w-[400px] p-4 bg-[#37322F]">
      <RewardsCell {...args} />
    </div>
  ),
}
