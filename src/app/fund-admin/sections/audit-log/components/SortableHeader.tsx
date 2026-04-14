import { ArrowDownWFill } from '@/components/Icons/v3design/ArrowDownWFill'
import { ArrowsUpDown } from '@/components/Icons/v3design/ArrowsUpDown'
import { ArrowUpWFill } from '@/components/Icons/v3design/ArrowUpWFill'
import { Span } from '@/components/Typography'
import { cn } from '@/lib/utils'
import { useTableContext } from '@/shared/context'

import { useAuditLogTableSort } from '../hooks'
import type { AuditLogCellDataMap, ColumnId, SortableColumnId } from '../types'

interface Props {
  label: string
  columnId: SortableColumnId
  className?: string
}

export const SortableHeader = ({ label, columnId, className }: Props) => {
  const { sort } = useTableContext<ColumnId, AuditLogCellDataMap>()
  const sortByColumn = useAuditLogTableSort()
  const isActive = sort.columnId === columnId && sort.direction !== null
  return (
    <th
      className={cn('text-left cursor-pointer select-none', className)}
      onClick={() => sortByColumn(columnId, sort)}
    >
      <div className="flex items-center gap-1.5">
        {!isActive && <ArrowsUpDown color="white" size={16} />}
        {isActive && sort.direction === 'desc' && <ArrowDownWFill color="white" size={16} />}
        {isActive && sort.direction === 'asc' && <ArrowUpWFill color="white" size={16} />}
        <Span variant="tag-s" bold>
          {label}
        </Span>
      </div>
    </th>
  )
}
