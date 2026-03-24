import { ALL_ACTION_TYPES } from '@/app/api/btc-vault/v1/schemas'

/** Max paginated getLogs requests per fallback call (same family of API as epoch-history). */
export const MAX_BLOCKSCOUT_GETLOGS_PAGES = 200

/**
 * Max concurrent Blockscout `getLogs` topic streams (each topic paginates independently).
 * Avoids opening too many parallel pagination loops against the explorer API.
 */
export const MAX_PARALLEL_BTC_VAULT_TOPIC_SCANS = 4

/** Max contracts per `multicall` batch (pairs of pending + claimable per row). */
export const MULTICALL_BATCH_SIZE = 128

/** Vault events that produce `BtcVaultHistoryItem` rows directly (per-user events only). */
export const HISTORY_EVENT_NAMES = [
  'DepositRequested',
  'DepositClaimed',
  'DepositRequestCancelled',
  'RedeemRequest',
  'RedeemClaimed',
  'RedeemRequestCancelled',
] as const

/**
 * Maps subgraph-style `DEPOSIT_REQUEST` action to one or more Solidity event names.
 * Derived actions (DEPOSIT_CLAIMABLE, REDEEM_CLAIMABLE, REDEEM_ACCEPTED) use empty arrays
 * because they are produced by cross-referencing request rows with epoch events, not by
 * direct event decoding.
 */
export const ACTION_TO_EVENT_NAMES: Record<string, (typeof HISTORY_EVENT_NAMES)[number][]> = {
  DEPOSIT_REQUEST: ['DepositRequested'],
  DEPOSIT_CLAIMABLE: [],
  DEPOSIT_CLAIMED: ['DepositClaimed'],
  DEPOSIT_CANCELLED: ['DepositRequestCancelled'],
  REDEEM_REQUEST: ['RedeemRequest'],
  REDEEM_CLAIMABLE: [],
  REDEEM_CLAIMED: ['RedeemClaimed'],
  REDEEM_CANCELLED: ['RedeemRequestCancelled'],
  REDEEM_ACCEPTED: [],
}

/**
 * Derived actions that need their base request events scanned for cross-referencing
 * with epoch events. When a derived action appears in the type filter, its dependencies
 * are also included in the Blockscout getLogs topic scan.
 */
export const DERIVED_ACTION_DEPENDENCIES: Record<string, string[]> = {
  DEPOSIT_CLAIMABLE: ['DEPOSIT_REQUEST'],
  REDEEM_CLAIMABLE: ['REDEEM_REQUEST'],
  REDEEM_ACCEPTED: ['REDEEM_REQUEST'],
}

for (const action of ALL_ACTION_TYPES) {
  if (!ACTION_TO_EVENT_NAMES[action]) {
    throw new Error(
      `[btc-vault] Blockscout history: missing ACTION_TO_EVENT_NAMES for schema action "${action}"`,
    )
  }
}
