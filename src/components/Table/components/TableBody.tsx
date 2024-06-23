import { FC, TableHTMLAttributes } from 'react'
import cx from 'classnames'

/**
 * Tailwind styled wrapper around `tbody` element
 */
export const TableBody: FC<TableHTMLAttributes<HTMLTableSectionElement>> = ({ className, ...props }) => {
  return <tbody className={cx('text-sm leading-5 [&_td]:py-4', className)} {...props} />
}
