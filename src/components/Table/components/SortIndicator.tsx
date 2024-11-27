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
    <div className={cn('flex gap-1 w-fit', sortEnabled && 'cursor-pointer')}>
      {children}
      {sortEnabled &&
        (sortDirection === 'asc' ? (
          <TbSortAscending />
        ) : sortDirection === 'desc' ? (
          <TbSortDescending />
        ) : (
          <TbArrowsSort className="text-gray-500" />
        ))}
    </div>
  )
}
