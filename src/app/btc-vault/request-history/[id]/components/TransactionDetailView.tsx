'use client'

import { ConditionalTooltip } from '@/app/components/Tooltip/ConditionalTooltip'
import { Button } from '@/components/Button'
import { Header } from '@/components/Typography'
import { cn } from '@/lib/utils'

import { BTC_VAULT_CLAIM_IN_PROGRESS_MESSAGE } from '../../../constants'
import type { RequestStatus, RequestType } from '../../../services/types'
import type { DisplayStatus, RequestDetailDisplay } from '../../../services/ui/types'
import { RequestDetailGrid } from './RequestDetailGrid'
import { RequestStatusStepper } from './RequestStatusStepper'

export interface TransactionDetailViewProps {
  detail: RequestDetailDisplay
  status: RequestStatus
  type: RequestType
  displayStatus?: DisplayStatus
  onClaim?: () => void
  isClaimPending?: boolean
  onCancel?: () => void
}

export function TransactionDetailView({
  detail,
  status,
  type,
  displayStatus,
  onClaim,
  isClaimPending,
  onCancel,
}: TransactionDetailViewProps) {
  return (
    <div data-testid="transaction-detail-page" className="flex flex-col items-start w-full gap-6">
      <Header variant="h2" caps className="text-100">
        {detail.typeLabel.toUpperCase()} REQUEST
      </Header>
      <div className="bg-bg-80 rounded py-8 px-4 md:p-6 w-full flex flex-col gap-6">
        <RequestStatusStepper status={status} type={type} displayStatus={displayStatus} />
        <RequestDetailGrid detail={detail} />
        {detail.claimable &&
          (isClaimPending ? (
            <ConditionalTooltip
              supportMobileTap
              className="p-0"
              conditionPairs={[
                {
                  condition: () => true,
                  lazyContent: () => BTC_VAULT_CLAIM_IN_PROGRESS_MESSAGE,
                },
              ]}
            >
              <span className="inline-block w-full cursor-default md:w-fit">
                <Button
                  variant="primary"
                  className={cn('pointer-events-none')}
                  data-testid="claim-button"
                  aria-disabled
                  aria-busy
                  tabIndex={-1}
                >
                  Claiming...
                </Button>
              </span>
            </ConditionalTooltip>
          ) : (
            <Button variant="primary" data-testid="claim-button" onClick={onClaim} disabled={!onClaim}>
              {detail.type === 'deposit' ? 'Claim Shares' : 'Claim rBTC'}
            </Button>
          ))}
        {detail.canCancel && (
          <Button variant="secondary-outline" data-testid="cancel-request-button" onClick={onCancel}>
            Cancel request
          </Button>
        )}
      </div>
    </div>
  )
}
