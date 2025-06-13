import type { Meta, StoryObj } from '@storybook/react'
import { TotalBackingMetric } from './TotalBackingMetric'

const meta: Meta<typeof TotalBackingMetric> = {
  title: 'Backing/TotalBackingMetric',
  component: TotalBackingMetric,
  parameters: {
    layout: 'centered',
  },
}

export default meta
type Story = StoryObj<typeof TotalBackingMetric>

export const WithTotalBacking: Story = {
  args: {
    totalBacking: 5000,
  },
}

export const NoTotalBacking: Story = {
  args: {
    totalBacking: 0,
  },
}
