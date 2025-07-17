import type { Table, PaginationState } from '@tanstack/react-table'
import { useSearchParams, useRouter } from 'next/navigation'
import { Dispatch, SetStateAction, useEffect, useMemo } from 'react'
import PaginationArrowButton from './PaginationArrowButton'
import PaginationPageNumbers from './PaginationPageNumbers'
import PaginationPageSizeSelector from './PaginationPageSizeSelector'

interface PaginationProps {
  pagination: PaginationState
  setPagination: Dispatch<SetStateAction<PaginationState>>
  data: unknown[]
  table: Table<unknown>
}

export function Pagination({ pagination, setPagination, data, table }: PaginationProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  // Memoize calculations for readability
  const { totalPages, maxPageButtons, currentSetStart, currentSetEnd } = useMemo(() => {
    const totalPages = Math.ceil(data.length / pagination.pageSize)
    const maxPageButtons = 5
    const currentSetStart = Math.floor(pagination.pageIndex / maxPageButtons) * maxPageButtons
    const currentSetEnd = Math.min(currentSetStart + maxPageButtons, totalPages)
    return { totalPages, maxPageButtons, currentSetStart, currentSetEnd }
  }, [data.length, pagination.pageSize, pagination.pageIndex])

  // Page validation
  useEffect(() => {
    const requestedPage = parseInt(searchParams?.get('page') ?? '1')
    if (requestedPage > totalPages || requestedPage < 1) {
      const params = new URLSearchParams(searchParams?.toString() ?? '')
      params.set('page', '1')
      router.replace(`?${params.toString()}`, { scroll: false })
      setPagination(prev => ({ ...prev, pageIndex: 0 }))
    }
  }, [searchParams, data.length, pagination.pageSize, router, setPagination, totalPages])

  // Update URL with 1-indexed page number
  useEffect(() => {
    if (!searchParams) return
    const params = new URLSearchParams(searchParams.toString())
    params.set('page', (pagination.pageIndex + 1).toString())
    router.replace(`?${params.toString()}`, { scroll: false })
  }, [pagination.pageIndex, searchParams, router])

  // Page navigation
  const goToPage = (pageIndex: number) => setPagination(prev => ({ ...prev, pageIndex }))
  const goToNextSet = () => goToPage(Math.min(currentSetStart + maxPageButtons, totalPages - 1))
  const goToPrevSet = () => goToPage(Math.max(currentSetStart - maxPageButtons, 0))

  return (
    <div className="flex justify-center items-center space-x-2 mt-4">
      <PaginationArrowButton
        direction="prev"
        disabled={!table.getCanPreviousPage()}
        onClick={() => table.previousPage()}
      />
      {currentSetStart > 0 && <PaginationEllipsis onClick={goToPrevSet} />}
      <PaginationPageNumbers
        goToPage={goToPage}
        pagination={pagination}
        currentSetStart={currentSetStart}
        currentSetEnd={currentSetEnd}
      />
      {currentSetEnd < totalPages && <PaginationEllipsis onClick={goToNextSet} />}
      <PaginationArrowButton
        direction="next"
        disabled={!table.getCanNextPage()}
        onClick={() => table.nextPage()}
      />
      <PaginationPageSizeSelector table={table} />
    </div>
  )
}

interface PaginationEllipsisProps {
  onClick: () => void
}

function PaginationEllipsis({ onClick }: PaginationEllipsisProps) {
  return (
    <button className="w-7" aria-label="More pages" tabIndex={0} onClick={onClick}>
      ...
    </button>
  )
}
