'use client'

import type { Sort } from '@/shared/context'
import { useTableActionsContext } from '@/shared/context'

import type { AuditLogCellDataMap, ColumnId, SortableColumnId } from '../types'

export const useAuditLogTableSort = () => {
  const dispatch = useTableActionsContext<ColumnId, AuditLogCellDataMap>()

  return (columnId: SortableColumnId, currentSort: Sort<ColumnId>) => {
    if (currentSort.columnId !== columnId) {
      dispatch({ type: 'SORT_BY_COLUMN', payload: { columnId, direction: 'desc' } })
      return
    }
    const nextDir = currentSort.direction === 'desc' ? 'asc' : currentSort.direction === 'asc' ? null : 'desc'
    dispatch({
      type: 'SORT_BY_COLUMN',
      payload: { columnId: nextDir ? columnId : null, direction: nextDir },
    })
  }
}
