'use client'

import type { FC } from 'react'
import { Fragment, memo, useCallback, useState } from 'react'

import { cn } from '@/lib/utils'

import type { BtcVaultHistoryTable } from './BtcVaultHistoryTable.config'
import { ActionsCell, AmountCell, DateCell, DetailActionsCell, StatusCell, TypeCell } from './Cells'

interface Props {
  row: BtcVaultHistoryTable['Row']
}

export const BtcVaultHistoryDataRow: FC<Props> = memo(({ row }) => {
  const { data } = row
  const [isExpanded, setIsExpanded] = useState(false)
  const [isHovered, setIsHovered] = useState(false)

  const hasHistory = (data.stateHistory?.length ?? 0) > 0

  const handleToggleExpand = useCallback(() => {
    if (hasHistory) setIsExpanded(prev => !prev)
  }, [hasHistory])

  const handleMouseEnter = useCallback(() => setIsHovered(true), [])
  const handleMouseLeave = useCallback(() => setIsHovered(false), [])

  const mainRowClassName = cn(
    'flex border-b-v3-bg-accent-60 border-b-1 gap-4 pl-4 py-3 min-h-[65px]',
    hasHistory && 'cursor-pointer',
    (isHovered || isExpanded) && 'bg-v3-text-100',
  )

  const detailRowClassName = cn(
    'flex border-b-v3-bg-accent-60 border-b-1 gap-4 pl-4 py-3 min-h-[65px]',
    'bg-v3-text-100',
  )

  return (
    <Fragment>
      <tr
        className={mainRowClassName}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={hasHistory ? handleToggleExpand : undefined}
        data-testid="btc-vault-history-data-row"
      >
        <TypeCell type={data.type} isHovered={isHovered || isExpanded} />
        <DateCell date={data.date} isHovered={isHovered || isExpanded} />
        <AmountCell
          amount={data.amount}
          fiatAmount={data.fiatAmount}
          claimTokenType={data.claimTokenType}
          isHovered={isHovered || isExpanded}
        />
        <StatusCell displayStatus={data.status} displayStatusLabel={data.displayStatusLabel} />
        <ActionsCell requestStatus={data.requestStatus} type={data.type} isHovered={isHovered || isExpanded} />
      </tr>
      {isExpanded &&
        data.stateHistory?.map((entry, idx) => (
          <tr
            key={`${row.id}-detail-${idx}`}
            className={detailRowClassName}
            data-testid="btc-vault-history-detail-row"
          >
            <TypeCell type={data.type} isHovered />
            <DateCell date={entry.date} isHovered />
            <AmountCell
              amount={data.amount}
              fiatAmount={data.fiatAmount}
              claimTokenType={data.claimTokenType}
              isHovered
            />
            <StatusCell displayStatus={entry.displayStatus} displayStatusLabel={entry.displayStatusLabel} />
            <DetailActionsCell actionLabel={entry.actionLabel} />
          </tr>
        ))}
    </Fragment>
  )
})

BtcVaultHistoryDataRow.displayName = 'BtcVaultHistoryDataRow'
