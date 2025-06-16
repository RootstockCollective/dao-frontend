import { Button } from '@/components/ButtonNew/Button'
import { Paragraph } from '@/components/TypographyNew'
import { useEffect, useState } from 'react'

interface TablePagerProps {
  pageSize: number
  totalItems: number
  pagedItemName: string
  onPageChange: (startIndex: number, endIndex: number) => void
  mode: 'cyclic' | 'expandable'
}

export const TablePager: React.FC<TablePagerProps> = ({
  pageSize,
  totalItems,
  pagedItemName,
  onPageChange,
  mode,
}) => {
  const [currentPage, setCurrentPage] = useState(0)
  const [expandEnd, setExpandEnd] = useState(pageSize)

  let start: number
  let end: number
  let isButtonDisabled = false

  if (mode === 'expandable') {
    start = totalItems === 0 ? 0 : 1
    end = Math.min(expandEnd, totalItems)
    isButtonDisabled = end >= totalItems
  } else {
    start = totalItems === 0 ? 0 : currentPage * pageSize + 1
    end = Math.min((currentPage + 1) * pageSize, totalItems)
    // Clamp start and end to never exceed totalItems
    if (start > totalItems) start = totalItems
    if (end < start) end = start
  }

  const hasItems = totalItems > 0

  const handleNext = () => {
    if (mode === 'expandable') {
      const newEnd = Math.min(expandEnd + pageSize, totalItems)
      setExpandEnd(newEnd)
      onPageChange(0, newEnd)
    } else {
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
  }

  useEffect(() => {
    // Reset state if mode or totalItems changes
    setCurrentPage(0)
    setExpandEnd(pageSize)
  }, [mode, totalItems, pageSize])

  return (
    <div className="w-full flex items-center justify-between mt-6">
      {hasItems && (
        <Button
          variant="secondary"
          onClick={handleNext}
          aria-label={`Show next ${pageSize} ${pagedItemName}`}
          data-testid="table-pager-next"
          disabled={mode === 'expandable' && isButtonDisabled}
          className="border border-v3-bg-accent-40 px-2 py-1"
          textClassName="text-sm font-normal"
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
