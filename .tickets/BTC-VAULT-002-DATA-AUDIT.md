# BTC-VAULT-002: Mock Data Service Layer

## User Story

As a developer building BTC Vault features, I want to have a service adapter layer with a mock implementation and React provider, so that all UI features can be built and demoed against realistic mock data without waiting for smart contracts, and later swapped to real contract calls with zero component changes.

## Description

Implement the service adapter pattern (port/adapter) described in the epic's Key Technical Decision #6. This creates the data layer foundation that every BTC Vault feature (F2–F10) consumes through React hooks. The mock implementation must simulate the full two-step request lifecycle (request → wait → claimable → finalize → done) so the entire UI is testable from day 1.

This ticket introduces **13 domain types**, **~14 service methods**, and a **time-based state machine** — none of which have existing counterparts in this codebase. The current vault is a simple deposit/withdraw with no multi-step lifecycle. We are building a mock for a system that doesn't exist yet, against an interface that's never been tested against a real contract.

## Architecture

```
React Components → React Hooks → BtcVaultService (Interface)
├── MockBtcVaultService (in-memory state + simulated async)
└── ContractBtcVaultService (stubbed — future)
↑ selected by NEXT_PUBLIC_BTC_VAULT_DATA_SOURCE
```

## Decisions Locked

| Decision | Resolution |
|----------|-----------|
| Amount representation | `bigint` for all monetary values — wagmi/viem returns this format |
| Active request return type | `VaultRequest[]` (array) — max 1 for now, but array for scalability |
| Unknown wallet fallback | Empty user profile |
| Timer cleanup | `dispose()` method on the service, called by provider cleanup |
| Error state simulation | All states must exist in the mock (idle, pending, claimable, done, failed) |
| epochId vs batchRedeemId | Mutually exclusive — deposits use epochId, withdrawals use batchRedeemId, the other is always `null` |
| PauseState scope | Pause gates **both** submit (idle → submitting) **and** finalize (claimable → finalizing) — halts entire flow per operation type |
| hasActiveRequest | Only one request (deposit or withdrawal) can be active per user at a time. "Active" = `submitting`, `pending`, `claimable`, or `finalizing`. Constraint may be relaxed later. |
| PauseState modeling | Plain object with `'active' | 'paused'` per region. XState machines documented in `refined-mock-xstate.md` for reference only — not an implementation dependency. |

---

## Domain Types (services/types.ts)

### VaultMetrics

| Field | Definition | Representation | Existing Pattern |
|-------|-----------|----------------|------------------|
| `tvl` | Total Value Locked in BTC terms | `bigint` (Wei, 18 decimals) | Yes — `totalAssets` in `useVaultBalance` |
| `apy` | Annual Percentage Yield | `bigint` (basis points, `1e9 = 100%`) | Yes — `estimatedApy` |
| `nav` | Net Asset Value per share | `bigint` (Wei) | Yes — `pricePerShare` |
| `timestamp` | When metrics were last computed | `number` (Unix seconds) | Yes — vault history uses this |

### PauseState

Vault-level operational controls. Independent of the epoch cycle.

| Field | States | Notes |
|-------|--------|-------|
| `deposits` | `'active' \| 'paused'` | **New concept** — no existing pattern |
| `withdrawals` | `'active' \| 'paused'` | **New concept** — no existing pattern |

**Pause scope:** When an operation type is paused, it blocks **two points** in the request lifecycle:
1. **Submit** (idle → submitting) — user cannot initiate a new deposit/withdrawal
2. **Finalize** (claimable → finalizing) — user cannot claim an existing request of that type

Epochs keep cycling regardless of pause state. Pausing only prevents user-initiated actions.

### EpochState

The epoch is an **accounting period** — a discrete time window where deposit/withdrawal requests are batched, then settled at a single NAV price (forward pricing pattern, per ERC-7540/Centrifuge).

**Epoch lifecycle:**
```
OPEN → CLOSED → SETTLING → CLAIMABLE → (next epoch opens)
 │         │          │           │
 │         │          │           └─ Users call finalize to claim shares/assets
 │         │          └─ NAV computed, price locked, orders filled pro-rata
 │         └─ No new requests accepted, snapshot taken
 └─ Accepting deposit/withdrawal requests
```

| Field | Definition | Representation |
|-------|-----------|----------------|
| `epochId` | Monotonic identifier (e.g. "42") | `string` |
| `status` | Current phase | `'open' \| 'closed' \| 'settling' \| 'claimable'` |
| `startTime` | When this epoch opened | `number` (Unix seconds) |
| `endTime` | When requests stop being accepted | `number` (Unix seconds) |
| `settledAt` | When settlement completed | `number \| null` |
| `navPerShare` | Price locked at settlement | `bigint \| null` |
| `totalDepositAssets` | Total rBTC submitted for deposit this epoch | `bigint` |
| `totalRedemptionShares` | Total vault shares submitted for withdrawal | `bigint` |

**Note:** 4 statuses instead of original 3 — added `'claimable'` to distinguish "still settling" from "ready to claim."

### UserPosition

| Field | Definition | Representation | Notes |
|-------|-----------|----------------|-------|
| `rbtcBalance` | User's rBTC wallet balance | `bigint` (18 decimals) | Partial — `useVaultBalance` has `userShares` |
| `vaultTokens` | User's vault share tokens | `bigint` (24 decimals per `ctokenvault`) | Yes — `userShares` |
| `positionValue` | BTC value of position | `bigint` | Partial — `userUsdrifBalance` analog |
| `percentOfVault` | User's % ownership of vault | `number` (JS float) | Calculated, display-only |

**`principal` deferred:** Not used anywhere in `src/`. No existing vault contract or hook tracks cumulative deposit amounts. Will add when contract ABI confirms it's exposed. Can be computed from request history if needed.

### EligibilityStatus

| Field | Definition | Representation |
|-------|-----------|----------------|
| `eligible` | Can this address use the vault? | `boolean` |
| `reason` | Why ineligible | `string` |

### VaultRequest

| Field | Definition | Representation |
|-------|-----------|----------------|
| `id` | Unique request identifier | `string` |
| `type` | Deposit or withdrawal | `'deposit' \| 'withdrawal'` |
| `amount` | Amount requested | `bigint` |
| `status` | Current lifecycle state | `'pending' \| 'claimable' \| 'done' \| 'failed'` |
| `epochId` | Which epoch (deposits only) | `string \| null` |
| `batchRedeemId` | Withdrawal batch identifier (withdrawals only) | `string \| null` |
| `timestamps` | Created, updated, finalized | `{ created: number, updated?: number, finalized?: number }` |
| `txHashes` | Submit tx, finalize tx | `{ submit?: string, finalize?: string }` |

### ClaimableInfo

| Field | Definition | Representation |
|-------|-----------|----------------|
| `claimable` | Can this request be finalized? | `boolean` |
| `lockedSharePrice` | Price locked at epoch close | `bigint` |

### TxResult

Represents the outcome of a blockchain transaction. Aligned with wagmi tx lifecycle.

| Field | Definition | Representation |
|-------|-----------|----------------|
| `hash` | Transaction hash on-chain | `string` (hex) |
| `status` | Transaction outcome | `'idle' \| 'pending' \| 'confirmed' \| 'failed'` |

### DepositRequestParams / WithdrawalRequestParams

| Field | Definition |
|-------|-----------|
| `amount` | `bigint` |
| `slippage?` | `number` |

### PaginationParams

| Field | Definition |
|-------|-----------|
| `page` | 1-indexed page number |
| `limit` | Items per page |
| `sortField?` | Field to sort by |
| `sortDirection?` | `'asc' \| 'desc'` |

### PaginatedResult\<T\>

| Field | Definition |
|-------|-----------|
| `data` | `T[]` |
| `total` | Total item count |
| `page` | Current page |
| `limit` | Page size |
| `totalPages` | Computed total pages |

---

## Service Interface (services/types.ts)

```typescript
interface BtcVaultService {
  // Vault-level reads
  getVaultMetrics(): Promise<VaultMetrics>
  getEpochState(): Promise<EpochState>
  getPauseState(): Promise<PauseState>

  // User-level reads
  getUserPosition(address: string): Promise<UserPosition>
  getEligibility(address: string): Promise<EligibilityStatus>
  getActiveRequests(address: string): Promise<VaultRequest[]>
  getClaimableStatus(requestId: string): Promise<ClaimableInfo>

  // History
  getRequestHistory(address: string, params: PaginationParams): Promise<PaginatedResult<VaultRequest>>

  // Writes — step 1 (request)
  submitDepositRequest(params: DepositRequestParams): Promise<TxResult>
  submitWithdrawalRequest(params: WithdrawalRequestParams): Promise<TxResult>

  // Writes — step 2 (finalize)
  finalizeDeposit(epochId: string): Promise<TxResult>
  finalizeWithdrawal(batchRedeemId: string): Promise<TxResult>

  // Observability — hooks subscribe for react-query invalidation
  subscribe(listener: BtcVaultServiceListener): () => void

  // Lifecycle — clears all timers
  dispose(): void
}
```

**Changes from original ticket:**
- `getActiveRequest` → `getActiveRequests` (returns array for scalability)
- Removed `getRequestDetail(requestId)` — info available from `getActiveRequests` + `getRequestHistory`
- Added `subscribe()` for event-driven invalidation
- Added `dispose()` for timer cleanup
- Renamed `getVaultPauseState` → `getPauseState` for brevity

---

## Write Operation Guards

| Method | Guards | Side Effects |
|--------|--------|-------------|
| `submitDepositRequest(params)` | deposits not paused, no active request, amount > 0, eligible | Creates VaultRequest `status: 'pending'`, assigns `epochId` |
| `submitWithdrawalRequest(params)` | withdrawals not paused, no active request, amount > 0, sufficient balance | Creates VaultRequest `status: 'pending'`, assigns `batchRedeemId` |
| `finalizeDeposit(epochId)` | deposits not paused | Transitions `claimable → done`, mints shares |
| `finalizeWithdrawal(batchRedeemId)` | withdrawals not paused | Transitions `claimable → done`, burns shares, returns rBTC |

### Request State Machine

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
       |                                 │                          |
       v (tx revert / error)             │                          v (tx revert)
   +--------+                       GUARD: operation type       +--------+
   | FAILED |                             not paused            | FAILED |
   +--------+                                                   +--------+
```

---

## Mock Implementation (services/mock/MockBtcVaultService.ts)

Pure TypeScript class. No external state management libraries. State machine behavior implemented with plain state variables, `setTimeout`, and method logic.

- In-memory state that changes over time to simulate the two-step flow
- RPC-like latency: reads resolve after 200–500ms
- Request submission simulates tx lifecycle, returns epochId/batchRedeemId
- Epoch close: configurable timer (~10s auto-close), transitions pending → claimable
- Finalization: simulates tx lifecycle, transitions claimable → done, mints/burns shares
- All timers tracked in a `Set` for cleanup in `dispose()`

### Mock State Coverage

| State | What it means | Mock must provide |
|-------|--------------|-------------------|
| `idle` | No active request | `getActiveRequests` returns `[]` |
| `pending` | Request submitted, waiting for epoch close | VaultRequest with `status: 'pending'` |
| `claimable` | Epoch settled, user can finalize | VaultRequest with `status: 'claimable'`, ClaimableInfo with `claimable: true` |
| `done` | Finalized, shares minted/burned | VaultRequest with `status: 'done'`, updated UserPosition |
| `failed` | Transaction reverted or rejected | VaultRequest with `status: 'failed'`, TxResult with `status: 'failed'` |

---

## Seed Data (services/mock/mockData.ts)

### Request Coverage (AC-5)

|  | Deposit | Withdrawal |
|--|---------|-----------|
| **Pending** | 1 request | 1 request |
| **Claimable** | 1 request | 1 request |
| **Done** | 1 request | 1 request |
| **Failed** | 1 request | 1 request |

**Minimum: 8 seed VaultRequest objects.**

### User Profiles

| Profile | Position | Active Requests | History |
|---------|----------|----------------|---------|
| **User A** (rich) | Has rBTC balance, vault tokens, position value | `[1 active pending/claimable request]` | Multiple done + failed requests |
| **User B** (empty) | Zero everything | `[]` | Empty array |
| **Any unknown address** | Zero everything | `[]` | Empty array |

### Vault Metrics

tvl=50 BTC, apy=8.5%, nav=1.02 BTC/share. All values internally consistent (User A owns ~10% of 50 BTC vault = ~5 BTC position).

---

## File Structure

```
src/app/btc-vault/
  services/
    types.ts                              # All domain types + BtcVaultService interface
    index.ts                              # Factory: createBtcVaultService()
    mock/
      mockData.ts                         # Seed data (metrics, users, 8 requests)
      MockBtcVaultService.ts              # Full mock implementation
    contract/
      ContractBtcVaultService.ts          # Stub (all methods throw)
  providers/
    BtcVaultServiceProvider.tsx           # React Context provider
  hooks/
    useBtcVaultService.ts                 # Context consumer hook
```

Existing files modified:
- `src/app/btc-vault/BtcVaultPage.tsx` — wrap content with provider

---

## Acceptance Criteria

**AC-1:** BtcVaultService interface is defined in `services/types.ts` with all read/write methods listed in the interface section above

**AC-2:** All domain types (VaultMetrics, EpochState, PauseState, UserPosition, VaultRequest, ClaimableInfo, TxResult, EligibilityStatus, pagination types) are defined as TypeScript interfaces with the fields specified in the Domain Types section

**AC-3:** MockBtcVaultService implements the full interface — reads return seed data with simulated latency (200–500ms)

**AC-4:** Mock simulates the two-step lifecycle: `submitDepositRequest` → status pending → after ~10s auto-transitions to claimable → `finalizeDeposit` → status done

**AC-5:** Seed data includes requests in all 4 states (pending, claimable, done, failed) for both deposit and withdrawal types (8 total)

**AC-6:** ContractBtcVaultService exists as a stub where every method throws a descriptive error

**AC-7:** Factory in `services/index.ts` selects mock or contract based on `NEXT_PUBLIC_BTC_VAULT_DATA_SOURCE` env var (default: mock)

**AC-8:** BtcVaultServiceProvider provides the service via React Context and is wrapped around BtcVaultPage

**AC-9:** `useBtcVaultService()` hook returns the service instance and throws if used outside the provider

**AC-10:** Adding `NEXT_PUBLIC_BTC_VAULT_DATA_SOURCE=mock` to env files does not break existing functionality

---

## Technical Notes

### Design Principles (from epic)

- **Domain-focused interface:** Define around what the UI needs, not what Solidity exposes
- **Hooks own React concerns:** Caching, polling, re-rendering live in hooks. The service is a plain TypeScript class
- **Mock fidelity:** Must demo the full two-step flow including error states
- **No component changes on swap:** Only ContractBtcVaultService implementation + env var flip
- **Test double:** Mock also serves as test fixture

### Patterns to Follow

- **Context provider:** Follow `src/app/vault/context/VaultDepositValidationContext.tsx` pattern
- **Hook consumer:** Follow `useVaultBalance.ts` return shape with `useMemo`
- **Types:** Use `interface` for object shapes per project convention (DAO-1901)

### Known Challenges

1. **React strict mode double-mount** — `useRef` lazy init + `dispose()` in `useEffect` cleanup handles this. `dispose()` must be idempotent.
2. **Cross-method state consistency** — when `finalizeDeposit` completes, must atomically update VaultRequest status + UserPosition + VaultMetrics within the same sync block before resolving the promise.
3. **Timer cleanup** — all `setTimeout` calls must be tracked and cleared in `dispose()`.

---

## Dependencies

**Depends on:** BTC-VAULT-001 — route and page component must exist to wrap with provider

**Blocks:** All feature stories (F2–F10) consume this service layer through hooks

## Env Variable Additions

`NEXT_PUBLIC_BTC_VAULT_DATA_SOURCE=mock` — add to `.env.dev`, `.env.testnet.local`, `.env.fork`

---

## Reference Documents

- `refined-mock-xstate.md` — XState state machine concepts (reference only, not an implementation dependency)
- `btc-002-tech.md` — Technical implementation plan

---

## Open / Deferred Questions

| # | Question | Status | Notes |
|---|----------|--------|-------|
| Q8 | Is `principal` a real contract field? | **DEFERRED** | Not used anywhere in `src/`. Removed from v1 mock. Will add when contract ABI confirms. |
| Q10 | What does "FM capital return" mean in data terms? | **OPEN** | Keeping two-step explicit: rBTC returns only after `finalizeWithdrawal`. |

## Risks

| # | Risk | Severity | Status |
|---|------|----------|--------|
| 1 | Timer lifecycle leaks — `setTimeout`/`setInterval` can leak on unmount, double-fire on strict mode | **HIGH** | MITIGATED — `dispose()` method clears timers |
| 2 | Cross-method state consistency — minting shares on finalize must update UserPosition, VaultMetrics, and request status atomically | **MEDIUM** | OPEN |
| 3 | `principal` may not exist on-chain | **LOW-MED** | DEFERRED — removed from v1 mock |
