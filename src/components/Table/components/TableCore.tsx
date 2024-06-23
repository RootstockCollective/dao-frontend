import { FC, TableHTMLAttributes } from 'react'
import cx from 'classnames'

/**
 * Tailwind styled wrapper around `table` element
 */
export const TableCore: FC<TableHTMLAttributes<HTMLTableElement>> = ({ className, children, ...props }) => {
  return (
    <div
      className={cx(
        'w-full overflow-auto border border-white border-solid rounded-lg border-opacity-40',
        className,
      )}
      {...props}
    >
      <table className="w-full h-auto border-collapse">{children}</table>
    </div>
  )
}
