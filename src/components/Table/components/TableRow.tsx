import { TableHTMLAttributes } from 'react'

/**
 * Tailwind styled wrapper around `tr` element
 */
export const TableRow = ({ className, ...props }: TableHTMLAttributes<HTMLTableRowElement>) => {
  return <tr className={className} {...props} />
}
