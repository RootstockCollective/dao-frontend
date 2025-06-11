import type { Meta, StoryObj } from '@storybook/react'
import { PizzaChart } from './PizzaChart'

const meta = {
  title: 'Components/PizzaChart/PizzaChart',
  component: PizzaChart,
  tags: ['autodocs'],
} satisfies Meta<typeof PizzaChart>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    values: [
      { name: 'Category A', value: 40 },
      { name: 'Category B', value: 25 },
      { name: 'Category C', value: 35 },
    ],
  },
}

export const WithCustomColors: Story = {
  args: {
    values: [
      { name: 'For', value: 12_340_999, color: '#1BC47D' },
      { name: 'Against', value: 5_670_999, color: '#FF6688' },
      { name: 'Abstain', value: 9_800_999, color: '#DEFF1A' },
    ],
  },
}
