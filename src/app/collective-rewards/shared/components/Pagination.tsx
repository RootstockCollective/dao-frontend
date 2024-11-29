import { FC, useContext } from 'react'
import { PaginatedDataContext } from '@/app/collective-rewards/context/PaginatedDataContext'
import { PaginationButton } from './PaginationButton'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export const Pagination: FC = () => {
  const { currentPage, pageCount, updateCurrentPage } = useContext(PaginatedDataContext)

  return (
    <div className="flex gap-x-1 items-center justify-center">
      <PaginationButton
        text={<ChevronLeft />}
        onClick={() => updateCurrentPage(currentPage - 1)}
        disabled={currentPage === 0}
      />
      {Array(pageCount)
        .fill(1)
        .map((_, pageNumber) => (
          <PaginationButton
            key={pageNumber}
            onClick={() => updateCurrentPage(pageNumber)}
            text={pageNumber + 1}
            isActive={pageNumber === currentPage}
          />
        ))}
      <PaginationButton
        text={<ChevronRight />}
        onClick={() => updateCurrentPage(currentPage + 1)}
        disabled={currentPage === pageCount - 1}
      />
    </div>
  )
}
