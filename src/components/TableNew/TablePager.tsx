import { Button } from '@/components/ButtonNew/Button'
import { Paragraph } from '@/components/TypographyNew'
import React, { useState } from 'react'

interface TablePagerProps {
  pageSize: number
  totalItems: number
  pagedItemName: string
  onPageChange: (startIndex: number, endIndex: number) => void
}

export const TablePager: React.FC<TablePagerProps> = ({
  pageSize,
  totalItems,
  pagedItemName,
  onPageChange,
}) => {
  const [currentPage, setCurrentPage] = useState(0)
  let start = totalItems === 0 ? 0 : currentPage * pageSize + 1
  let end = Math.min((currentPage + 1) * pageSize, totalItems)
  const hasItems = totalItems > 0

  // Clamp start and end to never exceed totalItems
  if (start > totalItems) start = totalItems
  if (end < start) end = start

  const handleNext = () => {
    const nextPage = currentPage + 1
    if (nextPage * pageSize >= totalItems) {
      // Loop back to start
      setCurrentPage(0)
      onPageChange(0, pageSize)
    } else {
      setCurrentPage(nextPage)
      onPageChange(nextPage * pageSize, (nextPage + 1) * pageSize)
    }
  }

  return (
    <div className="w-full flex items-center justify-between mt-6">
      {hasItems && (
        <Button
          variant="pagination"
          onClick={handleNext}
          aria-label={`Show next ${pageSize} ${pagedItemName}`}
          data-testid="table-pager-next"
        >
          Show next {pageSize} {pagedItemName}
        </Button>
      )}
      <Paragraph variant="body-xs" className="text-v3-bg-accent-0 ml-auto" data-testid="table-pager-count">
        {pagedItemName} {start} – {end} out of {totalItems}
      </Paragraph>
    </div>
  )
}

export default TablePager
