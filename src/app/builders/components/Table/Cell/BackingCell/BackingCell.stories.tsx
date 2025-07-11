import type { Meta, StoryObj } from '@storybook/react'
import { parseEther } from 'viem'
import { BackingCell } from './BackingCell'

const meta: Meta<typeof BackingCell> = {
  title: 'Koto/Builders/Table/Cell/BackingCell',
  component: BackingCell,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof meta>

export const WithBacking: Story = {
  args: {
    amount: parseEther('30000'),
    formattedAmount: '30,000 RIF',
    formattedUsdAmount: '$141.00',
  },
}

export const WithSmallBacking: Story = {
  args: {
    amount: parseEther('500'),
    formattedAmount: '500 RIF',
    formattedUsdAmount: '$2.35',
  },
}

export const WithLargeBacking: Story = {
  args: {
    amount: parseEther('1500000'),
    formattedAmount: '1.5M RIF',
    formattedUsdAmount: '$7,050.00',
  },
}

export const WithoutBacking: Story = {
  args: {
    amount: 0n,
    formattedAmount: '0 RIF',
    formattedUsdAmount: '$0.00',
  },
}

export const Default: Story = {
  args: {
    amount: parseEther('15000'),
    formattedAmount: '15,000 RIF',
    formattedUsdAmount: '$70.50',
  },
}
