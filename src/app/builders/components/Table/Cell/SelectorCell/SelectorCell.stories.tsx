import type { Meta, StoryObj } from '@storybook/react'
import { SelectorCell } from './SelectorCell'

const meta = {
  title: 'Koto/Builders/Table/Cell/SelectorCell',
  component: SelectorCell,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    isSelected: {
      control: 'boolean',
      description: 'Whether the cell is selected',
    },
    isHovered: {
      control: 'boolean',
      description: 'Whether the cell is being hovered',
    },
    children: {
      control: 'text',
      description: 'Content to display in the cell',
    },
  },
} satisfies Meta<typeof SelectorCell>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    children: <div className="w-20 h-20 bg-yellow-500 rounded-full" />,
    isSelected: false,
    isHovered: false,
  },
}
