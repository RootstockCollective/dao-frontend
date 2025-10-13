import type { Meta, StoryObj } from '@storybook/nextjs'

import { RBTC, RIF, USDRIF } from '@/lib/constants'
import { MetricTooltipContent } from './MetricTooltipContent'
import { TokenSymbol } from './types'

const meta = {
  title: 'Components/MetricBar/MetricTooltip',
  component: MetricTooltipContent,
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    tokens: {
      control: { type: 'object' },
      description: 'Collection of token metrics displayed inside the tooltip',
    },
  },
} satisfies Meta<typeof MetricTooltipContent>

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
    tokens: sampleTokens.map((token, index) => ({ ...token, fade: index < 2 })),
  },
}

export const TwoTokens: Story = {
  args: {
    tokens: sampleTokens.slice(0, 2).map((token, index) => ({ ...token, fade: index < 1 })),
  },
}

export const OneToken: Story = {
  args: {
    tokens: sampleTokens.slice(0, 1),
  },
}

export const NoTokens: Story = {
  args: {
    tokens: [],
  },
}
