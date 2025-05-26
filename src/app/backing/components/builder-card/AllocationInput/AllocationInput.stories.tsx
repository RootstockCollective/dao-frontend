import { AllocationInput } from './AllocationInput'
import type { Meta, StoryObj } from '@storybook/react'

// FIXME: currently throws an error because of the wallet connection
// Error; Cannot read properties of undefined (reading 'ConnectWorkflow')

const meta: Meta<typeof AllocationInput> = {
  title: 'Backing/AllocationInput',
  component: AllocationInput,
}

export default meta

type Story = StoryObj<typeof AllocationInput>

export const Default: Story = {
  args: {
    allocation: 0,
    maxAllocation: 120000,
    currentAllocation: 0,
    onAllocationChange: value => console.log('Allocation changed:', value),
  },
}

export const WithAllocation: Story = {
  args: {
    allocation: 50000,
    maxAllocation: 120000,
    currentAllocation: 50000,
    onAllocationChange: value => console.log('Allocation changed:', value),
  },
}

export const Pending: Story = {
  args: {
    allocation: 50000,
    maxAllocation: 120000,
    currentAllocation: 30000,
    allocationTxPending: true,
    onAllocationChange: value => console.log('Allocation changed:', value),
  },
}
