import type { Meta, StoryObj } from '@storybook/react'
import { Legend } from './Legend'

const meta: Meta<typeof Legend> = {
  title: 'Components/Legend',
  component: Legend,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof Legend>

export const Default: Story = {
  args: {
    title: 'Legend:',
    items: [
      {
        key: '1',
        label: 'Item 1',
        displayColor: '#FF0000',
      },
      {
        key: '2',
        label: 'Item 2',
        displayColor: '#00FF00',
      },
      {
        key: '3',
        label: 'Item 3',
        displayColor: '#0000FF',
      },
    ],
  },
}

export const SingleItem: Story = {
  args: {
    title: 'Single Item legend:',
    items: [
      {
        key: '1',
        label: 'Single Item',
        displayColor: '#FF0000',
      },
    ],
  },
}

export const CustomClassName: Story = {
  args: {
    title: 'Custom Styling',
    className: 'bg-gray-100 p-4 rounded-lg',
    items: [
      {
        key: '1',
        label: 'Custom Style',
        displayColor: '#FF0000',
      },
      {
        key: '2',
        label: 'Custom Style',
        displayColor: '#00FF00',
      },
    ],
  },
}
