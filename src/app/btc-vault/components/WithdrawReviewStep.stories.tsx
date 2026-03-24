import type { Meta, StoryObj } from '@storybook/nextjs'
import { action } from 'storybook/actions'

import { RBTC } from '@/lib/constants'
import { PricesContext } from '@/shared/context'

import { WithdrawReviewStep } from './WithdrawReviewStep'

const mockPrices = {
  [RBTC]: { price: 100000, lastUpdated: '2026-01-01T00:00:00Z' },
}

const meta = {
  title: 'BTC Vault/WithdrawReviewStep',
  component: WithdrawReviewStep,
  parameters: {
    layout: 'centered',
  },
  decorators: [
    Story => (
      <PricesContext.Provider value={{ prices: mockPrices }}>
        <div className="w-[600px] min-h-[400px] flex">
          <Story />
        </div>
      </PricesContext.Provider>
    ),
  ],
  args: {
    onBack: action('onBack'),
    onSubmit: action('onSubmit'),
  },
} satisfies Meta<typeof WithdrawReviewStep>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    amount: '500',
    rbtcEquivalent: '0.51',
    withdrawalFee: '0',
    isSubmitting: false,
  },
}

export const LargeWithdrawal: Story = {
  args: {
    amount: '10000',
    rbtcEquivalent: '10.2',
    withdrawalFee: '2',
    isSubmitting: false,
  },
}

export const Submitting: Story = {
  args: {
    amount: '500',
    rbtcEquivalent: '0.51',
    withdrawalFee: '0',
    isSubmitting: true,
  },
}

export const WithFee: Story = {
  args: {
    amount: '1000',
    rbtcEquivalent: '0.98',
    withdrawalFee: '2',
    isSubmitting: false,
  },
}
