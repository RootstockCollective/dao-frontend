import type { Meta, StoryObj } from '@storybook/react'
import { BackingCell } from './BackingCell'
import { parseEther } from 'viem'

const meta: Meta<typeof BackingCell> = {
  title: 'Components/BackingCell',
  component: BackingCell,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    amount: {
      description: 'The amount of stRIF allocated in wei',
    },
    price: {
      description: 'The price of stRIF in USD',
    },
    title: {
      description: 'Optional ReactNode to display as additional metric information',
    },
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    amount: parseEther('60000'),
    price: 0.0047,
  },
}

export const LargeAmount: Story = {
  args: {
    amount: parseEther('150000'),
    price: 0.0047,
  },
}

export const SmallAmount: Story = {
  args: {
    amount: parseEther('500'),
    price: 0.0047,
  },
}