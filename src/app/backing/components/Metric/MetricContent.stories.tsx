import type { Meta, StoryObj } from '@storybook/react'
import { expect, within } from '@storybook/test'
import { BedIcon } from 'lucide-react'
import { MetricContent } from './MetricContent'

const meta = {
  title: 'Koto/Components/MetricContent',
  component: MetricContent,
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof MetricContent>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    children: <div className="text-2xl font-bold">$1,234,567</div>,
  },
}

export const WithIcon: Story = {
  args: {
    children: (
      <div className="flex items-center gap-2">
        <BedIcon className="w-6 h-6" />
        <span className="text-2xl font-bold">1,234</span>
      </div>
    ),
  },
}

export const WithCustomClassName: Story = {
  args: {
    className: 'bg-gray-100 p-4 rounded',
    children: <div className="text-2xl font-bold">Custom Styled Content</div>,
  },
}

export const WithComplexContent: Story = {
  args: {
    children: (
      <div className="flex flex-col gap-1">
        <div className="text-2xl font-bold">$50,000</div>
        <div className="text-sm text-gray-500">+12% from last month</div>
      </div>
    ),
  },
}

export const Tested: Story = {
  args: {
    children: <div>Test content</div>,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const content = canvas.getByTestId('MetricContent')
    await expect(content).toBeInTheDocument()
  },
}
