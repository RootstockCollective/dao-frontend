import { Button } from '@/components/Button'
import { Paragraph, Span } from '@/components/Typography'
import type { CommonComponentProps } from '@/components/commonProps'
import { cn } from '@/lib/utils'
import { useEffect, useState, useMemo } from 'react'

const modes = ['cyclic', 'expandable'] as const
type Mode = (typeof modes)[number]
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
  <Paragraph
    variant="body-xs"
    className="text-v3-bg-accent-0 select-none first-letter:uppercase"
    data-testid="table-pager-count"
  >
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

  if (!isMode(mode)) {
    throw new Error(`Invalid mode: ${mode}`)
  }

  const [{ start, end }, setRange] = useState(() => getDefaultRange(pageSize, totalItems))

  useEffect(() => {
    // reset only when mode changes
    setRange(getDefaultRange(pageSize, totalItems))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode])

  useEffect(() => {
    // if total increases, keep current range
    // if total decreases below current end, clamp down
    setRange(prev => {
      if (!totalItems) return prev
      if (prev.start === 0) return getDefaultRange(pageSize, totalItems) // safety for initial 0
      if (prev.end > totalItems) return { ...prev, end: totalItems }
      return prev
    })
  }, [totalItems, pageSize]) // (optional) remove pageSize if it's constant

  const handleNext = () => {
    if (totalItems) {
      nextPageHandlers[mode]({ end, pageSize, totalItems, onPageChange, setRange })
    }
  }

  // Calculate remaining items for next page
  const remainingItems = useMemo(() => {
    if (isExpandable(mode)) {
      const remainingTotal = Math.max(0, totalItems - end)
      return Math.min(pageSize, remainingTotal)
    }
    if (isCyclic(mode)) {
      if (end + 1 > totalItems) {
        return Math.min(pageSize, totalItems)
      }
      return Math.min(pageSize, totalItems - end)
    }
    return 0
  }, [end, mode, pageSize, totalItems])
  const isNextExpandableButtonVisible = isExpandable(mode) && remainingItems > 0
  const isNextCyclicButtonVisible = isCyclic(mode) && remainingItems > 0

  return (
    <div
      className={cn(
        'w-full flex items-center mt-0 md:mt-6',
        isNextExpandableButtonVisible || isNextCyclicButtonVisible ? 'justify-between' : 'justify-end',
        className,
      )}
    >
      {isNextExpandableButtonVisible && (
        <Button
          variant="secondary"
          onClick={handleNext}
          aria-label={`Show next ${remainingItems} ${pagedItemName}`}
          data-testid="table-pager-next"
          disabled={isExpandable(mode) && end >= totalItems}
          className="border border-v3-bg-accent-40 px-2 py-1 w-auto"
        >
          <Span className="text-sm hidden md:inline">
            Show next {remainingItems} {pagedItemName}
          </Span>
          <Span className="text-sm inline md:hidden">Show next {remainingItems}</Span>
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
