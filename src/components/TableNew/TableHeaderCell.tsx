import { cn } from '@/lib/utils'
import { FC } from 'react'
import { CommonComponentProps } from '../commonProps'

export interface TableHeaderCellProps extends CommonComponentProps {
  id: string // columnName
  onClick?: () => void
}

export const TableHeaderCell: FC<TableHeaderCellProps> = ({ children, className, onClick }) => {
  return (
    <div
      className={cn(
        'flex flex-row justify-center items-center',
        onClick ? 'cursor-pointer' : 'cursor-default',
        className,
      )}
      onClick={onClick}
    >
      {children}
    </div>
  )
}
