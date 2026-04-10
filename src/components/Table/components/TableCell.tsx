import { TableHTMLAttributes } from 'react'

import { cn } from '@/lib/utils'

/**
 * Tailwind styled wrapper around `td` element
 */
export const TableCell = ({ className, ...props }: TableHTMLAttributes<HTMLTableCellElement>) => {
  return <td className={cn('p-3 border-b', className)} {...props} />
}
