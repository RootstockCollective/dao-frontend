import type { Meta, StoryObj } from '@storybook/react'
import { ClaimRewardRadioOption } from './ClaimRewardRadioOption'
import { useState } from 'react'
import { ClaimRewardType } from './types'
import * as RadioGroup from '@radix-ui/react-radio-group'
import { TokenImage } from '@/components/TokenImage'
import { RBTC, RIF } from '@/lib/constants'

// Create a wrapper component that provides the RadioGroup context
const ClaimRewardRadioOptionWrapper = (props: any) => {
  const [selectedValue, setSelectedValue] = useState<ClaimRewardType>(props.value || 'all')

  const handleValueChange = (value: string) => {
    setSelectedValue(value as ClaimRewardType)
  }

  return (
    <RadioGroup.Root
      className="flex gap-2 w-full max-w-md"
      value={selectedValue}
      onValueChange={handleValueChange}
    >
      <ClaimRewardRadioOption {...props} />
    </RadioGroup.Root>
  )
}

const meta: Meta<typeof ClaimRewardRadioOptionWrapper> = {
  title: 'CollectiveRewards/ClaimRewardRadioOption',
  component: ClaimRewardRadioOptionWrapper,
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    value: {
      control: { type: 'radio' },
      options: ['all', 'rif', 'rbtc'],
      description: 'The value of the radio option',
    },
    isLoading: {
      control: { type: 'boolean' },
      description: 'Whether the option is in loading state',
    },
  },
}

export default meta

type Story = StoryObj<typeof ClaimRewardRadioOptionWrapper>

export const Default: Story = {
  args: {
    value: 'all',
    label: 'All Rewards',
    subLabel: '$375.75 USD',
    isLoading: false,
  },
}

export const Loading: Story = {
  args: {
    ...Default.args,
    isLoading: true,
  },
}

export const RIFToken: Story = {
  args: {
    value: 'rif',
    label: (
      <div className="flex items-center gap-2">
        1,000 RIF
        <TokenImage symbol={RIF} size={16} />
      </div>
    ),
    subLabel: '$250.50 USD',
    isLoading: false,
  },
}

export const RBTCSelected: Story = {
  args: {
    value: 'rbtc',
    label: (
      <div className="flex items-center gap-2">
        0.005 RBTC
        <TokenImage symbol={RBTC} size={18} />
      </div>
    ),
    subLabel: '$125.25 USD',
    isLoading: false,
  },
}

export const WithLongLabel: Story = {
  args: {
    value: 'all',
    label: 'All Available Rewards (Including Staking and Governance)',
    subLabel: '$375.75 USD (Total Value)',
    isLoading: false,
  },
}

export const WithLongSubLabel: Story = {
  args: {
    value: 'rif',
    label: '1,000 RIF',
    subLabel: '$250.50 USD (Current Market Value - Updated 5 minutes ago)',
    isLoading: false,
  },
}

export const ComplexLabel: Story = {
  args: {
    value: 'rbtc',
    label: (
      <div className="flex items-center gap-2">
        <span>0.005 RBTC</span>
        <TokenImage symbol={RBTC} size={18} />
        <span className="text-sm text-v3-bg-accent-0">(Bitcoin on Rootstock)</span>
      </div>
    ),
    subLabel: '$125.25 USD',
    isLoading: false,
  },
}

export const SelectedState: Story = {
  args: {
    value: 'all',
    label: 'All Rewards',
    subLabel: '$375.75 USD',
    isLoading: false,
  },
  parameters: {
    docs: {
      description: {
        story: 'This option is pre-selected to show the selected state styling.',
      },
    },
  },
}

export const LoadingWithToken: Story = {
  args: {
    value: 'rif',
    label: (
      <div className="flex items-center gap-2">
        1,000 RIF
        <TokenImage symbol={RIF} size={16} />
      </div>
    ),
    subLabel: '$250.50 USD',
    isLoading: true,
  },
}

export const MinimalContent: Story = {
  args: {
    value: 'all',
    label: 'All',
    subLabel: '$100',
    isLoading: false,
  },
}
