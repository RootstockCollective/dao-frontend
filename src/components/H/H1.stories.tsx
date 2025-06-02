import type { Meta, StoryObj } from '@storybook/react'
import { H1 } from './H1'

const meta: Meta<typeof H1> = {
  title: 'Koto/H1',
  component: H1,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof H1>

export const Default: Story = {
  args: {
    children: 'BACKING',
  },
}

export const WithSubtitle: Story = {
  args: {
    children: (
      <div className="flex flex-col items-start gap-1">
        <span className="text-[2rem] font-bold uppercase text-white">BACKING</span>
        <span className="text-sm text-v3-text-200">Subtitle or supporting text goes here.</span>
      </div>
    ),
    className: 'text-left',
  },
}

export const WithCustomClassName: Story = {
  args: {
    children: 'Custom Styled Heading',
    className: 'text-blue-500',
  },
}

export const LongText: Story = {
  args: {
    children: 'This is a longer heading text that might wrap to multiple lines',
  },
}
