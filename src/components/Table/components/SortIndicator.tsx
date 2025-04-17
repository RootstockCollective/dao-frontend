import { type SortDirection } from '@tanstack/react-table'
import { type PropsWithChildren } from 'react'
import { ArrowsSortIcon, SortAscendingIcon, SortDescendingIcon } from '@/components/Icons'
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
            <SortAscendingIcon />
          ) : sortDirection === 'desc' ? (
            <SortDescendingIcon />
          ) : (
            <ArrowsSortIcon className="text-gray-500" />
          )}
        </div>
      )}
      <div>{children}</div>
    </div>
  )
}
