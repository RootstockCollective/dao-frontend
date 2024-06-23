import { FC, TableHTMLAttributes } from 'react'
import cx from 'classnames'

/**
 * Tailwind styled wrapper around `tr` element
 */
export const TableRow: FC<TableHTMLAttributes<HTMLTableRowElement>> = ({ className, ...props }) => {
  return <tr className={cx('', className)} {...props} />
}
