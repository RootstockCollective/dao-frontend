import type { Meta, StoryObj } from '@storybook/react'
import { PizzaChartDetails } from './PizzaChartDetails'

const meta = {
  title: 'Components/PizzaChart/PizzaChartDetails',
  component: PizzaChartDetails,
  tags: ['autodocs'],
} satisfies Meta<typeof PizzaChartDetails>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    segments: [
      { name: 'Category A', value: 40 },
      { name: 'Category B', value: 25 },
      { name: 'Category C', value: 35 },
    ],
  },
}

export const WithCustomColors: Story = {
  args: {
    segments: [
      { name: 'For', value: 12_340_999, color: 'black' },
      { name: 'Against', value: 5_670_999, color: 'red' },
      { name: 'Abstain', value: 9_800_999, color: 'green' },
    ],
  },
}

export const OnLightBackgroundWithLongContents: Story = {
  args: {
    segments: [
      {
        name: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit.',
        value: 12_340_999,
      },
      { name: 'Consectetur adipisicing elit. Sunt ipsum recusandae', value: 5_670_999 },
      {
        name: 'Sunt ipsum recusandae vitae atque dolor quas consequatur',
        value: 9_800_999,
      },
      {
        name: 'Lorem ipsum dolor sit amet consectetur',
        value: 999_999_999_999,
      },
      { name: 'Consectetur adipisicing elit. Sunt ipsum recusandae', value: 5_670_999 },
    ],
  },
  render: args => (
    <div className="p-4 bg-text-80">
      <PizzaChartDetails {...args} />
    </div>
  ),
}
