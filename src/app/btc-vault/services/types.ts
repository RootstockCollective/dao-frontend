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

// ─── Observability ───────────────────────────────────────────────────

/**
 * Discriminated union of events emitted by the vault service.
 *
 * Downstream hooks subscribe to these events to invalidate react-query
 * caches and trigger UI updates. Each event type maps to a specific
 * state transition in the vault's lifecycle.
 */
export type BtcVaultServiceEvent =
  | {
      /** Epoch transitioned to a new phase. */
      type: 'epoch:transition'
      /** The new epoch status. */
      status: EpochStatus
      /** The epoch this transition belongs to. */
      epochId: string
    }
  | {
      /** Pause state changed for one or both operation regions. */
      type: 'pause:change'
      /** Current deposit operation status after the change. */
      deposits: 'active' | 'paused'
      /** Current withdrawal operation status after the change. */
      withdrawals: 'active' | 'paused'
    }
  | {
      /** A new request was submitted by the user. */
      type: 'request:submitted'
      /** ID of the newly created request. */
      requestId: string
      /** Whether this is a deposit or withdrawal request. */
      requestType: RequestType
    }
  | {
      /** A pending request became claimable after epoch settlement. */
      type: 'request:claimable'
      /** ID of the request that is now claimable. */
      requestId: string
    }
  | {
      /** A request was finalized (shares minted or rBTC returned). */
      type: 'request:finalized'
      /** ID of the finalized request. */
      requestId: string
    }
  | {
      /** A request failed (transaction reverted or rejected). */
      type: 'request:failed'
      /** ID of the failed request. */
      requestId: string
    }
  | {
      /** A blockchain transaction was confirmed (mined). */
      type: 'tx:confirmed'
      /** Transaction hash that was confirmed. Hex string. */
      hash: string
    }

/**
 * Callback for vault service events. Passed to `BtcVaultService.subscribe()`.
 */
export type BtcVaultServiceListener = (event: BtcVaultServiceEvent) => void

// ─── Service Interface ───────────────────────────────────────────────

/**
 * Data/service layer for the BTC vault.
 *
 * All reads return `Promise<T>` so the mock and real (contract) implementations
 * share the same interface shape. Guards on write methods are enforced internally.
 *
 * **Implementations:**
 * - `MockBtcVaultService` — in-memory mock with timer-based epoch cycling.
 * - `ContractBtcVaultService` — stub, throws until contract ABIs are available.
 *
 * **Lifecycle:** Created via `createBtcVaultService()`, provided to components
 * via `BtcVaultServiceProvider` React context, and cleaned up via `dispose()`
 * on provider unmount.
 */
export interface BtcVaultService {
  // ── Vault-level reads ──────────────────────────────────────────────

  /** Returns aggregate vault metrics (TVL, APY, NAV). Same data for all users. */
  getVaultMetrics(): Promise<VaultMetrics>

  /** Returns the current epoch's state (phase, timing, settlement data). */
  getEpochState(): Promise<EpochState>

  /** Returns whether deposits and withdrawals are currently active or paused. */
  getPauseState(): Promise<PauseState>

  // ── User-level reads ───────────────────────────────────────────────

  /** Returns the user's vault position (balances, ownership %). Empty profile for unknown addresses. */
  getUserPosition(address: string): Promise<UserPosition>

  /** Returns whether the address is eligible to interact with the vault. */
  getEligibility(address: string): Promise<EligibilityStatus>

  /**
   * Returns the user's active (non-terminal) requests.
   * Currently at most 1 due to the single-active-request constraint.
   * Returns `[]` when no active request exists (the "idle" state).
   */
  getActiveRequests(address: string): Promise<VaultRequest[]>

  /** Returns whether a specific request is ready to be finalized. */
  getClaimableStatus(requestId: string): Promise<ClaimableInfo>

  // ── History ────────────────────────────────────────────────────────

  /** Returns paginated request history (all statuses) for the given address. */
  getRequestHistory(address: string, params: PaginationParams): Promise<PaginatedResult<VaultRequest>>

  // ── Write operations (guards enforced internally) ──────────────────

  /**
   * Submit a new deposit request for the current epoch.
   * @throws If deposits are paused, user has an active request, amount <= 0, or user is ineligible.
   */
  submitDepositRequest(params: DepositRequestParams): Promise<TxResult>

  /**
   * Submit a new withdrawal request for the current batch.
   * @throws If withdrawals are paused, user has an active request, amount <= 0, or insufficient balance.
   */
  submitWithdrawalRequest(params: WithdrawalRequestParams): Promise<TxResult>

  /**
   * Finalize a claimable deposit — mints vault tokens to the user.
   * @throws If deposits are paused or no claimable deposit exists for the given epochId.
   */
  finalizeDeposit(epochId: string): Promise<TxResult>

  /**
   * Finalize a claimable withdrawal — burns vault tokens, returns rBTC.
   * @throws If withdrawals are paused or no claimable withdrawal exists for the given batchRedeemId.
   */
  finalizeWithdrawal(batchRedeemId: string): Promise<TxResult>

  // ── Observability ──────────────────────────────────────────────────

  /**
   * Subscribe to service events (epoch transitions, pause changes, request updates).
   * Used by downstream hooks for react-query cache invalidation.
   * @returns Unsubscribe function — call to stop receiving events.
   */
  subscribe(listener: BtcVaultServiceListener): () => void

  // ── Lifecycle ──────────────────────────────────────────────────────

  /**
   * Dispose the service — clears all timers and listeners.
   * Called by the React provider on unmount. Must be idempotent.
   */
  dispose(): void
}

// ─── Mock Configuration ──────────────────────────────────────────────

/**
 * Configuration for `MockBtcVaultService` timer durations.
 * All values in milliseconds. Used to speed up or slow down the
 * simulated epoch cycle and transaction confirmations for testing/demos.
 */
export interface MockBtcVaultConfig {
  /** How long an epoch stays in `open` status. Default: 10000ms. */
  epochDuration?: number

  /** Delay for `closed → settling` transition. Default: 1000ms. */
  closeDelay?: number

  /** Delay for `settling → claimable` transition. Default: 2000ms. */
  settleDelay?: number

  /** Delay for `claimable → next epoch open` transition. Default: 3000ms. */
  nextEpochDelay?: number

  /** Simulated block confirmation time for submit/finalize transactions. Default: 1500ms. */
  txConfirmDelay?: number

  /** Probability (0–1) of a transaction failing. Default: 0 (always succeeds). Set > 0 to test error states. */
  txFailChance?: number

  /** Fixed read latency in ms. Default: 0 (uses random 200–500ms). */
  readLatency?: number
}
