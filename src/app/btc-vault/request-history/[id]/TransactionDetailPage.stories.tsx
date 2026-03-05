import type { Meta, StoryObj } from '@storybook/nextjs'

import { Button } from '@/components/Button'
import { Header } from '@/components/Typography'

import type { RequestStatus, RequestType } from '../../services/types'
import type { RequestDetailDisplay } from '../../services/ui/types'
import { RequestDetailGrid, RequestStatusStepper } from './components'

interface TransactionDetailPreviewProps {
  detail: RequestDetailDisplay
  status: RequestStatus
  type: RequestType
}

function TransactionDetailPreview({ detail, status, type }: TransactionDetailPreviewProps) {
  return (
    <div className="flex flex-col items-start w-full gap-6">
      <Header variant="h2" caps className="text-100">
        {detail.typeLabel.toUpperCase()} REQUEST
      </Header>
      <div className="bg-bg-80 rounded py-8 px-4 md:p-6 w-full flex flex-col gap-6">
        <RequestStatusStepper status={status} type={type} />
        <RequestDetailGrid detail={detail} />
        {detail.canCancel && (
          <Button variant="secondary-outline" onClick={() => {}}>
            Cancel request
          </Button>
        )}
      </div>
    </div>
  )
}

const meta = {
  title: 'BTC Vault/TransactionDetailPage',
  component: TransactionDetailPreview,
  parameters: {
    layout: 'fullscreen',
  },
  decorators: [
    Story => (
      <div className="w-full p-6">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof TransactionDetailPreview>

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

export const PendingDeposit: Story = {
  args: {
    detail: makeDetail({
      type: 'deposit',
      typeLabel: 'Deposit',
      status: 'pending',
      canCancel: true,
    }),
    status: 'pending',
    type: 'deposit',
  },
}

export const PendingWithdrawal: Story = {
  args: {
    detail: makeDetail({
      type: 'withdrawal',
      typeLabel: 'Withdrawal',
      status: 'pending',
      amountFormatted: '1.25',
      sharesFormatted: '1.25',
      canCancel: true,
    }),
    status: 'pending',
    type: 'withdrawal',
  },
}

export const ClaimableWithdrawal: Story = {
  args: {
    detail: makeDetail({
      type: 'withdrawal',
      typeLabel: 'Withdrawal',
      status: 'claimable',
      amountFormatted: '1.25',
      sharesFormatted: '1.25',
      lastUpdatedFormatted: '21 May 2025',
      claimable: true,
      lockedSharePriceFormatted: '1.02/share',
    }),
    status: 'claimable',
    type: 'withdrawal',
  },
}

export const DoneDeposit: Story = {
  args: {
    detail: makeDetail({
      type: 'deposit',
      typeLabel: 'Deposit',
      status: 'done',
      amountFormatted: '2',
      sharesFormatted: '1.96',
      lastUpdatedFormatted: '30 May 2025',
    }),
    status: 'done',
    type: 'deposit',
  },
}

export const FailedWithdrawal: Story = {
  args: {
    detail: makeDetail({
      type: 'withdrawal',
      typeLabel: 'Withdrawal',
      status: 'failed',
      amountFormatted: '0.25',
      sharesFormatted: '0.25',
      lastUpdatedFormatted: '15 Jun 2025',
    }),
    status: 'failed',
    type: 'withdrawal',
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
      canCancel: true,
    }),
    status: 'pending',
    type: 'deposit',
  },
}
