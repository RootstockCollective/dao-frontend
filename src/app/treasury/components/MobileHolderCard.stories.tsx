import type { Meta, StoryObj } from '@storybook/nextjs'
import { MobileHolderCard } from './MobileHolderCard'

const meta: Meta<typeof MobileHolderCard> = {
  title: 'KOTO/DAO/MobileHolderCard',
  component: MobileHolderCard,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof MobileHolderCard>

export const Default: Story = {
  args: {
    address: '0x1234567890123456789012345678901234567890',
    amount: '1000000000000000000000', // 1000 stRIF
  },
}

export const WithRNS: Story = {
  args: {
    address: '0x1234567890123456789012345678901234567890',
    rns: 'alice.rsk',
    amount: '500000000000000000000', // 500 stRIF
  },
}

export const LargeAmount: Story = {
  args: {
    address: '0x9876543210987654321098765432109876543210',
    amount: '1000000000000000000000000', // 1,000,000 stRIF
  },
}

export const SmallAmount: Story = {
  args: {
    address: '0xabcdef1234567890abcdef1234567890abcdef12',
    amount: '1000000000000000000', // 1 stRIF
  },
}

export const WithCustomClassName: Story = {
  args: {
    address: '0x1234567890123456789012345678901234567890',
    amount: '1000000000000000000000',
    className: 'border border-primary',
  },
}

export const FullWidth: Story = {
  args: {
    address: '0x1234567890123456789012345678901234567890',
    rns: 'alice.rsk',
    amount: '1000000000000000000000',
    className: 'w-full',
  },
  decorators: [
    Story => (
      <div className="w-96 p-4 bg-gray-200">
        <div className="text-sm text-gray-600 mb-2">Parent container (384px wide)</div>
        <Story />
      </div>
    ),
  ],
}
