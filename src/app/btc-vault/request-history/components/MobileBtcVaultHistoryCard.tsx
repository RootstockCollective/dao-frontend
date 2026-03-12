'use client'

import type { FC } from 'react'
import { memo } from 'react'

import { MoneyIconKoto } from '@/components/Icons'
import { TrashIcon } from '@/components/Icons/v3design'
import { TokenImage } from '@/components/TokenImage'
import { Paragraph } from '@/components/Typography'
import { RBTC } from '@/lib/constants'

import type { BtcVaultHistoryTable } from './BtcVaultHistoryTable.config'
import { RequestStatusBadge } from './RequestStatusBadge'

interface Props {
  row: BtcVaultHistoryTable['Row']
}

export const MobileBtcVaultHistoryCard: FC<Props> = memo(({ row }) => {
  const { data } = row

  return (
    <div
      className="flex flex-col rounded-sm border-b border-b-v3-bg-accent-60 bg-v3-bg-accent-80"
      data-testid="mobile-btc-vault-history-card"
    >
      <div className="flex flex-col p-4 gap-3">
        {/* Type and status */}
        <div className="flex items-center justify-between">
          <Paragraph variant="body" className="font-medium text-v3-text-100">
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

        {/* Actions — always visible on mobile (no hover on touch devices) */}
        {data.requestStatus === 'claimable' && (
          <div className="flex items-center gap-1">
            <Paragraph variant="body-s" className="font-medium text-v3-text-100">
              {data.type === 'Deposit' ? 'Claim shares' : 'Claim rBTC'}
            </Paragraph>
            <MoneyIconKoto size={16} />
          </div>
        )}
        {data.requestStatus === 'pending' && (
          <div className="flex items-center gap-1">
            <Paragraph variant="body-s" className="font-medium text-v3-text-100">
              Cancel request
            </Paragraph>
            <TrashIcon size={16} />
          </div>
        )}
      </div>
    </div>
  )
})

MobileBtcVaultHistoryCard.displayName = 'MobileBtcVaultHistoryCard'
