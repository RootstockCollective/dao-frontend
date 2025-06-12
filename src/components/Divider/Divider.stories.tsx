import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { Divider } from './Divider'

const meta: Meta<typeof Divider> = {
  title: 'Components/Divider',
  component: Divider,
  tags: ['autodocs'],
}

export default meta

type Story = StoryObj<typeof Divider>

export const Default: Story = {
  args: {},
  render: args => (
    <div>
      <div>Above the divider</div>
      <Divider {...args} />
      <div>Below the divider</div>
    </div>
  ),
}

export const WithCustomClass: Story = {
  args: {
    className: 'bg-red-500 my-8',
  },
  render: args => (
    <div>
      <div>Above the divider</div>
      <Divider {...args} />
      <div>Below the divider</div>
    </div>
  ),
}
