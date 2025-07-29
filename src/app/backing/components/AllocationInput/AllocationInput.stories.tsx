import { RIF } from '@/lib/constants'
import type { Meta, StoryObj } from '@storybook/nextjs'
import { useState } from 'react'
import { AllocationInput, AllocationInputProps, UpdatedBackingState } from './AllocationInput'

const meta: Meta<typeof AllocationInput> = {
  title: 'Backing/AllocationInput',
  component: AllocationInput,
}

export default meta

type Story = StoryObj<typeof AllocationInput>

// Mock builder address
const MOCK_BUILDER_ADDRESS = '0x1234567890123456789012345678901234567890' as const

// Mock prices data
const mockPrices = {
  [RIF]: {
    price: 0.05,
    lastUpdated: new Date().toISOString(),
  },
}

// Wrapper component to handle state
const AllocationInputWithState = (args: AllocationInputProps) => {
  const [currentBackingState, setCurrentBackingState] = useState<UpdatedBackingState>({
    ...args.onchainBackingState,
    cumulativeBackingReductions: 0n,
  })

  const updateBacking = (value: bigint) => {
    setCurrentBackingState({
      ...currentBackingState,
      builderBacking: value,
    })
  }

  return <AllocationInput {...args} updatedBackingState={currentBackingState} updateBacking={updateBacking} />
}

export const Default: Story = {
  render: args => <AllocationInputWithState {...args} />,
  args: {
    builderAddress: MOCK_BUILDER_ADDRESS,
    balance: 120000n * 10n ** 18n, // 120,000 stRIF
    onchainBackingState: {
      builderBacking: 0n,
      cumulativeBacking: 0n,
    },
    updatedBackingState: {
      builderBacking: 0n,
      cumulativeBacking: 0n,
      cumulativeBackingReductions: 0n,
    },
    allocationTxPending: false,
    disabled: false,
    prices: mockPrices,
  },
}

export const WithBacking: Story = {
  render: args => <AllocationInputWithState {...args} />,
  args: {
    builderAddress: MOCK_BUILDER_ADDRESS,
    balance: 120000n * 10n ** 18n, // 120,000 stRIF
    onchainBackingState: {
      builderBacking: 50000n * 10n ** 18n, // 50,000 stRIF
      cumulativeBacking: 50000n * 10n ** 18n,
    },
    updatedBackingState: {
      builderBacking: 50000n * 10n ** 18n, // 50,000 stRIF
      cumulativeBacking: 50000n * 10n ** 18n,
      cumulativeBackingReductions: 0n,
    },
    allocationTxPending: false,
    disabled: false,
    prices: mockPrices,
  },
}

export const Pending: Story = {
  render: args => <AllocationInputWithState {...args} />,
  args: {
    builderAddress: MOCK_BUILDER_ADDRESS,
    balance: 120000n * 10n ** 18n, // 120,000 stRIF
    onchainBackingState: {
      builderBacking: 30000n * 10n ** 18n, // 30,000 stRIF
      cumulativeBacking: 30000n * 10n ** 18n,
    },
    updatedBackingState: {
      builderBacking: 50000n * 10n ** 18n, // 50,000 stRIF (updated)
      cumulativeBacking: 50000n * 10n ** 18n,
      cumulativeBackingReductions: 0n,
    },
    allocationTxPending: true,
    disabled: false,
    prices: mockPrices,
  },
}

export const Disabled: Story = {
  render: args => <AllocationInputWithState {...args} />,
  args: {
    builderAddress: MOCK_BUILDER_ADDRESS,
    balance: 120000n * 10n ** 18n, // 120,000 stRIF
    onchainBackingState: {
      builderBacking: 0n,
      cumulativeBacking: 0n,
    },
    updatedBackingState: {
      builderBacking: 0n,
      cumulativeBacking: 0n,
      cumulativeBackingReductions: 0n,
    },
    allocationTxPending: false,
    disabled: true,
    prices: mockPrices,
  },
}
