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

export const WithoutAllocation: Story = {
  render: args => <BuilderCardWithState {...args} />,
  args: {
    address: '0x1234567890abcdef',
    builderName: 'Beefy',
    backerRewardPercentage: {
      previous: BigInt(40),
      next: BigInt(50),
      cooldown: BigInt(0),
      active: BigInt(50),
    },
    rifPriceUsd: 0.05,
    isConnected: true,
    maxAllocation: 120000,
    currentAllocation: 0,
    allocation: 0,
    topBarColor: '#4FFFE7',
    className: 'w-[200px]',
  },
}

export const WithAllocation: Story = {
  render: args => <BuilderCardWithState {...args} />,
  args: {
    address: '0x1234567890abcdef',
    builderName: 'Beefy',
    backerRewardPercentage: {
      previous: BigInt(40),
      next: BigInt(50),
      cooldown: BigInt(0),
      active: BigInt(50),
    },
    rifPriceUsd: 0.05,
    isConnected: true,
    maxAllocation: 120000,
    currentAllocation: 90000,
    allocation: 90000,
    topBarColor: '#A084F5',
    className: 'w-[200px]',
  },
}

export const WithBuilderIncreasedRewardPct: Story = {
  render: args => <BuilderCardWithState {...args} />,
  args: {
    address: '0x1234567890abcdef',
    builderName: 'Beefy',
    backerRewardPercentage: {
      previous: BigInt(50),
      next: BigInt(60),
      cooldown: BigInt(0),
      active: BigInt(50),
    },
    rifPriceUsd: 0.05,
    isConnected: true,
    maxAllocation: 120000,
    currentAllocation: 0,
    allocation: 0,
    topBarColor: '#A084F5',
    className: 'w-[200px]',
  },
}

export const WithBuilderDecreasedRewardPct: Story = {
  render: args => <BuilderCardWithState {...args} />,
  args: {
    address: '0x1234567890abcdef',
    builderName: 'Beefy',
    backerRewardPercentage: {
      previous: BigInt(50),
      next: BigInt(40),
      cooldown: BigInt(0),
      active: BigInt(50),
    },
    rifPriceUsd: 0.05,
    isConnected: true,
    maxAllocation: 120000,
    currentAllocation: 0,
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
    backerRewardPercentage: {
      previous: BigInt(40),
      next: BigInt(50),
      cooldown: BigInt(0),
      active: BigInt(50),
    },
    rifPriceUsd: 0.05,
    isConnected: true,
    maxAllocation: 120000,
    currentAllocation: 9000,
    allocation: 9000,
    allocationTxPending: true,
    topBarColor: '#A084F5',
    className: 'w-[200px]',
  },
}
