import type { Meta, StoryObj } from '@storybook/react'
import { StakeInput } from './StakeInput'

const meta = {
  title: 'Components/StakeInputNew',
  component: StakeInput,
} satisfies Meta<typeof StakeInput>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    onChange: (val: string) => console.log(val),
    value: '',
    symbol: 'RIF',
    labelText: 'Amount to stake',
    currencyValue: '0 USD',
  },
}

export const WithValue: Story = {
  args: {
    onChange: (val: string) => console.log(val),
    value: '100',
    symbol: 'RIF',
    labelText: 'Amount to stake',
    currencyValue: '150 USD',
  },
}

export const DifferentToken: Story = {
  args: {
    onChange: (val: string) => console.log(val),
    value: '50',
    symbol: 'ETH',
    labelText: 'Stake amount',
    currencyValue: '125,000 USD',
  },
}

export const NoLabel: Story = {
  args: {
    onChange: (val: string) => console.log(val),
    value: '50',
    symbol: 'ETH',
    currencyValue: '125,000 USD',
  },
}

export const NoCurrency: Story = {
  args: {
    onChange: (val: string) => console.log(val),
    value: '50',
    symbol: 'ETH',
  },
}

export const NoLabelNoCurrency: Story = {
  args: {
    onChange: (val: string) => console.log(val),
    value: '50',
    symbol: 'ETH',
  },
}

export const NoLabelNoCurrencyError: Story = {
  args: {
    onChange: (val: string) => console.log(val),
    value: '50',
    symbol: 'RIF',
    error: 'This is an error message',
  },
}

export const MobileFirst: Story = {
  args: {
    onChange: (val: string) => console.log(val),
    value: '75',
    symbol: 'RIF',
    labelText: 'Mobile Stake',
    currencyValue: '112.5 USD',
  },
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
  },
}
