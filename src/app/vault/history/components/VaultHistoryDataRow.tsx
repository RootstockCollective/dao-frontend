'use client'

import { FC, useState, Fragment, memo, useCallback } from 'react'
import { cn } from '@/lib/utils'
import { VaultHistoryTable } from './VaultHistoryTable.config'
import { PeriodCell, ActionCell, AssetsCell, TotalUsdCell, ActionsCell } from './Cells'

interface VaultHistoryDataRowProps {
  row: VaultHistoryTable['Row']
}

export const VaultHistoryDataRow: FC<VaultHistoryDataRowProps> = memo(({ row, ...props }) => {
  const {
    data: { period, action, assets, transactions, total_usd },
  }: VaultHistoryTable['Row'] = row

  const [isExpanded, setIsExpanded] = useState(false)
  const [isHovered, setIsHovered] = useState(false)

  const handleToggleExpand = useCallback(() => {
    setIsExpanded(prev => !prev)
  }, [])

  const handleMouseEnter = useCallback(() => {
    setIsHovered(true)
  }, [])

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false)
  }, [])

  const mainRowClassName = cn(
    'flex border-b-v3-bg-accent-60 border-b-1 gap-4 pl-4 py-3 min-h-[65px]',
    'cursor-pointer',
    isHovered && 'bg-v3-text-100',
    isExpanded && !isHovered && 'bg-v3-bg-accent-100',
  )

  const detailRowClassName = cn(
    'flex border-b-v3-bg-accent-60 border-b-1 gap-4 pl-4 py-3 min-h-[65px]',
    isHovered ? 'bg-v3-text-100' : 'bg-v3-bg-accent-100',
  )

  return (
    <Fragment>
      <tr
        {...props}
        className={mainRowClassName}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={handleToggleExpand}
        data-testid="VaultHistoryDataRow"
      >
        <PeriodCell period={period} isExpanded={isExpanded} isHovered={isHovered} />
        <ActionCell action={action} isExpanded={isExpanded} isHovered={isHovered} />
        <AssetsCell assets={assets} action={action} isExpanded={isExpanded} isHovered={isHovered} />
        <TotalUsdCell usd={total_usd} isExpanded={isExpanded} isHovered={isHovered} />
        <ActionsCell
          isHovered={isHovered}
          isGrouped
          isExpanded={isExpanded}
          onToggle={handleToggleExpand}
          usd={''}
        />
      </tr>
      {isExpanded &&
        transactions.map((detail, idx) => (
          <tr
            key={`${row.id}-detail-${idx}`}
            className={detailRowClassName}
            data-testid="VaultHistoryDetailRow"
          >
            <PeriodCell period={detail.date} isDetailRow isHovered={isHovered} />
            <ActionCell action={detail.action} isDetailRow isHovered={isHovered} />
            <AssetsCell assets={detail.assets} action={detail.action} isDetailRow isHovered={isHovered} />
            <TotalUsdCell
              usd={(Number(detail.assets.replace(/[^0-9.]/g, '')) || 0).toFixed(2)}
              isDetailRow
              isHovered={isHovered}
            />
            <ActionsCell isDetailRow isHovered={isHovered} usd={''} />
          </tr>
        ))}
    </Fragment>
  )
})

VaultHistoryDataRow.displayName = 'VaultHistoryDataRow'
