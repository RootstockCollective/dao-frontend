import { FC, HTMLAttributes, ReactNode } from 'react'
import { TableHead, TableRow, TableCell, TableBody, TableCore } from './components'

interface TableProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * Array of objects to be displayed in the table, with values of any type React can render.
   */
  data: Record<string, ReactNode>[]
  /**
   * Optional flag to make all column widths equal
   */
  equalColumns?: boolean
}

/**
 * A table assembled from individual table components.
 * In most cases, this will suffice for displaying any type of data.
 * If you have unique data that doesn't fit into the `data` prop,
 * you can create a custom table using the available components:
 * `Table`, `TableBody`, `TableCell`, `TableHead`, `TableRow`.
 */
export const Table: FC<TableProps> = ({ data, equalColumns = true, ...props }) => {
  // calculate column width
  const header = Object.keys(data[0])
  if (header.length === 0) return <></>
  const width = equalColumns ? Math.round(100 / header.length) + '%' : 'inherit'
  return (
    <TableCore {...props}>
      <TableHead>
        <TableRow>
          {header.map(headTitle => (
            <TableCell style={{ width }} key={headTitle}>
              {headTitle}
            </TableCell>
          ))}
        </TableRow>
      </TableHead>
      <TableBody>
        {data.map((record, i) => (
          <TableRow key={i}>
            {Object.values(record).map((val, j) => (
              <TableCell style={{ width }} key={j}>
                {val}
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </TableCore>
  )
}
