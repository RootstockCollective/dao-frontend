import type { Meta, StoryObj } from '@storybook/nextjs'

import { Bar } from './Bar'
import { BarDivider } from './BarDivider'
import { BarRoot } from './BarRoot'
import { BarSegment } from './BarSegment'

const meta = {
  title: 'Components/Bar',
  component: Bar,
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    className: {
      control: 'text',
      description: 'Tailwind classes applied to the bar container',
    },
  },
} satisfies Meta<typeof Bar>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <BarRoot>
      <Bar className="w-72 h-1 gap-[0.1875rem]">
        <BarSegment position="left" className="flex-[3] bg-v3-rif-blue border-v3-rif-blue " />
        <BarDivider />
        <BarSegment position="center" className="flex-[2] bg-v3-primary border-v3-primary" />
        <BarDivider />
        <BarSegment position="right" className="flex-1 bg-v3-rif-blue border-v3-rif-blue" />
      </Bar>
    </BarRoot>
  ),
}
