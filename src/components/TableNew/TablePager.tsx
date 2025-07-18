import { Button } from '@/components/ButtonNew/Button'
import { Paragraph, Span } from '@/components/TypographyNew'
import { CommonComponentProps } from '@/components/commonProps'
import { cn } from '@/lib/utils'
import { useEffect, useState } from 'react'

const modes = ['cyclic', 'expandable'] as const
export type Mode = (typeof modes)[number]
const isMode = (mode: string): mode is Mode => modes.includes(mode as Mode)
const isExpandable = (mode: Mode) => mode === 'expandable'
const isCyclic = (mode: Mode) => mode === 'cyclic'

export type Range = {
  start: number
  end: number
}

export interface TablePagerProps extends CommonComponentProps {
  pageSize: number
  totalItems: number
  pagedItemName: string
  onPageChange: (range: Range) => void
  mode: Mode
}

const PagerCount: React.FC<{
  start: number
  end: number
  total: number
  itemName: string
}> = ({ start, end, total, itemName }) => (
  <Paragraph variant="body-xs" className="text-v3-bg-accent-0 select-none" data-testid="table-pager-count">
    {itemName} {start} – {end} out of {total}
  </Paragraph>
)
type NextPageHandler = (props: {
  end: number
  pageSize: number
  totalItems: number
  onPageChange: TablePagerProps['onPageChange']
  setRange: (range: { start: number; end: number }) => void
}) => void
const handleNextExpandable: NextPageHandler = ({ end, pageSize, totalItems, onPageChange, setRange }) => {
  const newEnd = Math.min(end + pageSize, totalItems)
  setRange({ start: 1, end: newEnd })
  onPageChange({ start: 0, end: newEnd })
}

const handleNextCyclic: NextPageHandler = ({ end, pageSize, totalItems, onPageChange, setRange }) => {
  const nextStart = end + 1
  const nextEnd = Math.min(end + pageSize, totalItems)
  if (nextStart > totalItems) {
    setRange({ start: 1, end: Math.min(pageSize, totalItems) })
    onPageChange({ start: 0, end: pageSize })
  } else {
    setRange({ start: nextStart, end: nextEnd })
    onPageChange({ start: nextStart - 1, end: nextEnd })
  }
}
const nextPageHandlers: Record<Mode, NextPageHandler> = {
  expandable: handleNextExpandable,
  cyclic: handleNextCyclic,
} as const

const getDefaultRange = (pageSize: number, totalItems: number) => ({
  start: totalItems && 1,
  end: Math.min(pageSize, totalItems),
})

/**
 * TablePager component
 * @warning THE CYCLIC MODE IS NOT YET FULLY IMPLEMENTED!
 * @param pageSize - The number of items to show per page
 * @param totalItems - The total number of items
 * @param pagedItemName - The name of the paged item
 * @param onPageChange - The function to call when the page changes
 * @param mode - The mode of the pager (cyclic or expandable)
 * @param className - The className to apply to the pager
 */
export const TablePager: React.FC<TablePagerProps> = ({
  pageSize,
  totalItems = 0,
  pagedItemName,
  onPageChange,
  mode,
  className,
}) => {
  const [{ start, end }, setRange] = useState(getDefaultRange(pageSize, totalItems))

  if (!isMode(mode)) {
    throw new Error(`Invalid mode: ${mode}`)
  }

  // Reset the range when the mode, pageSize, or totalItems changes
  useEffect(() => {
    setRange(getDefaultRange(pageSize, totalItems))
  }, [mode, totalItems, pageSize])

  const handleNext = () => {
    if (totalItems) {
      nextPageHandlers[mode]({ end, pageSize, totalItems, onPageChange, setRange })
    }
  }

  const isNextExpandableButtonVisible = isExpandable(mode) && totalItems > pageSize
  const isNextCyclicButtonVisible = isCyclic(mode)

  return (
    <div
      className={cn(
        'w-full flex items-center mt-6',
        isNextExpandableButtonVisible || isNextCyclicButtonVisible ? 'justify-between' : 'justify-end',
        className,
      )}
    >
      {isNextExpandableButtonVisible && (
        <Button
          variant="secondary"
          onClick={handleNext}
          aria-label={`Show next ${pageSize} ${pagedItemName}`}
          data-testid="table-pager-next"
          disabled={isExpandable(mode) && end >= totalItems}
          className="border border-v3-bg-accent-40 px-2 py-1"
        >
          <Span className="text-sm">
            Show next {pageSize} {pagedItemName}
          </Span>
        </Button>
      )}
      {isNextCyclicButtonVisible && (
        <div className="flex items-center gap-2">
          {/* TODO: Add first, previous, next, and last buttons and remove the warning in the component description */}
        </div>
      )}
      <PagerCount start={start} end={end} total={totalItems} itemName={pagedItemName} />
    </div>
  )
}

export default TablePager
