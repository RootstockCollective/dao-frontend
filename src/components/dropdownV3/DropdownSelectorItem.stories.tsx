import type { Meta, StoryObj } from '@storybook/react'
import { DropdownSelectorItem } from './DropdownSelectorItem'

const meta = {
  title: 'DropdownV3/DropdownSelectorItem',
  component: DropdownSelectorItem,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    label: {
      control: 'text',
      description: 'The main label text of the item',
    },
    sublabel: {
      control: 'text',
      description: 'Optional sublabel text shown below the main label',
    },
    checked: {
      control: 'boolean',
      description: 'Whether the item is checked/selected',
    },
    className: {
      control: 'text',
      description: 'Optional CSS class name for custom styling',
    },
  },
} satisfies Meta<typeof DropdownSelectorItem>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    label: 'Basic Item',
    checked: false,
    sublabel: 'Sublabel',
  },
  render: args => (
    <div className="p-4">
      <DropdownSelectorItem {...args} />
    </div>
  ),
}
