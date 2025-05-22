import type { Meta, StoryObj } from '@storybook/react'
import { expect, within } from '@storybook/test'
import { BedIcon } from 'lucide-react'
import { MetricTitle } from './MetricTitle'

const meta = {
  title: 'Koto/Components/MetricTitle',
  component: MetricTitle,
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof MetricTitle>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    dataTestId: 'TVL',
    title: 'Annual backers incentives',
    info: 'The total value of all assets locked in the protocol',
  },
}

export const WithCustomClassName: Story = {
  args: {
    dataTestId: 'TVL',
    title: 'Annual backers incentives',
    info: 'The total value of all assets locked in the protocol',
    className: 'bg-gray-100 text-black p-2 rounded',
  },
}

export const WithReactNodeTitle: Story = {
  args: {
    dataTestId: 'TVL',
    title: <span className="text-blue-500">Custom Title Component</span>,
    info: 'The total value of all assets locked in the protocol',
  },
}

export const WithReactNodeInfo: Story = {
  args: {
    dataTestId: 'TVL',
    title: 'Annual backers incentives',
    info: (
      <div className="p-2">
        <BedIcon />
      </div>
    ),
  },
}

export const Tested: Story = {
  args: {
    dataTestId: 'TVL',
    title: 'Test Title',
    info: 'Test Info',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const title = canvas.getByTestId('TVL_MetricTitle')
    await expect(title).toBeInTheDocument()
  },
}
