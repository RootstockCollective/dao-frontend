import { TableProvider } from '@/shared/context'

import { AuditLogTable } from './components/AuditLogTable'
import type { AuditLogCellDataMap, ColumnId as AuditLogColumnId } from './types'

export const AuditLogSection = () => {
  return (
    <div className="p-6 pt-4 bg-bg-80">
      <TableProvider<AuditLogColumnId, AuditLogCellDataMap>>
        <AuditLogTable />
      </TableProvider>
    </div>
  )
}
