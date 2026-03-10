'use client'

import type { FC } from 'react'
import { memo, useCallback, useState } from 'react'

import { MoneyIconKoto } from '@/components/Icons'
import { TrashIcon } from '@/components/Icons/v3design'
import { TokenImage } from '@/components/TokenImage'
import { Paragraph } from '@/components/Typography'
import { RBTC } from '@/lib/constants'
import { cn } from '@/lib/utils'

import type { BtcVaultHistoryTable } from './BtcVaultHistoryTable.config'
import { RequestStatusBadge } from './RequestStatusBadge'

interface Props {
  row: BtcVaultHistoryTable['Row']
}

export const MobileBtcVaultHistoryCard: FC<Props> = memo(({ row }) => {
  const { data } = row
  const [isExpanded, setIsExpanded] = useState(false)

  const hasHistory = (data.stateHistory?.length ?? 0) > 0

  const handleToggleExpand = useCallback(() => {
    setIsExpanded(prev => !prev)
  }, [])

  const textColor = isExpanded ? 'text-black' : 'text-v3-text-100'
  const mutedTextColor = isExpanded ? 'text-black/60' : 'text-v3-text-60'

  return (
    <div
      className={cn(
        'flex flex-col rounded-sm border-b border-b-v3-bg-accent-60',
        isExpanded ? 'bg-v3-text-100' : 'bg-v3-bg-accent-80',
        hasHistory && 'cursor-pointer',
      )}
      onClick={hasHistory ? handleToggleExpand : undefined}
      data-testid="mobile-btc-vault-history-card"
    >
      <div className="flex flex-col p-4 gap-3">
        {/* Type and status */}
        <div className="flex items-center justify-between">
          <Paragraph variant="body" className={cn('font-medium', textColor)}>
            {data.type}
          </Paragraph>
          <RequestStatusBadge displayStatus={data.status} label={data.displayStatusLabel} />
        </div>

        {/* Date */}
        <Paragraph variant="body-s" className={mutedTextColor}>
          {data.date}
        </Paragraph>

        {/* Amount */}
        <div className="flex items-center gap-1">
          <Paragraph variant="body" className={textColor}>
            {data.amount}
          </Paragraph>
          {data.claimTokenType === 'rbtc' ? (
            <>
              <TokenImage symbol={RBTC} size={16} />
              <Paragraph variant="body-s" className={mutedTextColor}>
                rBTC
              </Paragraph>
            </>
          ) : (
            <Paragraph variant="body-s" className={mutedTextColor}>
              shares
            </Paragraph>
          )}
        </div>

        {/* Fiat amount for deposits */}
        {data.fiatAmount && (
          <Paragraph variant="body-xs" className={mutedTextColor}>
            {data.fiatAmount}
          </Paragraph>
        )}
      </div>

      {/* Expanded detail entries */}
      {isExpanded && hasHistory && (
        <div className="flex flex-col border-t border-t-v3-bg-accent-60 bg-v3-text-100">
          {/* Actions — only visible when expanded */}
          {(data.requestStatus === 'claimable' || data.requestStatus === 'pending') && (
            <div className="flex items-center gap-1 p-4 border-b border-b-v3-bg-accent-60">
              {data.requestStatus === 'claimable' && (
                <>
                  <Paragraph variant="body-s" className="font-medium text-black">
                    {data.type === 'Deposit' ? 'Claim shares' : 'Claim rBTC'}
                  </Paragraph>
                  <MoneyIconKoto size={16} color="black" />
                </>
              )}
              {data.requestStatus === 'pending' && (
                <>
                  <Paragraph variant="body-s" className="font-medium text-black">
                    Cancel request
                  </Paragraph>
                  <TrashIcon size={16} color="black" />
                </>
              )}
            </div>
          )}

          {data.stateHistory?.map((entry, idx) => (
            <div
              key={`${row.id}-detail-${idx}`}
              className={cn(
                'flex flex-col p-4 gap-3',
                idx < (data.stateHistory?.length ?? 0) - 1 && 'border-b border-b-v3-bg-accent-60',
              )}
              data-testid="mobile-btc-vault-history-detail-entry"
            >
              <Paragraph variant="body-s" className="text-black">
                {data.type}
              </Paragraph>
              <Paragraph variant="body-s" className="text-black">
                {entry.date}
              </Paragraph>
              <div className="flex items-center gap-1">
                <Paragraph variant="body" className="text-black">
                  {data.amount}
                </Paragraph>
                {data.claimTokenType === 'rbtc' ? (
                  <>
                    <TokenImage symbol={RBTC} size={16} />
                    <Paragraph variant="body-s" className="text-black">
                      rBTC
                    </Paragraph>
                  </>
                ) : (
                  <Paragraph variant="body-s" className="text-black">
                    shares
                  </Paragraph>
                )}
              </div>
              <RequestStatusBadge displayStatus={entry.displayStatus} label={entry.displayStatusLabel} />
              <Paragraph variant="body-s" className="text-black">
                {entry.actionLabel ?? '-'}
              </Paragraph>
            </div>
          ))}
        </div>
      )}
    </div>
  )
})

MobileBtcVaultHistoryCard.displayName = 'MobileBtcVaultHistoryCard'
