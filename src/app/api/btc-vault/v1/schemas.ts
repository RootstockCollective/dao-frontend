import { z } from 'zod'

import { AddressSchema, SortDirectionEnum } from '@/app/api/utils/validators'

export const SortFieldEnum = z.enum(['timestamp', 'assets'])
export const ActionTypeEnum = z.enum([
  'deposit_request',
  'deposit_claimed',
  'deposit_cancelled',
  'redeem_request',
  'redeem_claimed',
  'redeem_cancelled',
])

/** Uppercase action type strings for subgraph/GraphQL (derived from ActionTypeEnum). */
export const ALL_ACTION_TYPES: readonly string[] = ActionTypeEnum.options.map(t => t.toUpperCase())

/** Lowercase API type[] for deposit actions (query param); single source of truth. */
export const DEPOSIT_ACTION_TYPES: readonly string[] = ActionTypeEnum.options.filter(t =>
  t.startsWith('deposit_'),
)
/** Lowercase API type[] for redeem actions (query param); single source of truth. */
export const REDEEM_ACTION_TYPES: readonly string[] = ActionTypeEnum.options.filter(t =>
  t.startsWith('redeem_'),
)
/** Uppercase action strings for deposit (e.g. for isDeposit checks in mappers). */
export const DEPOSIT_ACTIONS: readonly string[] = DEPOSIT_ACTION_TYPES.map(t => t.toUpperCase())

const baseHistoryQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(200).default(20),
  page: z.coerce.number().int().min(1).default(1),
  sort_field: SortFieldEnum.default('timestamp'),
  sort_direction: SortDirectionEnum.default('desc'),
  type: z.array(ActionTypeEnum).optional(),
})

/** Query schema for GET /api/btc-vault/v1/history (no address = global, ?address= = filtered by address). */
export const BtcVaultGlobalHistoryQuerySchema = baseHistoryQuerySchema.extend({
  address: AddressSchema.optional(),
})
