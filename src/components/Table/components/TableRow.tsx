import { FC, TableHTMLAttributes } from 'react'

/**
 * Tailwind styled wrapper around `tr` element
 */
export const TableRow: FC<TableHTMLAttributes<HTMLTableRowElement>> = ({ className, ...props }) => {
  return <tr className={className} {...props} />
}
