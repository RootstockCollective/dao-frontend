'use client'

import { KeyboardEvent, useRef } from 'react'

import { ComparativeProgressBar } from '@/components/ComparativeProgressBar/ComparativeProgressBar'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { Label, Paragraph, Span } from '@/components/Typography'
import { cn } from '@/lib/utils'

import { SPLIT_COLORS } from '../../constants/dashboardColors'
import { CARD_RADIUS } from '../../constants/dashboardSurface'
import { CycleHistoryEntry } from '../../types'
import {
  formatBackingCompact,
  formatCycleWindow,
  formatSplitLabel,
  formatUsdWhole,
} from '../../utils/dashboardFormatters'

interface Column {
  id: string
  label: string
  /** Percentage of the table width. */
  width: string
}

const COLUMNS: Column[] = [
  { id: 'cycle', label: 'Cycle', width: '11%' },
  { id: 'window', label: 'Window', width: '15%' },
  { id: 'backing', label: 'Backing', width: '9%' },
  { id: 'rewards', label: 'Rewards', width: '11%' },
  { id: 'split', label: 'Backer / Builder split', width: '32%' },
  { id: 'backers', label: 'Backers', width: '9%' },
  { id: 'status', label: 'Status', width: '13%' },
]

/**
 * Selection is a filled row plus a short accent bar in the first cell, rather than an outline
 * around the whole row. An outline had to be assembled per cell — borders on a `<tr>` don't
 * render reliably — which meant `border-separate`, a transparent border on every cell to stop
 * the rows shifting, and rounded corners split across two cells. A background needs none of
 * that, and it reads as quieter next to ten other rows.
 */
const cellClasses = (isFirst: boolean, isLast: boolean) =>
  cn('py-4 align-middle', isFirst && 'relative pl-4 md:pl-6', isLast && 'pr-4 md:pr-6')

const EmptyState = ({ children }: { children: string }) => (
  <div className="flex items-center justify-center py-12">
    <Paragraph className="text-v3-text-40">{children}</Paragraph>
  </div>
)

const SplitCell = ({ backersShare }: { backersShare: number | null }) => {
  if (backersShare === null) {
    return <Span className="text-v3-text-40">—</Span>
  }

  const backersPct = Math.round(backersShare * 100)

  return (
    // `min-w-0` lets the bar shrink inside the fixed column instead of spilling into Backers.
    <div className="flex items-center gap-3 pr-8 min-w-0">
      <ComparativeProgressBar
        segmented
        className="flex-1 min-w-[48px]"
        aria-label={`Backers ${backersPct}%, Builders ${100 - backersPct}%`}
        values={[
          { value: backersShare, color: SPLIT_COLORS.backers },
          { value: 1 - backersShare, color: SPLIT_COLORS.builders },
        ]}
      />
      <Span variant="body-s" className="text-v3-text-40 whitespace-nowrap">
        {formatSplitLabel(backersShare)}
      </Span>
    </div>
  )
}

/** A bordered pill, so the two states read as one column of tokens rather than loose words. */
const StatusCell = ({ status }: { status: CycleHistoryEntry['status'] }) => {
  const isRunning = status === 'running'

  return (
    <Span
      variant="tag-s"
      caps
      className={cn(
        'inline-flex shrink-0 rounded-full border px-2.5 py-1 tracking-wider whitespace-nowrap',
        isRunning ? 'border-v3-primary/50 text-v3-primary' : 'border-v3-bg-accent-60 text-v3-text-40',
      )}
    >
      {isRunning ? 'Running' : 'Settled'}
    </Span>
  )
}

interface CycleRowProps {
  cycle: CycleHistoryEntry
  isSelected: boolean
  /** Only one row is in the tab order; the arrow keys move between them. */
  isTabbable: boolean
  onSelect?: (cycleNumber: number) => void
  onNavigate?: (offset: number) => void
}

const CycleRow = ({ cycle, isSelected, isTabbable, onSelect, onNavigate }: CycleRowProps) => {
  const isSelectable = Boolean(onSelect)

  const handleKeyDown = (event: KeyboardEvent<HTMLTableRowElement>) => {
    if (!onSelect) return

    if (event.key === 'Enter' || event.key === ' ') {
      // Space would otherwise scroll the page out from under the table.
      event.preventDefault()
      onSelect(cycle.cycleNumber)
      return
    }

    const offset = { ArrowDown: 1, ArrowUp: -1 }[event.key]
    if (offset) {
      event.preventDefault()
      onNavigate?.(offset)
    }
  }

  const cell = (index: number) => ({
    role: 'gridcell' as const,
    className: cellClasses(index === 0, index === COLUMNS.length - 1),
  })

  return (
    <tr
      aria-selected={isSelectable ? isSelected : undefined}
      tabIndex={isSelectable ? (isTabbable ? 0 : -1) : undefined}
      onClick={isSelectable ? () => onSelect?.(cycle.cycleNumber) : undefined}
      onKeyDown={handleKeyDown}
      className={cn(
        'transition-colors border-t border-v3-bg-accent-60',
        isSelected && 'bg-v3-bg-accent-60/80',
        isSelectable &&
          'cursor-pointer hover:bg-v3-bg-accent-60/60 focus-visible:bg-v3-bg-accent-60 focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-v3-text-100',
      )}
      data-testid={`cycle-history-row-${cycle.cycleNumber}`}
    >
      <td {...cell(0)}>
        {/* Decorative: the row already announces itself through `aria-selected`. */}
        {isSelected && (
          <span
            aria-hidden
            className="absolute left-0 top-1/2 h-7 w-0.5 -translate-y-1/2 rounded-full bg-v3-primary"
          />
        )}
        <Span className="font-kk-topo text-v3-text-100">Cycle {cycle.cycleNumber}</Span>
      </td>

      <td {...cell(1)}>
        <Span variant="body-s" className="text-v3-text-40 whitespace-nowrap">
          {formatCycleWindow(cycle.start, cycle.end)}
        </Span>
      </td>

      <td {...cell(2)}>
        <Span className="text-v3-text-100">{formatBackingCompact(cycle.backing)}</Span>
      </td>

      <td {...cell(3)}>
        <Span className="text-v3-text-100">{formatUsdWhole(cycle.rewardsFiat)}</Span>
      </td>

      <td {...cell(4)}>
        <SplitCell backersShare={cycle.backersShare} />
      </td>

      <td {...cell(5)}>
        <Span className="text-v3-text-100">{cycle.backersCount ?? '—'}</Span>
      </td>

      <td {...cell(6)}>
        <StatusCell status={cycle.status} />
      </td>
    </tr>
  )
}

export interface CycleHistoryTableProps {
  cycles: CycleHistoryEntry[]
  /** Cycle number currently driving the cards above the table. */
  selectedCycle?: number | null
  /** Omit to render the table read-only. */
  onSelectCycle?: (cycleNumber: number) => void
  isLoading?: boolean
  className?: string
}

export const CycleHistoryTable = ({
  cycles,
  selectedCycle = null,
  onSelectCycle,
  isLoading = false,
  className,
}: CycleHistoryTableProps) => {
  const bodyRef = useRef<HTMLTableSectionElement>(null)

  const selectedIndex = cycles.findIndex(({ cycleNumber }) => cycleNumber === selectedCycle)
  // With nothing selected the first row carries the tab stop, so the table is still reachable.
  const tabbableIndex = selectedIndex === -1 ? 0 : selectedIndex

  const navigateFrom = (index: number, offset: number) => {
    const nextIndex = Math.min(Math.max(index + offset, 0), cycles.length - 1)
    if (nextIndex === index) return

    onSelectCycle?.(cycles[nextIndex].cycleNumber)
    bodyRef.current?.querySelectorAll('tr')[nextIndex]?.focus()
  }

  return (
    <div
      className={cn('bg-v3-bg-accent-80 overflow-hidden', CARD_RADIUS, className)}
      data-testid="cycle-history"
    >
      {/* The rule separates the panel's title from the grid, which starts its own header row. */}
      <div className="flex items-baseline justify-between gap-4 border-b border-v3-bg-accent-60 p-4 md:p-6">
        <Label variant="tag-s" caps className="text-v3-text-40 tracking-wider">
          Cycle history
        </Label>
        {onSelectCycle && cycles.length > 0 && (
          <Span variant="body-xs" className="text-v3-text-40 text-right">
            Select a row to load it above
          </Span>
        )}
      </div>

      {isLoading && cycles.length === 0 ? (
        // Sized explicitly: the default scales to 20% of its container, which is enormous here.
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner size="small" />
        </div>
      ) : cycles.length === 0 ? (
        <EmptyState>No cycles to show yet</EmptyState>
      ) : (
        // Full-bleed so a selected row's fill reaches both edges of the panel; the cells carry
        // the horizontal padding instead.
        <div className="w-full overflow-x-auto">
          <table role="grid" className="w-full min-w-[860px] table-fixed">
            <colgroup>
              {COLUMNS.map(({ id, width }) => (
                <col key={id} style={{ width }} />
              ))}
            </colgroup>

            <thead>
              <tr>
                {COLUMNS.map(({ id, label }, index) => (
                  <th
                    key={id}
                    scope="col"
                    className={cn(
                      'text-left pt-4 pb-3 font-normal md:pt-5',
                      index === 0 && 'pl-4 md:pl-6',
                      index === COLUMNS.length - 1 && 'pr-4 md:pr-6',
                    )}
                  >
                    <Label variant="tag-s" caps className="text-v3-text-40 tracking-wider">
                      {label}
                    </Label>
                  </th>
                ))}
              </tr>
            </thead>

            <tbody ref={bodyRef}>
              {cycles.map((cycle, index) => (
                <CycleRow
                  key={cycle.cycleNumber}
                  cycle={cycle}
                  isSelected={cycle.cycleNumber === selectedCycle}
                  isTabbable={index === tabbableIndex}
                  onSelect={onSelectCycle}
                  onNavigate={offset => navigateFrom(index, offset)}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
