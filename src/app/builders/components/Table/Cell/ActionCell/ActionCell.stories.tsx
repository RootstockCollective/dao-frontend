import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { ActionCell } from './ActionCell'
import { AlertProvider } from '@/app/providers/AlertProvider'

const meta: Meta<typeof ActionCell> = {
  title: 'Components/TableNew/ActionCell',
  component: ActionCell,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'A table cell component that shows action buttons with toggle functionality. Shows vertical dots when closed and cross when open.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    actionType: {
      control: 'select',
      options: ['removeBacking', 'adjustBacking', 'backBuilder'],
      description: 'The type of action this cell represents',
    },
    onClick: {
      action: 'clicked',
      description: 'Callback function called when the action is clicked',
    },
    className: {
      control: 'text',
      description: 'Additional CSS classes to apply to the cell',
    },
  },
}

export default meta

type Story = StoryObj<typeof meta>

export const RemoveBacking: Story = {
  args: {
    actionType: 'removeBacking',
    onClick: () => alert('Remove backing action clicked'),
  },
}

export const AdjustBacking: Story = {
  args: {
    actionType: 'adjustBacking',
    onClick: () => alert('Adjust backing action clicked'),
  },
}

export const BackBuilder: Story = {
  args: {
    actionType: 'backBuilder',
    onClick: () => alert('Back builder action clicked'),
  },
}
