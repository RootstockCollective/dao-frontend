// ─── Vault-Level State ───────────────────────────────────────────────

/**
 * Aggregate metrics for the entire BTC vault. Same data for every user.
 *
 * All monetary values use `bigint` in Wei format (18 decimals) matching
 * the rBTC/wagmi convention. APY uses basis-point format where 1e9 = 100%.
 */
export interface VaultMetrics {
  /** Total Value Locked — aggregate rBTC held by the vault. Wei, 18 decimals. */
  tvl: bigint

  /** Annual Percentage Yield. Basis points where `VAULT_BASIS_POINTS = 1e9 = 100%`. */
  apy: bigint

  /** Net Asset Value per share — current price of one vault token in rBTC terms. Wei, 18 decimals. */
  nav: bigint

  /** Unix timestamp (seconds) of when these metrics were last computed. */
  timestamp: number
}

/**
 * The four phases of the epoch accounting cycle.
 *
 * ```
 * open → closed → settling → claimable → (next epoch opens)
 * ```
 *
 * - `open`      — Accepting deposit/withdrawal requests.
 * - `closed`    — Snapshot taken, no new requests accepted.
 * - `settling`  — NAV being computed, orders filled pro-rata (forward pricing).
 * - `claimable` — Settlement complete, users can call finalize to claim shares/assets.
 */
export type EpochStatus = 'open' | 'closed' | 'settling' | 'claimable'

/**
 * State of the current accounting epoch.
 *
 * An epoch is a discrete time window where deposit/withdrawal requests are
 * batched then settled at a single NAV price (ERC-7540 "forward pricing"
 * pattern). Users don't know the share price when they submit — it's fixed
 * only at epoch settlement.
 *
 * Lifecycle: `open → closed → settling → claimable → (next epoch)`
 */
export interface EpochState {
  /** Monotonic epoch identifier, incremented each cycle (e.g. "1", "2", "3"). */
  epochId: string

  /** Current phase of this epoch's lifecycle. */
  status: EpochStatus

  /** Unix timestamp (seconds) when this epoch opened. Used for "epoch opened X ago" display. */
  startTime: number

  /** Unix timestamp (seconds) when this epoch stops accepting requests. Used for countdown timer UI. */
  endTime: number

  /**
   * Unix timestamp (seconds) when settlement completed.
   * `null` while epoch is `open`, `closed`, or `settling`.
   */
  settledAt: number | null

  /**
   * Share price locked at settlement (Wei, 18 decimals).
   * `null` before settlement — this is the "forward pricing" property:
   * the price is unknown until the epoch settles.
   */
  navPerShare: bigint | null

  /** Total rBTC submitted for deposit during this epoch. Wei, 18 decimals. Epoch accounting aggregate. */
  totalDepositAssets: bigint

  /** Total vault shares submitted for withdrawal during this epoch. Wei, 18 decimals. Epoch accounting aggregate. */
  totalRedemptionShares: bigint
}

/**
 * Vault-level operational pause controls.
 *
 * Each region (`deposits`, `withdrawals`) is toggled independently by an admin.
 * When paused, it gates **two** points in the request lifecycle:
 *
 * 1. **Submit** — user cannot initiate a new request of that type.
 * 2. **Finalize** — user cannot claim an existing request of that type.
 *
 * The epoch cycle is **unaffected** by pause state — epochs keep cycling
 * regardless. Pausing only prevents user-initiated actions from progressing.
 */
export interface PauseState {
  /** Whether deposit operations are currently allowed or halted. */
  deposits: 'active' | 'paused'

  /** Whether withdrawal operations are currently allowed or halted. */
  withdrawals: 'active' | 'paused'
}

// ─── User-Level State ────────────────────────────────────────────────

/**
 * A single user's position within the vault.
 *
 * For unknown addresses, all `bigint` fields are `0n` and `percentOfVault` is `0`.
 */
export interface UserPosition {
  /** User's rBTC wallet balance (not in the vault). Wei, 18 decimals. */
  rbtcBalance: bigint

  /** User's vault share tokens. Wei, 18 decimals. Represents ownership of the vault. */
  vaultTokens: bigint

  /** BTC value of the user's vault position (`vaultTokens * navPerShare`). Wei, 18 decimals. */
  positionValue: bigint

  /**
   * User's percentage ownership of the vault (e.g. `10.2` means 10.2%).
   * `number` (JS float) because this is a display-only derived value —
   * precision loss at the percentage level is acceptable.
   */
  percentOfVault: number
}

/**
 * Whether a given address is eligible to interact with the vault.
 */
export interface EligibilityStatus {
  /** `true` if the address can use the vault, `false` otherwise. */
  eligible: boolean

  /** Human-readable reason for ineligibility. Empty string when eligible. */
  reason: string
}

/**
 * The type of vault operation.
 * - `deposit`    — User sends rBTC into the vault and receives vault tokens.
 * - `withdrawal` — User redeems vault tokens and receives rBTC back.
 */
export type RequestType = 'deposit' | 'withdrawal'

/**
 * Lifecycle status of a vault request.
 *
 * ```
 * pending → claimable → done
 *    ↓          ↓
 *  failed     failed
 * ```
 *
 * - `pending`   — Request submitted, waiting for epoch settlement.
 * - `claimable` — Epoch settled, user can call finalize to claim.
 * - `done`      — Finalized. Shares minted (deposit) or rBTC returned (withdrawal).
 * - `failed`    — Transaction reverted or rejected at any point.
 *
 * "Active" statuses (block new requests): `pending`, `claimable`.
 * "Terminal" statuses (allow new requests): `done`, `failed`.
 */
export type RequestStatus = 'pending' | 'claimable' | 'done' | 'failed'

/**
 * A single deposit or withdrawal request through the vault's two-step lifecycle.
 *
 * The two-step lifecycle:
 * 1. **Submit** — user sends a request, it enters `pending` for the current epoch.
 * 2. **Finalize** — after epoch settles, user claims shares/assets, request becomes `done`.
 *
 * `epochId` and `batchRedeemId` are **mutually exclusive**:
 * - Deposits use `epochId` (which epoch the deposit belongs to).
 * - Withdrawals use `batchRedeemId` (which batch the redemption belongs to).
 * - The unused field is always `null`.
 */
export interface VaultRequest {
  /** Unique identifier for this request (e.g. "req-101-1708000000"). */
  id: string

  /** Whether this is a deposit or withdrawal. */
  type: RequestType

  /** Amount of rBTC (deposit) or vault tokens (withdrawal) requested. Wei, 18 decimals. */
  amount: bigint

  /** Current lifecycle status. See `RequestStatus` for the state machine. */
  status: RequestStatus

  /**
   * The epoch this request was submitted in. Deposits only.
   * `null` for withdrawal requests.
   */
  epochId: string | null

  /**
   * The batch identifier for this withdrawal. Withdrawals only.
   * `null` for deposit requests.
   */
  batchRedeemId: string | null

  /** Key moments in the request's lifecycle. All values are Unix timestamps (seconds). */
  timestamps: {
    /** When the request was first submitted. */
    created: number
    /** When the request status last changed (e.g. pending → claimable). */
    updated?: number
    /** When the request was finalized (done). Only set for completed requests. */
    finalized?: number
  }

  /** On-chain transaction hashes for each step of the two-step lifecycle. */
  txHashes: {
    /** Transaction hash from the initial submit call. Hex string (e.g. "0xabc..."). */
    submit?: string
    /** Transaction hash from the finalize/claim call. Hex string. Only set for finalized requests. */
    finalize?: string
  }
}

/**
 * Whether a specific request is ready to be finalized (claimed).
 */
export interface ClaimableInfo {
  /** `true` if the request's epoch has settled and it can be finalized. */
  claimable: boolean

  /** The NAV per share locked at epoch settlement. Wei, 18 decimals. Maps to `EpochState.navPerShare`. */
  lockedSharePrice: bigint
}

// ─── Write Operation Types ───────────────────────────────────────────

/**
 * Blockchain transaction status, aligned with the wagmi/viem lifecycle.
 *
 * ```
 * idle → pending → confirmed
 *                → failed
 * ```
 *
 * - `idle`      — Transaction not yet initiated.
 * - `pending`   — Transaction submitted to the chain, waiting for block inclusion.
 * - `confirmed` — Transaction mined successfully.
 * - `failed`    — Transaction reverted or was rejected.
 */
export type TxStatus = 'idle' | 'pending' | 'confirmed' | 'failed'

/**
 * Result of a write operation (submit or finalize).
 *
 * In the real implementation this comes from wagmi/viem after sending a
 * transaction to the smart contract. The mock simulates this by returning
 * `status: 'pending'` immediately and updating internal state after a delay.
 */
export interface TxResult {
  /** Transaction hash on-chain. Hex string (e.g. "0xabc..."). */
  hash: string

  /** Current status of the transaction. See `TxStatus`. */
  status: TxStatus
}

/**
 * Parameters for submitting a new deposit request.
 *
 * Guards enforced by the service before processing:
 * - Deposits must not be paused.
 * - User must not have an active request (single-active-request constraint).
 * - Amount must be > 0.
 * - User must be eligible (`EligibilityStatus.eligible === true`).
 */
export interface DepositRequestParams {
  /** Amount of rBTC to deposit. Wei, 18 decimals. Must be > 0. */
  amount: bigint

  /** Maximum acceptable slippage as a decimal (e.g. 0.01 = 1%). Optional. */
  slippage?: number
}

/**
 * Parameters for submitting a new withdrawal request.
 *
 * Guards enforced by the service before processing:
 * - Withdrawals must not be paused.
 * - User must not have an active request (single-active-request constraint).
 * - Amount must be > 0.
 * - User must have sufficient vault token balance.
 */
export interface WithdrawalRequestParams {
  /** Amount of vault tokens to redeem. Wei, 18 decimals. Must be > 0 and <= user's vaultTokens. */
  amount: bigint

  /** Maximum acceptable slippage as a decimal (e.g. 0.01 = 1%). Optional. */
  slippage?: number
}

// ─── Pagination ──────────────────────────────────────────────────────

/**
 * Parameters for paginated queries (request history).
 */
export interface PaginationParams {
  /** 1-indexed page number. */
  page: number

  /** Maximum items per page. */
  limit: number

  /** Field name to sort by (e.g. "created", "amount"). Optional, defaults to "created". */
  sortField?: string

  /** Sort direction. Defaults to "desc" (newest first). */
  sortDirection?: 'asc' | 'desc'
}

/**
 * Generic paginated response wrapper.
 */
export interface PaginatedResult<T> {
  /** Items for the current page. */
  data: T[]

  /** Total number of items across all pages. */
  total: number

  /** Current page number (1-indexed). */
  page: number

  /** Page size used for this query. */
  limit: number

  /** Total number of pages (`Math.ceil(total / limit)`). */
  totalPages: number
}
