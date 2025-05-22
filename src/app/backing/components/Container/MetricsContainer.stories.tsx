import type { Meta, StoryObj } from '@storybook/react'
import { MetricsContainer } from './MetricsContainer'

const meta = {
  title: 'Koto/Container/MetricsContainer',
  component: MetricsContainer,
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof MetricsContainer>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    dataTestid: 'test',
    children: (
      <>
        <div className="text-2xl font-bold">100</div>
        <div className="text-sm text-gray-500">Total Metrics</div>
      </>
    ),
  },
}

export const WithCustomClassName: Story = {
  args: {
    dataTestid: 'test',
    className: 'bg-gray-100',
    children: (
      <>
        <div className="text-2xl font-bold">100</div>
        <div className="text-sm text-gray-500">Total Metrics</div>
      </>
    ),
  },
}
