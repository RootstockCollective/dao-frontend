import { cn } from '@/lib/utils'

import { CommonComponentProps } from '../commonProps'

export interface TableHeaderNodeProps extends CommonComponentProps {}

export const TableHeaderNode = ({ children, className }: TableHeaderNodeProps) => {
  return <div className={cn('flex flex-col items-start gap-1 cursor-[inherit]', className)}>{children}</div>
}
