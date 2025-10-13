import type { Meta, StoryObj } from '@storybook/nextjs'

import { RBTC, RIF, USDRIF } from '@/lib/constants'
import { MetricBar } from './MetricBar'
import { TokenSymbol } from './types'

const meta = {
  title: 'Components/MetricBar/MetricBar',
  component: MetricBar,
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof MetricBar>

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
    value: '0.042',
    fiatValue: '4537.688',
  },
  {
    symbol: USDRIF as TokenSymbol,
    value: '980.10',
    fiatValue: '980.10',
  },
]

export const Default: Story = {
  args: {
    segments: sampleTokens,
    className: 'w-80',
  },
}
