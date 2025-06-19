import { cn } from '@/lib/utils'
import { FC, TableHTMLAttributes } from 'react'

/**
 * Tailwind styled wrapper around `td` element
 */
export const ActionCell: FC<TableHTMLAttributes<HTMLTableCellElement>> = ({ className, ...props }) => {
  return <td className={cn('p-3 border-b border-white/20', className)} {...props} />
}
