'use client'

import { KeyboardEvent } from 'react'

import { ComparativeProgressBar } from '@/components/ComparativeProgressBar/ComparativeProgressBar'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { Label, Paragraph, Span } from '@/components/Typography'
import { cn, millify } from '@/lib/utils'

import { SPLIT_COLORS } from '../../constants/dashboardColors'
import { CycleHistoryEntry } from '../../types'
import { formatCycleWindow, formatSplitLabel, formatUsdWhole } from '../../utils/dashboardFormatters'

interface Column {
  id: string
  label: string
  /** Percentage of the table width. */
  width: string
  align?: 'left' | 'right'
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
 * A row's selected outline is drawn per cell rather than on the `<tr>`, because borders on
 * table rows don't render reliably. `border-separate` keeps the cell borders from collapsing
 * into each other.
 */
const cellBorderClasses = (isSelected: boolean, isFirst: boolean, isLast: boolean) =>
  cn(
    'border-y border-transparent py-4 align-middle',
    isSelected && 'border-v3-primary',
    isFirst && 'border-l rounded-l-lg pl-4',
    isLast && 'border-r rounded-r-lg pr-4',
    isSelected && isFirst && 'border-l-v3-primary',
    isSelected && isLast && 'border-r-v3-primary',
  )

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

const StatusCell = ({ status }: { status: CycleHistoryEntry['status'] }) =>
  status === 'running' ? (
    <Span variant="body-s" className="text-success">
      Running
    </Span>
  ) : (
    <Span variant="body-s" className="text-v3-text-40">
      Settled
    </Span>
  )

interface CycleRowProps {
  cycle: CycleHistoryEntry
  isSelected: boolean
  onSelect?: (cycleNumber: number) => void
}

const CycleRow = ({ cycle, isSelected, onSelect }: CycleRowProps) => {
  const isSelectable = Boolean(onSelect)

  const handleKeyDown = (event: KeyboardEvent<HTMLTableRowElement>) => {
    if (!onSelect) return
    if (event.key !== 'Enter' && event.key !== ' ') return
    // Space would otherwise scroll the page out from under the table.
    event.preventDefault()
    onSelect(cycle.cycleNumber)
  }

  const cellClasses = (index: number) =>
    cellBorderClasses(isSelected, index === 0, index === COLUMNS.length - 1)

  return (
    <tr
      aria-selected={isSelectable ? isSelected : undefined}
      tabIndex={isSelectable ? 0 : undefined}
      onClick={isSelectable ? () => onSelect?.(cycle.cycleNumber) : undefined}
      onKeyDown={handleKeyDown}
      className={cn(
        'transition-colors outline-none',
        isSelectable && 'cursor-pointer hover:bg-v3-bg-accent-60 focus-visible:bg-v3-bg-accent-60',
      )}
      data-testid={`cycle-history-row-${cycle.cycleNumber}`}
    >
      <td className={cellClasses(0)}>
        <Span className="font-kk-topo text-v3-text-100">Cycle {cycle.cycleNumber}</Span>
      </td>

      <td className={cellClasses(1)}>
        <Span variant="body-s" className="text-v3-text-40 whitespace-nowrap">
          {formatCycleWindow(cycle.start, cycle.end)}
        </Span>
      </td>

      <td className={cellClasses(2)}>
        <Span className="text-v3-text-100">{millify(cycle.backing)}</Span>
      </td>

      <td className={cellClasses(3)}>
        <Span className="text-v3-text-100">{formatUsdWhole(cycle.rewardsFiat)}</Span>
      </td>

      <td className={cellClasses(4)}>
        <SplitCell backersShare={cycle.backersShare} />
      </td>

      <td className={cellClasses(5)}>
        <Span className="text-v3-text-100">{cycle.backersCount ?? '—'}</Span>
      </td>

      <td className={cellClasses(6)}>
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
}: CycleHistoryTableProps) => (
  <div className={cn('bg-v3-bg-accent-80 rounded-lg p-4 md:p-6', className)} data-testid="cycle-history">
    <div className="flex items-baseline justify-between gap-4 pb-4">
      <Label variant="tag-s" caps className="text-v3-text-40 tracking-wider">
        Cycle history
      </Label>
      {onSelectCycle && (
        <Span variant="body-xs" className="text-v3-text-40 text-right">
          Select a row to load it above
        </Span>
      )}
    </div>

    {isLoading && cycles.length === 0 ? (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner />
      </div>
    ) : cycles.length === 0 ? (
      <EmptyState>No cycles to show yet</EmptyState>
    ) : (
      <div className="w-full overflow-x-auto">
        <table role="grid" className="w-full min-w-[860px] table-fixed border-separate border-spacing-y-1">
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
                    'text-left pb-3 font-normal',
                    index === 0 && 'pl-4',
                    index === COLUMNS.length - 1 && 'pr-4',
                  )}
                >
                  <Label variant="tag-s" caps className="text-v3-text-40 tracking-wider">
                    {label}
                  </Label>
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {cycles.map(cycle => (
              <CycleRow
                key={cycle.cycleNumber}
                cycle={cycle}
                isSelected={cycle.cycleNumber === selectedCycle}
                onSelect={onSelectCycle}
              />
            ))}
          </tbody>
        </table>
      </div>
    )}
  </div>
)
