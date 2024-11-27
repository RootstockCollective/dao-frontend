import {
  useReactTable,
  createColumnHelper,
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
  flexRender,
  SortingFnOption,
} from '@tanstack/react-table'
import { HTMLAttributes, ReactNode, useMemo, useState } from 'react'
import { TableHead, TableRow, TableCell, TableBody, TableCore } from './components'
import { SortIndicator } from './components/SortIndicator'
import { cn } from '@/lib/utils'

interface SharedProps {
  'data-testid'?: string
}

type TableData<T extends Record<string, any> = Record<string, any>> = T

/**
 * Props for the Table component.
 */
interface TableProps<T extends TableData> extends HTMLAttributes<HTMLDivElement> {
  data: T[]
  equalColumns?: boolean
  theadProps?: SharedProps
  tbodyProps?: SharedProps
  headerClassName?: string
  /**
   * Custom renderers for table column cells.
   *
   * *Example how to render `name` column:*
   *
   * ```tsx
   *  renderers: {
   *    name: (value: string, row: ITable) => <p>{value} - {row.symbol}</p>
   *  }
   * ```
   */
  renderers?: { [K in keyof T]?: (value: T[K], row: T) => ReactNode }
  /**
   * Flag indicating whether sorting can be applied for the whole table. `false` by default
   */
  isSortable?: boolean
  /**
   * Custom sorting function for table column. `false` excludes column from sorting
   *
   * *Example:*
   *
   * ```tsx
   *  sortingOptions: {
   *    name: (a: number, b: number) => Math.sin(a) - Math.abs(b)
   *  }
   * ```
   */
  sortingOptions?: {
    [K in keyof T]?: false | SortingFnOption<T>
  }
}

export const Table = <T extends TableData>({
  data,
  equalColumns = true,
  tbodyProps,
  theadProps,
  headerClassName,
  renderers = {},
  isSortable = false,
  sortingOptions,
  ...props
}: TableProps<T>) => {
  const columnHelper = createColumnHelper<T>()
  const columns = useMemo(
    () =>
      (Object.keys(data[0]) as Array<keyof T>).map(key =>
        columnHelper.accessor(row => row[key], {
          header: key as string,
          cell: info => {
            const value = info.getValue() as T[keyof T]
            const row = info.row.original as T
            const func = renderers[key]
            return func ? func(value, row) : value
          },
          enableSorting: isSortable && sortingOptions?.[key] !== false,
          sortingFn: sortingOptions?.[key] || 'auto',
        }),
      ),
    [columnHelper, data, isSortable, renderers, sortingOptions],
  )

  const [sorting, setSorting] = useState<SortingState>([])
  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  const width = equalColumns ? Math.round(100 / columns.length) + '%' : 'inherit'

  return (
    <TableCore {...props}>
      <TableHead {...theadProps}>
        <TableRow>
          {table.getHeaderGroups().map(headerGroup =>
            headerGroup.headers.map(header => (
              <TableCell
                onClick={() => header.column.toggleSorting()}
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
