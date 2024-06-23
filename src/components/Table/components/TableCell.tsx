import { FC, TableHTMLAttributes } from 'react'
import cx from 'classnames'

/**
 * Tailwind styled wrapper around `td` element
 */
export const TableCell: FC<TableHTMLAttributes<HTMLTableCellElement>> = ({ className, ...props }) => {
  return <td className={cx('px-6 border-b border-white border-opacity-20', className)} {...props} />
}
