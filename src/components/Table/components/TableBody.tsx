import { FC, TableHTMLAttributes } from 'react'

import { cn } from '@/lib/utils'

/**
 * Tailwind styled wrapper around `tbody` element
 */
export const TableBody: FC<TableHTMLAttributes<HTMLTableSectionElement>> = ({ className, ...props }) => {
  return <tbody className={cn('text-sm leading-5', className)} {...props} />
}
