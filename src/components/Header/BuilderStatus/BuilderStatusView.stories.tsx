import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { BuilderStatusView } from './BuilderStatusView'

const meta: Meta<typeof BuilderStatusView> = {
  title: 'Components/Header/BuilderStatus',
  component: BuilderStatusView,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    builderState: {
      control: { type: 'select' },
      options: ['active', 'inProgress'],
      description: 'The current state of the builder',
    },
  },
}

export default meta

type Story = StoryObj<typeof BuilderStatusView>

export const ActiveBuilder: Story = {
  args: {
    builderState: 'active',
  },
  render: args => <BuilderStatusView {...args} />,
}

export const InProgressBuilder: Story = {
  args: {
    builderState: 'inProgress',
  },
  render: args => <BuilderStatusView {...args} />,
}

export const Default: Story = {
  args: {
    builderState: 'active',
  },
}
