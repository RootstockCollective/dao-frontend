import type { Meta, StoryObj } from '@storybook/react'
import { MetricsContainer } from './MetricsContainer'

const meta = {
  title: 'Koto/Backing/Container/MetricsContainer',
  component: MetricsContainer,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof MetricsContainer>

export default meta
type Story = StoryObj<typeof meta>

export const WithSingleMetric: Story = {
  args: {
    children: (
      <div className="text-center">
        <div className="text-3xl font-bold">1,234</div>
        <div className="text-sm text-gray-500">Total Users</div>
      </div>
    ),
  },
}

export const WithMultipleMetrics: Story = {
  args: {
    children: (
      <div className="space-y-6 text-center">
        <div>
          <div className="text-3xl font-bold">1,234</div>
          <div className="text-sm text-gray-500">Total Users</div>
        </div>
        <div>
          <div className="text-3xl font-bold">56.7%</div>
          <div className="text-sm text-gray-500">Engagement Rate</div>
        </div>
      </div>
    ),
  },
}

export const WithCustomStyling: Story = {
  args: {
    children: (
      <div className="text-center">
        <div className="text-3xl font-bold text-blue-600">$9,876</div>
        <div className="text-sm text-blue-400">Revenue</div>
      </div>
    ),
    className: 'bg-blue-50 border-2 border-blue-200',
  },
}
