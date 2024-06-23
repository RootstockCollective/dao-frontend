import type { Meta, StoryObj } from '@storybook/react'
import { MetricsCard } from './MetricsCard'

const meta = {
  title: 'Components/MetricsCard',
  component: MetricsCard,
} satisfies Meta<typeof MetricsCard>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    title: 'Avg cost per Proposal',
    amount: '136.26 RIF',
    fiatAmount: '= $ USD 14,045',
  },
}
