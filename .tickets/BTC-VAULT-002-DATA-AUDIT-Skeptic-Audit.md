# BTC Vault 002 — Mock Data Service: Skeptic's Audit

> Generated from analysis of BTC-VAULT-002.md against existing codebase patterns.
> Purpose: Map every data point needed, flag gaps, and derisk before writing code.

**Iteration: 3**

---

## Overview

This ticket introduces **13 new domain types**, **14 service methods**, and a **time-based state machine** — none of which have existing counterparts in this codebase. The current vault is a simple deposit/withdraw with no multi-step lifecycle. We are building a mock for a system that doesn't exist yet, against an interface that's never been tested against a real contract.

### Decisions Locked (from Iteration 1)

| Decision | Resolution |
|----------|-----------|
| Amount representation | `bigint` for all monetary values — confirmed, wagmi/viem returns this format |
| Active request return type | `VaultRequest[]` (array) — max 1 for now, but array for scalability |
| Unknown wallet fallback | Empty user profile |
| Timer cleanup | `dispose()` method on the service, called by provider cleanup |
| Error state simulation | All states must exist in the mock (idle, pending, loading, finished, failed) even if not all flows trigger them yet |
| epochId vs batchRedeemId | Mutually exclusive — deposits use epochId, withdrawals use batchRedeemId, the other is always `null` |
| PauseState scope | Pause gates **both** submit (idle → submitting) **and** finalize (claimable → finalizing) — halts entire flow per operation type |
| hasActiveRequest | Only one request (deposit or withdrawal) can be active per user at a time. "Active" = `submitting`, `pending`, `claimable`, or `finalizing`. Constraint may be relaxed later. |
| PauseState modeling | Modeled as XState parallel state machine with explicit events (`PAUSE_DEPOSITS`, `RESUME_DEPOSITS`, etc.) — not raw booleans. See `refined-mock-xstate.md` Machine 2. |

---

## Group 1: Vault-Level State (3 reads, 0 writes)

Global reads — same data for every user.

### VaultMetrics

| Field | Definition | Representation | Existing Pattern |
|-------|-----------|----------------|------------------|
| `tvl` | Total Value Locked in BTC terms | `bigint` (Wei, 18 decimals like rBTC) | Yes — `totalAssets` in `useVaultBalance` |
| `apy` | Annual Percentage Yield | `bigint` (basis points, `VAULT_BASIS_POINTS = 1e9 = 100%`) | Yes — `estimatedApy` |
| `nav` | Net Asset Value per share | `bigint` (Wei) | Yes — `pricePerShare` |
| `timestamp` | When metrics were last computed | `number` (Unix seconds) | Yes — vault history uses this |

### PauseState (REVISED — Iteration 3)

Vault-level operational controls. Independent of the epoch cycle — an admin can pause deposits mid-epoch, or pause withdrawals while the epoch keeps cycling. Modeled as an XState parallel state machine (see `refined-mock-xstate.md` Machine 2).

| Region | States | Events | Existing Pattern |
|--------|--------|--------|------------------|
| `deposits` | `active \| paused` | `PAUSE_DEPOSITS`, `RESUME_DEPOSITS` | **NO** — new concept |
| `withdrawals` | `active \| paused` | `PAUSE_WITHDRAWALS`, `RESUME_WITHDRAWALS` | **NO** — new concept |

**Pause scope:** When an operation type is paused, it blocks **two points** in the request lifecycle:

1. **Submit** (`idle → submitting`) — user cannot initiate a new deposit/withdrawal
2. **Finalize** (`claimable → finalizing`) — user cannot claim an existing request of that type

A user stuck in `claimable` while their operation type is paused should see: "Deposits/Withdrawals are paused — claiming is temporarily unavailable."

**Epoch is unaffected** — epochs keep cycling regardless of pause state. Pausing only prevents user-initiated actions from progressing, it doesn't halt settlement of existing requests.

### EpochState (REVISED — Iteration 2)

The ticket's original `EpochState` had only `status` and `epochId`. Research into fund-management vault patterns (ERC-7540, Centrifuge, Maple Finance) shows that "epoch" in this context means an **accounting period** — a discrete time window where deposit/withdrawal requests are batched, then settled at a single NAV price. This is the "forward pricing" pattern: users don't know the share price when they submit; it's fixed only at epoch settlement.

**Epoch lifecycle:**

```
OPEN → CLOSED → SETTLING → CLAIMABLE → (next epoch opens)
 │         │          │           │
 │         │          │           └─ Users call finalize to claim shares/assets
 │         │          └─ NAV computed, price locked, orders filled pro-rata
 │         └─ No new requests accepted, snapshot taken
 └─ Accepting deposit/withdrawal requests
```

**Revised type:**

| Field | Definition | Representation | Source |
|-------|-----------|----------------|--------|
| `epochId` | Monotonic identifier (e.g. "42") | `string` | ERC-7540 `requestId` concept |
| `status` | Current phase | `'open' \| 'closed' \| 'settling' \| 'claimable'` | Centrifuge epoch lifecycle |
| `startTime` | When this epoch opened | `number` (Unix seconds) | Needed for "epoch opened X ago" |
| `endTime` | When requests stop being accepted | `number` (Unix seconds) | Needed for countdown timer UI |
| `settledAt` | When settlement completed | `number \| null` (null if not yet) | Needed for "settled X ago" |
| `navPerShare` | Price locked at settlement | `bigint \| null` (null before settlement) | Forward pricing — unknown until settled |
| `totalDepositAssets` | Total rBTC submitted for deposit this epoch | `bigint` | Epoch accounting aggregate |
| `totalRedemptionShares` | Total vault shares submitted for withdrawal | `bigint` | Epoch accounting aggregate |

**Note:** Added `'claimable'` as a 4th status. The original ticket had 3 (`open | closed | settling`), but the lifecycle requires a state where settlement is done and users can finalize. Without it, the UI can't distinguish "still settling" from "ready to claim."

---

## Group 2: User-Specific Reads (4 methods)

Per-address data. The mock needs **at least 2 user profiles** (one with data, one empty).

### UserPosition

| Field | Definition | Representation | Existing Pattern |
|-------|-----------|----------------|------------------|
| `rbtcBalance` | User's rBTC wallet balance | `bigint` (18 decimals) | Partial — `useVaultBalance` has `userShares` |
| `vaultTokens` | User's vault share tokens | `bigint` (24 decimals per `ctokenvault` pattern) | Yes — `userShares` |
| `positionValue` | USD/BTC value of position | `bigint` | Partial — `userUsdrifBalance` analog |
| ~~`principal`~~ | ~~Original amount deposited~~ | ~~`bigint`~~ | **DEFERRED** — see note below |
| `percentOfVault` | User's % ownership of vault | `number` (percentage) | **NO** — calculated but never stored |

**Note on `principal`:** Searched the entire `src/` directory — `principal` is not used anywhere in the current codebase. The original ticket listed it in `UserPosition`, but no existing vault contract or hook tracks cumulative deposit amounts. This field would only be useful for P&L display (`positionValue - principal = profit`). **Recommendation:** defer until the contract ABI confirms whether it's exposed. If not, it can be computed from request history (sum of all completed deposit amounts). Keeping it out of the mock avoids building UI against a phantom field.

### EligibilityStatus

| Field | Definition | Representation | Existing Pattern |
|-------|-----------|----------------|------------------|
| `eligible` | Can this address use the vault? | `boolean` | Partial — `canDeposit` in `VaultDepositValidationContext` |
| `reason` | Why ineligible | `string` | Partial — `reason` field exists |

### VaultRequest

| Field | Definition | Representation | Existing Pattern |
|-------|-----------|----------------|------------------|
| `id` | Unique request identifier | `string` | **NO** — new concept |
| `type` | Deposit or withdrawal | `'deposit' \| 'withdrawal'` | Yes — `'DEPOSIT' \| 'WITHDRAW'` in history |
| `amount` | Amount requested | `bigint` | Yes |
| `status` | Current lifecycle state | `'pending' \| 'claimable' \| 'done' \| 'failed'` | **NO** — new lifecycle |
| `epochId` | Which epoch this belongs to (deposits only) | `string \| null` | **NO** — null for withdrawals |
| `batchRedeemId` | Withdrawal batch identifier (withdrawals only) | `string \| null` | **NO** — null for deposits |
| `timestamps` | Created, updated, finalized | `{ created: number, updated?: number, finalized?: number }` | Partial — history has `timestamp` |
| `txHashes` | Submit tx, finalize tx | `{ submit?: string, finalize?: string }` | Partial — history has `transactionHash` |

**Changes from Iteration 1:**
- Added `'failed'` to status enum — needed for error state simulation per Q7.
- Clarified epochId/batchRedeemId mutual exclusivity per Q9.

### ClaimableInfo

| Field | Definition | Representation | Existing Pattern |
|-------|-----------|----------------|------------------|
| `claimable` | Can this request be finalized? | `boolean` | **NO** |
| `lockedSharePrice` | Price locked at epoch close | `bigint` | **NO** — maps to `EpochState.navPerShare` |

### Interface Change: `getActiveRequests` (plural)

**Original ticket:** `getActiveRequest(address: string): Promise<VaultRequest | null>`

**Revised:** `getActiveRequests(address: string): Promise<VaultRequest[]>`

Returns an array for scalability. For now, the mock returns at most 1 element. Consumers access `requests[0]` or check `.length === 0` for empty state.

---

## Group 3: Write Operations — The Two-Step Lifecycle (4 methods)

Core complexity. The mock must simulate a **state machine** with timers.

### TxResult (Clarification — Iteration 2)

`TxResult` is what the service returns when you call a write method (submit a deposit, finalize a withdrawal, etc.). It represents the outcome of a blockchain transaction. In the real implementation, this comes from wagmi/viem after sending a transaction to the smart contract.

| Field | Definition | Representation |
|-------|-----------|----------------|
| `hash` | Transaction hash on-chain | `string` (hex, e.g. `"0xabc..."`) |
| `status` | Transaction outcome | `'idle' \| 'pending' \| 'confirmed' \| 'failed'` |

**Status enum aligned with wagmi lifecycle:** `idle` (not started) → `pending` (tx submitted, waiting for block) → `confirmed` (mined successfully) or `failed` (reverted/rejected).

The mock will simulate this by:
1. Immediately returning `{ hash: "0xmock...", status: 'pending' }`
2. After ~1-2s delay, the request's status updates internally (simulating block confirmation)

### Method Signatures (Revised — Iteration 3)

| Method | Input | Output | Guards | Side Effects |
|--------|-------|--------|--------|-------------|
| `submitDepositRequest(params)` | `{ amount: bigint, slippage?: number }` | `Promise<TxResult>` | **deposits not paused**, **no active request**, amount > 0, eligible | Creates VaultRequest `status: 'pending'`, assigns `epochId` |
| `submitWithdrawalRequest(params)` | `{ amount: bigint, slippage?: number }` | `Promise<TxResult>` | **withdrawals not paused**, **no active request**, amount > 0, sufficient balance | Creates VaultRequest `status: 'pending'`, assigns `batchRedeemId` |
| `finalizeDeposit(epochId)` | `string` | `Promise<TxResult>` | **deposits not paused** | Transitions `claimable -> done`, mints shares |
| `finalizeWithdrawal(batchRedeemId)` | `string` | `Promise<TxResult>` | **withdrawals not paused** | Transitions `claimable -> done`, burns shares, returns rBTC |

### State Machine (Revised — Iteration 3)

```
                    ┌─ GUARD: operation type not paused ─┐
                    │  GUARD: no active request           │
                    │  GUARD: amount > 0, eligible/balance│
                    ▼                                     │
submitDepositRequest()          timer (~10s)              │    finalizeDeposit()
submitWithdrawalRequest()                                 │    finalizeWithdrawal()
       |                            |                     │          |
       v                            v                     │          v
   +--------+    epoch close    +-----------+   user call │      +------+
   |PENDING | ----------------> |CLAIMABLE  | ──────────┘──────>| DONE |
   +--------+                   +-----------+                    +------+
       |                          ▲       │                          |
       v (tx revert / error)      │       │                          v (tx revert)
   +--------+                     │  GUARD: operation type           +--------+
   | FAILED |                     │        not paused                | FAILED |
   +--------+                     │                                  +--------+
```

### hasActiveRequest Constraint (NEW — Iteration 3)

Only one request (either deposit or withdrawal) can be active per user at a time. This is a **business rule** enforced as a guard on `idle → submitting`.

- **"Active"** = request is in `submitting`, `pending`, `claimable`, or `finalizing` state
- **Not active** = `idle`, `done`, or `failed`
- Checked via `getActiveRequests(address).length === 0`
- This constraint may be relaxed in future versions — which is why `getActiveRequests` returns `VaultRequest[]` rather than `VaultRequest | null`

### Mock State Enum Coverage (NEW — Iteration 2)

Per Q7, the mock must define data for ALL states even if not all flows are triggered yet:

| State | What it means | Mock must provide |
|-------|--------------|-------------------|
| `idle` | No active request, nothing in progress | `getActiveRequests` returns `[]` |
| `pending` | Request submitted, waiting for epoch close | VaultRequest with `status: 'pending'`, TxResult with `status: 'confirmed'` |
| `claimable` | Epoch settled, user can finalize | VaultRequest with `status: 'claimable'`, ClaimableInfo with `claimable: true` |
| `done` | Finalized, shares minted/burned | VaultRequest with `status: 'done'`, updated UserPosition |
| `failed` | Transaction reverted or rejected | VaultRequest with `status: 'failed'`, TxResult with `status: 'failed'` |

---

## Group 4: Pagination & History (2 methods)

### PaginationParams

| Field | Definition | Existing Pattern |
|-------|-----------|------------------|
| `page` | 1-indexed page number | Yes — `PaginationResponse` in `src/app/api/utils/types.ts` |
| `limit` | Items per page | Yes |
| `sortField?` | Field to sort by | Yes — `sort_field` |
| `sortDirection?` | `'asc' \| 'desc'` | Yes — `sort_direction` |

### PaginatedResult\<T\>

| Field | Definition | Existing Pattern |
|-------|-----------|------------------|
| `data` | `T[]` | Yes |
| `total` | Total item count | Yes |
| `page` | Current page | Yes |
| `limit` | Page size | Yes |
| `totalPages` | Computed total pages | Yes |

---

## Group 5: Seed Data Matrix

### Request Coverage (AC-5) — Revised

|  | Deposit | Withdrawal |
|--|---------|-----------|
| **Pending** | 1 request | 1 request |
| **Claimable** | 1 request | 1 request |
| **Done** | 1 request | 1 request |
| **Failed** | 1 request | 1 request |

**Minimum: 8 seed VaultRequest objects** (was 6, added failed state per Q7).

### User Profiles

| Profile | Position | Active Requests | History |
|---------|----------|----------------|---------|
| **User A** (rich) | Has rBTC balance, vault tokens, position value | `[1 active pending/claimable request]` | Multiple done + failed requests |
| **User B** (empty) | Zero everything | `[]` | Empty array |
| **Any unknown address** | Zero everything | `[]` | Empty array |

---

## Appendix A: Resolved Questions

| # | Question | Answer |
|---|----------|--------|
| Q1 | What fields does `EpochState` need? | Expanded using ERC-7540/Centrifuge fund-accounting patterns. See Group 1 revised type. |
| Q2 | What are the valid values for `TxResult.status`? | `'idle' \| 'pending' \| 'confirmed' \| 'failed'` — aligned with wagmi tx lifecycle. |
| Q3 | Confirm `bigint` for all monetary values? | Yes — wagmi/viem returns this format from contract reads. |
| Q4 | Can a user have >1 active request? | No for now, but return type is `VaultRequest[]` for scalability. hasActiveRequest guard enforced on `idle → submitting`. |
| Q5 | Unknown wallet fallback? | Empty user profile. |
| Q6 | Timer cleanup strategy? | `dispose()` method on the service, called by provider's `useEffect` cleanup. |
| Q7 | Should the mock simulate error paths? | Yes — all states must exist (idle, pending, loading, finished, failed) even if not all flows trigger them. Added `'failed'` to VaultRequest status and seed data. |
| Q9 | Are epochId and batchRedeemId mutually exclusive? | Yes — deposits use epochId, withdrawals use batchRedeemId. Different contract method calls. |
| Q11 | How does PauseState get toggled? | Via Pause Machine events (`PAUSE_DEPOSITS`, `RESUME_DEPOSITS`, `PAUSE_WITHDRAWALS`, `RESUME_WITHDRAWALS`). Visualizer exposes toggle buttons for testing. |
| Q12 | Does pause only block new submissions? | No — pause gates **both** submit (`idle → submitting`) and finalize (`claimable → finalizing`) for that operation type. |

---

## Appendix B: Open / Deferred Questions

| # | Question | Status | Notes |
|---|----------|--------|-------|
| Q8 | Is `principal` a real contract field? | **DEFERRED** | Not used anywhere in `src/`. Removed from v1 mock. Will add when contract ABI confirms. Can be computed from history if needed. |
| Q10 | What does "FM capital return" mean in data terms? | **OPEN** | Unknown. Keeping two-step explicit: rBTC returns only after `finalizeWithdrawal`. |

---

## Appendix C: Resolved Flags (by group)

### Group 1 — Vault-Level State

- ~~EpochState is critically underspecified.~~ **RESOLVED** — expanded with timing + accounting fields based on ERC-7540 patterns.
- ~~PauseState — who toggles it?~~ **RESOLVED** — modeled as XState parallel state machine with explicit events. Visualizer exposes toggle buttons.

### Group 2 — User-Specific Reads

- ~~`principal` on UserPosition~~ — **DEFERRED.** Not in codebase, not confirmed on-chain. Will add when ABI is available.
- **`percentOfVault`** — will use `number` (JS float). Display-only derived value. Precision loss at percentage level is acceptable.
- ~~`getActiveRequest` assumes max 1~~ — **RESOLVED.** Changed to array return.
- ~~`epochId` vs `batchRedeemId` mutual exclusivity~~ — **RESOLVED.** Confirmed mutually exclusive.

### Group 3 — Write Operations

- ~~`TxResult` is too vague~~ — **RESOLVED.** Defined as `{ hash: string, status: 'idle' | 'pending' | 'confirmed' | 'failed' }`, aligned with wagmi lifecycle.
- **Timer-based transitions are fragile.** MITIGATED — `dispose()` method clears timers. Provider calls `dispose()` on unmount. React strict mode double-mount handled by re-initializing on mount.
- **Minting/burning shares on finalize** — the mock must update `UserPosition` in-memory when `finalizeDeposit` mints shares and when `finalizeWithdrawal` burns them. Cross-method state dependencies remain a concern. The mock is effectively a mini in-memory database.
- **"FM capital return (for withdrawals)"** — **STILL OPEN** (Q10). Keeping the two-step explicit: rBTC only returns to user after `finalizeWithdrawal`.

### Group 4 — Pagination & History

- **`getRequestHistory` returns `PaginatedResult<VaultRequest>`** — the existing vault history uses `VaultHistoryTransaction` which is a different shape. The BTC vault history returns `VaultRequest` objects (with status, epochId, etc.), not simple transactions. Intentional — the two-step lifecycle requires richer data.

### Group 5 — Seed Data

- ~~Which address maps to which profile?~~ **RESOLVED.** User A gets a hardcoded mock address. All unknown addresses return empty user profile.
- **Seed data must be internally consistent.** If User A has `vaultTokens = 1000n` and the vault's `totalShares = 10000n`, then `percentOfVault` must be `10`. If the TVL is `50 BTC` and User A owns `10%`, their `positionValue` must be `5 BTC`.

---

## Appendix D: Risks

| # | Risk | Severity | Status |
|---|------|----------|--------|
| 1 | ~~EpochState is underspecified~~ | ~~HIGH~~ | **RESOLVED** — expanded with timing + accounting fields from ERC-7540 |
| 2 | **Timer lifecycle leaks** — `setTimeout`/`setInterval` can leak on unmount, double-fire on strict mode, lose state on HMR | **HIGH** | MITIGATED — `dispose()` method clears timers |
| 3 | **Cross-method state consistency** — minting shares on finalize must update UserPosition, VaultMetrics, and request status atomically | **MEDIUM** | OPEN |
| 4 | ~~`getActiveRequest` assumes max 1~~ | ~~MEDIUM~~ | **RESOLVED** — returns array |
| 5 | ~~No error simulation~~ | ~~MEDIUM~~ | **RESOLVED** — all states represented |
| 6 | **`principal` may not exist on-chain** | **LOW-MED** | DEFERRED — removed from v1 mock |
| 7 | ~~BigInt vs number vs string ambiguity~~ | ~~LOW~~ | **RESOLVED** — `bigint` confirmed |
| 8 | ~~`TxResult.status` enum undefined~~ | ~~LOW~~ | **RESOLVED** |

**Remaining open risks: #2 (mitigated but not eliminated), #3, #6 (deferred).**
