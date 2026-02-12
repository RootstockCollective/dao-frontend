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

export interface Range {
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
  start: totalItems > 0 ? 1 : 0,
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

  // Reset ONLY on mode change (don’t tie to totalItems/pageSize or you'll reset on fetch)
  useEffect(() => {
    setRange(getDefaultRange(pageSize, totalItems))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode])

  // Clamp to total and initialize when items appear
  useEffect(() => {
    setRange(prev => {
      if (!totalItems) return prev

      // initialize 0→positive
      if (prev.start === 0 && prev.end === 0) {
        return getDefaultRange(pageSize, totalItems)
      }

      // clamp end if total shrank
      if (prev.end > totalItems) {
        return { ...prev, end: totalItems }
      }

      // If totalItems changed and end is less than what we should show,
      // update end to reflect available items (for expandable mode)
      if (isExpandable(mode)) {
        const minEnd = Math.min(pageSize, totalItems)
        if (prev.end < minEnd && prev.end < totalItems) {
          return { ...prev, end: minEnd }
        }
      }

      return prev
    })
  }, [totalItems, pageSize, mode])

  // React to pageSize/mode changes WITHOUT needing the previous value:
  // - cyclic: force window size == pageSize
  // - expandable: do nothing (preserve user-grown window)
  useEffect(() => {
    if (!totalItems) return
    if (mode !== 'cyclic') return

    setRange(prev => {
      const desiredEnd = Math.min(prev.start + pageSize - 1, totalItems)
      return desiredEnd !== prev.end ? { ...prev, end: desiredEnd } : prev
    })
  }, [pageSize, mode, totalItems])

  const handleNext = () => {
    if (totalItems) {
      nextPageHandlers[mode]({ end, pageSize, totalItems, onPageChange, setRange })
    }
  }

  const remainingItems = useMemo(() => {
    if (isExpandable(mode)) {
      const remainingTotal = Math.max(0, totalItems - end)
      return Math.min(pageSize, remainingTotal)
    }
    if (isCyclic(mode)) {
      if (end + 1 > totalItems) return Math.min(pageSize, totalItems)
      return Math.min(pageSize, totalItems - end)
    }
    return 0
  }, [end, mode, pageSize, totalItems])

  const showExpandableNext = isExpandable(mode) && remainingItems > 0
  const showCyclicNext = isCyclic(mode) && remainingItems > 0

  return (
    <div
      className={cn(
        'w-full flex items-center mt-0 md:mt-6',
        showExpandableNext || showCyclicNext ? 'justify-between' : 'justify-end',
        className,
      )}
    >
      {showExpandableNext && (
        <Button
          variant="secondary"
          onClick={handleNext}
          aria-label={`Show next ${remainingItems} ${pagedItemName}`}
          data-testid="table-pager-next"
          disabled={end >= totalItems}
          className="border border-v3-bg-accent-40 px-2 py-1 w-auto"
        >
          <Span className="text-sm hidden md:inline">
            Show next {remainingItems} {pagedItemName}
          </Span>
          <Span className="text-sm inline md:hidden">Show next {remainingItems}</Span>
        </Button>
      )}

      {showCyclicNext && (
        <div className="flex items-center gap-2">{/* TODO: first/prev/next/last for cyclic mode */}</div>
      )}

      <PagerCount start={start} end={end} total={totalItems} itemName={pagedItemName} />
    </div>
  )
}
