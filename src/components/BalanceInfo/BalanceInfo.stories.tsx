import type { Meta, StoryObj } from '@storybook/react'
import { BalanceInfo } from './BalanceInfo'
import { Popover } from '@/components/Popover'
import { Label } from '@/components/TypographyNew'
import { KotoQuestionMarkIcon } from '@/components/Icons'

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
    titlePopover: (
      <Popover trigger="hover" content={<Label variant="body-s">RIF token info</Label>}>
        <KotoQuestionMarkIcon className="mb-1 hover:cursor-help" />
      </Popover>
    ),
    amount: '999,999,999',
    symbol: 'RIF',
    fiatAmount: '999,999.99 USD',
  },
}

export const StRIF: Story = {
  args: {
    title: 'stRIF',
    titlePopover: (
      <Popover trigger="hover" content={<Label variant="body-s">stRIF token info</Label>}>
        <KotoQuestionMarkIcon className="mb-1 hover:cursor-help" />
      </Popover>
    ),
    amount: '999,999,999',
    symbol: 'stRIF',
    fiatAmount: '999,999.99 USD',
  },
}

export const USDRIF: Story = {
  args: {
    title: 'USDRIF',
    titlePopover: (
      <Popover trigger="hover" content={<Label variant="body-s">USDRIF token info</Label>}>
        <KotoQuestionMarkIcon className="mb-1 hover:cursor-help" />
      </Popover>
    ),
    amount: '999,999.99',
    symbol: 'USDRIF',
    fiatAmount: '999,999.99 USD',
  },
}

export const RBTC: Story = {
  args: {
    title: 'rBTC',
    titlePopover: (
      <Popover trigger="hover" content={<Label variant="body-s">rBTC token info</Label>}>
        <KotoQuestionMarkIcon className="mb-1 hover:cursor-help" />
      </Popover>
    ),
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
    titlePopover: (
      <Popover
        trigger="hover"
        content={
          <>
            <Label variant="body-s">Total value locked</Label>
            <Label variant="body-s"> (Total stRIF + Treasury)</Label>
          </>
        }
      >
        <KotoQuestionMarkIcon className="mb-1 hover:cursor-help" />
      </Popover>
    ),
    amount: '999,999,999.99',
    symbol: 'USD',
    fiatAmount: '999,999,999.99 USD',
  },
}
