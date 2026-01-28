'use client'

import { useState, Fragment } from 'react'
import { cn } from '@/lib/utils'
import { TransactionHistoryTable } from '../../config'
import { CycleCell, DateCell, FromToCell, TypeCell, AmountCell, TotalAmountCell } from './Cells'
import { formatExpandedDate } from '@/app/my-rewards/tx-history/utils/utils'

interface DesktopDataRowProps {
  row: TransactionHistoryTable['Row']
}

export const DesktopDataRow = ({ row, ...props }: DesktopDataRowProps) => {
  const {
    data: { cycle, date, from_to, type, amount, total_amount },
  }: TransactionHistoryTable['Row'] = row

  const [isExpanded, setIsExpanded] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const isGrouped = from_to.isGrouped || false
  const groupedDetails = from_to.groupedDetails || []

  const handleToggleExpand = () => {
    if (isGrouped) {
      setIsExpanded(!isExpanded)
    }
  }

  const mainRowClassName = cn(
    'flex border-b-v3-bg-accent-60 border-b-1 gap-4 pl-4 py-3 min-h-[65px]',
    isGrouped && 'cursor-pointer',
    isGrouped && isHovered && 'bg-v3-text-100',
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
        onMouseEnter={() => isGrouped && setIsHovered(true)}
        onMouseLeave={() => isGrouped && setIsHovered(false)}
        onClick={handleToggleExpand}
      >
        <CycleCell {...cycle} isExpanded={isExpanded} isHovered={isHovered} />
        <DateCell {...date} isExpanded={isExpanded} isHovered={isHovered} />
        <FromToCell {...from_to} isExpanded={isExpanded} isHovered={isHovered} />
        <TypeCell {...type} isExpanded={isExpanded} isHovered={isHovered} />
        <AmountCell {...amount} isExpanded={isExpanded} isHovered={isHovered} />
        <TotalAmountCell
          {...total_amount}
          isGrouped={isGrouped}
          isExpanded={isExpanded}
          isHovered={isHovered}
          onToggle={handleToggleExpand}
        />
      </tr>
      {isExpanded &&
        groupedDetails.map((detail, idx) => (
          <tr key={`${row.id}-detail-${idx}`} className={detailRowClassName}>
            <CycleCell cycle={null} isDetailRow isHovered={isHovered} />
            <DateCell
              timestamp={detail.blockTimestamp}
              formatted={formatExpandedDate(detail.blockTimestamp)}
              transactionHash={detail.transactionHash}
              isDetailRow
              isHovered={isHovered}
            />
            <FromToCell
              builder={detail.builder}
              builderAddress={detail.builderAddress}
              type={from_to.type}
              isDetailRow
              isHovered={isHovered}
            />
            <TypeCell type={type.type} isDetailRow isHovered={isHovered} />
            <AmountCell
              amounts={detail.amounts}
              type={type.type}
              increased={detail.increased}
              isDetailRow
              isHovered={isHovered}
            />
            <TotalAmountCell usd={detail.usdValue} isDetailRow isHovered={isHovered} />
          </tr>
        ))}
    </Fragment>
  )
}
