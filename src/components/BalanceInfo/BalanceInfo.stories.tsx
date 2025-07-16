import type { Meta, StoryObj } from '@storybook/react'
import { BalanceInfo } from './BalanceInfo'
import { Label } from '@/components/TypographyNew'

const meta: Meta<typeof BalanceInfo> = {
  title: 'Koto/DAO/BalanceInfo',
  component: BalanceInfo,
  parameters: {
    layout: 'centered',
  },
}
export default meta

type Story = StoryObj<typeof BalanceInfo>

export const RIF: Story = {
  args: {
    title: 'RIF',
    tooltipContent: <Label variant="body-s">RIF token info</Label>,
    amount: '999,999,999',
    symbol: 'RIF',
    fiatAmount: '999,999.99 USD',
  },
}

export const StRIF: Story = {
  args: {
    title: 'stRIF',
    tooltipContent: <Label variant="body-s">stRIF token info</Label>,
    amount: '999,999,999',
    symbol: 'stRIF',
    fiatAmount: '999,999.99 USD',
  },
}

export const USDRIF: Story = {
  args: {
    title: 'USDRIF',
    tooltipContent: <Label variant="body-s">USDRIF token info</Label>,
    amount: '999,999.99',
    symbol: 'USDRIF',
    fiatAmount: '999,999.99 USD',
  },
}

export const RBTC: Story = {
  args: {
    title: 'rBTC',
    tooltipContent: <Label variant="body-s">rBTC token info</Label>,
    amount: '9.999999',
    symbol: 'rBTC',
    fiatAmount: '999,999.99 USD',
  },
}

export const TotalStRIF: Story = {
  args: {
    title: 'Total stRIF',
    amount: '999,999,999,999',
    symbol: 'stRIF',
    fiatAmount: '999,999,999.99 USD',
  },
}

export const Treasury: Story = {
  args: {
    title: 'Treasury',
    amount: '999,999,999.99',
    symbol: 'USD',
    fiatAmount: undefined,
  },
}

export const TVL: Story = {
  args: {
    title: 'TVL',
    tooltipContent: (
      <>
        <Label variant="body-s">Total value locked</Label>
        <Label variant="body-s"> (Total stRIF + Treasury)</Label>
      </>
    ),
    amount: '999,999,999.99',
    symbol: 'USD',
    fiatAmount: '999,999,999.99 USD',
  },
}
