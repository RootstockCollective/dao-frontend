'use client'

import { Button } from '@/components/Button'
import { Header } from '@/components/Typography'

import type { RequestStatus, RequestType } from '../../../services/types'
import type { RequestDetailDisplay } from '../../../services/ui/types'
import { RequestDetailGrid } from './RequestDetailGrid'
import { RequestStatusStepper } from './RequestStatusStepper'

export interface TransactionDetailViewProps {
  detail: RequestDetailDisplay
  status: RequestStatus
  type: RequestType
  onCancel?: () => void
}

export function TransactionDetailView({ detail, status, type, onCancel }: TransactionDetailViewProps) {
  return (
    <div data-testid="transaction-detail-page" className="flex flex-col items-start w-full gap-6">
      <Header variant="h2" caps className="text-100">
        {detail.typeLabel.toUpperCase()} REQUEST
      </Header>
      <div className="bg-bg-80 rounded py-8 px-4 md:p-6 w-full flex flex-col gap-6">
        <RequestStatusStepper status={status} type={type} />
        <RequestDetailGrid detail={detail} />
        {detail.claimable && (
          <Button variant="primary" data-testid="claim-button" onClick={() => {}}>
            {detail.type === 'deposit' ? 'Claim Shares' : 'Claim rBTC'}
          </Button>
        )}
        {detail.canCancel && (
          <Button variant="secondary-outline" data-testid="cancel-request-button" onClick={onCancel}>
            Cancel request
          </Button>
        )}
      </div>
    </div>
  )
}
