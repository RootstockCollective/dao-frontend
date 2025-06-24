import type { Meta, StoryObj } from '@storybook/react'
import { SelectorCell } from './'

const meta = {
  title: 'Components/SelectorCell',
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
    children: <div style={{ width: 100, height: 100, backgroundColor: '#DDDD00', borderRadius: '50%' }} />,
    isSelected: false,
    isHovered: false,
  },
}
