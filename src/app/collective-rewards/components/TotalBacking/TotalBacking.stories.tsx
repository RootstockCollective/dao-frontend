import type { Meta, StoryObj } from '@storybook/react'
import { TotalBackingContent } from './TotalBacking'

const meta: Meta<typeof TotalBackingContent> = {
  title: 'CollectiveRewards/TotalBackingContent',
  component: TotalBackingContent,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'Displays the total backing amount in StRIF tokens with proper formatting and token icon. This is the presentational component that receives the totalAllocations as a prop.',
      },
    },
  },
  argTypes: {
    totalAllocations: {
      control: { type: 'text' },
      description: 'Total allocations amount in wei (bigint)',
    },
  },
  tags: ['autodocs'],
}

export default meta

type Story = StoryObj<typeof TotalBackingContent>

// Helper function to convert string to bigint for controls
const parseBigInt = (value: string): bigint => {
  try {
    return BigInt(value)
  } catch {
    return 0n
  }
}

export const Default: Story = {
  args: {
    totalAllocations: 1000000000000000000000n, // 1000 StRIF
  },
  render: (args) => <TotalBackingContent totalAllocations={args.totalAllocations} />,
}

export const ZeroAllocations: Story = {
  args: {
    totalAllocations: 0n,
  },
  render: (args) => <TotalBackingContent totalAllocations={args.totalAllocations} />,
}

export const SmallAmount: Story = {
  args: {
    totalAllocations: 500000000000000000n, // 0.5 StRIF
  },
  render: (args) => <TotalBackingContent totalAllocations={args.totalAllocations} />,
}

export const LargeAmount: Story = {
  args: {
    totalAllocations: 1000000000000000000000000000n, // 1,000,000,000 StRIF
  },
  render: (args) => <TotalBackingContent totalAllocations={args.totalAllocations} />,
}

export const VerySmallAmount: Story = {
  args: {
    totalAllocations: 1000000000000000n, // 0.001 StRIF (less than 1)
  },
  render: (args) => <TotalBackingContent totalAllocations={args.totalAllocations} />,
}

export const OneToken: Story = {
  args: {
    totalAllocations: 1000000000000000000n, // 1 StRIF
  },
  render: (args) => <TotalBackingContent totalAllocations={args.totalAllocations} />,
}

export const DecimalAmount: Story = {
  args: {
    totalAllocations: 123456789000000000000n, // 123.456789 StRIF
  },
  render: (args) => <TotalBackingContent totalAllocations={args.totalAllocations} />,
}

// Interactive story with controls
export const Interactive: Story = {
  args: {
    totalAllocations: 1000000000000000000000n, // 1000 StRIF
  },
  render: (args) => {
    const bigIntValue = typeof args.totalAllocations === 'string' 
      ? parseBigInt(args.totalAllocations) 
      : args.totalAllocations
    return <TotalBackingContent totalAllocations={bigIntValue} />
  },
  argTypes: {
    totalAllocations: {
      control: { type: 'text' },
      description: 'Enter amount in wei (e.g., 1000000000000000000000 for 1000 StRIF)',
    },
  },
}

// Story showing the component in different contexts
export const InContainer: Story = {
  args: {
    totalAllocations: 500000000000000000000n, // 500 StRIF
  },
  render: (args) => (
    <div className="p-6 bg-[var(--color-bg-80)] rounded-lg max-w-md">
      <TotalBackingContent totalAllocations={args.totalAllocations} />
    </div>
  ),
}

export const MultipleInstances: Story = {
  render: () => (
    <div className="space-y-4">
      <TotalBackingContent totalAllocations={1000000000000000000000n} />
      <TotalBackingContent totalAllocations={500000000000000000000n} />
      <TotalBackingContent totalAllocations={10000000000000000000000n} />
    </div>
  ),
} 