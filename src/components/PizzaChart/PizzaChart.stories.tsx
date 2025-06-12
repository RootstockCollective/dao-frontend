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
    segments: [
      { name: 'Category A', value: 5 },
      { name: 'Category B', value: 5 },
      { name: 'Category C', value: 5 },
    ],
  },
}

export const Disabled: Story = {
  args: {
    disabled: true,
    segments: [
      { name: 'Category A', value: 5 },
      { name: 'Category B', value: 5 },
      { name: 'Category C', value: 5 },
    ],
  },
  render(args) {
    return (
      <div className="flex justify-end">
        <PizzaChart {...args} />
      </div>
    )
  },
}

export const WithCustomColors: Story = {
  args: {
    segments: [
      { name: 'For', value: 50_000_000, color: 'red' },
      { name: 'Against', value: 25_000_000, color: 'green' },
      { name: 'Abstain', value: 25_000_000, color: 'blue' },
    ],
  },
  render(args) {
    return (
      <div className="flex justify-center">
        <PizzaChart {...args} />
      </div>
    )
  },
}

export const ChartWithSingleValue: Story = {
  args: {
    segments: [
      { name: 'Category A', value: 1 },
      { name: 'Category B', value: 0 },
      { name: 'Category C', value: 0 },
    ],
  },
}

export const ChartWithZeroValues: Story = {
  args: {
    segments: [
      { name: 'Category A', value: 0 },
      { name: 'Category B', value: 0 },
      { name: 'Category C', value: 0 },
    ],
  },
}
