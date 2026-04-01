import { FC, TableHTMLAttributes } from 'react'

import { cn } from '@/lib/utils'

/**
 * Tailwind styled wrapper around `thead` element
 */
export const TableHead: FC<TableHTMLAttributes<HTMLTableSectionElement>> = ({ className, ...props }) => {
  return (
    <thead className={cn('capitalize text-xs leading-4 [&_td]:py-3 bg-foreground', className)} {...props} />
  )
}
