import type { Meta, StoryObj } from '@storybook/react'
import { ActionMetricsContainer } from './ActionMetricsContainer'

const meta = {
  title: 'Koto/Components/Container/ActionMetricsContainer',
  component: ActionMetricsContainer,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof ActionMetricsContainer>

export default meta
type Story = StoryObj<typeof meta>

export const WithSingleAction: Story = {
  args: {
    className: 'bg-v3-bg-accent-80',
    children: (
      <div className="flex items-center gap-4">
        <div className="text-center">
          <div className="text-2xl font-bold">Action 1</div>
          <div className="text-sm text-gray-500">Status: Active</div>
        </div>
        <button className="px-4 py-2 bg-blue-500 text-white rounded">Execute</button>
      </div>
    ),
  },
}

export const WithMultipleActions: Story = {
  args: {
    className: 'bg-v3-bg-accent-80',
    children: (
      <div className="flex gap-8">
        <div className="flex items-center gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold">Action 1</div>
            <div className="text-sm text-gray-500">Status: Active</div>
          </div>
          <button className="px-4 py-2 bg-blue-500 text-white rounded">Execute</button>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold">Action 2</div>
            <div className="text-sm text-gray-500">Status: Pending</div>
          </div>
          <button className="px-4 py-2 bg-gray-500 text-white rounded" disabled>
            Execute
          </button>
        </div>
      </div>
    ),
  },
}

export const WithCustomStyling: Story = {
  args: {
    className: 'bg-blue-50 border-2 border-blue-200',
    children: (
      <div className="flex items-center gap-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">Custom Action</div>
          <div className="text-sm text-blue-400">Special Status</div>
        </div>
      </div>
    ),
  },
}
