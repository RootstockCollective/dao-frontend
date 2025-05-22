import type { Meta, StoryObj } from '@storybook/react'
import { expect, within } from '@storybook/test'
import { BedIcon } from 'lucide-react'
import { MetricTitleText } from './MetricTitleText'

const meta = {
  title: 'Koto/Components/MetricTitleText',
  component: MetricTitleText,
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof MetricTitleText>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    dataTestId: 'TVL',
    text: 'Annual backers incentives',
  },
}

export const WithReactNode: Story = {
  args: {
    dataTestId: 'TVL',
    text: (
      <div className="flex items-center gap-2">
        <BedIcon className="w-4 h-4" />
        <span>Custom Title with Icon</span>
      </div>
    ),
  },
}

export const WithCustomStyledText: Story = {
  args: {
    dataTestId: 'TVL',
    text: <span className="text-blue-500">Custom Styled Title</span>,
  },
}

export const WithLongText: Story = {
  args: {
    dataTestId: 'TVL',
    text: 'This is a very long title that might wrap to multiple lines in the UI',
  },
}

export const Tested: Story = {
  args: {
    dataTestId: 'TVL',
    text: 'Test Title',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const title = canvas.getByTestId('TVL_MetricTitleText')
    await expect(title).toBeInTheDocument()
  },
}
