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
      { name: 'Category A', value: 40, color: 'red' },
      { name: 'Category B', value: 25, color: 'green' },
      { name: 'Category C', value: 35, color: 'blue' },
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
        color: 'violet',
      },
      { name: 'Consectetur adipisicing elit. Sunt ipsum recusandae', value: 5_670_999, color: 'red' },
      {
        name: 'Sunt ipsum recusandae vitae atque dolor quas consequatur',
        value: 9_800_999,
        color: 'coral',
      },
      {
        name: 'Lorem ipsum dolor sit amet consectetur',
        value: 999_999_999_999,
        color: 'green',
      },
      { name: 'Consectetur adipisicing elit. Sunt ipsum recusandae', value: 5_670_999, color: 'orange' },
    ],
  },
  render: args => (
    <div className="p-4 bg-text-80">
      <PizzaChartDetails {...args} />
    </div>
  ),
}
