import { type HTMLAttributes } from 'react'
import { flexRender, type Table as ReactTable } from '@tanstack/react-table'
import { SortIndicator } from './components/SortIndicator'
import { cn } from '@/lib/utils'

interface Props<T> extends HTMLAttributes<HTMLDivElement> {
  table: ReactTable<T>
  /**
   * Expand the first column to full table width
   */
  stackFirstColumn?: boolean
}

/**
 * Grid-based table component with sorting support and flexible column layouts.
 * Columns can specify width via `columnDef.meta.width` (e.g. '2fr', '150px').
 * When `hasStackedColumn` is true, the first column expands to full width.
 */
export function GridTable<T>({ className, table, stackFirstColumn = false, ...props }: Props<T>) {
  // Build grid template from column definitions' meta.width (fallback to 1fr)
  // Slice off the first column if it's stacked
  const headers = table.getHeaderGroups()[0].headers.slice(Number(stackFirstColumn))
  const gridTemplateColumns = headers.map(header => header.column.columnDef.meta?.width ?? '1fr').join(' ')
  return (
    <div role="table" className={className} {...props}>
      {/* Table head */}
      <div
        role="rowheader"
        className="grid px-4 pb-[18px] border-b border-b-text-60 select-none"
        style={{ gridTemplateColumns }}
      >
        {/* Head cells */}
        {table.getHeaderGroups().map(headerGroup =>
          headerGroup.headers
            // don't display first column header if it is stacked
            .slice(Number(stackFirstColumn))
            .map(header => (
              <div
                role="columnheader"
                className="font-medium font-rootstock-sans text-sm leading-normal overflow-hidden"
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
      <div role="rowgroup">
        {/* Table rows */}
        {table.getRowModel().rows.map(row => (
          <div
            role="row"
            key={row.id}
            className={cn(
              'group grid gap-2 px-4 pt-6 pb-5 border-b border-b-bg-60',
              'transition-colors duration-500 ease-in-out hover:bg-text-80 hover:text-bg-100',
            )}
            style={{ gridTemplateColumns }}
          >
            {/* Table cells */}
            {row.getVisibleCells().map((cell, i) => {
              const isStacked = i === 0 && stackFirstColumn
              return (
                <div
                  role="cell"
                  className={cn('overflow-hidden', { 'pb-[22px]': isStacked })}
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
