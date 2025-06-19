import { type HTMLAttributes } from 'react'
import { flexRender, type Table as ReactTable } from '@tanstack/react-table'
import { SortIndicator } from './components/SortIndicator'
import { cn } from '@/lib/utils'

interface Props<T> extends HTMLAttributes<HTMLDivElement> {
  table: ReactTable<T>
  equalColumns?: boolean
}

/**
 * Grid-based table component with sorting support and flexible column layouts
 */
export function GridTable<T>({ className, table, equalColumns = true, ...props }: Props<T>) {
  const cols = table.getAllColumns()
  // Identify a single column that should span full width across rows (e.g., proposal title)
  // Used to adjust grid column count in layout (1 less if one stacked column is removed)
  const numStacked = Number(cols.some(col => col.columnDef.meta?.renderAbove))
  // finds which column is stacked
  const stackedColId = cols.find(col => Boolean(col.columnDef.meta?.renderAbove))?.id
  return (
    <div className={className} {...props}>
      {/* Table head */}
      <div
        className="grid gap-2 px-4 pb-[18px] border-b border-b-text-60"
        style={{
          gridTemplateColumns: `repeat(${cols.length - numStacked}, minmax(0, 1fr))`,
        }}
      >
        {/* Head cells */}
        {table.getHeaderGroups().map(headerGroup =>
          headerGroup.headers
            // don't display header at a stacked column
            .filter(header => !header.column.columnDef.meta?.renderAbove)
            .map(header => (
              <div
                className="font-medium font-rootstock-sans text-sm leading-normal select-non"
                key={header.id}
                onClick={header.column.getCanSort() ? () => header.column.toggleSorting() : undefined}
              >
                <SortIndicator
                  sortEnabled={header.column.getCanSort()}
                  sortDirection={header.column.getIsSorted()}
                >
                  {header.isPlaceholder
                    ? null
                    : flexRender(header.column.columnDef.header, header.getContext())}
                </SortIndicator>
              </div>
            )),
        )}
      </div>
      {/* Table body */}
      <div>
        {/* Table rows */}
        {table.getRowModel().rows.map(row => (
          <div
            key={row.id}
            className={cn(
              'group grid gap-2 px-4 pt-6 pb-5 border-b border-b-bg-60',
              'transition-colors duration-500 ease-in-out hover:bg-text-80 hover:text-bg-100',
            )}
            style={{
              gridTemplateColumns: `repeat(${cols.length - numStacked}, minmax(0, 1fr))`,
            }}
          >
            {/* Table cells */}
            {row.getVisibleCells().map(cell => {
              // Only the designated stacked column will stretch across the full grid width
              const isStacked = cell.column.id === stackedColId
              return (
                <div
                  className={cn({ 'pb-[22px]': isStacked })}
                  key={cell.id}
                  style={{
                    // stacked cells span full width, others occupy their original column
                    gridColumn: isStacked ? '1 / -1' : undefined,
                  }}
                >
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </div>
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}
