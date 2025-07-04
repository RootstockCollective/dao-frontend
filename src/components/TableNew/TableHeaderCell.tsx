import { cn } from '@/lib/utils'
import { FC } from 'react'
import { CommonComponentProps } from '../commonProps'

export interface TableHeaderCellProps extends CommonComponentProps {
  onClick?: () => void
  contentClassName?: string
}

export const TableHeaderCell: FC<TableHeaderCellProps> = ({
  children,
  className,
  onClick,
  contentClassName,
}) => {
  return (
    <td
      className={cn(
        'flex flex-col items-start gap-2',
        !!onClick ? 'cursor-pointer' : 'cursor-default',
        className,
      )}
      onClick={onClick}
    >
      <div className={cn('flex items-start self-stretch gap-1.5 cursor-[inherit]', contentClassName)}>
        {children}
      </div>
    </td>
  )
}
