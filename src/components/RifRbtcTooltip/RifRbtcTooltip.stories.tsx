import type { Meta, StoryObj } from '@storybook/nextjs'
import { RifRbtcTooltip } from './RifRbtcTooltip'

const meta: Meta<typeof RifRbtcTooltip> = {
  title: 'Components/RifRbtcTooltip',
  component: RifRbtcTooltip,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    rbtcValue: {
      control: { type: 'text' },
      description: 'RBTC amount as bigint string',
    },
    rifValue: {
      control: { type: 'text' },
      description: 'RIF amount as bigint string',
    },
    className: {
      control: { type: 'text' },
      description: 'Additional CSS classes',
    },
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    rbtcValue: BigInt('1000000000000000000'), // 1 RBTC in wei
    rifValue: BigInt('500000000000000000000'), // 500 RIF in wei
    children: 'Hover me to see tooltip',
  },
}
