import { FC } from 'react'
import { TableCell } from '@/components/Table'
import { cn } from '@/lib/utils'
import { Popover } from '@/components/Popover'
import { ArrowUpSFillIcon, ArrowDownSFillIcon, QuestionIcon } from '@/components/Icons'
import { TooltipProps } from '@/app/collective-rewards/rewards'

export type ISortConfig = {
  key: string
  direction: 'asc' | 'desc'
}

export type TableHeader = {
  label: string
  tooltip?: TooltipProps
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
          <Popover
            content={tooltip.text}
            className="font-normal text-sm"
            size="small"
            trigger="hover"
            {...tooltip.popoverProps}
          >
            <QuestionIcon className="mr-1" />
          </Popover>
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
