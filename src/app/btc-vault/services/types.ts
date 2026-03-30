// --- Vault-Level State ---

/**
 * Aggregate metrics for the entire BTC vault. Same data for every user.
 *
 * All monetary values use `bigint` in Wei format (18 decimals) matching
 * the rBTC/wagmi convention. APY uses basis-point format where 1e9 = 100%.
 */
export interface VaultMetrics {
  /** Total Value Locked — aggregate rBTC held by the vault. Wei, 18 decimals. */
  tvl: bigint

  /** Annual Percentage Yield as a decimal (e.g. 0.085 for 8.5%). Derived from consecutive epoch snapshots. */
  apy: number

  /**
   * Live spot NAV: `(totalAssets * 1e18) / totalSupply` with `totalSupply` in **24-decimal raw** share
   * units (same as `epochSnapshot.supplyAtClose`). Fixed-point rBTC wei per **one raw** share basis
   * (same dimensional encoding as `ClaimableInfo.lockedSharePrice`). For “rBTC per 1.0 human share”
   * UI (and fiat), apply `lockedSharePriceToNavPerHumanShareWei` from `vaultShareNav.ts`.
   */
  pricePerShare: bigint

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

// --- User-Level State ---

/**
 * A single user's position within the vault.
 *
 * For unknown addresses, all `bigint` fields are `0n` and `percentOfVault` is `0`.
 */
export interface UserPosition {
  /** User's rBTC wallet balance (not in the vault). Wei, 18 decimals. */
  rbtcBalance: bigint

  /** User's vault share tokens. Raw units: 24 decimals (18 + VAULT_SHARE_MULTIPLIER). */
  vaultTokens: bigint

  /** BTC value of the user's vault position (`vaultTokens * navPerShare`). Wei, 18 decimals. */
  positionValue: bigint

  /**
   * User's percentage ownership of the vault (e.g. `10.2` means 10.2%).
   * `number` (JS float) because this is a display-only derived value —
   * precision loss at the percentage level is acceptable.
   */
  percentOfVault: number

  /** Cumulative rBTC principal deposited by the user. Wei, 18 decimals. */
  totalDepositedPrincipal: bigint
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
 *    ↓
 *  cancelled
 * ```
 *
 * - `pending`   — Request submitted, waiting for epoch settlement.
 * - `claimable` — Epoch settled, user can call finalize to claim.
 * - `done`      — Finalized. Shares minted (deposit) or rBTC returned (withdrawal).
 * - `failed`    — Transaction reverted or rejected at any point.
 * - `cancelled` — User cancelled the request while it was pending.
 *
 * "Active" statuses (block new requests): `pending`, `claimable`.
 * "Terminal" statuses (allow new requests): `done`, `failed`, `cancelled`.
 */
export type RequestStatus = 'pending' | 'claimable' | 'done' | 'failed' | 'cancelled'

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

  /**
   * Requested amount, units depend on `type`:
   * - **Deposit** — rBTC wei (18 decimals).
   * - **Withdrawal** — raw vault share units (24 decimals, same as `requestRedeem` / `supplyAtClose`;
   *   pair with `lockedSharePrice` and proportional redemption math; format with `formatSymbol(..., 'ctokenvault')`).
   */
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

  /**
   * Wire display status from the history API (e.g. `'approved'`, `'claim_pending'`).
   * Present only for requests fetched via the history endpoint; `undefined` for
   * requests built from on-chain reads (useActiveRequests).
   */
  displayStatus?: import('./ui/api-types').BtcVaultHistoryStatusKey

  /**
   * Reason for failure when `status` is `'failed'`.
   * - `cancelled` — User voluntarily cancelled the request before settlement.
   * - `rejected`  — The system/contract rejected the request (e.g. insufficient liquidity, revert).
   * Defaults to `'cancelled'` in display layer when absent.
   * Feature 9 (data layer) will provide this from on-chain events.
   */
  failureReason?: 'cancelled' | 'rejected'
}

/**
 * Whether a specific request is ready to be finalized (claimed).
 */
export interface ClaimableInfo {
  /** `true` if the request's epoch has settled and it can be finalized. */
  claimable: boolean

  /**
   * Fixed-point NAV at settlement: `((assetsAtClose+1)*1e18)/(supplyAtClose+1)`.
   * Denomination: wei of rBTC per **one raw** share unit (supply is 24-decimal raw shares).
   * Pair with raw share amounts (same units as `epochSnapshot.supplyAtClose` and `requestRedeem` shares).
   * For “rBTC per 1.0 human share” UI, use `lockedSharePriceToNavPerHumanShareWei` from `vaultShareNav.ts`.
   */
  lockedSharePrice: bigint

  /**
   * `epochSnapshot` result field `assetsAtClose` — total rBTC wei in the vault at epoch close (18 decimals).
   * Call with `epochId` for deposits and `batchRedeemId` for withdrawals (claimable and terminal). With
   * `supplyAtCloseWei`, drives proportional redemption: `(shares * (assets+1)) / (supply+1)`.
   */
  assetsAtCloseWei?: bigint

  /**
   * `epochSnapshot` result field `supplyAtClose` — total vault share supply at close, **same raw units** as
   * `VaultRequest.amount` for withdrawals (24-decimal vault share wei including `VAULT_SHARE_MULTIPLIER`).
   * Call with `epochId` for deposits and `batchRedeemId` for withdrawals (claimable and terminal).
   */
  supplyAtCloseWei?: bigint
}

// --- Write Operation Types ---

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
}

// --- Pagination ---

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

// ─── Deposit History (Epoch Windows) ─────────────────────────────────

/**
 * A single row in the deposit history table. Each row represents one epoch
 * (either settled or currently open).
 *
 * Data for settled epochs comes from `EpochSettled` event logs fetched via
 * the Blockscout API. The open epoch row is assembled from contract reads
 * (`currentEpoch()`, `openEpochPendingDepositAssets()`).
 */
export interface DepositWindowRow {
  /** Monotonic epoch identifier (e.g. "0", "1", "2"). */
  epochId: string

  /** Unix timestamp (seconds) when this epoch opened — equal to the previous epoch's `closedAt`. `null` for epoch 0. */
  startDate: number | null

  /** Unix timestamp (seconds) when this epoch was settled. `null` if the epoch is still open. */
  endDate: number | null

  /** Total vault AUM at epoch close. Wei, 18 decimals. `null` for the open epoch. */
  tvl: bigint | null

  /** NAV per share at epoch close — `(assets + 1) * 1e18 / (supply + 1)`. Wei, 18 decimals. `null` for the open epoch. */
  pricePerShare: bigint | null

  /** Annualised yield derived from consecutive epochs. Percentage (e.g. `12.5` = 12.5%). `null` for the first epoch or the open epoch. */
  apy: number | null

  /** Whether this epoch has been settled or is the current open window. */
  status: 'settled' | 'open'

  /** Total assets waiting in the current open epoch. Only present when `status === 'open'`. Wei, 18 decimals. */
  pendingDeposits?: bigint
}

// ─── Capital Allocation ──────────────────────────────────────────────

/**
 * A single category in the vault's capital allocation breakdown.
 * Used to express how vault capital is distributed (e.g. deployed, reserve, unallocated).
 */
export interface CapitalCategory {
  /** Human-readable label (e.g. "Deployed capital"). */
  label: string

  /** Amount of rBTC allocated to this category. Wei, 18 decimals. */
  amount: bigint
}

/**
 * Breakdown of the vault's total capital across categories.
 * The sum of all `categories[].amount` should equal `totalCapital`.
 */
export interface CapitalAllocation {
  /** Individual allocation buckets. */
  categories: CapitalCategory[]

  /** Total capital across all categories. Wei, 18 decimals. */
  totalCapital: bigint

  /** On-chain custodial wallets managed by the Fund Manager. */
  wallets: WalletBalance[]
}

/**
 * A single custodial wallet used by the Fund Manager to deploy capital.
 */
export interface WalletBalance {
  /** Human-readable wallet label (e.g. "Fordefi 9"). */
  label: string
  /** Strategy tracking platform name (e.g. "Nimbus", "Suivision"). */
  trackingPlatform: string
  /** External URL to the strategy platform dashboard. */
  trackingUrl: string
  /** rBTC balance held by this wallet. Wei, 18 decimals. */
  amount: bigint
  /** Wallet's share of total capital as a percentage (e.g. 0.5 means 0.5%). */
  percentOfTotal: number
  /** Optional link for the wallet label (e.g. Blockscout address page). */
  labelUrl?: string
}
