import { Builder } from '@/app/collective-rewards/types'
import type { Meta, StoryObj } from '@storybook/nextjs'
import { BuilderNameCell } from './BuilderNameCell'

const meta: Meta<typeof BuilderNameCell> = {
  title: 'Koto/Builders/Table/Cell/BuilderNameCell',
  component: BuilderNameCell,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  decorators: [
    (Story, context) => {
      const isHighlighted = context.args.isHighlighted || false
      const bgColor = isHighlighted ? 'bg-v3-text-80' : 'bg-v3-bg-accent-80'

      return (
        <div className={`w-80 ${bgColor}`}>
          <Story />
        </div>
      )
    },
  ],
  argTypes: {
    builder: {
      control: 'object',
      description: 'The builder object containing all builder information',
    },
    className: {
      control: 'text',
      description: 'Additional CSS classes for styling',
    },
    isHighlighted: {
      control: 'boolean',
      description: 'Whether the cell is currently being highlighted',
    },
    hasAirdrop: {
      control: 'boolean',
      description: 'Whether the builder has an airdrop',
    },
  },
}

export default meta

type Story = StoryObj<typeof BuilderNameCell>

// Mock builder objects for different states
const activeBuilder: Builder = {
  address: '0x1234567890123456789012345678901234567890',
  builderName: 'Creamy',
  proposal: {
    id: 1n,
    name: 'Test Proposal',
    description: 'Test Description',
    date: '2024-01-01',
  },
  stateFlags: {
    initialized: true,
    communityApproved: true,
    kycApproved: true,
    kycPaused: false,
    selfPaused: false,
  },
  gauge: '0xabcdef1234567890abcdef1234567890abcdef12',
}

const pendingBuilder: Builder = {
  ...activeBuilder,
  builderName: 'Pending Builder',
  gauge: undefined,
  stateFlags: {
    initialized: false,
    communityApproved: false,
    kycApproved: false,
    kycPaused: false,
    selfPaused: false,
  },
}

const warningBuilder: Builder = {
  ...activeBuilder,
  builderName: 'Warning Builder',
  stateFlags: {
    initialized: true,
    communityApproved: false,
    kycApproved: true,
    kycPaused: false,
    selfPaused: false,
  },
}

const pausedBuilder: Builder = {
  ...activeBuilder,
  builderName: 'Paused Builder',
  stateFlags: {
    initialized: true,
    communityApproved: true,
    kycApproved: true,
    kycPaused: true,
    selfPaused: false,
  },
}

export const Default: Story = {
  args: {
    builder: activeBuilder,
  },
}

export const Pending: Story = {
  args: {
    builder: pendingBuilder,
  },
}

export const Warning: Story = {
  args: {
    builder: warningBuilder,
  },
}

export const Paused: Story = {
  args: {
    builder: pausedBuilder,
  },
}

export const Highlighted: Story = {
  args: {
    builder: activeBuilder,
    isHighlighted: true,
  },
}

export const WithAirdrop: Story = {
  args: {
    builder: activeBuilder,
    hasAirdrop: true,
  },
}
