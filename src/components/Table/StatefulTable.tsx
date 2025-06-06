import { flexRender, type Table as ReactTable } from '@tanstack/react-table'
import { ComponentProps, type HTMLAttributes } from 'react'
import { TableHead, TableRow, TableCell, TableBody, TableCore } from './components'
import { SortIndicator } from './components/SortIndicator'
import { cn } from '@/lib/utils/utils'

interface SharedProps {
  'data-testid'?: string
}

interface Props<T> extends HTMLAttributes<HTMLDivElement> {
  table: ReactTable<T>
  equalColumns?: boolean
  theadProps?: SharedProps
  tbodyProps?: SharedProps
  headerClassName?: string
  tHeadRowsPropsById?: Record<string, ComponentProps<typeof TableCell>>
}

/**
 * The table uses Tanstack React-table as a table data source. This allows using
 * columns Sorting, Filtering and tons of other built in functionality
 */
export function StatefulTable<T>({
  table,
  equalColumns = true,
  tbodyProps,
  theadProps,
  headerClassName,
  tHeadRowsPropsById,
  ...props
}: Props<T>) {
  const width = equalColumns ? Math.round(100 / table.getHeaderGroups()[0]?.headers.length) + '%' : 'inherit'
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
                  'font-bold font-rootstock-sans text-[1rem]',
                  'border-b border-solid border-[#888888]',
                )}
                style={{ width }}
                {...(tHeadRowsPropsById ? tHeadRowsPropsById[header.id] : {})}
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
