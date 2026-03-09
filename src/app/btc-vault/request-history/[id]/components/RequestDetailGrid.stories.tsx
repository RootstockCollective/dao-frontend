import type { Meta, StoryObj } from '@storybook/nextjs'

import type { RequestDetailDisplay } from '../../../services/ui/types'
import { RequestDetailGrid } from './RequestDetailGrid'

const meta = {
  title: 'BTC Vault/TransactionDetail/RequestDetailGrid',
  component: RequestDetailGrid,
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
} satisfies Meta<typeof RequestDetailGrid>

export default meta

type Story = StoryObj<typeof meta>

function makeDetail(overrides: Partial<RequestDetailDisplay> = {}): RequestDetailDisplay {
  return {
    id: 'req-1',
    type: 'deposit',
    typeLabel: 'Deposit',
    amountFormatted: '0.5',
    status: 'pending',
    createdAtFormatted: '14 Nov 2023',
    lastUpdatedFormatted: '14 Nov 2023',
    claimable: false,
    lockedSharePriceFormatted: null,
    finalizeId: null,
    epochId: '1',
    batchRedeemId: null,
    sharesFormatted: '—',
    usdEquivalentFormatted: '$12,345 USD',
    addressShort: '0xf39F...9266',
    addressFull: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb29266',
    submitTxShort: '0xaabb...ccdd',
    submitTxFull: '0xaabbccddeeff00112233445566778899aabbccddeeff00112233445566778899',
    canCancel: false,
    ...overrides,
  }
}

export const DepositPending: Story = {
  args: {
    detail: makeDetail({
      type: 'deposit',
      typeLabel: 'Deposit',
      status: 'pending',
      amountFormatted: '0.5',
      sharesFormatted: '—',
    }),
  },
}

export const DepositClaimable: Story = {
  args: {
    detail: makeDetail({
      type: 'deposit',
      typeLabel: 'Deposit',
      status: 'claimable',
      amountFormatted: '1',
      sharesFormatted: '0.98',
      lastUpdatedFormatted: '18 Feb 2025',
    }),
  },
}

export const DepositDone: Story = {
  args: {
    detail: makeDetail({
      type: 'deposit',
      typeLabel: 'Deposit',
      status: 'done',
      amountFormatted: '2',
      sharesFormatted: '1.96',
      lastUpdatedFormatted: '30 May 2025',
    }),
  },
}

export const DepositFailed: Story = {
  args: {
    detail: makeDetail({
      type: 'deposit',
      typeLabel: 'Deposit',
      status: 'failed',
      amountFormatted: '0.1',
      sharesFormatted: '—',
      lastUpdatedFormatted: '5 Jul 2025',
    }),
  },
}

export const WithdrawalPending: Story = {
  args: {
    detail: makeDetail({
      type: 'withdrawal',
      typeLabel: 'Withdrawal',
      status: 'pending',
      amountFormatted: '1.25',
      sharesFormatted: '1.25',
    }),
  },
}

export const WithdrawalClaimable: Story = {
  args: {
    detail: makeDetail({
      type: 'withdrawal',
      typeLabel: 'Withdrawal',
      status: 'claimable',
      amountFormatted: '1.25',
      sharesFormatted: '1.25',
      lastUpdatedFormatted: '21 May 2025',
      claimable: true,
    }),
  },
}

export const WithdrawalDone: Story = {
  args: {
    detail: makeDetail({
      type: 'withdrawal',
      typeLabel: 'Withdrawal',
      status: 'done',
      amountFormatted: '3',
      sharesFormatted: '2.94',
      lastUpdatedFormatted: '12 Jun 2025',
    }),
  },
}

export const WithdrawalFailed: Story = {
  args: {
    detail: makeDetail({
      type: 'withdrawal',
      typeLabel: 'Withdrawal',
      status: 'failed',
      amountFormatted: '0.25',
      sharesFormatted: '0.25',
      lastUpdatedFormatted: '15 Jun 2025',
    }),
  },
}

export const NoTxHash: Story = {
  args: {
    detail: makeDetail({
      type: 'deposit',
      typeLabel: 'Deposit',
      status: 'pending',
      submitTxShort: null,
      submitTxFull: null,
    }),
  },
}

export const NoUsdEquivalent: Story = {
  args: {
    detail: makeDetail({
      type: 'withdrawal',
      typeLabel: 'Withdrawal',
      status: 'pending',
      amountFormatted: '0.5',
      sharesFormatted: '0.5',
      usdEquivalentFormatted: null,
    }),
  },
}

export const WithUsdEquivalent: Story = {
  args: {
    detail: makeDetail({
      type: 'withdrawal',
      typeLabel: 'Withdrawal',
      status: 'claimable',
      amountFormatted: '1.5',
      sharesFormatted: '1.5',
      usdEquivalentFormatted: '$142,500 USD',
    }),
  },
}

export const DepositCancelled: Story = {
  args: {
    detail: makeDetail({
      type: 'deposit',
      typeLabel: 'Deposit',
      status: 'cancelled',
      amountFormatted: '0.5',
      sharesFormatted: '—',
      lastUpdatedFormatted: '20 Aug 2025',
    }),
  },
}

export const WithdrawalCancelled: Story = {
  args: {
    detail: makeDetail({
      type: 'withdrawal',
      typeLabel: 'Withdrawal',
      status: 'cancelled',
      amountFormatted: '1.25',
      sharesFormatted: '1.25',
      lastUpdatedFormatted: '20 Aug 2025',
    }),
  },
}
