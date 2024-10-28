import { ReactNode, useMemo } from 'react'
import { UsePaginatedQueryResult } from '@/shared/hooks/usePagination'
import { Button } from '@/components/Button'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface UseSimplePaginationResult<T> {
  paginationElement: ReactNode
  currentResults: T[]
}

export function usePaginationUi<T>(
  paginationResult: UsePaginatedQueryResult<T>,
): UseSimplePaginationResult<T> {
  const {
    currentResults,
    totalPages,
    tablePage,
    nextTablePage,
    previousTablePage,
    isLoading,
    goToTablePage,
  } = paginationResult

  const paginationElement = useMemo(() => {
    const getPageNumbers = () => {
      const maxVisiblePages = 5
      const pages = []
      const start = Math.max(0, Math.min(tablePage - 2, totalPages - maxVisiblePages))
      const end = Math.min(start + maxVisiblePages, totalPages)

      for (let i = start; i < end; i++) {
        pages.push(i)
      }

      return pages
    }

    return (
      <div className="flex gap-x-1 items-center justify-center">
        <PaginationButton
          text={<ChevronLeft />}
          onClick={previousTablePage}
          disabled={tablePage === 0 || isLoading}
        />
        {getPageNumbers().map(pageNumber => (
          <PaginationButton
            key={pageNumber}
            onClick={() => goToTablePage(pageNumber)}
            disabled={isLoading}
            text={pageNumber + 1}
            isActive={pageNumber === tablePage}
          />
        ))}
        <PaginationButton
          text={<ChevronRight />}
          onClick={nextTablePage}
          disabled={tablePage === totalPages - 1 || isLoading}
        />
      </div>
    )
  }, [tablePage, totalPages, isLoading, nextTablePage, previousTablePage, goToTablePage])

  return {
    paginationElement,
    currentResults,
  }
}

const PaginationButton = ({
  text,
  onClick,
  disabled,
  isActive,
}: {
  text: ReactNode
  onClick: () => void
  disabled?: boolean
  isActive?: boolean
}) => (
  <Button onClick={onClick} disabled={disabled} variant={isActive ? 'pagination-active' : 'pagination'}>
    {text}
  </Button>
)
