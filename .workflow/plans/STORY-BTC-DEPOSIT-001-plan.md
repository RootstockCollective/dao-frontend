# Architecture Plan: STORY-BTC-DEPOSIT-001

## Deposit Form & Review Screen for BTC Vault

**Story:** STORY-BTC-DEPOSIT-001
**Author:** Architect Agent
**Date:** 2026-03-03
**Status:** Pending Approval

---

## 1. Summary

Implement the investor-facing deposit form for the BTC Vault as a two-step modal: amount entry (with slippage) → review screen (with disclosures). The deposit button lives in the existing `btc-vault-actions` placeholder and gates on the existing `useActionEligibility` hook. The modal accepts an `onSubmit` callback so the contract integration (STORY-002) can be wired without modifying form internals.

### Key Decisions
- **Two-step modal** (amount → review) within a single `BtcDepositModal` component, using a `step` state variable — matches the disclosure-heavy UX requirement without over-engineering navigation
- **Adapt USDRIF `DepositModal` patterns** but simplify: no ERC-20 approval step, no terms modal, no deposit limiter — BTC vault uses native rBTC and KYB-gated eligibility (already handled by existing hooks)
- **Reuse shared components** (`Modal`, `Input`, `PercentageButtons`, `SlippageInput`) and slippage math utilities directly — no new abstractions needed
- **Estimated shares calculation** uses `amount / navPerShare` from `useVaultMetrics` — simple division since NAV is already in rBTC/share units
- **Percentage buttons**: use 25/50/75/100% options (matching UX spec) rather than USDRIF's 10/20/50/Max

---

## 2. Requirements Breakdown

| AC | Requirement | Implementation Approach |
|----|-------------|------------------------|
| AC-1 | Deposit button enabled only when `canDeposit` is true; tooltip shows `depositBlockReason` | `BtcVaultActions` component reads `useActionEligibility`, renders button with conditional `disabled` + `title` attribute |
| AC-2 | Modal with rBTC amount input, wallet balance, percentage buttons, validation | `BtcDepositModal` step 1: `Input` (type=number, decimalScale=18), `PercentageButtons` with 25/50/75/100%, balance from `useUserPosition`, validation via Big.js or parseEther comparison |
| AC-3 | Slippage configuration input with default | Reuse `SlippageInput` from `src/app/vault/components/SlippageInput.tsx`, initialize with `DEFAULT_SLIPPAGE_PERCENTAGE` |
| AC-4 | Review screen with deposit amount, estimated shares, NAV, fee, slippage, 3 disclosures | `BtcDepositModal` step 2: computed values from hooks + amount, static disclosure strings |
| AC-5 | Submit Request + Back buttons on review screen; Submit wired to `onSubmit` callback | Review step footer with two buttons; Back resets to step 1; Submit calls `onSubmit({ amount, slippage })` |

---

## 3. Affected Components

| File | Action | Description |
|------|--------|-------------|
| `src/app/btc-vault/BtcVaultPage.tsx` | Modify | Replace actions placeholder with `<BtcVaultActions />` |
| `src/app/btc-vault/components/BtcVaultActions.tsx` | Create | Deposit button with eligibility gating, modal state |
| `src/app/btc-vault/components/BtcDepositModal.tsx` | Create | Two-step deposit modal (amount → review) |
| `src/app/btc-vault/components/BtcDepositModal.test.tsx` | Create | Component tests for modal |
| `src/app/btc-vault/components/BtcVaultActions.test.tsx` | Create | Component tests for actions |
| `src/app/btc-vault/components/DepositReviewStep.tsx` | Create | Review screen sub-component |
| `src/app/btc-vault/components/DepositAmountStep.tsx` | Create | Amount input sub-component |

---

## 4. Architecture Decisions

### 4.1 Two-Step Modal with Step State

**Decision:** Use a single `BtcDepositModal` component with `step: 'amount' | 'review'` state, rendering `DepositAmountStep` or `DepositReviewStep` conditionally.

**Rationale:** Keeps the modal self-contained (single open/close lifecycle) while separating the two distinct UX steps into sub-components for testability. Matches the USDRIF pattern of a single modal component managing flow state.

### 4.2 onSubmit Callback Prop for Contract Integration

**Decision:** `BtcDepositModal` accepts `onSubmit: (params: DepositRequestParams) => Promise<void>` and `isSubmitting: boolean` props. The modal doesn't know about contracts.

**Rationale:** Clean separation — STORY-001 builds the form, STORY-002 wires the contract. The modal can be fully tested with a mock `onSubmit`. The parent (`BtcVaultActions`) composes the modal with the actual contract hook.

### 4.3 Reuse SlippageInput As-Is

**Decision:** Import `SlippageInput` directly from `src/app/vault/components/SlippageInput.tsx` — do not copy or move it.

**Rationale:** The component is generic (value + onChange props). If it later needs to be shared formally, it can be moved to `src/components/` in a follow-up. Avoids premature refactoring.

### 4.4 Estimated Shares Calculation

**Decision:** Calculate estimated shares as `parseEther(amount) * 10n**18n / navPerShare` using bigint math from the raw NAV value (available via `useVaultMetrics` — we'll need to expose the raw NAV bigint alongside the formatted value).

**Rationale:** Keeps precision — no floating-point rounding. The raw NAV comes from the existing `VaultMetrics.nav` type (bigint, 18 decimals). We may need a small helper or to access the raw metrics alongside the display version.

### 4.5 Percentage Button Options

**Decision:** Use custom options `[25%, 50%, 75%, 100%]` instead of the USDRIF default `[10%, 20%, 50%, Max]`.

**Rationale:** The UX spec for the BTC vault deposit lists these percentages. `PercentageButtons` already accepts custom `options` prop.

---

## 5. Implementation Phases

Each phase goes through the complete cycle: Developer → Code Review → QA

### Phase 1: Deposit Button & Modal with Amount Input

**Acceptance Criteria Covered:** AC-1, AC-2, AC-3

**Files to Create/Modify:**
- [ ] `src/app/btc-vault/components/BtcVaultActions.tsx` — Deposit button + modal open/close state + eligibility gating
- [ ] `src/app/btc-vault/components/BtcVaultActions.test.tsx` — Tests for button rendering, enabled/disabled, tooltip
- [ ] `src/app/btc-vault/components/DepositAmountStep.tsx` — Amount input, balance display, percentage buttons, slippage, validation
- [ ] `src/app/btc-vault/components/DepositAmountStep.test.tsx` — Tests for input, validation, percentage buttons
- [ ] `src/app/btc-vault/components/BtcDepositModal.tsx` — Modal shell with step management, composes DepositAmountStep
- [ ] `src/app/btc-vault/components/BtcDepositModal.test.tsx` — Tests for modal open/close, step transitions
- [ ] `src/app/btc-vault/BtcVaultPage.tsx` — Replace actions placeholder with `<BtcVaultActions />`

**Implementation Steps:**

- [ ] **Step 1.1:** Create `BtcVaultActions` component
  - Read `useActionEligibility(address)` and `useAccount()`
  - Render "Deposit" button with `disabled={!canDeposit}` and `title={depositBlockReason}`
  - Manage `isModalOpen` state; button click opens `BtcDepositModal`
  - Accept `onSubmit` callback to pass through to modal (no-op for now)

- [ ] **Step 1.2:** Create `DepositAmountStep` component
  - Props: `amount`, `setAmount`, `slippage`, `setSlippage`, `rbtcBalance` (bigint), `rbtcBalanceFormatted` (string), `onNext` (callback for review step), `errorMessage`
  - Render `Input` (type=number, decimalScale=18, placeholder="0") for rBTC amount
  - Show wallet balance below input: "Balance: {rbtcBalanceFormatted} rBTC"
  - Render `PercentageButtons` with `[25%, 50%, 75%, 100%]` options — handler multiplies balance and sets amount
  - Render `SlippageInput` below amount section
  - Validate: amount > 0, amount <= wallet balance (compare via `parseEther(amount) <= rbtcBalance`)
  - "Continue" button enabled only when valid; calls `onNext`

- [ ] **Step 1.3:** Create `BtcDepositModal` shell
  - Props: `onClose`, `onSubmit: (params: DepositRequestParams) => Promise<void>`, `isSubmitting: boolean`
  - State: `step: 'amount' | 'review'`, `amount: string`, `slippage: string`
  - Read `useUserPosition(address)` for `rbtcBalanceRaw` and `rbtcBalanceFormatted`
  - Render `Modal` with `DepositAmountStep` when step is 'amount'
  - Render placeholder div for review step (Phase 2)
  - Header: "DEPOSIT rBTC" (mirrors USDRIF pattern)

- [ ] **Step 1.4:** Wire into `BtcVaultPage`
  - Import `BtcVaultActions`
  - Replace the `btc-vault-actions` placeholder comment with `<BtcVaultActions />`

**Tests to Write:**
- [ ] `BtcVaultActions.test.tsx`: Button renders enabled when canDeposit=true; renders disabled with tooltip when canDeposit=false (mock useActionEligibility for each block reason); clicking opens modal
- [ ] `DepositAmountStep.test.tsx`: Renders amount input and balance; percentage buttons set correct amounts; validation blocks zero/empty/over-balance amounts; Continue button disabled when invalid
- [ ] `BtcDepositModal.test.tsx`: Opens with amount step; modal closes when onClose called

---

### Phase 2: Review Screen & Step Navigation

**Acceptance Criteria Covered:** AC-4, AC-5

**Files to Create/Modify:**
- [ ] `src/app/btc-vault/components/DepositReviewStep.tsx` — Review screen with all fields and disclosures
- [ ] `src/app/btc-vault/components/DepositReviewStep.test.tsx` — Tests for review display and button behavior
- [ ] `src/app/btc-vault/components/BtcDepositModal.tsx` — Wire review step into modal flow
- [ ] `src/app/btc-vault/components/BtcDepositModal.test.tsx` — Add step navigation tests

**Implementation Steps:**

- [ ] **Step 2.1:** Create `DepositReviewStep` component
  - Props: `amount` (string), `slippage` (string), `estimatedShares` (string), `navFormatted` (string), `navTimestamp` (number), `depositFee` (string), `onBack`, `onSubmit`, `isSubmitting`
  - Render review rows:
    - "Deposit amount": `{amount} rBTC`
    - "Estimated vault shares": `{estimatedShares}`
    - "Last confirmed NAV": `{navFormatted} rBTC/share` with formatted timestamp
    - "Deposit fee": `{depositFee}%` (show "0%" if none)
    - "Slippage tolerance": `{slippage}%`
  - Render three disclosure messages as styled info blocks:
    - "This is a request and requires approval"
    - "Shares are minted at the NAV confirmed at epoch close"
    - "Once the epoch is closed, deposit requests cannot be canceled"
  - "Back" button → calls `onBack`
  - "Submit Request" button → calls `onSubmit`, disabled when `isSubmitting`

- [ ] **Step 2.2:** Wire review step into `BtcDepositModal`
  - Read `useVaultMetrics()` for NAV data (navFormatted, timestamp)
  - Calculate estimated shares: `formatEther(parseEther(amount) * 10n**18n / navRaw)` where `navRaw` is the raw bigint NAV
  - To access raw NAV: either use `useVaultMetrics` hook's underlying raw data, or add a small utility that re-computes from the formatted value. Preferred: expose raw metrics via an optional param or a sibling hook `useVaultMetricsRaw()`, or use the existing raw `VaultMetrics` type directly.
  - Deposit fee: initially hardcode "0" (fee source TBD — may come from contract or vault config). Can be updated when contract details are finalized.
  - When `step === 'review'`, render `DepositReviewStep` with computed props
  - `onBack` sets step to 'amount'
  - `onSubmit` calls the `onSubmit` prop with `{ amount: parseEther(amount), slippage: parseFloat(slippage) / 100 }`

- [ ] **Step 2.3:** Update modal header to show step context
  - Amount step: "DEPOSIT rBTC"
  - Review step: "REVIEW DEPOSIT" (or keep same header — follow USDRIF pattern)

**Tests to Write:**
- [ ] `DepositReviewStep.test.tsx`: All review fields render with correct values; three disclosure messages are present; Back button calls onBack; Submit button calls onSubmit; Submit disabled when isSubmitting=true
- [ ] `BtcDepositModal.test.tsx` (additions): Continue from amount step navigates to review; Back from review returns to amount; Submit calls onSubmit prop with correct DepositRequestParams

---

## 6. Testing Strategy

| Phase | Test Type | Test Focus | Key Files |
|-------|-----------|------------|-----------|
| Phase 1 | Unit + Component (Vitest + RTL) | Button eligibility gating, amount input/validation, percentage buttons, slippage input, modal open/close | `BtcVaultActions.test.tsx`, `DepositAmountStep.test.tsx`, `BtcDepositModal.test.tsx` |
| Phase 2 | Unit + Component (Vitest + RTL) | Review screen display, disclosure content, step navigation, onSubmit callback params | `DepositReviewStep.test.tsx`, `BtcDepositModal.test.tsx` |

### Testing Approach
- Mock `useActionEligibility`, `useUserPosition`, `useVaultMetrics` hooks via `vi.mock()`
- Mock `useAccount` from wagmi to provide test address
- Use `@testing-library/react` for rendering and user interactions
- Test both enabled and disabled states for buttons
- Verify exact disclosure text strings (these are product requirements)
- Test amount validation edge cases: empty, zero, exceeds balance, negative
- Test percentage button calculations against known balance values

### Coverage Targets
- `BtcVaultActions.tsx` — 80%+ (component with logic)
- `DepositAmountStep.tsx` — 80%+ (validation logic)
- `DepositReviewStep.tsx` — 80%+ (display logic)
- `BtcDepositModal.tsx` — 70%+ (composition/integration)

---

## 7. Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Raw NAV bigint not easily accessible from existing display-oriented hooks | Medium | Low | Can access raw VaultMetrics via a small adapter or by reading the query cache directly. Worst case: parse back from formatted string (lossy but acceptable for estimates). |
| Deposit fee not available from contract yet | Medium | Low | Hardcode "0%" initially with a TODO. The review screen renders the field regardless — value can be updated when contract interface is finalized. |
| SlippageInput import from vault module creates cross-feature coupling | Low | Low | Acceptable short-term. If it becomes an issue, move to `src/components/` in a follow-up. |
| Percentage buttons with 25/50/75/100% may need rBTC gas reserve (100% would leave 0 for gas) | Medium | Medium | Consider showing a warning or capping at balance minus a small gas buffer. Add a note for the developer to check how the USDRIF vault handles Max. |

---

## Approval

- [ ] Plan reviewed by human
- [ ] Approved for implementation
