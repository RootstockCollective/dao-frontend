import type { Meta, StoryObj } from '@storybook/react'
import { RewardsCell } from './RewardsCell'
import { Tooltip } from '@/components/Tooltip'

const meta: Meta<typeof RewardsCell> = {
  title: 'Builders/Table/RewardsCell',
  component: RewardsCell,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    totalEstimatedUsd: {
      control: { type: 'number' },
      description: 'Total estimated rewards in USD',
    },
    totalEstimatedRbtc: {
      control: { type: 'text' },
      description: 'Total estimated RBTC rewards in wei (as bigint)',
    },
    totalEstimatedRif: {
      control: { type: 'text' },
      description: 'Total estimated RIF rewards in wei (as bigint)',
    },
  },
}

export default meta

type Story = StoryObj<typeof RewardsCell>

export const Default: Story = {
  args: {
    totalEstimatedUsd: 1250.5,
    totalEstimatedRbtc: BigInt(1000000000000000000), // 1 RBTC in wei
    totalEstimatedRif: BigInt(500000000000000000000), // 500 RIF in wei
  },
  render: args => (
    <div className="w-[400px] p-4 bg-[#37322F]">
      <RewardsCell {...args} />
    </div>
  ),
}
