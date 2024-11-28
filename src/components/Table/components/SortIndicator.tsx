import { SortDirection } from '@tanstack/react-table'
import { PropsWithChildren } from 'react'
import { TbArrowsSort, TbSortAscending, TbSortDescending } from 'react-icons/tb'
import { cn } from '@/lib/utils'

interface SortIndicatorProps extends PropsWithChildren {
  sortDirection: SortDirection | false
  sortEnabled?: boolean
}

export function SortIndicator({ children, sortDirection, sortEnabled = true }: SortIndicatorProps) {
  return (
    <div className={cn('flex gap-1', sortEnabled && 'cursor-pointer')}>
      {sortEnabled && (
        <div className="flex items-center">
          {sortDirection === 'asc' ? (
            <TbSortAscending />
          ) : sortDirection === 'desc' ? (
            <TbSortDescending />
          ) : (
            <TbArrowsSort className="text-gray-500" />
          )}
        </div>
      )}
      <div>{children}</div>
    </div>
  )
}
