import { FC, ReactNode } from 'react'
import { TableCell } from '@/components/Table'
import { cn } from '@/lib/utils'

import { ArrowUpSFillIcon, ArrowDownSFillIcon, QuestionIcon } from '@/components/Icons'
import { Tooltip } from '@/components/Tooltip'

export type ISortConfig = {
  key: string
  direction: 'asc' | 'desc'
}

export type TableHeader = {
  label: string
  tooltip?: { text: ReactNode }
  className?: string
  sortKey?: string
  onSort?: (parameter: any) => void
  sortConfig?: ISortConfig
}

export const TableHeaderCell: FC<TableHeader> = ({
  label,
  tooltip,
  className,
  sortKey,
  onSort,
  sortConfig,
}) => {
  return (
    <TableCell
      key={label}
      className={cn(
        className,
        'font-rootstock-sans font-bold text-base leading-none border-b border-solid border-[#2D2D2D]',
      )}
    >
      <div className="flex flex-row">
        {tooltip && (
          <Tooltip text={tooltip.text}>
            <QuestionIcon className="mr-1" />
          </Tooltip>
        )}
        <span>{label}</span>
        {onSort && sortKey && (
          <button
            className={`"text-xs text-white flex items-center ml-1" transition-transform duration-300 ${sortConfig?.key === sortKey && sortConfig?.direction === 'asc' ? 'rotate-180' : 'rotate-0'}`}
            onClick={() => onSort(sortKey)}
          >
            {sortConfig?.key === sortKey ? <ArrowUpSFillIcon className="stroke-2" /> : <ArrowDownSFillIcon />}
          </button>
        )}
      </div>
    </TableCell>
  )
}
