import type { Meta, StoryObj } from '@storybook/nextjs'
import { CategoryColumn } from './CategoryColumn'
import { ProposalCategory } from '@/shared/types'

const meta: Meta<typeof CategoryColumn> = {
  title: 'Proposals/CategoryColumn',
  component: CategoryColumn,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    category: {
      control: { type: 'select' },
      options: Object.values(ProposalCategory),
    },
  },
}

export default meta
type Story = StoryObj<typeof meta>

// Test all 6 proposal categories
export const Grants: Story = {
  args: {
    category: ProposalCategory.Grants,
  },
}

export const Activation: Story = {
  args: {
    category: ProposalCategory.Activation,
  },
}

export const Deactivation: Story = {
  args: {
    category: ProposalCategory.Deactivation,
  },
}

export const Milestone1: Story = {
  args: {
    category: ProposalCategory.Milestone1,
  },
}

export const Milestone2: Story = {
  args: {
    category: ProposalCategory.Milestone2,
  },
}

export const Milestone3: Story = {
  args: {
    category: ProposalCategory.Milestone3,
  },
}
