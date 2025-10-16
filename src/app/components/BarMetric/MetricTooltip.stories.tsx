import type { Meta, StoryObj } from '@storybook/nextjs'

import { RBTC, RIF, USDRIF } from '@/lib/constants'
import { MetricTooltip } from './MetricTooltip'
import { TokenSymbol } from './types'

const meta = {
  title: 'Components/BarMetric/MetricTooltip',
  component: MetricTooltip,
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    tokens: {
      control: { type: 'object' },
      description: 'Collection of token metrics displayed inside the tooltip',
    },
  },
} satisfies Meta<typeof MetricTooltip>

export default meta

type Story = StoryObj<typeof meta>

const sampleTokens = [
  {
    symbol: RIF as TokenSymbol,
    value: '1250.34',
    fiatValue: '1250.34',
  },
  {
    symbol: RBTC as TokenSymbol,
    value: '0.42',
    fiatValue: '27335.18',
  },
  {
    symbol: USDRIF as TokenSymbol,
    value: '980.10',
    fiatValue: '980.10',
  },
]

export const ThreeTokens: Story = {
  args: {
    tokens: sampleTokens,
  },
}

export const TwoTokens: Story = {
  args: {
    tokens: [sampleTokens[0], sampleTokens[1]],
  },
}

export const SingleToken: Story = {
  args: {
    tokens: [sampleTokens[0]],
  },
}

// Might want to figure out what to show in this case @roger
export const NoTokens: Story = {
  args: {
    tokens: [],
  },
}
