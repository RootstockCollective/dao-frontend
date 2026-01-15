import type { Meta, StoryObj } from '@storybook/nextjs'
import { SwapInputComponent, SwapInputToken } from './SwapInputComponent'
import { useState } from 'react'

const meta: Meta<typeof SwapInputComponent> = {
  title: 'Components/SwapInputComponent',
  component: SwapInputComponent,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    tokens: {
      control: 'object',
      description: 'Array of available tokens to select from',
    },
    selectedToken: {
      control: 'object',
      description: 'Currently selected token',
    },
    onTokenChange: {
      action: 'tokenChanged',
      description: 'Callback when token selection changes',
    },
    amount: {
      control: 'text',
      description: 'Current amount value',
    },
    onAmountChange: {
      action: 'amountChanged',
      description: 'Callback when amount changes',
    },
    balance: {
      control: 'text',
      description: 'User balance for the selected token',
    },
    onPercentageClick: {
      action: 'percentageClicked',
      description: 'Callback when percentage button is clicked',
    },
    isLoading: {
      control: 'boolean',
      description: 'Show skeleton loading state',
    },
    readonly: {
      control: 'boolean',
      description: 'Make input readonly (for displaying amountOut)',
    },
    labelText: {
      control: 'text',
      description: 'Label text above the input',
    },
    errorText: {
      control: 'text',
      description: 'Error message to display',
    },
  },
}

export default meta

const mockTokens: SwapInputToken[] = [
  {
    symbol: 'USDT0',
    address: '0x0000000000000000000000000000000000000000',
    name: 'Tether USD',
    decimals: 6,
    price: 1.0,
  },
  {
    symbol: 'USDRIF',
    address: '0x0000000000000000000000000000000000000001',
    name: 'USD RIF',
    decimals: 18,
    price: 1.0,
  },
  {
    symbol: 'RIF',
    address: '0x0000000000000000000000000000000000000002',
    name: 'RIF Token',
    decimals: 18,
    price: 0.5,
  },
]

type Story = StoryObj<typeof meta>

const DefaultWrapper = () => {
  const [selectedToken, setSelectedToken] = useState<SwapInputToken>(mockTokens[0])
  const [amount, setAmount] = useState('')

  const handlePercentageClick = (percentage: number) => {
    const balance = '1000.0'
    const newAmount = (parseFloat(balance) * percentage).toString()
    setAmount(newAmount)
  }

  return (
    <div className="w-[500px]">
      <SwapInputComponent
        tokens={mockTokens}
        selectedToken={selectedToken}
        onTokenChange={setSelectedToken}
        amount={amount}
        onAmountChange={setAmount}
        balance="1000.0"
        onPercentageClick={handlePercentageClick}
        labelText="Amount to swap"
      />
    </div>
  )
}

export const Default: Story = {
  render: () => <DefaultWrapper />,
}

const ReadonlyWrapper = () => {
  const [selectedToken] = useState<SwapInputToken>(mockTokens[1])

  return (
    <div className="w-[500px]">
      <SwapInputComponent
        tokens={mockTokens}
        selectedToken={selectedToken}
        onTokenChange={() => {}}
        amount="500.0"
        onAmountChange={() => {}}
        balance="1000.0"
        readonly={true}
        labelText="You will receive"
      />
    </div>
  )
}

export const Readonly: Story = {
  render: () => <ReadonlyWrapper />,
}

const LoadingWrapper = () => {
  const [selectedToken] = useState<SwapInputToken>(mockTokens[0])

  return (
    <div className="w-[500px]">
      <SwapInputComponent
        tokens={mockTokens}
        selectedToken={selectedToken}
        onTokenChange={() => {}}
        amount=""
        onAmountChange={() => {}}
        isLoading={true}
      />
    </div>
  )
}

export const Loading: Story = {
  render: () => <LoadingWrapper />,
}

const WithErrorWrapper = () => {
  const [selectedToken, setSelectedToken] = useState<SwapInputToken>(mockTokens[0])
  const [amount, setAmount] = useState('1500.0')

  return (
    <div className="w-[500px]">
      <SwapInputComponent
        tokens={mockTokens}
        selectedToken={selectedToken}
        onTokenChange={setSelectedToken}
        amount={amount}
        onAmountChange={setAmount}
        balance="1000.0"
        labelText="Amount to swap"
        errorText="Insufficient balance"
      />
    </div>
  )
}

export const WithError: Story = {
  render: () => <WithErrorWrapper />,
}

const WithoutBalanceWrapper = () => {
  const [selectedToken, setSelectedToken] = useState<SwapInputToken>(mockTokens[0])
  const [amount, setAmount] = useState('')

  return (
    <div className="w-[500px]">
      <SwapInputComponent
        tokens={mockTokens}
        selectedToken={selectedToken}
        onTokenChange={setSelectedToken}
        amount={amount}
        onAmountChange={setAmount}
        labelText="Amount to swap"
      />
    </div>
  )
}

export const WithoutBalance: Story = {
  render: () => <WithoutBalanceWrapper />,
}

const singleToken: SwapInputToken[] = [
  {
    symbol: 'USDT0',
    address: '0x0000000000000000000000000000000000000000',
    name: 'Tether USD',
    decimals: 6,
    price: 1.0,
  },
]

const SingleTokenWrapper = () => {
  const [selectedToken] = useState<SwapInputToken>(singleToken[0])
  const [amount, setAmount] = useState('')

  const handlePercentageClick = (percentage: number) => {
    const balance = '1000.0'
    const newAmount = (parseFloat(balance) * percentage).toString()
    setAmount(newAmount)
  }

  return (
    <div className="w-[500px]">
      <SwapInputComponent
        tokens={singleToken}
        selectedToken={selectedToken}
        onTokenChange={() => {}}
        amount={amount}
        onAmountChange={setAmount}
        balance="1000.0"
        onPercentageClick={handlePercentageClick}
        labelText="Amount to swap"
      />
    </div>
  )
}

export const SingleToken: Story = {
  render: () => <SingleTokenWrapper />,
}
