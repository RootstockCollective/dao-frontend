import { flexRender, type Table as ReactTable, type SortDirection } from '@tanstack/react-table'
import { type TableHTMLAttributes, type PropsWithChildren } from 'react'
import { DoubleArrowIcon } from '@/components/Table/components/icons/DoubleArrowIcon'
import { ArrowIcon } from '@/components/Table/components/icons/ArrowIcon'
import { cn } from '@/lib/utils'

interface SortIndicatorProps extends PropsWithChildren {
  sortDirection: SortDirection | false
  toggleSorting: () => void
  sortEnabled?: boolean
}

export function SortIndicator({ children, sortDirection, toggleSorting }: SortIndicatorProps) {
  return (
    <div className="w-fit flex items-center gap-1 cursor-pointer" onClick={toggleSorting}>
      <div className="flex items-center">
        {sortDirection === 'asc' ? (
          <ArrowIcon />
        ) : sortDirection === 'desc' ? (
          <ArrowIcon className="rotate-180" />
        ) : (
          <DoubleArrowIcon />
        )}
      </div>
      <div className="grow">{children}</div>
    </div>
  )
}

interface Props<T> extends TableHTMLAttributes<HTMLTableElement> {
  table: ReactTable<T>
}

export function NftHoldersTable<T>({ table, ...props }: Props<T>) {
  return (
    <table className="w-full border-collapse" {...props}>
      <thead>
        <tr>
          {table.getHeaderGroups().map(headerGroup =>
            headerGroup.headers.map(header => (
              <td
                key={header.id}
                className={cn(
                  'pb-10 pl-4 border-b-[0.5px] border-text-60 first:w-2/5 last:w-3/5', // layout
                  'text-text-100 text-sm font-medium font-rootstock-sans leading-tight', // font
                )}
              >
                <SortIndicator
                  sortDirection={header.column.getIsSorted()}
                  toggleSorting={() => header.column.toggleSorting()}
                >
                  {header.isPlaceholder
                    ? null
                    : flexRender(header.column.columnDef.header, header.getContext())}
                </SortIndicator>
              </td>
            )),
          )}
        </tr>
      </thead>
      <tbody>
        {table.getRowModel().rows.map(row => (
          <tr key={row.id}>
            {row.getVisibleCells().map(cell => (
              <td key={cell.id} className={cn('py-3 pl-4 border-b border-bg-60 first:w-2/5 last:w-3/5')}>
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  )
}
