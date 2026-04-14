import type { Meta, StoryObj } from '@storybook/nextjs'
import { action } from 'storybook/actions'

import { RBTC } from '@/lib/constants'
import { PricesContext } from '@/shared/context'

import { DepositReviewStep } from './DepositReviewStep'

const mockPrices = {
  [RBTC]: { price: 100000, lastUpdated: '2026-01-01T00:00:00Z' },
}

const meta = {
  title: 'BTC Vault/DepositReviewStep',
  component: DepositReviewStep,
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
} satisfies Meta<typeof DepositReviewStep>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    amount: '0.5',
    estimatedShares: '490.19',
    depositFee: '0',
    isSubmitting: false,
  },
}

export const LargeDeposit: Story = {
  args: {
    amount: '10.75',
    estimatedShares: '10535',
    depositFee: '2',
    isSubmitting: false,
  },
}

export const Submitting: Story = {
  args: {
    amount: '1',
    estimatedShares: '980.39',
    depositFee: '0',
    isSubmitting: true,
  },
}

export const ZeroFee: Story = {
  args: {
    amount: '0.001',
    estimatedShares: '0.98',
    depositFee: '0',
    isSubmitting: false,
  },
}
