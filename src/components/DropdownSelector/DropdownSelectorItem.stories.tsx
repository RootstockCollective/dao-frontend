import type { Meta, StoryObj } from '@storybook/react'
import { DropdownSelectorItem } from './DropdownSelectorItem'
import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu'
import { Button } from '@/components/Button'

const meta = {
  title: 'Components/DropdownSelectorItem',
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
    <div className="p-4 bg-v3-bg-accent-100 rounded">
      <DropdownSelectorItem {...args} />
    </div>
  ),
}

export const InDropdown: Story = {
  args: {
    label: 'Dropdown Item',
    checked: true,
    sublabel: 'With sublabel',
  },
  render: args => (
    <DropdownMenuPrimitive.Root>
      <DropdownMenuPrimitive.Trigger asChild>
        <Button>Open Dropdown</Button>
      </DropdownMenuPrimitive.Trigger>
      <DropdownMenuPrimitive.Portal>
        <DropdownMenuPrimitive.Content className="min-w-[220px] bg-white rounded-md p-1 shadow-md">
          <DropdownMenuPrimitive.Group>
            <DropdownMenuPrimitive.Item className="outline-none">
              <DropdownSelectorItem {...args} />
            </DropdownMenuPrimitive.Item>
            <DropdownMenuPrimitive.Item className="outline-none">
              <DropdownSelectorItem label="Another Item" checked={false} />
            </DropdownMenuPrimitive.Item>
          </DropdownMenuPrimitive.Group>
        </DropdownMenuPrimitive.Content>
      </DropdownMenuPrimitive.Portal>
    </DropdownMenuPrimitive.Root>
  ),
}
