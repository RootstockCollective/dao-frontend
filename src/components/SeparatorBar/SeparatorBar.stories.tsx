import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import SeparatorBar from './SeparatorBar'

const meta: Meta<typeof SeparatorBar> = {
  title: 'Components/SeparatorBar',
  component: SeparatorBar,
  tags: ['autodocs'],
}

export default meta

type Story = StoryObj<typeof SeparatorBar>

export const Default: Story = {
  args: {},
  render: args => (
    <div className="flex items-center">
      <span>Item 1</span>
      <SeparatorBar {...args} />
      <span>Item 2</span>
    </div>
  ),
}
