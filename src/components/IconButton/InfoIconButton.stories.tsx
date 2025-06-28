import type { Meta, StoryObj } from '@storybook/react'
import { InfoIconButton } from './InfoIconButton'

const meta = {
  title: 'Backing/Components/IconButton/InfoIconButton',
  component: InfoIconButton,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof InfoIconButton>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    content: 'This is some helpful information',
  },
}

export const LongText: Story = {
  args: {
    content:
      'This is a longer piece of information that explains something in more detail. It might wrap to multiple lines in the popover.',
  },
}

export const WithCustomClassName: Story = {
  args: {
    content: 'Information with custom styling',
    className: 'bg-gray-100 p-2 rounded-md',
  },
}
