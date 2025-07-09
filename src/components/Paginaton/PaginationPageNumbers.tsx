import { useMemo } from 'react'
import { cn } from '@/lib/utils'
import type { PaginationState } from '@tanstack/react-table'

interface PaginationPageNumbersProps {
  pagination: PaginationState
  goToPage: (pageIndex: number) => void
  currentSetStart: number
  currentSetEnd: number
}

// Renders page number buttons for pagination
export default function PaginationPageNumbers({
  goToPage,
  pagination,
  currentSetStart,
  currentSetEnd,
}: PaginationPageNumbersProps) {
  const pageNumbers = useMemo(
    () => Array.from({ length: currentSetEnd - currentSetStart }, (_, index) => currentSetStart + index),
    [currentSetStart, currentSetEnd],
  )
  return (
    <>
      {pageNumbers.map(page => {
        const isActive = page === pagination.pageIndex
        return (
          <button
            key={page}
            onClick={() => goToPage(page)}
            aria-label={`Go to page ${page + 1}`}
            tabIndex={0}
            className="w-7 h-7 p-[3px] rounded-sm border border-bg-40"
          >
            <div
              className={cn(
                { 'bg-bg-40': isActive },
                'h-full w-full rounded-xs text-sm font-rootstock-sans flex items-center justify-center',
              )}
            >
              {page + 1}
            </div>
          </button>
        )
      })}
    </>
  )
}
