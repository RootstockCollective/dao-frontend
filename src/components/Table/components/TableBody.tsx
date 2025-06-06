import { cn } from '@/lib/utils/utils'
import { FC, TableHTMLAttributes } from 'react'

/**
 * Tailwind styled wrapper around `tbody` element
 */
export const TableBody: FC<TableHTMLAttributes<HTMLTableSectionElement>> = ({ className, ...props }) => {
  return <tbody className={cn('text-sm leading-5', className)} {...props} />
}
