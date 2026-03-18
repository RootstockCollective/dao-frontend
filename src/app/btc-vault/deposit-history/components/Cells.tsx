'use client'

import type { ReactNode } from 'react'

import { TokenImage } from '@/components/TokenImage'
import { Paragraph } from '@/components/Typography'
import { RBTC } from '@/lib/constants'
import { cn } from '@/lib/utils'
import { useTableContext } from '@/shared/context'

import type { ColumnId, DepositHistoryCellDataMap } from './DepositHistoryTable.config'
import { COLUMN_TRANSFORMS } from './DepositHistoryTable.config'

interface TableCellProps {
  columnId: ColumnId
  children?: ReactNode
  className?: string
}

const TableCell = ({ children, className, columnId }: TableCellProps): ReactNode => {
  const { columns } = useTableContext<ColumnId, DepositHistoryCellDataMap>()
  const column = columns.find(col => col.id === columnId)
  if (column?.hidden) return null

  return (
    <td
      className={cn('flex self-stretch items-center select-none', COLUMN_TRANSFORMS[columnId], className)}
      data-testid={`deposit-history-cell-${columnId}`}
    >
      {children}
    </td>
  )
}

interface CellStateProps {
  isHovered: boolean
}

interface DepositWindowCellProps extends CellStateProps {
  value: string
}

export const DepositWindowCell = ({ value, isHovered }: DepositWindowCellProps) => (
  <TableCell columnId="depositWindow">
    <Paragraph variant="body" className={cn(isHovered ? 'text-black' : 'text-v3-text-100')}>
      {value}
    </Paragraph>
  </TableCell>
)

interface DateCellProps extends CellStateProps {
  value: string
}

export const StartDateCell = ({ value, isHovered }: DateCellProps) => (
  <TableCell columnId="startDate">
    <Paragraph variant="body-s" className={cn(isHovered ? 'text-black' : 'text-v3-text-100')}>
      {value}
    </Paragraph>
  </TableCell>
)

export const EndDateCell = ({ value, isHovered }: DateCellProps) => (
  <TableCell columnId="endDate">
    <Paragraph variant="body-s" className={cn(isHovered ? 'text-black' : 'text-v3-text-100')}>
      {value}
    </Paragraph>
  </TableCell>
)

interface TvlCellProps extends CellStateProps {
  tvl: string
  fiatTvl: string | null
}

export const TvlCell = ({ tvl, fiatTvl, isHovered }: TvlCellProps) => (
  <TableCell columnId="tvl">
    <div className="flex flex-col gap-0.5">
      <div className="flex items-center gap-1">
        <Paragraph variant="body" className={cn(isHovered ? 'text-black' : 'text-v3-text-100')}>
          {tvl}
        </Paragraph>
        <TokenImage symbol={RBTC} size={16} />
      </div>
      {fiatTvl && (
        <Paragraph variant="body-xs" className={cn(isHovered ? 'text-black/60' : 'text-v3-text-60')}>
          {fiatTvl}
        </Paragraph>
      )}
    </div>
  </TableCell>
)

interface ApyCellProps extends CellStateProps {
  value: string
}

export const ApyCell = ({ value, isHovered }: ApyCellProps) => (
  <TableCell columnId="apy">
    <Paragraph variant="body" className={cn(isHovered ? 'text-black' : 'text-v3-text-100')}>
      {value}
    </Paragraph>
  </TableCell>
)
