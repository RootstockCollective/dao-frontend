import { ReactNode, useMemo } from 'react'
import PaginationArrowButton from '@/components/Pagination/PaginationArrowButton'
import PaginationPageNumbers from '@/components/Pagination/PaginationPageNumbers'

interface UseSimplePaginationResult<T> {
  paginationElement: ReactNode
  currentResults: T[]
}

interface UseSimplePaginationOptions<T> {
  currentResults: T[]
  totalPages: number
  tablePage: number
  nextTablePage: () => void
  previousTablePage: () => void
  isLoading: boolean
  goToTablePage: (pageNumber: number) => void
}

export function usePaginationUi<T>(
  paginationResult: UseSimplePaginationOptions<T>,
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
    const maxPageButtons = 5
    const currentSetStart = Math.floor(tablePage / maxPageButtons) * maxPageButtons
    const currentSetEnd = Math.min(currentSetStart + maxPageButtons, totalPages)

    return (
      <div className="flex justify-center items-center space-x-2 mt-4">
        <PaginationArrowButton
          direction="prev"
          onClick={previousTablePage}
          disabled={tablePage === 0 || isLoading}
          data-testid="PaginationPrev"
        />
        <PaginationPageNumbers
          goToPage={goToTablePage}
          pagination={{
            pageIndex: tablePage,
            pageSize: 10, // or whatever your page size is
          }}
          currentSetStart={currentSetStart}
          currentSetEnd={currentSetEnd}
        />
        <PaginationArrowButton
          direction="next"
          onClick={nextTablePage}
          disabled={tablePage === totalPages - 1 || isLoading}
          data-testid="PaginationNext"
        />
      </div>
    )
  }, [tablePage, totalPages, isLoading, nextTablePage, previousTablePage, goToTablePage])

  return {
    paginationElement,
    currentResults,
  }
}
