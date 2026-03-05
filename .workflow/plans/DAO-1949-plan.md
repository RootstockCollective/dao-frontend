# Architecture Plan: DAO-1949

## KYB Eligibility Gating, Pause States & Read-Only Mode for BTC Vault

**Story:** DAO-1949
**Author:** Architect Agent
**Date:** 2026-03-02
**Status:** Pending Approval

---

## 1. Summary

Wire the BTC vault's `useActionEligibility` hook to mock data (whitelist/KYB, pause state, active requests), then build a persistent eligibility indicator and pause-state banners so users always see why they can or cannot act. Deposit and withdrawal buttons are disabled when the user is unapproved, when the vault is paused, or when the user already has an active request — each with a clear reason. The dApp remains publicly accessible in read-only mode for ineligible users.

### Key Decisions

- **Create `useActionEligibility` as a single source of truth** — one hook that combines KYB/whitelist, pause state, and active-request status into a unified `ActionEligibility` object. This follows the vault pattern (`useCanDepositToVault`) but extends it with pause and active-request dimensions.
- **Mock data first, wire later** — the hook will initially use mock data controlled via a module-level mock (or simple constants), making the UI testable before contracts/backend are ready. The `toActionEligibility` mapper provides the seam for switching to real data.
- **Reuse `StackableBanner` for pause banners** — the existing `StackableBanner` + `BannerContent` component pattern is a clean fit for persistent, non-dismissible banners.
- **New `EligibilityIndicator` component** — a small persistent badge/chip showing KYB + pause status in one line (e.g. "KYB: Approved | Deposits: Paused").

---

## 2. Requirements Breakdown

| AC | Requirement | Implementation Approach |
|----|-------------|------------------------|
| AC-1 | Unapproved user cannot submit deposits or withdrawals | `useActionEligibility` returns `canDeposit: false` / `canWithdraw: false` with `blockReasons` when `isApproved` is false. Action buttons read these flags. |
| AC-2 | Buttons disabled while user has active request | `useActionEligibility` checks `hasActiveRequest` (Pending or Claimable). Returns block reason "You already have an active request". |
| AC-3 | Persistent KYB status indicator | `EligibilityIndicator` component renders KYB status from `useActionEligibility`. Placed above the actions section in `BtcVaultPage`. |
| AC-4 | Pause banners appear/disappear based on vault state | `PauseStateBanner` component reads `pauseState` from `useActionEligibility`. Uses `StackableBanner` pattern. Non-dismissible. |
| AC-5 | Paused actions disabled with messaging; indicator reflects both KYB + pause | `useActionEligibility` combines KYB and pause into `canDeposit`/`canWithdraw`. `EligibilityIndicator` shows combined status line. |
| AC-6 | In-flight requests unaffected by pause | `useActionEligibility` does NOT alter existing request state when paused. Pause only blocks new submissions. Verified by test. |
| AC-7 | Read-only mode for ineligible users | When `isEligible` is false, `BtcVaultPage` renders all sections as read-only (data visible, action buttons hidden or disabled). No redirect. |

---

## 3. Affected Components

| File | Action | Description |
|------|--------|-------------|
| `src/app/btc-vault/hooks/useActionEligibility.ts` | **Create** | Core hook: combines KYB, pause, active-request into `ActionEligibility` |
| `src/app/btc-vault/hooks/useActionEligibility.test.ts` | **Create** | Unit tests for all eligibility scenarios |
| `src/app/btc-vault/hooks/toActionEligibility.ts` | **Create** | Mapper: raw data → `ActionEligibility` shape |
| `src/app/btc-vault/hooks/toActionEligibility.test.ts` | **Create** | Unit tests for mapper |
| `src/app/btc-vault/hooks/types.ts` | **Create** | Shared types: `ActionEligibility`, `PauseState`, `BlockReason`, `KybStatus` |
| `src/app/btc-vault/hooks/mockEligibilityData.ts` | **Create** | Mock data scenarios for development/testing |
| `src/app/btc-vault/components/EligibilityIndicator.tsx` | **Create** | Persistent badge showing KYB + pause status |
| `src/app/btc-vault/components/EligibilityIndicator.test.tsx` | **Create** | Component tests |
| `src/app/btc-vault/components/PauseStateBanner.tsx` | **Create** | Vault pause banner (deposits/withdrawals/fully paused) |
| `src/app/btc-vault/components/PauseStateBanner.test.tsx` | **Create** | Component tests |
| `src/app/btc-vault/components/VaultActionButtons.tsx` | **Create** | Stub deposit/withdraw buttons gated by eligibility (replaced by F5/F6) |
| `src/app/btc-vault/components/VaultActionButtons.test.tsx` | **Create** | Tests for button enabled/disabled states and block-reason tooltips |
| `src/app/btc-vault/BtcVaultPage.tsx` | **Modify** | Integrate `EligibilityIndicator`, `PauseStateBanner`, `VaultActionButtons`, read-only gating |
| `src/app/btc-vault/BtcVaultPage.test.tsx` | **Modify** | Add tests for eligibility-driven rendering |

---

## 4. Architecture Decisions

### 4.1 Single `useActionEligibility` Hook

**Decision:** Create one hook that returns a flat `ActionEligibility` object covering all three dimensions (KYB, pause, active request) rather than separate hooks per concern.

**Rationale:** The user story treats these as interdependent — the UI must show combined status ("KYB: Approved | Deposits: Paused") and the button state depends on all three. A single hook avoids scattered state and simplifies consumption.

**Pattern Reference:** Follows `useCanDepositToVault` (returns `{ canDeposit, reason, isLoading }`) but extends the shape.

### 4.2 Mapper Pattern (`toActionEligibility`)

**Decision:** Extract a pure function `toActionEligibility(rawData) → ActionEligibility` that the hook calls internally.

**Rationale:** Makes the business logic unit-testable without React. When real contract/backend data replaces mocks, only the hook's data source changes — the mapper stays the same. This is the "mapper" pattern referenced in the user story.

### 4.3 Mock Data Layer

**Decision:** Use a `mockEligibilityData.ts` module with predefined scenarios (approved, unapproved, paused, active request) that the hook imports during MVP. No feature flag needed — the swap to real data will be a code change in the hook.

**Rationale:** The story explicitly says "Use `useActionEligibility` with mock data." A module-level mock is simpler than a feature flag and allows tests to import scenarios directly.

### 4.4 Pause Banner Uses `StackableBanner`

**Decision:** Build `PauseStateBanner` using the existing `StackableBanner` + custom content (not `BannerContent`, which includes an action button we don't need).

**Rationale:** `StackableBanner` provides the visual container, gradient, and stacking behavior. The pause banner content is simpler than `BannerContent` (no button, no right-content), so we use a custom child.

### 4.5 Read-Only Mode via Conditional Rendering

**Decision:** When `isEligible` is false, hide action buttons and show a read-only notice. The page is still rendered — no redirect.

**Rationale:** AC-7 says "dApp remains publicly accessible in read-only mode." This means data (metrics, history) is visible but deposit/withdraw actions are hidden or fully disabled.

### 4.6 Stub Deposit/Withdraw Buttons

**Decision:** Create a `VaultActionButtons` component with stub Deposit and Withdraw buttons that are fully gated by `useActionEligibility`. These stubs will be replaced by real implementations in F5/F6.

**Rationale:** AC-1 requires "unapproved user cannot submit deposits or withdrawals" and AC-2 requires "buttons are disabled while the user has an active request." Without buttons, these ACs cannot be demonstrated. The stubs are intentionally minimal — they render disabled/enabled buttons with tooltips showing block reasons, but have no transaction logic. F5/F6 will replace this component with real deposit/withdraw flows while preserving the same eligibility gating contract.

---

## 5. Implementation Phases

Each phase goes through the complete cycle: Developer → Code Review → QA

### Phase 1: Types, Mapper & Hook (Foundation)

**Acceptance Criteria Covered:** AC-1, AC-2, AC-6

**Files to Create/Modify:**

- [ ] `src/app/btc-vault/hooks/types.ts` — Type definitions
- [ ] `src/app/btc-vault/hooks/mockEligibilityData.ts` — Mock data scenarios
- [ ] `src/app/btc-vault/hooks/toActionEligibility.ts` — Pure mapper function
- [ ] `src/app/btc-vault/hooks/toActionEligibility.test.ts` — Mapper tests
- [ ] `src/app/btc-vault/hooks/useActionEligibility.ts` — React hook
- [ ] `src/app/btc-vault/hooks/useActionEligibility.test.ts` — Hook tests

**Implementation Steps:**

- [ ] **Step 1.1:** Define types in `types.ts`:

```typescript
export type KybStatus = 'approved' | 'not_authorized'

export interface PauseState {
  depositsPaused: boolean
  withdrawalsPaused: boolean
}

export type BlockReason =
  | 'not_authorized'
  | 'deposits_paused'
  | 'withdrawals_paused'
  | 'active_request'

export interface ActionEligibility {
  isApproved: boolean
  kybStatus: KybStatus
  pauseState: PauseState
  hasActiveRequest: boolean
  canDeposit: boolean
  canWithdraw: boolean
  depositBlockReasons: BlockReason[]
  withdrawBlockReasons: BlockReason[]
  isLoading: boolean
}

export interface RawEligibilityData {
  isWhitelisted: boolean
  depositsPaused: boolean
  withdrawalsPaused: boolean
  hasActiveRequest: boolean
}
```

- [ ] **Step 1.2:** Create `mockEligibilityData.ts` with scenarios:
  - `approvedNoBlocks` — fully eligible
  - `notAuthorized` — KYB not approved
  - `depositsPaused` — only deposits paused
  - `withdrawalsPaused` — only withdrawals paused
  - `fullyPaused` — both paused
  - `activeRequest` — has pending/claimable request
  - `approvedDepositsPausedWithActiveRequest` — combined scenario

- [ ] **Step 1.3:** Implement `toActionEligibility(raw: RawEligibilityData): ActionEligibility`:
  - `isApproved = raw.isWhitelisted`
  - `kybStatus = isApproved ? 'approved' : 'not_authorized'`
  - `canDeposit = isApproved && !raw.depositsPaused && !raw.hasActiveRequest`
  - `canWithdraw = isApproved && !raw.withdrawalsPaused && !raw.hasActiveRequest`
  - Build `depositBlockReasons` / `withdrawBlockReasons` arrays from the flags
  - `isLoading = false` (mapper always receives resolved data)

- [ ] **Step 1.4:** Implement `useActionEligibility` hook:
  - Import mock data from `mockEligibilityData.ts`
  - Call `toActionEligibility(mockData)`
  - Wrap in `useMemo` for referential stability
  - Use `useAccount` from wagmi to check if wallet is connected (if not, return a default "not eligible" state)

- [ ] **Step 1.5:** Write tests for `toActionEligibility`:
  - Approved user, no blocks → `canDeposit: true`, `canWithdraw: true`
  - Unapproved user → `canDeposit: false`, `canWithdraw: false`, reasons include `'not_authorized'`
  - Deposits paused → `canDeposit: false`, `canWithdraw: true`, reasons include `'deposits_paused'`
  - Withdrawals paused → `canDeposit: true`, `canWithdraw: false`
  - Both paused → both false
  - Active request → both false, reasons include `'active_request'`
  - Active request + paused → both false, multiple reasons
  - **AC-6 invariant:** Verify `hasActiveRequest` is preserved regardless of pause state (mapper does not clear it)

- [ ] **Step 1.6:** Write tests for `useActionEligibility`:
  - Hook returns correct `ActionEligibility` shape
  - Hook conditions on wallet connection (`useAccount`)
  - Hook returns loading state when wallet not connected

**Tests to Write:**

- [ ] `toActionEligibility.test.ts` — 8+ test cases covering all eligibility combinations
- [ ] `useActionEligibility.test.ts` — 4+ test cases for hook behavior (connected, disconnected, mock scenarios)

**Cleanup:**

- [ ] Ensure all exports are named exports (no default exports)
- [ ] Verify `@/` import paths

---

### Phase 2: Eligibility Indicator & Pause Banner (Visibility)

**Acceptance Criteria Covered:** AC-3, AC-4, AC-5

**Files to Create/Modify:**

- [ ] `src/app/btc-vault/components/EligibilityIndicator.tsx` — KYB + pause status badge
- [ ] `src/app/btc-vault/components/EligibilityIndicator.test.tsx` — Component tests
- [ ] `src/app/btc-vault/components/PauseStateBanner.tsx` — Persistent pause banner
- [ ] `src/app/btc-vault/components/PauseStateBanner.test.tsx` — Component tests

**Implementation Steps:**

- [ ] **Step 2.1:** Build `EligibilityIndicator`:
  - Accepts `ActionEligibility` as props (or calls `useActionEligibility` internally)
  - Renders a persistent inline badge/chip:
    - KYB-only: "KYB: Approved" (green) or "KYB: Not Authorized" (red)
    - KYB + pause: "KYB: Approved | Deposits: Paused" (amber)
    - Fully paused: "KYB: Approved | Vault: Paused"
  - Uses semantic color tokens (`text-100`, `primary`, `disabled-primary`)
  - Uses `data-testid="EligibilityIndicator"` for testing
  - Always visible when wallet is connected

- [ ] **Step 2.2:** Build `PauseStateBanner`:
  - Accepts `pauseState: PauseState` as prop (or calls `useActionEligibility`)
  - Renders using `StackableBanner` wrapper for visual consistency
  - Banner variants:
    - `depositsPaused && !withdrawalsPaused` → "Deposits Paused" banner
    - `!depositsPaused && withdrawalsPaused` → "Withdrawals Paused" banner
    - `depositsPaused && withdrawalsPaused` → "Vault Paused" banner
  - Non-dismissible (no close button)
  - Returns `null` when nothing is paused
  - Uses `data-testid="PauseStateBanner"` for testing
  - Warning color palette (amber/orange gradient)

- [ ] **Step 2.3:** Write `EligibilityIndicator` tests:
  - Renders "KYB: Approved" when approved, no pause
  - Renders "KYB: Not Authorized" when not approved
  - Renders combined status when approved + paused
  - Does not render when loading

- [ ] **Step 2.4:** Write `PauseStateBanner` tests:
  - Renders deposits paused banner
  - Renders withdrawals paused banner
  - Renders fully paused banner
  - Returns null when nothing paused

**Tests to Write:**

- [ ] `EligibilityIndicator.test.tsx` — 4+ test cases
- [ ] `PauseStateBanner.test.tsx` — 4+ test cases

**Cleanup:**

- [ ] Ensure components export Props types alongside components
- [ ] Verify `StackableBanner` import works from `@/components/StackableBanner/StackableBanner`

---

### Phase 3: Stub Action Buttons, Page Integration & Read-Only Mode

**Acceptance Criteria Covered:** AC-1 (UI enforcement), AC-2 (button disabling), AC-5 (combined messaging), AC-7 (read-only mode)

**Files to Create/Modify:**

- [ ] `src/app/btc-vault/components/VaultActionButtons.tsx` — Stub deposit/withdraw buttons
- [ ] `src/app/btc-vault/components/VaultActionButtons.test.tsx` — Button state tests
- [ ] `src/app/btc-vault/BtcVaultPage.tsx` — Integrate all eligibility components
- [ ] `src/app/btc-vault/BtcVaultPage.test.tsx` — Integration tests

**Implementation Steps:**

- [ ] **Step 3.1:** Build `VaultActionButtons` stub component:
  - Accepts `ActionEligibility` as props (or calls `useActionEligibility` internally)
  - Renders two buttons: "Deposit" and "Withdraw"
  - Deposit button: `disabled={!canDeposit}`. When disabled, shows tooltip with the first `depositBlockReasons` entry (human-readable label, e.g. "Not Authorized", "Deposits Paused", "You already have an active request")
  - Withdraw button: `disabled={!canWithdraw}`. Same tooltip pattern with `withdrawBlockReasons`
  - When enabled, buttons are non-functional (no `onClick` handler — F5/F6 will wire real actions)
  - Uses `data-testid="VaultActionButtons"`, `data-testid="DepositButton"`, `data-testid="WithdrawButton"`
  - Hidden entirely when wallet is not connected (read-only mode, AC-7)
  - Uses existing `Button` component from `@/components/Button`

- [ ] **Step 3.2:** Integrate into `BtcVaultPage`:
  - Call `useActionEligibility()` at the top of the component
  - Add `PauseStateBanner` above all sections (only renders when paused)
  - Add `EligibilityIndicator` below the metrics section, always visible when wallet connected
  - Render `VaultActionButtons` inside the actions section
  - When `!isApproved`, show a read-only notice in the actions area:
    - "Your wallet is not authorized for BTC Vault actions"
    - Buttons still render but are disabled (AC-1 requires they "cannot submit", not that they're hidden)
  - When wallet not connected: show "Connect your wallet to view eligibility", hide action buttons entirely (AC-7 read-only mode)
  - Keep metrics, dashboard, request queue, and history sections visible in all states

- [ ] **Step 3.3:** Add a `blockReasonLabel` utility (inline or in `types.ts`) to map `BlockReason` enum values to user-facing strings:
  - `'not_authorized'` → "Not Authorized"
  - `'deposits_paused'` → "Deposits Paused"
  - `'withdrawals_paused'` → "Withdrawals Paused"
  - `'active_request'` → "You already have an active request"

- [ ] **Step 3.4:** Write `VaultActionButtons` tests:
  - Approved, no blocks: both buttons enabled
  - Not authorized: both buttons disabled, tooltip shows "Not Authorized"
  - Deposits paused: Deposit disabled with "Deposits Paused", Withdraw enabled
  - Active request: both buttons disabled with "You already have an active request"
  - Wallet disconnected: component returns null

- [ ] **Step 3.5:** Write `BtcVaultPage` integration tests:
  - Approved user: `EligibilityIndicator` shows "Approved", action buttons enabled
  - Unapproved user: `EligibilityIndicator` shows "Not Authorized", buttons disabled, read-only notice shown
  - Paused vault: `PauseStateBanner` visible, affected action buttons disabled
  - Active request: action buttons disabled, tooltip text present
  - No wallet: `EligibilityIndicator` hidden, action buttons hidden, data sections still rendered

**Tests to Write:**

- [ ] `VaultActionButtons.test.tsx` — 5+ test cases for button states and tooltips
- [ ] `BtcVaultPage.test.tsx` — 5+ test cases for eligibility-driven rendering

**Cleanup:**

- [ ] Remove outdated placeholder comments from `BtcVaultPage.tsx` where new components are placed
- [ ] Ensure `data-testid` attributes are consistent

---

## 6. Testing Strategy

| Phase | Test Type | Test Focus | Key Files |
|-------|-----------|------------|-----------|
| Phase 1 | Unit (Vitest) | Mapper logic, hook behavior, all eligibility combinations | `toActionEligibility.test.ts`, `useActionEligibility.test.ts` |
| Phase 2 | Unit + Component (RTL) | Component rendering per eligibility state | `EligibilityIndicator.test.tsx`, `PauseStateBanner.test.tsx` |
| Phase 3 | Component (RTL) | Stub button states, tooltips, page integration, read-only mode | `VaultActionButtons.test.tsx`, `BtcVaultPage.test.tsx` |

### Testing Approach

- Unit tests co-located with source files (`*.test.ts` / `*.test.tsx`)
- Use React Testing Library for component tests
- Mock `useAccount` (wagmi) for wallet connection state
- Mock `useActionEligibility` in component tests (Phase 2, 3) to isolate UI from hook logic
- Use `mockEligibilityData.ts` scenarios in hook/mapper tests (Phase 1)
- Test both the `toActionEligibility` mapper (pure function, no mocks needed) and the `useActionEligibility` hook (via `renderHook`)
- Import from `vitest` (not `jest`)

### Coverage Targets

Reference: `.workflow/CONFIG.md`

| File Type | Target | Files |
|-----------|--------|-------|
| Hooks (`useActionEligibility`) | 80% | `src/app/btc-vault/hooks/useActionEligibility.ts` |
| Utilities (`toActionEligibility`) | 90% | `src/app/btc-vault/hooks/toActionEligibility.ts` |
| Components | 70% | `EligibilityIndicator.tsx`, `PauseStateBanner.tsx`, `VaultActionButtons.tsx` |
| Pages | 60% | `BtcVaultPage.tsx` |

---

## 7. Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Mock data shape diverges from real contract/backend data | Medium | Medium | `toActionEligibility` mapper provides the seam; define `RawEligibilityData` type now and validate it against contract ABI when wiring real data |
| Pause state banner conflicts with future F3/F4/F5 component layout | Low | Low | Banner is placed as the first child of `BtcVaultPage` (above all sections), following `StackableBanner` pattern — unlikely to conflict |
| Active-request detection requires contract reads not yet available | Medium | Low | MVP uses mock data; the `hasActiveRequest` field is a simple boolean that will be wired to a contract read later |
| `EligibilityIndicator` text becomes too long on mobile | Low | Low | Use responsive truncation (e.g. "KYB: ✓" on mobile) or stack vertically; test with RTL `screen.getByText` for both variants |
| Feature flag `btc_vault` is not enabled in dev environment | Low | Medium | Page already uses `withServerFeatureFlag`; ensure `.env.dev` has `NEXT_PUBLIC_ENABLE_FEATURE_BTC_VAULT=true` |
| Stub buttons diverge from real F5/F6 button API | Medium | Low | `VaultActionButtons` consumes `ActionEligibility` — the same type F5/F6 will use. Stubs only render enabled/disabled state with tooltips; no transaction logic to diverge. F5/F6 replaces the component entirely. |

---

## Approval

- [ ] Plan reviewed by human
- [ ] Approved for implementation
