import type { Meta, StoryObj } from '@storybook/react'
import { BuilderFilterDropdown } from './BuilderFilterDropdown'

const meta: Meta<typeof BuilderFilterDropdown> = {
  title: 'Builders/BuilderFilterDropdown',
  component: BuilderFilterDropdown,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    onSelected: {
      action: 'selected',
      description: 'Callback function when an option is selected',
    },
    className: {
      control: 'text',
      description: 'Custom className for the container',
    },
  },
}

export default meta

type Story = StoryObj<typeof BuilderFilterDropdown>

export const Default: Story = {
  args: {
    onSelected: option => console.log('Selected:', option.id),
  },
  render: args => (
    <div className="w-64">
      <BuilderFilterDropdown {...args} />
    </div>
  ),
}
