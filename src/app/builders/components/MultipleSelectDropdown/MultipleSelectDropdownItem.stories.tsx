import { MultipleSelectDropdownItem } from '@/app/builders/components/MultipleSelectDropdown/MultipleSelectDropdownItem'
import type { Meta, StoryObj } from '@storybook/react'

const meta = {
  title: 'Builders/MultipleSelectDropdownItem',
  component: MultipleSelectDropdownItem,
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
} satisfies Meta<typeof MultipleSelectDropdownItem>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    label: 'Basic Item',
    checked: false,
    sublabel: 'Sublabel',
  },
  render: args => (
    <div className="p-4 bg-v3-bg-accent-100 rounded">
      <MultipleSelectDropdownItem {...args} />
    </div>
  ),
}
