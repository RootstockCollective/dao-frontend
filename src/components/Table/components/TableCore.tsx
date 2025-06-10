import { cn } from '@/lib/utils'
import { FC, TableHTMLAttributes } from 'react'

/**
 * Tailwind styled wrapper around `table` element
 */
export const TableCore: FC<TableHTMLAttributes<HTMLTableElement>> = ({ className, children, ...props }) => {
  return (
    <div className={cn('w-full overflow-auto', className)} {...props}>
      <table className="w-full h-auto border-collapse">{children}</table>
    </div>
  )
}
