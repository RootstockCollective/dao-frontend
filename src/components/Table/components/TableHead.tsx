import { FC, TableHTMLAttributes } from 'react'
import cx from 'classnames'

/**
 * Tailwind styled wrapper around `thead` element
 */
export const TableHead: FC<TableHTMLAttributes<HTMLTableSectionElement>> = ({ className, ...props }) => {
  return <thead className={cx('capitalize text-xs leading-4 [&_td]:py-3', className)} {...props} />
}
