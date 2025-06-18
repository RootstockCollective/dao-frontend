import { Button } from '@/components/ButtonNew/Button'
import { Paragraph } from '@/components/TypographyNew'
import { CommonComponentProps } from '@/components/commonProps'
import { useEffect, useState } from 'react'

interface TablePagerProps {
  pageSize: number
  totalItems: number
  pagedItemName: string
  onPageChange: (startIndex: number, endIndex: number) => void
  mode: 'cyclic' | 'expandable'
}

const PagerContainer: React.FC<CommonComponentProps> = ({ children, className = '' }) => (
  <div className={`w-full flex items-center justify-between mt-6 ${className}`}>{children}</div>
)

const PagerCount: React.FC<{
  start: number
  end: number
  total: number
  itemName: string
}> = ({ start, end, total, itemName }) => (
  <Paragraph variant="body-xs" className="text-v3-bg-accent-0" data-testid="table-pager-count">
    {itemName} {start} – {end} out of {total}
  </Paragraph>
)

export const TablePager: React.FC<TablePagerProps> = ({
  pageSize,
  totalItems,
  pagedItemName,
  onPageChange,
  mode,
}) => {
  const [{ start, end }, setRange] = useState(() => ({
    start: totalItems === 0 ? 0 : 1,
    end: Math.min(pageSize, totalItems),
  }))

  useEffect(() => {
    setRange({
      start: totalItems === 0 ? 0 : 1,
      end: Math.min(pageSize, totalItems),
    })
  }, [mode, totalItems, pageSize])

  if (totalItems <= pageSize) {
    return null
  }

  const isButtonDisabled = mode === 'expandable' ? end >= totalItems : false

  const handleNext = () => {
    if (totalItems === 0) return
    if (mode === 'expandable') {
      const newEnd = Math.min(end + pageSize, totalItems)
      setRange({ start: 1, end: newEnd })
      onPageChange(0, newEnd)
    } else {
      const nextStart = end + 1
      const nextEnd = Math.min(end + pageSize, totalItems)
      if (nextStart > totalItems) {
        setRange({ start: 1, end: Math.min(pageSize, totalItems) })
        onPageChange(0, pageSize)
      } else {
        setRange({ start: nextStart, end: nextEnd })
        onPageChange(nextStart - 1, nextEnd)
      }
    }
  }

  return (
    <PagerContainer>
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
      <PagerCount start={start} end={end} total={totalItems} itemName={pagedItemName} />
    </PagerContainer>
  )
}

export default TablePager
