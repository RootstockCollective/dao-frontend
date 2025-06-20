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
      options: ['select', 'edit', 'delete', 'view'],
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

export const Primary: Story = {
  args: {
    actionType: 'select',
    onClick: () => console.log('Primary action clicked'),
  },
}

export const Select: Story = {
  args: {
    actionType: 'select',
    onClick: () => console.log('Select action clicked'),
  },
}

export const Edit: Story = {
  args: {
    actionType: 'edit',
    onClick: () => console.log('Edit action clicked'),
  },
}

export const Delete: Story = {
  args: {
    actionType: 'delete',
    onClick: () => console.log('Delete action clicked'),
  },
}

export const View: Story = {
  args: {
    actionType: 'view',
    onClick: () => console.log('View action clicked'),
  },
}

export const WithCustomClassName: Story = {
  args: {
    actionType: 'select',
    className: 'bg-blue-50 border-blue-200',
    onClick: () => console.log('Custom styled action clicked'),
  },
}
