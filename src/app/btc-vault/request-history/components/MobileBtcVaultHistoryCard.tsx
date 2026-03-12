'use client'

import type { FC } from 'react'

import { TokenImage } from '@/components/TokenImage'
import { Paragraph } from '@/components/Typography'
import { RBTC } from '@/lib/constants'
import { cn } from '@/lib/utils'

import type { BtcVaultHistoryTable } from './BtcVaultHistoryTable.config'
import { RequestStatusBadge } from './RequestStatusBadge'

interface Props {
  row: BtcVaultHistoryTable['Row']
}

export const MobileBtcVaultHistoryCard: FC<Props> = ({ row }) => {
  const { data } = row

  return (
    <div
      className="flex flex-col bg-v3-bg-accent-80 rounded-sm border-b border-b-v3-bg-accent-60 p-4 gap-3"
      data-testid="mobile-btc-vault-history-card"
    >
      {/* Type and status */}
      <div className="flex items-center justify-between">
        <Paragraph variant="body" className="text-v3-text-100 font-medium">
          {data.type}
        </Paragraph>
        <RequestStatusBadge displayStatus={data.status} label={data.displayStatusLabel} />
      </div>

      {/* Date */}
      <Paragraph variant="body-s" className="text-v3-text-60">
        {data.date}
      </Paragraph>

      {/* Amount */}
      <div className="flex items-center gap-1">
        <Paragraph variant="body" className="text-v3-text-100">
          {data.amount}
        </Paragraph>
        {data.claimTokenType === 'rbtc' ? (
          <>
            <TokenImage symbol={RBTC} size={16} />
            <Paragraph variant="body-s" className="text-v3-text-60">
              rBTC
            </Paragraph>
          </>
        ) : (
          <Paragraph variant="body-s" className="text-v3-text-60">
            shares
          </Paragraph>
        )}
      </div>

      {/* Fiat amount for deposits */}
      {data.fiatAmount && (
        <Paragraph variant="body-xs" className="text-v3-text-60">
          {data.fiatAmount}
        </Paragraph>
      )}

      {/* Action stub for actionable rows */}
      {data.requestStatus === 'claimable' && (
        <Paragraph variant="body-s" className={cn('font-medium text-primary')}>
          {data.type === 'Deposit' ? 'Claim shares' : 'Claim rBTC'}
        </Paragraph>
      )}
      {data.requestStatus === 'pending' && (
        <Paragraph variant="body-s" className="font-medium text-v3-text-60">
          Cancel request
        </Paragraph>
      )}
    </div>
  )
}
