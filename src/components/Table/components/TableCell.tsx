import { cn } from '@/lib/utils'
import { FC, TableHTMLAttributes } from 'react'

/**
 * Tailwind styled wrapper around `td` element
 */
export const TableCell: FC<TableHTMLAttributes<HTMLTableCellElement>> = ({ className, ...props }) => {
  return <td className={cn('px-6 border-b border-white border-opacity-20', className)} {...props} />
}
