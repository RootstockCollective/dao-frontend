import type { Meta, StoryObj } from '@storybook/react'
import { Raw } from './Raw'

const meta: Meta<typeof Raw> = {
  title: 'Components/Raw',
  component: Raw,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof Raw>

export const Default: Story = {
  args: {},
}
