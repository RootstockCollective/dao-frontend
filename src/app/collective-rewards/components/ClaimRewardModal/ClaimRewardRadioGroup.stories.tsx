import type { Meta, StoryObj } from '@storybook/react'
import { ClaimRewardRadioGroup } from './ClaimRewardRadioGroup'
import { useState } from 'react'
import { RBTC, RIF } from '@/lib/constants'
import { ClaimRewardType } from './types'

// Mock tokens data to avoid reading from environment variables
const mockTokens = {
  rif: {
    address: '0x2acc95758f8b5f583470ba265eb685a8f45fc9d5' as const,
    symbol: RIF,
  },
  rbtc: {
    address: '0xf7ab6cfaebbadfe8b5494022c4c6db776bd63b6b' as const,
    symbol: RBTC,
  },
}

// Create a wrapper component that handles dynamic state
const ClaimRewardRadioGroupWrapper = (props: any) => {
  const [selectedValue, setSelectedValue] = useState<ClaimRewardType>(props.value || 'all')

  return <ClaimRewardRadioGroup {...props} value={selectedValue} onValueChange={setSelectedValue} />
}

const meta: Meta<typeof ClaimRewardRadioGroupWrapper> = {
  title: 'CollectiveRewards/ClaimRewardRadioGroup',
  component: ClaimRewardRadioGroupWrapper,
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    value: {
      control: { type: 'radio' },
      options: ['all', ...Object.keys(mockTokens)],
      description: 'The selected reward type',
    },
    isLoading: {
      control: { type: 'boolean' },
      description: 'Whether the radio group is in loading state',
    },
    className: {
      control: { type: 'text' },
      description: 'Additional CSS classes',
    },
  },
}

export default meta

type Story = StoryObj<typeof ClaimRewardRadioGroupWrapper>

// Default options with all rewards and individual tokens
const defaultOptions = [
  {
    value: 'all' as ClaimRewardType,
    label: 'All Rewards',
    subLabel: '$375.75 USD',
  },
  {
    value: 'rif' as ClaimRewardType,
    label: '1,000 RIF',
    subLabel: '$250.50 USD',
  },
  {
    value: 'rbtc' as ClaimRewardType,
    label: '0.005 RBTC',
    subLabel: '$125.25 USD',
  },
]

export const Default: Story = {
  args: {
    value: 'all',
    options: defaultOptions,
    isLoading: false,
  },
}

export const Loading: Story = {
  args: {
    ...Default.args,
    isLoading: true,
  },
}

export const RIFSelected: Story = {
  args: {
    ...Default.args,
    value: 'rif',
  },
}

export const BTCSelected: Story = {
  args: {
    ...Default.args,
    value: 'rbtc',
  },
}

export const WithCustomStyling: Story = {
  args: {
    ...Default.args,
    className: 'max-w-md',
  },
}

export const SingleOption: Story = {
  args: {
    ...Default.args,
    options: [
      {
        value: 'all' as ClaimRewardType,
        label: 'All Rewards',
        subLabel: '$375.75 USD',
      },
    ],
  },
}

export const MultipleTokens: Story = {
  args: {
    ...Default.args,
    options: [
      {
        value: 'all' as ClaimRewardType,
        label: 'All Rewards',
        subLabel: '$1,250.00 USD',
      },
      {
        value: 'rif' as ClaimRewardType,
        label: '5,000 RIF',
        subLabel: '$1,000.00 USD',
      },
      {
        value: 'rbtc' as ClaimRewardType,
        label: '0.025 RBTC',
        subLabel: '$250.00 USD',
      },
    ],
  },
}

export const WithLongLabels: Story = {
  args: {
    ...Default.args,
    options: [
      {
        value: 'all' as ClaimRewardType,
        label: 'All Available Rewards',
        subLabel: '$375.75 USD (Total Value)',
      },
      {
        value: 'rif' as ClaimRewardType,
        label: '1,000 RIF Tokens',
        subLabel: '$250.50 USD (Current Market Value)',
      },
      {
        value: 'rbtc' as ClaimRewardType,
        label: '0.005 RBTC (Bitcoin on Rootstock)',
        subLabel: '$125.25 USD (Current Market Value)',
      },
    ],
  },
}
