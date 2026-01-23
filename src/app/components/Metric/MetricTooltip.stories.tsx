import type { Meta, StoryObj } from '@storybook/nextjs'

import { RBTC, RIF, USDRIF } from '@/lib/constants'
import { MetricTooltipContent } from './MetricTooltipContent'
import { TokenSymbol } from './types'
import Big from 'big.js'

const meta = {
  title: 'Components/MetricBar/MetricTooltipContent',
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
    fiatValue: Big(1250.34),
  },
  {
    symbol: RBTC as TokenSymbol,
    value: '0.42',
    fiatValue: Big(27335.18),
  },
  {
    symbol: USDRIF as TokenSymbol,
    value: '980.10',
    fiatValue: Big(980.1),
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

export const VeryDifferentValues: Story = {
  args: {
    tokens: [
      {
        symbol: RIF as TokenSymbol,
        value: '10000.00000000',
        fiatValue: Big(10000.0),
      },
      {
        symbol: RBTC as TokenSymbol,
        value: '0.1',
        fiatValue: Big(0.1),
        fade: true,
      },
      {
        symbol: USDRIF as TokenSymbol,
        value: '0.50000000000006',
        fiatValue: Big(0.5),
        fade: true,
      },
    ],
  },
}
