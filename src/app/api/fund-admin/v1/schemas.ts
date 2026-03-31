import { z } from 'zod'

import { SortDirectionEnum } from '@/app/api/utils/validators'

/** Sort fields for GET /api/fund-admin/v1/audit-log (UI columns; subgraph mapping TBD). */
export const FundAdminAuditLogSortFieldEnum = z.enum(['date', 'action', 'role'])

export type FundAdminAuditLogSortField = z.infer<typeof FundAdminAuditLogSortFieldEnum>

/** Query schema for GET /api/fund-admin/v1/audit-log */
export const FundAdminAuditLogQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(200).default(20),
  page: z.coerce.number().int().min(1).default(1),
  sort_field: FundAdminAuditLogSortFieldEnum.optional(),
  sort_direction: SortDirectionEnum.optional(),
})
