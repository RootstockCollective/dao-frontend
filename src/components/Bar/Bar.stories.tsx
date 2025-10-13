import type { Meta, StoryObj } from '@storybook/nextjs'

import { Bar } from './Bar'
import { BarDivider } from './BarDivider'
import { BarSegment } from './BarSegment'

const meta = {
  title: 'Components/Bar',
  component: Bar,
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof Bar>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: args => (
    <Bar className="w-72 h-1" {...args}>
      <BarSegment
        position="left"
        className="bg-v3-rif-blue border-v3-rif-blue "
        style={{
          flexBasis: '30%',
        }}
      />
      <BarDivider />
      <BarSegment
        position="center"
        className=" bg-v3-primary border-v3-primary"
        style={{
          flexBasis: '20%',
        }}
      />
      <BarDivider />
      <BarSegment
        position="right"
        className="bg-v3-rif-blue border-v3-rif-blue"
        style={{
          flexBasis: '50%',
        }}
      />
    </Bar>
  ),
}
