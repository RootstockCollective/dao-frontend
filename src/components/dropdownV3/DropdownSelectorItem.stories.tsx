import type { Meta, StoryObj } from '@storybook/react'
import { DropdownSelectorItem } from './DropdownSelectorItem'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { Button } from '@/components/Button'

const meta = {
  title: 'Components/DropdownV3/DropdownSelectorItem',
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
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <Button>Open Dropdown</Button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content className="min-w-[220px] bg-white rounded-md p-1 shadow-md">
          <DropdownMenu.Group>
            <DropdownMenu.Item className="outline-none">
              <DropdownSelectorItem {...args} />
            </DropdownMenu.Item>
            <DropdownMenu.Item className="outline-none">
              <DropdownSelectorItem label="Another Item" checked={false} />
            </DropdownMenu.Item>
          </DropdownMenu.Group>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  ),
}
