import { Chevron } from './Chevron'
import { cn } from '@/lib/utils'
import type { Table } from '@tanstack/react-table'

interface PaginationPageSizeSelectorProps<T> {
  table: Table<T>
  pageSizes?: number[]
}

// Dropdown for selecting page size in pagination
export default function PaginationPageSizeSelector<T>({
  table,
  pageSizes = [10, 20, 30, 40, 50],
}: PaginationPageSizeSelectorProps<T>) {
  return (
    <div className="relative ml-1">
      <select
        className={cn(
          'focus:outline-hidden focus:ring-0 focus:border-none bg-bg-60',
          'pl-3 w-[70px] h-7 appearance-none rounded-sm',
          'cursor-pointer font-rootstock-sans text-text-100',
        )}
        aria-label="Select page size"
        tabIndex={0}
        value={table.getState().pagination.pageSize}
        onChange={e => {
          table.setPageSize(Number(e.target.value))
        }}
      >
        {pageSizes.map(pageSize => (
          <option key={pageSize} value={pageSize}>
            {pageSize}
          </option>
        ))}
      </select>
      <Chevron
        className={cn('pointer-events-none absolute right-2', 'top-1/2 -translate-y-1/2 -rotate-90 scale-75')}
      />
    </div>
  )
}
