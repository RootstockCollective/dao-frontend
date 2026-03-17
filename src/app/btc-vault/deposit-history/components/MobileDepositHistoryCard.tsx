'use client'

import type { FC } from 'react'
import { memo } from 'react'

import { TokenImage } from '@/components/TokenImage'
import { Paragraph } from '@/components/Typography'
import { RBTC } from '@/lib/constants'

import type { DepositHistoryTableType } from './DepositHistoryTable.config'

interface Props {
  row: DepositHistoryTableType['Row']
}

export const MobileDepositHistoryCard: FC<Props> = memo(({ row }) => {
  const { data } = row

  return (
    <div
      className="flex flex-col rounded-sm border-b border-b-v3-bg-accent-60 bg-v3-bg-accent-80"
      data-testid="mobile-deposit-history-card"
    >
      <div className="flex flex-col p-4 gap-3">
        <div className="flex items-center justify-between">
          <Paragraph variant="body" className="font-medium text-v3-text-100">
            Deposit Window {data.depositWindow}
          </Paragraph>
          <Paragraph variant="body-s" className="text-v3-text-60">
            {data.apy}
          </Paragraph>
        </div>
        <div className="flex items-center justify-between">
          <Paragraph variant="body-s" className="text-v3-text-60">
            {data.startDate} — {data.endDate}
          </Paragraph>
        </div>
        <div className="flex items-center gap-1">
          <Paragraph variant="body" className="text-v3-text-100">
            {data.tvl}
          </Paragraph>
          <TokenImage symbol={RBTC} size={16} />
        </div>
        {data.fiatTvl && (
          <Paragraph variant="body-xs" className="text-v3-text-60">
            {data.fiatTvl}
          </Paragraph>
        )}
      </div>
    </div>
  )
})

MobileDepositHistoryCard.displayName = 'MobileDepositHistoryCard'
