import type { Meta, StoryObj } from '@storybook/react'
import { BuilderCard } from './BuilderCard'
import { useState } from 'react'
import { AlertProvider } from '@/app/providers/AlertProvider'

// Workaround for Storybook BigInt serialization
const createBackerRewardPercentage = (previous: number, next: number, cooldown: number, active: number) => ({
  previous: BigInt(previous),
  next: BigInt(next),
  cooldown: BigInt(cooldown),
  active: BigInt(active),
})

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
    backerRewardPercentage: createBackerRewardPercentage(40, 50, 0, 50),
    rifPriceUsd: 0.05,
    isConnected: false,
    maxAllocation: 120000,
    existentAllocation: 0,
    allocation: 0,
    topBarColor: '#4FFFE7',
    className: 'w-[200px]',
  },
}

export const WithoutAllocation: Story = {
  render: args => <BuilderCardWithState {...args} />,
  args: {
    address: '0x1234567890abcdef',
    builderName: 'Beefy',
    backerRewardPercentage: createBackerRewardPercentage(40, 50, 0, 50),
    rifPriceUsd: 0.05,
    isConnected: true,
    maxAllocation: 120000,
    existentAllocation: 0,
    allocation: 0,
    topBarColor: '#FF6B6B',
    className: 'w-[200px]',
  },
}

export const WithAllocation: Story = {
  render: args => <BuilderCardWithState {...args} />,
  args: {
    address: '0x1234567890abcdef',
    builderName: 'Beefy',
    backerRewardPercentage: createBackerRewardPercentage(40, 50, 0, 50),
    rifPriceUsd: 0.05,
    isConnected: true,
    maxAllocation: 120000,
    existentAllocation: 90000,
    allocation: 90000,
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
    backerRewardPercentage: createBackerRewardPercentage(50, 60, 0, 50),
    rifPriceUsd: 0.05,
    isConnected: true,
    maxAllocation: 120000,
    existentAllocation: 0,
    allocation: 0,
    topBarColor: '#FFD93D',
    className: 'w-[200px]',
  },
}

export const WithBuilderDecreasedRewardPct: Story = {
  render: args => <BuilderCardWithState {...args} />,
  args: {
    address: '0x1234567890abcdef',
    builderName: 'Beefy',
    backerRewardPercentage: createBackerRewardPercentage(50, 40, 0, 50),
    rifPriceUsd: 0.05,
    isConnected: true,
    maxAllocation: 120000,
    existentAllocation: 0,
    allocation: 0,
    topBarColor: '#A084F5',
    className: 'w-[200px]',
  },
}

export const WithAllocationPending: Story = {
  render: args => <BuilderCardWithState {...args} />,
  args: {
    address: '0x1234567890abcdef',
    builderName: 'Beefy',
    backerRewardPercentage: createBackerRewardPercentage(40, 50, 0, 50),
    rifPriceUsd: 0.05,
    isConnected: true,
    maxAllocation: 120000,
    existentAllocation: 9000,
    allocation: 9000,
    allocationTxPending: true,
    topBarColor: '#95E1D3',
    className: 'w-[200px]',
  },
}
