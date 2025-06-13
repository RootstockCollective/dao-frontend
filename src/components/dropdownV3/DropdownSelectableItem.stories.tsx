import type { Meta, StoryObj } from '@storybook/react'
import { DropdownSelectableItem } from './DropdownSelectableItem'

const meta: Meta<typeof DropdownSelectableItem> = {
  title: 'components/DropdownV3SelectableItem',
  component: DropdownSelectableItem,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof DropdownSelectableItem>

export const Default: Story = {
  args: {
    label: 'Option 1',
    checked: false,
  },
}

export const Checked: Story = {
  args: {
    label: 'Option 2',
    checked: true,
  },
}

export const WithSublabel: Story = {
  args: {
    label: 'Option 3',
    sublabel: 'Additional info',
    checked: false,
  },
}
