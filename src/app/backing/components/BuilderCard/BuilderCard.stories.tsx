import type { Meta, StoryObj } from '@storybook/react'
import { BuilderCard } from './BuilderCard'
import { useState } from 'react'
import { AlertProvider } from '@/app/providers/AlertProvider'

const meta: Meta<typeof BuilderCard> = {
  title: 'Backing/BuilderCard',
  component: BuilderCard,
  decorators: [
    Story => (
      <AlertProvider>
        <div className="w-[800px]">
          <Story />
        </div>
      </AlertProvider>
    ),
  ],
}
export default meta

type Story = StoryObj<typeof BuilderCard>

// Wrapper component to handle state
const BuilderCardWithState = (args: any) => {
  const [allocation, setAllocation] = useState(args.allocation || 0)
  return <BuilderCard {...args} allocation={allocation} onAllocationChange={value => setAllocation(value)} />
}

export const NotConnected: Story = {
  render: args => <BuilderCardWithState {...args} />,
  args: {
    address: '0x1234567890abcdef',
    builderName: 'Beefy',
    backerRewardPct: {
      current: 40n,
      next: 50n,
      cooldownEndTime: 0n,
    },
    rifPriceUsd: 0.05,
    isConnected: false,
    maxAllocation: 120000n,
    existentAllocation: 0n,
    allocation: 0n,
    topBarColor: '#4FFFE7',
    className: 'w-[200px]',
  },
}

export const WithoutAllocation: Story = {
  render: args => <BuilderCardWithState {...args} />,
  args: {
    address: '0x1234567890abcdef',
    builderName: 'Beefy',
    backerRewardPct: {
      current: 40n,
      next: 50n,
      cooldownEndTime: 0n,
    },
    rifPriceUsd: 0.05,
    isConnected: true,
    maxAllocation: 120000n,
    existentAllocation: 0n,
    allocation: 0n,
    topBarColor: '#FF6B6B',
    className: 'w-[200px]',
  },
}

export const WithAllocation: Story = {
  render: args => <BuilderCardWithState {...args} />,
  args: {
    address: '0x1234567890abcdef',
    builderName: 'Beefy',
    backerRewardPct: {
      current: 40n,
      next: 50n,
      cooldownEndTime: 0n,
    },
    rifPriceUsd: 0.05,
    isConnected: true,
    maxAllocation: 120000n,
    existentAllocation: 90000n,
    allocation: 90000n,
    estimatedRewards: '250.00 USD',
    topBarColor: '#4ECDC4',
    className: 'w-[200px]',
  },
}

export const WithBuilderIncreasedRewardPct: Story = {
  render: args => <BuilderCardWithState {...args} />,
  args: {
    address: '0x1234567890abcdef',
    builderName: 'Beefy',
    backerRewardPct: {
      current: 50n,
      next: 60n,
      cooldownEndTime: 0n,
    },
    rifPriceUsd: 0.05,
    isConnected: true,
    maxAllocation: 120000n,
    existentAllocation: 0n,
    allocation: 0n,
    topBarColor: '#FFD93D',
    className: 'w-[200px]',
  },
}

export const WithBuilderDecreasedRewardPct: Story = {
  render: args => <BuilderCardWithState {...args} />,
  args: {
    address: '0x1234567890abcdef',
    builderName: 'Beefy',
    backerRewardPct: {
      current: 50n,
      next: 40n,
      cooldownEndTime: 0n,
    },
    rifPriceUsd: 0.05,
    isConnected: true,
    maxAllocation: 120000n,
    existentAllocation: 0n,
    allocation: 0n,
    topBarColor: '#A084F5',
    className: 'w-[200px]',
  },
}

export const WithAllocationPending: Story = {
  render: args => <BuilderCardWithState {...args} />,
  args: {
    address: '0x1234567890abcdef',
    builderName: 'Beefy',
    backerRewardPct: {
      current: 40n,
      next: 50n,
      cooldownEndTime: 0n,
    },
    rifPriceUsd: 0.05,
    isConnected: true,
    maxAllocation: 120000n,
    existentAllocation: 9000n,
    allocation: 9000n,
    allocationTxPending: true,
    topBarColor: '#95E1D3',
    className: 'w-[200px]',
  },
}
