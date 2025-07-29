import { ReactNode, useMemo, useState } from 'react'
import { Button } from '@/components/Button'
import { ChevronLeft, ChevronRight } from 'lucide-react'
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
    const maxVisiblePages = 5
    const getPageNumbers = () => {
      const pages = []
      const start = Math.max(0, Math.min(tablePage - 2, totalPages - maxVisiblePages))
      const end = Math.min(start + maxVisiblePages, totalPages)

      for (let i = start; i < end; i++) {
        pages.push(i)
      }

      return pages
    }

    const maxPageButtons = 5
    const currentSetStart = Math.floor(tablePage / maxPageButtons) * maxPageButtons
    const currentSetEnd = Math.min(currentSetStart + maxPageButtons, totalPages)

    return (
      <div className="flex justify-center items-center space-x-2 mt-4">
        <PaginationArrowButton
          direction="prev"
          onClick={previousTablePage}
          disabled={tablePage === 0 || isLoading}
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
        />
      </div>
    )
  }, [tablePage, totalPages, isLoading, nextTablePage, previousTablePage, goToTablePage])

  return {
    paginationElement,
    currentResults,
  }
}

export function useBasicPaginationUi(totalPages: number) {
  const [currentPage, setCurrentPage] = useState(0)
  const maxVisiblePages = 5

  const setPage = (nextPage: number) => {
    if (nextPage < 0 || nextPage >= totalPages) return
    if (nextPage === currentPage) return
    setCurrentPage(nextPage)
  }

  const getPageNumbers = () => {
    const pages = []
    const start = Math.max(0, Math.min(currentPage - 2, totalPages - maxVisiblePages))
    const end = Math.min(start + maxVisiblePages, totalPages)

    for (let i = start; i < end; i++) {
      pages.push(i)
    }
    return pages
  }

  const paginationUi = (
    <div className="flex gap-x-1 items-center justify-center">
      <PaginationButton
        text={<ChevronLeft />}
        onClick={() => setPage(currentPage - 1)}
        disabled={currentPage === 0}
      />
      {getPageNumbers().map(pageNumber => (
        <PaginationButton
          key={pageNumber}
          onClick={() => setPage(pageNumber)}
          text={pageNumber + 1}
          isActive={pageNumber === currentPage}
        />
      ))}
      <PaginationButton
        text={<ChevronRight />}
        onClick={() => setPage(currentPage + 1)}
        disabled={currentPage === totalPages - 1}
      />
    </div>
  )

  return { paginationUi, currentPage }
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
