import type { Meta, StoryObj } from '@storybook/react'
import { TokenAmount } from './TokenAmount'

const meta = {
  title: 'Components/TokenAmount',
  component: TokenAmount,
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    amount: {
      control: 'text',
      description: 'The token amount to display',
    },
    tokenSymbol: {
      control: 'text',
      description: 'The token symbol (RIF, RBTC, etc.)',
    },
    amountInFiat: {
      control: 'text',
      description: 'The fiat equivalent amount',
    },
  },
} satisfies Meta<typeof TokenAmount>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    amount: '1,234.56',
    tokenSymbol: 'RIF',
    amountInFiat: '$1,234.56',
  },
}

export const LargeAmount: Story = {
  args: {
    amount: '1,000,000.00',
    tokenSymbol: 'RIF',
    amountInFiat: '$1,000,000.00',
  },
}

export const SmallAmount: Story = {
  args: {
    amount: '0.001',
    tokenSymbol: 'RIF',
    amountInFiat: '$0.001',
  },
}

export const RBTC: Story = {
  args: {
    amount: '0.5',
    tokenSymbol: 'RBTC',
    amountInFiat: '$15,000.00',
  },
}

export const TRIF: Story = {
  args: {
    amount: '5,000.00',
    tokenSymbol: 'TRIF',
    amountInFiat: '$5,000.00',
  },
}

export const STRIF: Story = {
  args: {
    amount: '10,000.00',
    tokenSymbol: 'STRIF',
    amountInFiat: '$10,000.00',
  },
}

export const TRBTC: Story = {
  args: {
    amount: '0.1',
    tokenSymbol: 'TRBTC',
    amountInFiat: '$3,000.00',
  },
}

export const UnknownToken: Story = {
  args: {
    amount: '100.00',
    tokenSymbol: 'UNKNOWN',
    amountInFiat: '$100.00',
  },
}

export const ZeroAmount: Story = {
  args: {
    amount: '0.00',
    tokenSymbol: 'RIF',
    amountInFiat: '$0.00',
  },
}

export const WithDecimals: Story = {
  args: {
    amount: '1,234.567890',
    tokenSymbol: 'RIF',
    amountInFiat: '$1,234.57',
  },
}
