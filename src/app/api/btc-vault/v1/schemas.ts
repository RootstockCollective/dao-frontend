import { z } from 'zod'

import { AddressSchema, SortDirectionEnum } from '@/app/api/utils/validators'

export const SortFieldEnum = z.enum(['timestamp', 'assets'])
export const ActionTypeEnum = z.enum([
  'deposit_request',
  'deposit_claimable',
  'deposit_claimed',
  'deposit_cancelled',
  'redeem_request',
  'redeem_claimable',
  'redeem_claimed',
  'redeem_cancelled',
  'redeem_accepted',
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

/** Sort fields for GET /api/btc-vault/v1/nav-history (subgraph `BtcVaultNavHistory_orderBy`). */
export const BtcVaultNavHistorySortFieldEnum = z.enum([
  'processedAt',
  'reportedOffchainAssets',
  'requestsProcessed',
])

/** Query schema for GET /api/btc-vault/v1/nav-history */
export const BtcVaultNavHistoryQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(200).default(20),
  page: z.coerce.number().int().min(1).default(1),
  sort_field: BtcVaultNavHistorySortFieldEnum.default('processedAt'),
  sort_direction: SortDirectionEnum.default('desc'),
})

/** Sort fields for GET /api/btc-vault/v1/whitelist-role-history (subgraph `BtcVaultWhitelistedUser_orderBy`). */
export const BtcVaultWhitelistedUsersSortFieldEnum = z.enum(['lastUpdated', 'account', 'status'])

/** Query schema for GET /api/btc-vault/v1/whitelist-role-history */
export const BtcVaultWhitelistRoleHistoryQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(200).default(20),
  page: z.coerce.number().int().min(1).default(1),
  sort_field: BtcVaultWhitelistedUsersSortFieldEnum.default('lastUpdated'),
  sort_direction: SortDirectionEnum.default('desc'),
})

/** Sort fields for GET /api/btc-vault/v1/audit-log (UI columns; subgraph mapping TBD). */
export const BtcVaultAuditLogSortFieldEnum = z.enum(['date'])
export const BtcVaultAuditLogTypeEnum = z.enum([
  'PAUSED_DEPOSITS',
  'RESUMED_DEPOSITS',
  'PAUSED_REDEEMS',
  'RESUMED_REDEEMS',
  'WHITELISTED_USER',
  'DEWHITELISTED_USER',
  'NAV_UPDATED',
  'TRANSFER_TO_MANAGER_WALLET',
  'VAULT_DEPOSIT',
  'TOP_UP_BUFFER',
  'TOP_UP_SYNTHETIC_YIELD',
  'SYNTHETIC_YIELD_UPDATED',
  'BUFFER_UPDATED',
])
export const BtcVaultAuditLogRoleEnum = z.enum([
  'ADMIN',
  'MANAGER',
  'PAUSER',
  'INVESTOR',
  'BUFFER_INJECTOR',
  'WHITELISTER',
])
export const BtcVaultAuditLogShowEnum = z.enum(['reason', 'rbtc', 'wrbtc'])

export type BtcVaultAuditLogSortField = z.infer<typeof BtcVaultAuditLogSortFieldEnum>

/** Query schema for GET /api/btc-vault/v1/audit-log */
export const BtcVaultAuditLogQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(200).default(20),
  page: z.coerce.number().int().min(1).default(1),
  sort_field: BtcVaultAuditLogSortFieldEnum.optional(),
  sort_direction: SortDirectionEnum.optional(),
  type: z.array(BtcVaultAuditLogTypeEnum).optional(),
  role: z.array(BtcVaultAuditLogRoleEnum).optional(),
  show: z.array(BtcVaultAuditLogShowEnum).optional(),
})
