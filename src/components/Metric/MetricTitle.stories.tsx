import { TooltipProvider } from '@radix-ui/react-tooltip'
import type { Meta, StoryObj } from '@storybook/react'
import { expect, within } from '@storybook/test'
import { MetricTitle } from './MetricTitle'

const meta: Meta<typeof MetricTitle> = {
  title: 'Koto/Components/Metric/MetricTitle',
  component: MetricTitle,
  parameters: {
    layout: 'centered',
  },
  decorators: [
    Story => (
      <TooltipProvider>
        <Story />
      </TooltipProvider>
    ),
  ],
} satisfies Meta<typeof MetricTitle>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    title: 'Annual backers incentives',
    info: 'The total value of all assets locked in the protocol',
  },
}

export const WithCustomClassName: Story = {
  args: {
    title: 'Annual backers incentives',
    info: 'The total value of all assets locked in the protocol',
    className: 'bg-gray-100 text-black p-2 rounded',
  },
}

export const WithReactNodeTitle: Story = {
  args: {
    title: <span className="text-blue-500">Custom Title Component</span>,
    info: 'The total value of all assets locked in the protocol',
  },
}

export const Tested: Story = {
  args: {
    title: 'Test Title',
    info: 'Test Info',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const title = canvas.getByTestId('MetricTitle')
    await expect(title).toBeInTheDocument()
  },
}
