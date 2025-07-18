import { type SortDirection } from '@tanstack/react-table'
import { type PropsWithChildren } from 'react'
import { cn } from '@/lib/utils'
import { DoubleArrowIcon } from './icons/DoubleArrowIcon'
import { ArrowIcon } from './icons/ArrowIcon'

interface SortIndicatorProps extends PropsWithChildren {
  sortDirection: SortDirection | false
  sortEnabled?: boolean
}

export function SortIndicator({ children, sortDirection, sortEnabled = true }: SortIndicatorProps) {
  return (
    <div
      className={cn('flex items-start gap-1', {
        'cursor-pointer': sortEnabled,
      })}
    >
      {sortEnabled && (
        <div className={cn('pt-1 flex items-center', { 'opacity-50': !sortEnabled })}>
          {sortDirection === 'asc' ? (
            <ArrowIcon />
          ) : sortDirection === 'desc' ? (
            <ArrowIcon className="rotate-180" />
          ) : (
            <DoubleArrowIcon />
          )}
        </div>
      )}
      <div className="grow">{children}</div>
    </div>
  )
}
