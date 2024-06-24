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
    borderless: false,
  },
}

export const WithoutFiatAmount: Story = {
  args: {
    title: 'Total voting power delegated',
    amount: '230',
  },
}

export const Borderless: Story = {
  args: {
    title: 'My voting power',
    amount: '235,23m',
    borderless: true,
  },
}
