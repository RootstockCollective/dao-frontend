import type { Meta, StoryObj } from '@storybook/react'
import { BuilderNameCell } from './BuilderNameCell'

const meta: Meta<typeof BuilderNameCell> = {
  title: 'Builders/Table/BuilderNameCell',
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
    builderName: {
      control: 'text',
      description: 'The name of the builder to display',
    },
    className: {
      control: 'text',
      description: 'Additional CSS classes for styling',
    },
    isHighlighted: {
      control: 'boolean',
      description: 'Whether the cell is currently being highlighted',
    },
    hasExtraRewards: {
      control: 'boolean',
      description: 'Whether the builder has extra rewards available',
    },
    hasWarning: {
      control: 'boolean',
      description: 'Whether the builder has a warning that requires action',
    },
    isPending: {
      control: 'boolean',
      description: 'Whether the builder is pending approval',
    },
  },
}

export default meta

type Story = StoryObj<typeof BuilderNameCell>

export const Default: Story = {
  args: {
    builderName: 'Creamy',
    builderPageLink: 'https://www.google.com',
  },
}
