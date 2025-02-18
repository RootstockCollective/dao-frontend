import { FC } from 'react'
import { TableCell } from '@/components/Table'
import { cn } from '@/lib/utils'
import { Popover } from '@/components/Popover'
import { RiArrowUpSFill, RiArrowDownSFill } from 'react-icons/ri'
import { TooltipProps } from '@/app/collective-rewards/rewards'
import Image from 'next/image'

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

type TableHeaderProps = TableHeader

export const TableHeaderCell: FC<TableHeaderProps> = ({
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
            <Image src="/images/question.svg" className="mr-1" width={20} height={20} alt="QuestionIcon" />
          </Popover>
        )}
        <span>{label}</span>
        {onSort && sortKey && (
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
