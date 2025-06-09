import { AllocationInput } from './AllocationInput'
import type { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'

const meta: Meta<typeof AllocationInput> = {
  title: 'Backing/AllocationInput',
  component: AllocationInput,
}

export default meta

type Story = StoryObj<typeof AllocationInput>

// Wrapper component to handle state
const AllocationInputWithState = (args: any) => {
  const [allocation, setAllocation] = useState(args.allocation)
  return (
    <AllocationInput {...args} allocation={allocation} onAllocationChange={value => setAllocation(value)} />
  )
}

export const Default: Story = {
  render: args => <AllocationInputWithState {...args} />,
  args: {
    allocation: 0n,
    maxAllocation: 120000n,
    existentAllocation: 0n,
    rifPriceUsd: 0.05,
  },
}

export const WithAllocation: Story = {
  render: args => <AllocationInputWithState {...args} />,
  args: {
    allocation: 50000n,
    maxAllocation: 120000n,
    existentAllocation: 50000n,
    rifPriceUsd: 0.05,
  },
}

export const Pending: Story = {
  render: args => <AllocationInputWithState {...args} />,
  args: {
    allocation: 50000n,
    maxAllocation: 120000n,
    existentAllocation: 30000n,
    allocationTxPending: true,
    rifPriceUsd: 0.05,
  },
}
