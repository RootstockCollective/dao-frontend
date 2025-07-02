import type { Meta, StoryObj } from '@storybook/react'
import { BuilderRewards } from './BuilderRewards'

const meta: Meta<typeof BuilderRewards> = {
  title: 'Builders/BuilderRewards',
  component: BuilderRewards,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    className: {
      control: 'text',
      description: 'Additional CSS classes',
    },
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {},
}

export const WithCustomClass: Story = {
  args: {
    className: 'p-4 bg-gray-100 rounded-lg',
  },
}
