import { TableHTMLAttributes } from 'react'

import { cn } from '@/lib/utils'

/**
 * Tailwind styled wrapper around `table` element
 */
export const TableCore = ({ className, children, ...props }: TableHTMLAttributes<HTMLTableElement>) => {
  return (
    <div className={cn('w-full overflow-auto', className)} {...props}>
      <table className="w-full h-auto border-collapse">{children}</table>
    </div>
  )
}
