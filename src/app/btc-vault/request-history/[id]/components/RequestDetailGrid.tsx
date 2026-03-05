'use client'

import { ShortenAndCopy } from '@/components/ShortenAndCopy/ShortenAndCopy'
import { TokenImage } from '@/components/TokenImage'
import { Label, Span } from '@/components/Typography'
import { RBTC } from '@/lib/constants'

import type { RequestDetailDisplay } from '../../../services/ui/types'

interface RequestDetailGridProps {
  detail: RequestDetailDisplay
}

export function RequestDetailGrid({ detail }: RequestDetailGridProps) {
  return (
    <div data-testid="request-detail-grid" className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <div className="flex flex-col gap-1">
        <Label variant="tag" className="text-bg-0">
          Request type
        </Label>
        <Span variant="body-l" className="text-100">
          {detail.typeLabel}
        </Span>
      </div>

      <div className="flex flex-col gap-1">
        <Label variant="tag" className="text-bg-0">
          Shares requested
        </Label>
        <Span variant="body-l" className="text-100">
          {detail.sharesFormatted}
        </Span>
      </div>

      <div className="flex flex-col gap-1">
        <Label variant="tag" className="text-bg-0">
          Shares value
        </Label>
        <div className="flex flex-col">
          <div className="flex items-center gap-1">
            <Span variant="body-l" className="text-100">
              {detail.amountFormatted}
            </Span>
            <TokenImage symbol={RBTC} size={16} />
            <Span variant="body-l" className="text-100">
              {RBTC}
            </Span>
          </div>
          {detail.usdEquivalentFormatted && (
            <Span variant="body-xs" bold className="text-bg-0">
              {detail.usdEquivalentFormatted}
            </Span>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <Label variant="tag" className="text-bg-0">
          Created on
        </Label>
        <Span variant="body-l" className="text-100">
          {detail.createdAtFormatted}
        </Span>
      </div>

      <div className="flex flex-col gap-1">
        <Label variant="tag" className="text-bg-0">
          Last status update
        </Label>
        <Span variant="body-l" className="text-100">
          {detail.lastUpdatedFormatted}
        </Span>
      </div>

      <div className="flex flex-col gap-1">
        <Label variant="tag" className="text-bg-0">
          {detail.type === 'withdrawal' ? 'Withdrawal address' : 'Deposit address'}
        </Label>
        <ShortenAndCopy value={detail.addressFull} />
      </div>

      <div className="flex flex-col gap-1">
        <Label variant="tag" className="text-bg-0">
          Tx hash
        </Label>
        {detail.submitTxFull ? (
          <ShortenAndCopy value={detail.submitTxFull} />
        ) : (
          <Span variant="body-l" className="text-200">
            —
          </Span>
        )}
      </div>
    </div>
  )
}
