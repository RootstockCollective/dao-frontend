import type { Meta, StoryObj } from '@storybook/react'
import { ClaimRewardsModalView } from './ClaimRewardsModalView'
import { getTokens } from '@/lib/tokens'
import { useState } from 'react'

const tokens = getTokens()

// Create a wrapper component that handles dynamic state
const ClaimRewardsModalViewWrapper = (props: any) => {
  const [selectedRewardType, setSelectedRewardType] = useState(props.selectedRewardType || 'all')

  return (
    <ClaimRewardsModalView
      {...props}
      selectedRewardType={selectedRewardType}
      onRewardTypeChange={setSelectedRewardType}
    />
  )
}

const meta: Meta<typeof ClaimRewardsModalViewWrapper> = {
  title: 'CollectiveRewards/ClaimRewardsModalView',
  component: ClaimRewardsModalViewWrapper,
  parameters: {
    layout: 'centered',
    backgrounds: {
      default: 'pattern',
      values: [
        {
          name: 'pattern',
          value: 'repeating-linear-gradient(45deg, #f0f0f0 0px, #f0f0f0 10px, #e0e0e0 10px, #e0e0e0 20px)',
        },
      ],
    },
  },
  argTypes: {
    selectedRewardType: {
      control: { type: 'radio' },
      options: ['all', ...Object.keys(tokens)],
      description: 'The selected reward type for claiming',
    },
    isClaimable: {
      control: { type: 'boolean' },
      description: 'Whether rewards are currently claimable',
    },
    isLoading: {
      control: { type: 'boolean' },
      description: 'Whether the modal is in loading state',
    },
    isTxPending: {
      control: { type: 'boolean' },
      description: 'Whether a transaction is pending',
    },
  },
}

export default meta

type Story = StoryObj<typeof ClaimRewardsModalViewWrapper>

export const Default: Story = {
  args: {
    onClose: () => alert('Modal closed'),
    selectedRewardType: 'all',
    tokenAmounts: {
      rif: 1000000000000000000000n,
      rbtc: 5000000000000000000n,
    },
    tokenFiatAmounts: {
      rif: 250.5,
      rbtc: 125.25,
    },
    totalFiatAmount: 375.75,
    onClaim: () => alert('Claiming rewards...'),
    isClaimable: true,
    isLoading: false,
    isTxPending: false,
    tokens,
  },
}

export const ModalLoading: Story = {
  args: {
    ...Default.args,
    isLoading: true,
  },
}

export const TransactionPending: Story = {
  args: {
    ...Default.args,
    isTxPending: true,
  },
}

export const NotClaimable: Story = {
  args: {
    ...Default.args,
    isClaimable: false,
  },
}

export const RIFSelected: Story = {
  args: {
    ...Default.args,
    selectedRewardType: 'rif',
  },
}

export const BTCSelected: Story = {
  args: {
    ...Default.args,
    selectedRewardType: 'rbtc',
  },
}
