import type { Meta, StoryObj } from '@storybook/nextjs'

import { RequestStatusStepper } from './RequestStatusStepper'

const meta = {
  title: 'BTC Vault/TransactionDetail/RequestStatusStepper',
  component: RequestStatusStepper,
  parameters: {
    layout: 'padded',
  },
  decorators: [
    Story => (
      <div className="bg-bg-80 rounded p-6 max-w-2xl">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof RequestStatusStepper>

export default meta

type Story = StoryObj<typeof meta>

export const DepositPending: Story = {
  args: { status: 'pending', type: 'deposit' },
}

export const DepositClaimable: Story = {
  args: { status: 'claimable', type: 'deposit' },
}

export const DepositDone: Story = {
  args: { status: 'done', type: 'deposit' },
}

export const DepositFailed: Story = {
  args: { status: 'failed', type: 'deposit' },
}

export const WithdrawalPending: Story = {
  args: { status: 'pending', type: 'withdrawal' },
}

export const WithdrawalClaimable: Story = {
  args: { status: 'claimable', type: 'withdrawal' },
}

export const WithdrawalDone: Story = {
  args: { status: 'done', type: 'withdrawal' },
}

export const WithdrawalFailed: Story = {
  args: { status: 'failed', type: 'withdrawal' },
}

export const DepositCancelled: Story = {
  args: { status: 'cancelled', type: 'deposit' },
}

export const WithdrawalCancelled: Story = {
  args: { status: 'cancelled', type: 'withdrawal' },
}
