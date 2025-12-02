'use client'

import { FC, useState, Fragment, memo, useCallback } from 'react'
import { cn } from '@/lib/utils'
import { StakingHistoryTable } from './StakingHistoryTable.config'
import { PeriodCell, ActionCell, AmountCell, TotalAmountCell, ActionsCell } from './Cells'

interface TransactionHistoryDataRowProps {
  row: StakingHistoryTable['Row']
}

export const StakingHistoryDataRow: FC<TransactionHistoryDataRowProps> = memo(({ row, ...props }) => {
  const {
    data: { period, action, amount, transactions, total_amount },
  }: StakingHistoryTable['Row'] = row

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
      >
        <PeriodCell period={period} isExpanded={isExpanded} isHovered={isHovered} />
        <ActionCell action={action} isExpanded={isExpanded} isHovered={isHovered} />
        <AmountCell amount={amount} action={action} isExpanded={isExpanded} isHovered={isHovered} />
        <TotalAmountCell usd={total_amount} isExpanded={isExpanded} isHovered={isHovered} />
        <ActionsCell
          isHovered={isHovered}
          isGrouped
          isExpanded={isExpanded}
          onToggle={handleToggleExpand}
          usd={''}
        ></ActionsCell>
      </tr>
      {isExpanded &&
        transactions.map((detail, idx) => (
          <tr key={`${row.id}-detail-${idx}`} className={detailRowClassName}>
            <PeriodCell period={detail.date} isDetailRow isHovered={isHovered} />
            <ActionCell action={detail.action} isDetailRow isHovered={isHovered} />
            <AmountCell amount={detail.amount} action={detail.action} isDetailRow isHovered={isHovered} />
            <TotalAmountCell usd={detail.total_amount ?? ''} isDetailRow isHovered={isHovered} />
            <ActionsCell isDetailRow isHovered={isHovered} usd={''} />
          </tr>
        ))}
    </Fragment>
  )
})

StakingHistoryDataRow.displayName = 'StakingHistoryDataRow'
