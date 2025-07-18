import { cn } from '@/lib/utils'
import { FC } from 'react'
import { CommonComponentProps } from '../commonProps'

export interface TableHeaderCellProps extends CommonComponentProps<HTMLTableCellElement> {
  contentClassName?: string
}

export const TableHeaderCell: FC<TableHeaderCellProps> = ({
  children,
  className,
  onClick,
  contentClassName,
}) => {
  return (
    <th
      className={cn(
        'flex flex-col items-start gap-2 whitespace-nowrap',
        !!onClick ? 'cursor-pointer' : 'cursor-default',
        className,
      )}
      onClick={onClick}
    >
      <div className={cn('flex items-start self-stretch gap-1.5 cursor-[inherit]', contentClassName)}>
        {children}
      </div>
    </th>
  )
}
