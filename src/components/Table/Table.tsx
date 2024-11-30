import { flexRender, type Table as ReactTable } from '@tanstack/react-table'
import { type HTMLAttributes } from 'react'
import { TableHead, TableRow, TableCell, TableBody, TableCore } from './components'
import { SortIndicator } from './components/SortIndicator'
import { cn } from '@/lib/utils'

interface SharedProps {
  'data-testid'?: string
}

interface TableProps<T> extends HTMLAttributes<HTMLDivElement> {
  equalColumns?: boolean
  theadProps?: SharedProps
  tbodyProps?: SharedProps
  headerClassName?: string
  table: ReactTable<T>
}

export function Table<T>({
  equalColumns = true,
  tbodyProps,
  theadProps,
  headerClassName,
  table,
  ...props
}: TableProps<T>) {
  const width = equalColumns ? Math.round(100 / table.options.data.length) + '%' : 'inherit'

  return (
    <TableCore {...props}>
      <TableHead {...theadProps}>
        <TableRow>
          {table.getHeaderGroups().map(headerGroup =>
            headerGroup.headers.map(header => (
              <TableCell
                onClick={
                  header.column.getCanSort()
                    ? () => {
                        header.column.toggleSorting()
                      }
                    : undefined
                }
                key={header.id}
                className={cn(
                  headerClassName,
                  `w-[${width}px]`,
                  'font-bold font-rootstock-sans text-[1rem]',
                  'border-b border-solid border-[#888888]',
                )}
              >
                <SortIndicator
                  sortEnabled={header.column.getCanSort()}
                  sortDirection={header.column.getIsSorted()}
                >
                  {header.isPlaceholder
                    ? null
                    : flexRender(header.column.columnDef.header, header.getContext())}
                </SortIndicator>
              </TableCell>
            )),
          )}
        </TableRow>
      </TableHead>
      <TableBody {...tbodyProps}>
        {table.getRowModel().rows.map(row => (
          <TableRow key={row.id} className="text-[14px] border-hidden" style={{ borderTopStyle: 'solid' }}>
            {row.getVisibleCells().map(cell => (
              <TableCell key={cell.id} style={{ width }}>
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </TableCore>
  )
}
