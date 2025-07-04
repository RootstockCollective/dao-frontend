import { cn } from '@/lib/utils'
import { FC } from 'react'
import { CommonComponentProps } from '../commonProps'

export interface TableHeaderNodeProps extends CommonComponentProps {}

export const TableHeaderNode: FC<TableHeaderNodeProps> = ({ children, className }) => {
  return <div className={cn('flex flex-col items-start gap-1 cursor-[inherit]', className)}>{children}</div>
}
