import { Typography } from '@/components/TypographyNew/Typography'
import { TooltipProvider } from '@radix-ui/react-tooltip'
import type { Meta, StoryObj } from '@storybook/react'
import { expect, within } from '@storybook/test'
import { BedIcon, DollarSignIcon, TrendingUpIcon, UsersIcon } from 'lucide-react'
import { Metric } from './Metric'
import { MetricContent } from './MetricContent'
import { MetricTitle } from './MetricTitle'

const meta: Meta<typeof Metric> = {
  title: 'Koto/Components/Metric',
  component: Metric,
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
} satisfies Meta<typeof Metric>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    title: (
      <MetricTitle
        title="Annual backers incentives"
        info="The total value of all assets locked in the protocol"
      />
    ),
    content: (
      <div className="flex items-baseline gap-2">
        <Typography className="text-2xl font-bold">123,456.78</Typography>
        <Typography className="text-sm font-bold">USD</Typography>
      </div>
    ),
    className: 'bg-v3-bg-accent-80',
  },
}

export const WithIcon: Story = {
  args: {
    title: (
      <MetricTitle
        title="Active Users"
        info="Number of users who have interacted with the protocol in the last 30 days"
      />
    ),
    content: (
      <div className="flex items-center gap-2">
        <BedIcon className="w-6 h-6" />
        <span className="text-2xl font-bold">1,234</span>
      </div>
    ),
  },
}

export const WithCustomContent: Story = {
  args: {
    title: <MetricTitle title="Custom Metric" info="This is a custom metric with complex content" />,
    content: (
      <div className="flex flex-col gap-1">
        <div className="text-2xl font-bold">$50,000</div>
        <div className="text-sm text-gray-500">+12% from last month</div>
      </div>
    ),
  },
}

export const SimpleTextTitle: Story = {
  args: {
    title: 'Simple Text Title',
    content: <div className="text-2xl font-bold">$1,234,567</div>,
  },
}

export const WithMetricContent: Story = {
  args: {
    title: (
      <MetricTitle
        title="Using MetricContent Component"
        info="This example uses the MetricContent component"
      />
    ),
    content: (
      <MetricContent>
        <div className="text-2xl font-bold">$1,234,567</div>
      </MetricContent>
    ),
  },
}

export const WithTrendingMetric: Story = {
  args: {
    title: <MetricTitle title="Growth Rate" info="Monthly growth rate of the protocol" />,
    content: (
      <div className="flex items-center gap-2">
        <TrendingUpIcon className="w-6 h-6 text-green-500" />
        <span className="text-2xl font-bold text-green-500">+15.3%</span>
      </div>
    ),
  },
}

export const WithMultipleIcons: Story = {
  args: {
    title: (
      <div className="flex items-center gap-2">
        <UsersIcon className="w-5 h-5" />
        <Typography variant="body" className="grow not-italic leading-6 text-v3-bg-accent-0">
          Community Stats
        </Typography>
      </div>
    ),
    content: (
      <div className="flex items-center gap-2">
        <DollarSignIcon className="w-5 h-5" />
        <span className="text-2xl font-bold">$2.5M</span>
      </div>
    ),
  },
}

export const WithCustomStyling: Story = {
  args: {
    title: (
      <MetricTitle
        title="Custom Styled Metric"
        info="This metric has custom styling applied"
        className="bg-gray-100 p-2 rounded"
      />
    ),
    content: (
      <div className="bg-blue-50 p-4 rounded-lg">
        <div className="text-2xl font-bold text-blue-600">$75,000</div>
        <div className="text-sm text-blue-400">Custom styled content</div>
      </div>
    ),
  },
}

export const WithLongContent: Story = {
  args: {
    title: (
      <MetricTitle
        title="Detailed Statistics"
        info="This metric shows detailed statistics with multiple lines of information"
      />
    ),
    content: (
      <div className="flex flex-col gap-2">
        <div className="text-2xl font-bold">$1,234,567</div>
        <div className="text-sm text-gray-500">Total Value Locked</div>
        <div className="text-sm text-gray-500">Across 5 different protocols</div>
        <div className="text-sm text-gray-500">Updated every 24 hours</div>
      </div>
    ),
  },
}

export const Tested: Story = {
  args: {
    title: <MetricTitle title="Test Metric" info="Test info" />,
    content: <div>Test content</div>,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const metric = canvas.getByTestId('Metric')
    await expect(metric).toBeInTheDocument()
  },
}
