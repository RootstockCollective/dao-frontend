import { FC, TableHTMLAttributes } from 'react'

import { cn } from '@/lib/utils'

/**
 * Tailwind styled wrapper around `td` element
 */
export const TableCell: FC<TableHTMLAttributes<HTMLTableCellElement>> = ({ className, ...props }) => {
  return <td className={cn('p-3 border-b', className)} {...props} />
}
