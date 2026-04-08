'use client'

import { CopyButton } from '@/components/CopyButton'
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
      <div className="flex flex-col gap-2 md:col-span-2">
        <Label variant="tag" className="text-bg-0">
          Request type
        </Label>
        <Span variant="body-l" className="text-100">
          {detail.typeLabel}
        </Span>
      </div>

      {detail.type === 'withdrawal' ? (
        <>
          <div className="flex flex-col gap-2">
            <Label variant="tag" className="text-bg-0">
              Shares requested
            </Label>
            <Span variant="body-l" className="text-100">
              {detail.sharesFormatted}
            </Span>
          </div>

          <div className="flex flex-col gap-2">
            <Label variant="tag" className="text-bg-0">
              Shares value
            </Label>
            {detail.amountFormatted === '—' ? (
              <Span variant="body-l" className="text-100">
                —
              </Span>
            ) : (
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
            )}
          </div>
        </>
      ) : (
        <>
          <div className="flex flex-col gap-2">
            <Label variant="tag" className="text-bg-0">
              Amount to deposit
            </Label>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
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

          <div className="flex flex-col gap-2">
            <Label variant="tag" className="text-bg-0">
              Shares
            </Label>
            <Span variant="body-l" className="text-100">
              {detail.sharesFormatted}
            </Span>
          </div>
        </>
      )}

      <div className="flex flex-col gap-2">
        <Label variant="tag" className="text-bg-0">
          Created on
        </Label>
        <Span variant="body-l" className="text-100">
          {detail.createdAtFormatted}
        </Span>
      </div>

      <div className="flex flex-col gap-2">
        <Label variant="tag" className="text-bg-0">
          Last status update
        </Label>
        <Span variant="body-l" className="text-100">
          {detail.lastUpdatedFormatted}
        </Span>
      </div>

      <div className="flex flex-col gap-2">
        <Label variant="tag" className="text-bg-0">
          {detail.type === 'withdrawal' ? 'Withdrawal address' : 'Address to deposit'}
        </Label>
        <ShortenAndCopy
          value={detail.addressFull}
          className="text-primary overflow-hidden text-ellipsis font-rootstock-sans font-normal text-lg leading-[133%]"
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label variant="tag" className="text-bg-0">
          Tx hash
        </Label>
        {detail.submitTxShort ? (
          <CopyButton
            copyText={detail.submitTxFull!}
            className="justify-start text-primary overflow-hidden text-ellipsis font-rootstock-sans font-normal text-lg leading-[133%]"
          >
            {detail.submitTxShort}
          </CopyButton>
        ) : (
          <Span variant="body-l" className="text-200">
            —
          </Span>
        )}
      </div>
    </div>
  )
}
