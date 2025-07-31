import { percentageToWei } from '@/app/utils'
import { AlertProvider } from '@/app/providers/AlertProvider'
import type { Meta, StoryObj } from '@storybook/react'
import { getAddress, parseEther } from 'viem'
import { BuilderCard } from './BuilderCard'

// Decorator to handle BigInt serialization
const withBigIntSerialization = (Story: any) => {
  return (
    <div style={{ maxWidth: '600px' }}>
      <AlertProvider>
        <Story />
      </AlertProvider>
    </div>
  )
}

const meta: Meta<typeof BuilderCard> = {
  title: 'Backing/BuilderCard',
  component: BuilderCard,
  parameters: {
    layout: 'centered',
  },
  decorators: [withBigIntSerialization],
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof BuilderCard>

const defaultProps = {
  address: getAddress('0x1234567890123456789012345678901234567890'),
  builderName: 'Example Builder',
  stateFlags: {
    activated: true,
    kycApproved: true,
    communityApproved: true,
    paused: false,
    revoked: false,
  },
  backerRewardPct: {
    previous: percentageToWei('50'),
    current: percentageToWei('50'),
    next: percentageToWei('50'),
    cooldownEndTime: BigInt(Math.floor(Date.now() / 1000) + 3600), // 1 hour from now
  },
  existentAllocation: parseEther('1000'),
  maxAllocation: parseEther('10000'),
  allocation: parseEther('1000'),
  rifPriceUsd: 0.1,
  isConnected: true,
  builderEstimatedRewards: {
    rif: {
      amount: {
        value: parseEther('550'),
        price: 0.1,
        symbol: 'RIF',
        currency: 'USD',
      },
    },
    rbtc: {
      amount: {
        value: parseEther('0.05'),
        price: 5000,
        symbol: 'RBTC',
        currency: 'USD',
      },
    },
  },
  allocationTxPending: false,
  onAllocationChange: () => {},
  topBarColor: '#4CAF50',
}

export const Default: Story = {
  args: defaultProps,
}

export const NotConnected: Story = {
  args: {
    ...defaultProps,
    isConnected: false,
  },
}

export const NoExistingAllocation: Story = {
  args: {
    ...defaultProps,
    existentAllocation: parseEther('0'),
  },
}

export const WithAllocation: Story = {
  args: {
    ...defaultProps,
    allocation: parseEther('5000'),
    existentAllocation: parseEther('5000'),
  },
}

export const WithBuilderIncreasedRewardPct: Story = {
  args: {
    ...defaultProps,
    backerRewardPct: {
      previous: percentageToWei('50'),
      current: percentageToWei('50'),
      next: percentageToWei('80'),
      cooldownEndTime: BigInt(Math.floor(Date.now() / 1000) + 3600), // 1 hour from now
    },
  },
}

export const WithBuilderDecreasedRewardPct: Story = {
  args: {
    ...defaultProps,
    backerRewardPct: {
      previous: percentageToWei('50'),
      current: percentageToWei('50'),
      next: percentageToWei('30'),
      cooldownEndTime: BigInt(Math.floor(Date.now() / 1000) + 3600), // 1 hour from now
    },
  },
}

export const WithAllocationPending: Story = {
  args: {
    ...defaultProps,
    allocationTxPending: true,
  },
}

export const WithBuilderNotRewardable: Story = {
  args: {
    ...defaultProps,
    stateFlags: {
      activated: false,
      kycApproved: false,
      communityApproved: false,
      paused: false,
      revoked: false,
    },
  },
}
