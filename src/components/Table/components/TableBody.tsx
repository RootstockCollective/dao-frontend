import { TableHTMLAttributes } from 'react'

import { cn } from '@/lib/utils'

/**
 * Tailwind styled wrapper around `tbody` element
 */
export const TableBody = ({ className, ...props }: TableHTMLAttributes<HTMLTableSectionElement>) => {
  return <tbody className={cn('text-sm leading-5', className)} {...props} />
}
