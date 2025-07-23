import { flexRender, type Table as ReactTable, type SortDirection } from '@tanstack/react-table'
import { type TableHTMLAttributes, type PropsWithChildren } from 'react'
import { DoubleArrowIcon } from '@/components/Table/components/icons/DoubleArrowIcon'
import { ArrowIcon } from '@/components/Table/components/icons/ArrowIcon'
import { cn } from '@/lib/utils'

interface SortIndicatorProps extends PropsWithChildren {
  sortDirection: SortDirection | false
  sortEnabled?: boolean
  toggleSorting: () => void
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

export function HoldersTable<T>({ table, ...props }: Props<T>) {
  return (
    <table className="w-full" {...props}>
      <thead>
        <tr>
          {table.getHeaderGroups().map(headerGroup =>
            headerGroup.headers.map((header, index) => (
              <td
                key={header.id}
                className={cn(
                  'pb-10 text-text-100 text-sm font-medium font-rootstock-sans leading-tight border-b-[0.5px] border-text-60',
                  header.id === 'id' ? 'w-3/5' : 'w-2/5',
                  index === 0 ? 'pl-4' : '',
                  index === headerGroup.headers.length - 1 ? 'pr-4' : '',
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
            {row.getVisibleCells().map((cell, index) => (
              <td
                key={cell.id}
                className={cn(
                  'py-3 border-b border-bg-60',
                  index === 0 ? 'pl-4 w-2/5' : '',
                  index === row.getVisibleCells().length - 1 ? 'pr-4 w-3/5' : '',
                )}
              >
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  )
}
