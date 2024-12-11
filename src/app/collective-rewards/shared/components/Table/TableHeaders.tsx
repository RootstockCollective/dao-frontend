import { FC } from 'react'
import { TableCell } from '@/components/Table'
import { cn } from '@/lib/utils'
import { Popover } from '@/components/Popover'
import { FaRegQuestionCircle } from 'react-icons/fa'
import { RiArrowUpSFill, RiArrowDownSFill } from 'react-icons/ri'
import { TooltipProps } from '@/app/collective-rewards/rewards'

export type ISortConfig = {
  key: string
  direction: 'asc' | 'desc'
}

export type TableHeader = {
  label: string
  className: string
  tooltip?: TooltipProps
  sortKey?: string
}

type TableHeaderProps = {
  tableHeader: TableHeader
  onSort?: (parameter: any) => void
  sortConfig?: ISortConfig
}

export const TableHeaderCell: FC<TableHeaderProps> = ({
  tableHeader: { label, className, sortKey, tooltip },
  onSort,
  sortConfig,
}) => {
  return (
    <TableCell
      key={label}
      className={cn(
        'font-rootstock-sans font-bold text-base leading-none border-b border-solid border-[#2D2D2D]',
        className,
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
            <FaRegQuestionCircle className="mr-1 self-center" />
          </Popover>
        )}
        {label}
        {onSort && (
          <button
            className={`"text-xs text-white flex items-center ml-1" transition-transform duration-300 ${sortConfig?.key === sortKey && sortConfig?.direction === 'asc' ? 'rotate-180' : 'rotate-0'}`}
            onClick={() => onSort(sortKey)}
          >
            {sortConfig?.key === sortKey ? <RiArrowUpSFill className="stroke-2" /> : <RiArrowDownSFill />}
          </button>
        )}
      </div>
    </TableCell>
  )
}
