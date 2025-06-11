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

// All BigInt-like values as strings for Storybook serialization
export type BuilderCardStoryArgs = {
  address: string
  builderName: string
  proposal: {
    id: string
    name: string
    description: string
    date: string
  }
  backerRewardPct: {
    current: string
    next: string
    cooldownEndTime: string
  }
  rifPriceUsd: number
  isConnected: boolean
  maxAllocation: string
  existentAllocation: string
  allocation: string
  topBarColor: string
  className: string
  allocationTxPending?: boolean
  estimatedRewards?: string
}

type Story = StoryObj<BuilderCardStoryArgs>

// Wrapper: converts string args to BigInt for the real component
const BuilderCardWithState = (args: BuilderCardStoryArgs) => {
  const [allocation, setAllocation] = useState(BigInt(args.allocation || '0'))
  return (
    <BuilderCard
      address={args.address as `0x${string}`}
      builderName={args.builderName}
      proposal={{
        ...args.proposal,
        id: BigInt(args.proposal.id),
      }}
      backerRewardPct={{
        current: BigInt(args.backerRewardPct.current),
        next: BigInt(args.backerRewardPct.next),
        cooldownEndTime: BigInt(args.backerRewardPct.cooldownEndTime),
      }}
      rifPriceUsd={args.rifPriceUsd}
      isConnected={args.isConnected}
      maxAllocation={BigInt(args.maxAllocation)}
      existentAllocation={BigInt(args.existentAllocation)}
      allocation={allocation}
      onAllocationChange={value => setAllocation(BigInt(value))}
      topBarColor={args.topBarColor}
      className={args.className}
      allocationTxPending={args.allocationTxPending}
      estimatedRewards={args.estimatedRewards}
    />
  )
}

export const NotConnected: Story = {
  render: args => <BuilderCardWithState {...args} />,
  args: {
    address: '0x1234567890abcdef',
    builderName: 'Beefy',
    proposal: {
      id: '1',
      name: 'Test Proposal',
      description: 'Test Description',
      date: '2024-03-20',
    },
    backerRewardPct: {
      current: '40',
      next: '50',
      cooldownEndTime: '0',
    },
    rifPriceUsd: 0.05,
    isConnected: false,
    maxAllocation: '120000',
    existentAllocation: '0',
    allocation: '0',
    topBarColor: '#4FFFE7',
    className: 'w-[200px]',
  },
}

export const WithoutAllocation: Story = {
  render: args => <BuilderCardWithState {...args} />,
  args: {
    address: '0x1234567890abcdef',
    builderName: 'Beefy',
    proposal: {
      id: '1',
      name: 'Test Proposal',
      description: 'Test Description',
      date: '2024-03-20',
    },
    backerRewardPct: {
      current: '40',
      next: '50',
      cooldownEndTime: '0',
    },
    rifPriceUsd: 0.05,
    isConnected: true,
    maxAllocation: '120000',
    existentAllocation: '0',
    allocation: '0',
    topBarColor: '#FF6B6B',
    className: 'w-[200px]',
  },
}

export const WithAllocation: Story = {
  render: args => <BuilderCardWithState {...args} />,
  args: {
    address: '0x1234567890abcdef',
    builderName: 'Beefy',
    proposal: {
      id: '1',
      name: 'Test Proposal',
      description: 'Test Description',
      date: '2024-03-20',
    },
    backerRewardPct: {
      current: '40',
      next: '50',
      cooldownEndTime: '0',
    },
    rifPriceUsd: 0.05,
    isConnected: true,
    maxAllocation: '120000',
    existentAllocation: '90000',
    allocation: '90000',
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
    proposal: {
      id: '1',
      name: 'Test Proposal',
      description: 'Test Description',
      date: '2024-03-20',
    },
    backerRewardPct: {
      current: '50',
      next: '60',
      cooldownEndTime: '0',
    },
    rifPriceUsd: 0.05,
    isConnected: true,
    maxAllocation: '120000',
    existentAllocation: '0',
    allocation: '0',
    topBarColor: '#FFD93D',
    className: 'w-[200px]',
  },
}

export const WithBuilderDecreasedRewardPct: Story = {
  render: args => <BuilderCardWithState {...args} />,
  args: {
    address: '0x1234567890abcdef',
    builderName: 'Beefy',
    proposal: {
      id: '1',
      name: 'Test Proposal',
      description: 'Test Description',
      date: '2024-03-20',
    },
    backerRewardPct: {
      current: '50',
      next: '40',
      cooldownEndTime: '0',
    },
    rifPriceUsd: 0.05,
    isConnected: true,
    maxAllocation: '120000',
    existentAllocation: '0',
    allocation: '0',
    topBarColor: '#A084F5',
    className: 'w-[200px]',
  },
}

export const WithAllocationPending: Story = {
  render: args => <BuilderCardWithState {...args} />,
  args: {
    address: '0x1234567890abcdef',
    builderName: 'Beefy',
    proposal: {
      id: '1',
      name: 'Test Proposal',
      description: 'Test Description',
      date: '2024-03-20',
    },
    backerRewardPct: {
      current: '40',
      next: '50',
      cooldownEndTime: '0',
    },
    rifPriceUsd: 0.05,
    isConnected: true,
    maxAllocation: '120000',
    existentAllocation: '9000',
    allocation: '9000',
    allocationTxPending: true,
    topBarColor: '#95E1D3',
    className: 'w-[200px]',
  },
}
