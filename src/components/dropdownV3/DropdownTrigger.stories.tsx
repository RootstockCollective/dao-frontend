import type { Meta, StoryObj } from '@storybook/react'
import { DropdownTrigger } from './DropdownTrigger'
import { useState } from 'react'

const meta = {
  title: 'DropdownV3/DropdownTrigger',
  component: DropdownTrigger,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    className: {
      control: 'text',
      description: 'Optional CSS class name for custom styling',
    },
    onClick: {
      action: 'clicked',
      description: 'Click handler for the trigger',
    },
  },
} satisfies Meta<typeof DropdownTrigger>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    'aria-expanded': false,
    'aria-haspopup': true,
    className: '',
  },
  render: args => {
    const [isOpen, setIsOpen] = useState(false)
    return (
      <div className="p-4 bg-v3-bg-primary">
        <DropdownTrigger {...args} aria-expanded={isOpen} onClick={() => setIsOpen(!isOpen)} />
      </div>
    )
  },
}
