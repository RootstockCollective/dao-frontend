import { db } from '@/lib/db'

/**
 * Represents a single vault transaction from the history
 * This type matches the structure returned by the database query
 */
export interface VaultHistoryTransaction {
  /** User address (wallet address) that performed the transaction */
  user: string
  /** Action type: "DEPOSIT" or "WITHDRAW" */
  action: 'DEPOSIT' | 'WITHDRAW'
  /** Amount of assets involved in the transaction (as string to handle large numbers) */
  assets: string
  /** Amount of shares involved in the transaction (as string to handle large numbers) */
  shares: string
  /** Block number at which the transaction occurred */
  blockNumber: string
  /** Unix timestamp (in seconds) when the transaction occurred */
  timestamp: number | string
  /** Transaction hash identifier */
  transactionHash: string
}

/**
 * Represents vault history grouped by period (month) and action type
 * This type matches the structure returned by the database query
 */
export interface VaultHistoryByPeriodAndAction {
  /** Period in format "YYYY-MM" (e.g., "2024-01") */
  period: string
  /** Action type: "DEPOSIT" or "WITHDRAW" */
  action: 'DEPOSIT' | 'WITHDRAW'
  /** Sum of all assets for transactions in this period+action group (as string to handle large numbers) */
  assets: string
  /** Array of individual transactions in this group */
  transactions: VaultHistoryTransaction[]
}

/**
 * Represents a raw database row from the vault history query before transformation
 */
interface VaultHistoryDatabaseRow {
  /** Period in format "YYYY-MM" (e.g., "2024-01") */
  period: string
  /** Action type: "DEPOSIT" or "WITHDRAW" */
  action: 'DEPOSIT' | 'WITHDRAW'
  /** Sum of all assets for transactions in this period+action group (may be null if no rows to sum) */
  assets: number | bigint | null
  /** Array of individual transactions in this group (always an array due to COALESCE) */
  transactions: VaultHistoryTransaction[]
}

/**
 * Retrieves vault history from the database grouped by period and action
 * @param params - Query parameters
 * @param params.address - User wallet address to filter transactions
 * @param params.limit - Maximum number of records to return
 * @param params.page - Page number (1-indexed)
 * @param params.sort_field - Field to sort by: 'period', 'assets', or 'action'
 * @param params.sort_direction - Sort direction: 'asc' (ascending) or 'desc' (descending)
 * @param params.type - Optional array of action types to filter by: 'deposit' or 'withdraw'
 * @returns Array of vault history grouped by period and action
 */
export async function getVaultHistoryFromDB(params: {
  address: string
  limit: number
  page: number
  sort_field: 'period' | 'assets' | 'action'
  sort_direction: 'asc' | 'desc'
  type?: ('deposit' | 'withdraw')[]
}): Promise<VaultHistoryByPeriodAndAction[]> {
  const { address, limit, page, sort_field, sort_direction, type } = params
  const offset = (page - 1) * limit

  // Whitelist to prevent SQL injection - only allow known safe values
  const orderDirection = sort_direction === 'asc' ? 'ASC' : 'DESC'

  let query = db('VaultHistory')
    .select(
      db.raw(`
        TO_CHAR(DATE_TRUNC('month', to_timestamp(timestamp)), 'YYYY-MM') as period
      `),
      'action',
    )
    .select({
      assets: db.raw(`SUM(assets)`),
      transactions: db.raw(`
        COALESCE(
          json_agg(
            json_build_object(
              'user', convert_from("user", 'utf8'),
              'action', action,
              'assets', assets::text,
              'shares', shares::text,
              'blockNumber', "blockNumber"::text,
              'timestamp', timestamp,
              'transactionHash', convert_from("transactionHash", 'utf8')
            ) ORDER BY timestamp ${orderDirection}
          ),
          '[]'::json
        )
      `),
    })
    .where(`user`, address)

  // Apply type filter if provided
  if (type && type.length > 0) {
    // Convert 'deposit'/'withdraw' to 'DEPOSIT'/'WITHDRAW' (uppercase) to match DB values
    const upperCaseTypes = type.map(t => t.toUpperCase())
    query = query.whereIn('action', upperCaseTypes)
  }

  const result = await query
    .groupByRaw(`DATE_TRUNC('month', to_timestamp(timestamp)), "action"`)
    .orderBy(sort_field, sort_direction)
    .limit(limit)
    .offset(offset)

  return result.map((row: VaultHistoryDatabaseRow) => ({
    period: row.period,
    action: row.action,
    assets: String(row.assets || 0),
    transactions: row.transactions || [],
  }))
}

/**
 * Counts the total number of distinct period+action combinations for a given address
 * @param address - User wallet address to count transactions for
 * @param type - Optional array of action types to filter by: 'deposit' or 'withdraw'
 * @returns Total count of distinct period+action combinations
 */
export async function getVaultHistoryCountFromDB(
  address: string,
  type?: ('deposit' | 'withdraw')[],
): Promise<number> {
  let query = db('VaultHistory')
    .count({ count: db.raw(`DISTINCT (DATE_TRUNC('month', to_timestamp(timestamp)), "action")`) })
    .where(`user`, address)

  // Apply type filter if provided
  if (type && type.length > 0) {
    // Convert 'deposit'/'withdraw' to 'DEPOSIT'/'WITHDRAW' (uppercase) to match DB values
    const upperCaseTypes = type.map(t => t.toUpperCase())
    query = query.whereIn('action', upperCaseTypes)
  }

  const result = await query.first()

  return Number(result?.count ?? 0)
}
