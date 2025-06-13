import type { Meta, StoryObj } from '@storybook/react'
import { Dropdown } from './Dropdown'
import { DropdownSelectableItem } from './DropdownSelectableItem'
import { Button } from '@/components/Button'
import { useState } from 'react'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'

const meta: Meta<typeof Dropdown> = {
  title: 'components/DropdownV3',
  component: Dropdown,
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    title: { control: 'text' },
    align: {
      control: { type: 'select' },
      options: ['start', 'center', 'end'],
    },
    className: { control: 'text' },
  },
}

export default meta

type Story = StoryObj<typeof Dropdown>

const defaultOptions = [
  { id: '1', label: 'Option 1' },
  { id: '2', label: 'Option 2', sublabel: 'Description 2' },
  { id: '3', label: 'Option 3', sublabel: 'Description 3' },
]

const SelectionTemplate = (args: any) => {
  const [selected, setSelected] = useState<string[]>(['1'])

  const handleItemClick = (itemId: string) => {
    setSelected(prev => (prev.includes(itemId) ? prev.filter(id => id !== itemId) : [...prev, itemId]))
  }

  return (
    <Dropdown {...args} trigger={<Button>Select Options</Button>}>
      {defaultOptions.map(item => (
        <DropdownMenu.Item
          key={item.id}
          className="outline-none"
          onSelect={e => {
            e.preventDefault()
            handleItemClick(item.id)
          }}
        >
          <DropdownSelectableItem
            label={item.label}
            sublabel={item.sublabel}
            checked={selected.includes(item.id)}
          />
        </DropdownMenu.Item>
      ))}
    </Dropdown>
  )
}

export const Selection: Story = {
  render: SelectionTemplate,
  args: {
    title: 'Select Options',
    align: 'end',
    className: '',
  },
}

const MenuTemplate = (args: any) => {
  return (
    <Dropdown {...args} trigger={<Button>Open Menu</Button>}>
      <DropdownMenu.Item className="outline-none px-2 py-1 hover:bg-v3-bg-accent-200 rounded">
        Menu Item 1
      </DropdownMenu.Item>
      <DropdownMenu.Item className="outline-none px-2 py-1 hover:bg-v3-bg-accent-200 rounded">
        Menu Item 2
      </DropdownMenu.Item>
      <DropdownMenu.Separator className="h-px bg-v3-bg-accent-200 my-1" />
      <DropdownMenu.Item className="outline-none px-2 py-1 hover:bg-v3-bg-accent-200 rounded">
        Menu Item 3
      </DropdownMenu.Item>
    </Dropdown>
  )
}

export const Menu: Story = {
  render: MenuTemplate,
  args: {
    title: 'Menu',
    align: 'end',
    className: '',
  },
}

const CustomContentTemplate = (args: any) => {
  return (
    <Dropdown {...args} trigger={<Button>Custom Content</Button>}>
      <div className="p-4">
        <h3 className="text-lg font-semibold mb-2">Custom Content</h3>
        <p className="text-sm text-v3-bg-accent-0">This dropdown can contain any content you want.</p>
        <div className="mt-4 flex gap-2">
          <Button variant="secondary">Action 1</Button>
          <Button variant="secondary">Action 2</Button>
        </div>
      </div>
    </Dropdown>
  )
}

export const CustomContent: Story = {
  render: CustomContentTemplate,
  args: {
    align: 'end',
    className: '',
  },
}
