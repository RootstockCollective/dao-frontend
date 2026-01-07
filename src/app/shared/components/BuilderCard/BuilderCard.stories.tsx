import { percentageToWei } from '@/app/collective-rewards/settings/utils/weiUtils'
import { RIF } from '@/lib/constants'
import type { Meta, StoryObj } from '@storybook/nextjs'
import { getAddress, parseEther } from 'viem'
import { BuilderCard } from './BuilderCard'

// Decorator to handle BigInt serialization
const withBigIntSerialization = (Story: any) => {
  return (
    <div style={{ maxWidth: '600px' }}>
      <Story />
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

// Mock data
const mockBuilderAddress = getAddress('0x1234567890123456789012345678901234567890')
const mockGaugeAddress = getAddress('0x9876543210987654321098765432109876543210')

const mockBuilder = {
  address: mockBuilderAddress,
  builderName: 'Example Builder',
  proposal: {
    id: 123n,
    name: 'Example Builder Proposal',
    description: 'A great builder doing amazing work',
    date: '2024-01-01',
  },
  stateFlags: {
    initialized: true,
    kycApproved: true,
    communityApproved: true,
    kycPaused: false,
    selfPaused: false,
  },
  backerRewardPct: {
    previous: percentageToWei('50'),
    current: percentageToWei('50'),
    next: percentageToWei('50'),
    cooldownEndTime: BigInt(Math.floor(Date.now() / 1000) + 3600), // 1 hour from now
  },
  gauge: mockGaugeAddress,
}

const mockPrices = {
  [RIF]: {
    price: 0.1,
    lastUpdated: new Date().toISOString(),
  },
}

const mockEstimatedRewards = {
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
}

const baseAllocationInputProps = {
  builderAddress: mockBuilderAddress,
  balance: parseEther('10000'), // 10,000 stRIF
  allocationTxPending: false,
  disabled: false,
  prices: mockPrices,
  updateBacking: () => {}, // Mock function for stories
}

export const Default: Story = {
  args: {
    builder: mockBuilder,
    allocationInputProps: {
      ...baseAllocationInputProps,
      onchainBackingState: {
        builderBacking: parseEther('1000'), // 1,000 stRIF
        cumulativeBacking: parseEther('1000'),
      },
      updatedBackingState: {
        builderBacking: parseEther('1000'), // 1,000 stRIF
        cumulativeBacking: parseEther('1000'),
        cumulativeBackingReductions: 0n,
      },
    },
    estimatedRewards: mockEstimatedRewards,
    isInteractive: true,
  },
}

export const NotConnected: Story = {
  args: {
    builder: mockBuilder,
    allocationInputProps: {
      ...baseAllocationInputProps,
      onchainBackingState: {
        builderBacking: parseEther('1000'),
        cumulativeBacking: parseEther('1000'),
      },
      updatedBackingState: {
        builderBacking: parseEther('1000'),
        cumulativeBacking: parseEther('1000'),
        cumulativeBackingReductions: 0n,
      },
    },
    estimatedRewards: mockEstimatedRewards,
    isInteractive: false,
  },
}

export const NoExistingBacking: Story = {
  args: {
    builder: mockBuilder,
    allocationInputProps: {
      ...baseAllocationInputProps,
      onchainBackingState: {
        builderBacking: 0n,
        cumulativeBacking: 0n,
      },
      updatedBackingState: {
        builderBacking: 0n,
        cumulativeBacking: 0n,
        cumulativeBackingReductions: 0n,
      },
    },
    estimatedRewards: mockEstimatedRewards,
    isInteractive: true,
  },
}

export const WithBacking: Story = {
  args: {
    builder: mockBuilder,
    allocationInputProps: {
      ...baseAllocationInputProps,
      onchainBackingState: {
        builderBacking: parseEther('5000'), // 5,000 stRIF
        cumulativeBacking: parseEther('5000'),
      },
      updatedBackingState: {
        builderBacking: parseEther('5000'), // 5,000 stRIF
        cumulativeBacking: parseEther('5000'),
        cumulativeBackingReductions: 0n,
      },
    },
    estimatedRewards: mockEstimatedRewards,
    isInteractive: true,
  },
}

export const WithBuilderIncreasedRewardPct: Story = {
  args: {
    builder: {
      ...mockBuilder,
      backerRewardPct: {
        previous: percentageToWei('50'),
        current: percentageToWei('50'),
        next: percentageToWei('80'),
        cooldownEndTime: BigInt(Math.floor(Date.now() / 1000) + 3600), // 1 hour from now
      },
    },
    allocationInputProps: {
      ...baseAllocationInputProps,
      onchainBackingState: {
        builderBacking: parseEther('1000'),
        cumulativeBacking: parseEther('1000'),
      },
      updatedBackingState: {
        builderBacking: parseEther('1000'),
        cumulativeBacking: parseEther('1000'),
        cumulativeBackingReductions: 0n,
      },
    },
    estimatedRewards: mockEstimatedRewards,
    isInteractive: true,
  },
}

export const WithBuilderDecreasedRewardPct: Story = {
  args: {
    builder: {
      ...mockBuilder,
      backerRewardPct: {
        previous: percentageToWei('50'),
        current: percentageToWei('50'),
        next: percentageToWei('30'),
        cooldownEndTime: BigInt(Math.floor(Date.now() / 1000) + 3600), // 1 hour from now
      },
    },
    allocationInputProps: {
      ...baseAllocationInputProps,
      onchainBackingState: {
        builderBacking: parseEther('1000'),
        cumulativeBacking: parseEther('1000'),
      },
      updatedBackingState: {
        builderBacking: parseEther('1000'),
        cumulativeBacking: parseEther('1000'),
        cumulativeBackingReductions: 0n,
      },
    },
    estimatedRewards: mockEstimatedRewards,
    isInteractive: true,
  },
}

export const WithAllocationPending: Story = {
  args: {
    builder: mockBuilder,
    allocationInputProps: {
      ...baseAllocationInputProps,
      allocationTxPending: true,
      onchainBackingState: {
        builderBacking: parseEther('1000'),
        cumulativeBacking: parseEther('1000'),
      },
      updatedBackingState: {
        builderBacking: parseEther('2000'), // Pending change
        cumulativeBacking: parseEther('2000'),
        cumulativeBackingReductions: 0n,
      },
    },
    estimatedRewards: mockEstimatedRewards,
    isInteractive: true,
  },
}

export const WithBuilderNotRewardable: Story = {
  args: {
    builder: {
      ...mockBuilder,
      stateFlags: {
        initialized: false,
        kycApproved: false,
        communityApproved: false,
        kycPaused: false,
        selfPaused: false,
      },
    },
    allocationInputProps: {
      ...baseAllocationInputProps,
      onchainBackingState: {
        builderBacking: parseEther('1000'),
        cumulativeBacking: parseEther('1000'),
      },
      updatedBackingState: {
        builderBacking: parseEther('1000'),
        cumulativeBacking: parseEther('1000'),
        cumulativeBackingReductions: 0n,
      },
    },
    estimatedRewards: mockEstimatedRewards,
    isInteractive: true,
  },
}

export const WithAnimation: Story = {
  args: {
    builder: mockBuilder,
    allocationInputProps: {
      ...baseAllocationInputProps,
      onchainBackingState: {
        builderBacking: parseEther('1000'),
        cumulativeBacking: parseEther('1000'),
      },
      updatedBackingState: {
        builderBacking: parseEther('1000'),
        cumulativeBacking: parseEther('1000'),
        cumulativeBackingReductions: 0n,
      },
    },
    estimatedRewards: mockEstimatedRewards,
    isInteractive: true,
    showAnimation: true,
    index: 0,
  },
}
