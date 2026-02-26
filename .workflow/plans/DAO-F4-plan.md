# Architecture Plan: DAO-F4

## Investor Dashboard — MY METRICS (BTC Vault)

**Story:** DAO-F4
**Author:** Architect Agent
**Date:** 2025-03-03
**Status:** Pending Approval

---

## 1. Summary

Implement the MY METRICS investor dashboard for the BTC Vault by extending the data layer with earnings, yield, and fiat fields, then building a two-row metrics layout that adapts the USDRIF vault pattern. The dashboard is hidden when the wallet is disconnected, shows zeros (not dashes) for empty positions, and includes action buttons plus navigation links wired for future F5/F6/F10 integration.

### Key Decisions

- **Data layer first:** Extend `UserPosition` and `UserPositionDisplay` with `totalDepositedPrincipal`, derived `currentEarnings`, `yieldPercentToDate`, and fiat amounts. Use `MOCK_RBTC_USD_PRICE` for fiat until a price feed is wired.
- **Mobile-first layout:** Use `w-full md:w-[214px] md:min-w-[180px]` for metric cards and `flex flex-col gap-4 md:flex-row md:gap-x-6` for rows per `responsive-mobile-first.mdc`.
- **Conditional rendering:** `BtcVaultDashboard` returns `null` when `!isConnected`; the F4 section renders empty when disconnected.
- **Action buttons:** `BtcVaultActions` receives `onDeposit` / `onWithdraw` callback props (no-ops in F4) so F5/F6 can wire real flows without refactoring.

---

## 2. Requirements Breakdown

| AC | Requirement | Implementation Approach |
|----|-------------|-------------------------|
| AC-1 | Two-row layout with 7 BalanceInfo metrics | `BtcVaultDashboard` renders `MetricsContainer` with two flex rows; Row 1: Wallet, Vault shares, Share of vault; Row 2: Principal, Current earnings, Total balance, Yield %. Mobile: `flex-col`; desktop: `md:flex-row`. |
| AC-2 | Metric calculations (total balance, current earnings, yield %, fiat) | Mapper derives `currentEarnings = positionValue - totalDepositedPrincipal`, `yieldPercentToDate = principal > 0 ? (earnings/principal)*100 : 0`. Fiat via `MOCK_RBTC_USD_PRICE`. |
| AC-3 | Empty state — zeros for no position | Mapper and mock data return zeros; UI displays `0`, `0 rBTC`, `0%` — no dashes. |
| AC-4 | Current earnings — real metric with tooltip | Display `currentEarningsFormatted`; tooltip: "Subject to NAV updates, pending deposit windows". |
| AC-5 | Wallet disconnected — hide MY METRICS | `BtcVaultDashboard` returns `null` when `!isConnected`; F4 section renders empty. |
| AC-6 | Navigation links — View history, View yield history | Links below metrics, shown when `vaultTokensRaw > 0n`. Use `#` href with `// TODO(DAO-XXXX)` until F10. |
| AC-7 | Action buttons — Deposit, Withdraw, Swap | `BtcVaultActions` uses `useActionEligibility` for visibility matrix; block-reason tooltips; no-op handlers. |
| AC-8 | Data layer — extend UserPosition, UserPositionDisplay, mapper | Add `totalDepositedPrincipal` to `UserPosition`; add display fields to `UserPositionDisplay`; update `toUserPositionDisplay`; update mock data. |
| AC-9 | Loading state | BalanceInfo `amount="..."` when `useUserPosition.isLoading`. |
| AC-10 | Section title "MY METRICS" | Header component above metrics rows. |

---

## 3. Affected Components

| File | Action | Description |
|------|--------|-------------|
| `src/app/btc-vault/services/types.ts` | Modify | Add `totalDepositedPrincipal: bigint` to `UserPosition` |
| `src/app/btc-vault/services/ui/types.ts` | Modify | Add display fields: `totalDepositedPrincipalFormatted`, `currentEarningsFormatted`, `totalBalanceFormatted`, `yieldPercentToDateFormatted`, fiat fields, raw bigints |
| `src/app/btc-vault/services/ui/mappers.ts` | Modify | Update `toUserPositionDisplay` with derived calculations and fiat |
| `src/app/btc-vault/services/ui/mappers.test.ts` | Modify | Tests for new fields, edge cases |
| `src/app/btc-vault/hooks/useUserPosition/useUserPosition.ts` | Modify | Add `totalDepositedPrincipal` to MOCK_POSITION and EMPTY_POSITION |
| `src/app/btc-vault/components/BtcVaultDashboard.tsx` | Create | Container: section title, two rows of BalanceInfo, nav links, BtcVaultActions slot |
| `src/app/btc-vault/components/BtcVaultDashboard.test.tsx` | Create | Component tests for all states |
| `src/app/btc-vault/components/BtcVaultActions.tsx` | Create | Deposit/Withdraw buttons, Swap link, eligibility-based visibility |
| `src/app/btc-vault/components/BtcVaultActions.test.tsx` | Create | Button visibility, tooltip, no-op handler tests |
| `src/app/btc-vault/components/index.ts` | Create | Barrel export |
| `src/app/btc-vault/BtcVaultPage.tsx` | Modify | Replace F4 section placeholder with `BtcVaultDashboard` |

---

## 4. Architecture Decisions

### 4.1 Fiat Computation in Mapper

**Decision:** Compute fiat amounts in `toUserPositionDisplay` using `MOCK_RBTC_USD_PRICE` constant.

**Rationale:** Keeps display logic in the mapper; price feed integration is a separate story. Mapper receives raw bigints and returns display-ready strings.

**Pattern Reference:** PROJECT.md — mappers transform raw data into display strings.

### 4.2 Disconnected State at Page Level

**Decision:** `BtcVaultDashboard` returns `null` when `!isConnected` (or `!address`). The F4 section always renders; when disconnected, it has no children.

**Rationale:** AC-5 requires the MY METRICS section to not render when disconnected. Component-level early return keeps the section DOM element but with no content — equivalent to "not rendered" for the user.

**Pattern Reference:** `VaultUserMetricsContainer` conditionally renders wallet metrics based on `isConnected`.

### 4.3 Action Button Callbacks

**Decision:** `BtcVaultActions` receives `onDeposit` and `onWithdraw` as optional callback props (default: no-op).

**Rationale:** F5/F6 will wire real modal flows. Callback props avoid prop drilling and allow F5/F6 to pass handlers from a parent that owns modal state.

**Pattern Reference:** architecture-patterns.mdc — container components wire data and handlers to presentational components.

### 4.4 Mobile-First Card Sizing

**Decision:** Use `w-full md:w-[214px] md:min-w-[180px]` for BalanceInfo cards (per responsive-mobile-first.mdc).

**Rationale:** VaultUserMetricsContainer uses `w-[214px] min-w-[180px]` (not mobile-first). Story explicitly requires mobile-first per coding standards.

**Pattern Reference:** responsive-mobile-first.mdc — "Target pattern for new components: `w-full md:w-[214px] md:min-w-[180px]`".

---

## 5. Implementation Phases

Each phase goes through the complete cycle: Developer → Code Review → QA.
Target: 1–3 ACs per phase, one layer per phase, < 5 source files changed.

### Phase 1: Data layer — types, mappers, mock data, tests

**Acceptance Criteria Covered:** AC-2, AC-8
**Layer:** data
**Commit message:** `feat(btc-vault): extend position data layer with earnings and yield metrics`

**Files to Create/Modify:**
- [ ] `src/app/btc-vault/services/types.ts` — add `totalDepositedPrincipal: bigint` to `UserPosition` with JSDoc
- [ ] `src/app/btc-vault/services/ui/types.ts` — add `totalDepositedPrincipalFormatted`, `totalDepositedPrincipalRaw`, `currentEarningsFormatted`, `totalBalanceFormatted`, `totalBalanceRaw`, `yieldPercentToDateFormatted`, `fiatWalletBalance`, `fiatVaultShares`, `fiatPrincipalDeposited`, `fiatTotalBalance` to `UserPositionDisplay`
- [ ] `src/app/btc-vault/services/ui/mappers.ts` — update `toUserPositionDisplay`: derive currentEarnings, yieldPercentToDate, totalBalance; add fiat computation via `MOCK_RBTC_USD_PRICE`
- [ ] `src/app/btc-vault/services/ui/formatters.ts` or new constant — add `MOCK_RBTC_USD_PRICE` (e.g. `23_750`) in mappers or a constants file
- [ ] `src/app/btc-vault/hooks/useUserPosition/useUserPosition.ts` — add `totalDepositedPrincipal` to MOCK_POSITION (e.g. `(52n * ONE_BTC) / 100n`) and EMPTY_POSITION (`0n`)
- [ ] `src/app/btc-vault/services/ui/mappers.test.ts` — tests for new fields, derived values, zero principal, zero position, fiat formatting

**Implementation Steps:**
- [ ] **Step 1.1:** Add `totalDepositedPrincipal: bigint` to `UserPosition` in `types.ts` with JSDoc: "Cumulative rBTC principal deposited by the user. Wei, 18 decimals."
- [ ] **Step 1.2:** Add all new display fields to `UserPositionDisplay` in `ui/types.ts`
- [ ] **Step 1.3:** Add `MOCK_RBTC_USD_PRICE` constant (e.g. in mappers.ts or `btc-vault/services/constants.ts`)
- [ ] **Step 1.4:** Update `toUserPositionDisplay`: compute `currentEarnings = positionValue - totalDepositedPrincipal`; `yieldPercentToDate = totalDepositedPrincipal > 0n ? (currentEarnings * 100n) / totalDepositedPrincipal : 0n` (use integer math, then format); map `positionValue` → `totalBalanceFormatted`; compute fiat strings via `(value * MOCK_RBTC_USD_PRICE) / 1e18` and format as `$X,XXX.XX USD`
- [ ] **Step 1.5:** Add `formatFiatUsd` helper if needed (or inline in mapper)
- [ ] **Step 1.6:** Update MOCK_POSITION and EMPTY_POSITION in useUserPosition
- [ ] **Step 1.7:** Fix useUserPosition: it currently passes `UserPosition` to `toUserPositionDisplay` but the mapper expects `UserPosition` — the flow is correct. Ensure MOCK_POSITION includes the new field.
- [ ] **Step 1.8:** Add mapper tests: happy path with non-zero principal, zero principal (yield 0%), zero position (all zeros), fiat values

**Tests to Write:**
- [ ] `toUserPositionDisplay` — new fields present and correctly formatted
- [ ] `toUserPositionDisplay` — currentEarnings = positionValue - totalDepositedPrincipal
- [ ] `toUserPositionDisplay` — yield 0% when totalDepositedPrincipal is 0n
- [ ] `toUserPositionDisplay` — fiat amounts computed correctly
- [ ] `toUserPositionDisplay` — empty position returns zeros for all derived fields

**Cleanup:**
- [ ] Ensure `positionValueFormatted` is retained or deprecated — story adds `totalBalanceFormatted`; both can map from `positionValue`. Keep `totalBalanceFormatted` as primary for "Total balance" metric.

---

### Phase 2: Dashboard skeleton — section title, metrics rows, page integration

**Acceptance Criteria Covered:** AC-1, AC-9, AC-10
**Layer:** UI
**Commit message:** `feat(btc-vault): implement MY METRICS dashboard with metrics layout`

**Files to Create/Modify:**
- [ ] `src/app/btc-vault/components/BtcVaultDashboard.tsx` *(new)* — section title "MY METRICS", MetricsContainer with `bg-v3-bg-accent-80 divide-y-0`, two rows of 7 BalanceInfo cards, loading state (`"..."`), wired to `useUserPosition(address)`
- [ ] `src/app/btc-vault/components/BtcVaultDashboard.test.tsx` *(new)* — connected with data, loading state
- [ ] `src/app/btc-vault/BtcVaultPage.tsx` — replace F4 section content with `<BtcVaultDashboard />`

**Implementation Steps:**
- [ ] **Step 2.1:** Create `BtcVaultDashboard.tsx` with `'use client'`, import `useAccount`, `useUserPosition`, `useVaultMetrics` (if needed for NAV — not required for F4 display), `BalanceInfo`, `MetricsContainer`, `Header`, `RBTC` from constants
- [ ] **Step 2.2:** Return `null` when `!address || !isConnected` (early exit)
- [ ] **Step 2.3:** Render section title "MY METRICS" using Header component
- [ ] **Step 2.4:** Render MetricsContainer with `className="bg-v3-bg-accent-80 divide-y-0 flex flex-col gap-6 w-full"`
- [ ] **Step 2.5:** Row 1: flex row with 3 BalanceInfo — Wallet, Vault shares, Your share of vault. Use `className="w-full md:w-[214px] md:min-w-[180px]"` per card. Use `amount={isLoading ? '...' : data.rbtcBalanceFormatted}` etc. Add tooltipContent where AC-1 specifies "Yes"
- [ ] **Step 2.6:** Row 2: flex row with 4 BalanceInfo — Principal deposited, Current earnings, Total balance, Yield % to date. Same loading and card pattern
- [ ] **Step 2.7:** Row layout: `flex flex-col gap-4 md:flex-row md:gap-x-6` per row
- [ ] **Step 2.8:** Wire `BtcVaultDashboard` into `BtcVaultPage`: replace F4 section content with `<BtcVaultDashboard />`. `BtcVaultDashboard` returns `null` when `!address || !isConnected`, so the section renders empty when disconnected.
- [ ] **Step 2.9:** Add `data-testid` to BalanceInfo and section for tests
- [ ] **Step 2.10:** Add tooltips per AC-1 table: Wallet (?), Vault shares (?), Your share of vault (?), Current earnings ("Subject to NAV updates, pending deposit windows"), Total balance (?), Yield % to date (?)
- [ ] **Step 2.11:** Use `fiatAmount` prop for Wallet, Vault shares, Principal deposited, Total balance
- [ ] **Step 2.12:** Use `RBTC` from `@/lib/constants` for symbol

**Tests to Write:**
- [ ] `BtcVaultDashboard` — renders "MY METRICS" title when connected
- [ ] `BtcVaultDashboard` — renders 7 BalanceInfo when connected with data
- [ ] `BtcVaultDashboard` — shows "..." for amounts when isLoading
- [ ] `BtcVaultDashboard` — returns null when !isConnected (mock useAccount to return isConnected: false)

**Cleanup:**
- [ ] Import order: external → alias → relative
- [ ] JSDoc on BtcVaultDashboard

---

### Phase 3: Dashboard states — empty position, disconnected, current earnings

**Acceptance Criteria Covered:** AC-3, AC-4, AC-5
**Layer:** UI
**Commit message:** `feat(btc-vault): add dashboard empty state and disconnected behavior`

**Files to Create/Modify:**
- [ ] `src/app/btc-vault/components/BtcVaultDashboard.tsx` *(modify)* — ensure zeros display for empty position (data already returns zeros from Phase 1); verify current earnings tooltip; ensure disconnected returns null (already in Phase 2)
- [ ] `src/app/btc-vault/components/BtcVaultDashboard.test.tsx` *(modify)* — add tests for disconnected (hidden), empty position (zeros not dashes), current earnings tooltip content

**Implementation Steps:**
- [ ] **Step 3.1:** Verify empty position: when `vaultTokens === 0n`, mock returns EMPTY_POSITION; mapper produces zeros. Dashboard displays `0`, `0 rBTC`, `0%` — no dashes. Assert no `—` or `-` in rendered output for empty state.
- [ ] **Step 3.2:** Verify current earnings tooltip: "Subject to NAV updates, pending deposit windows" on Current earnings BalanceInfo
- [ ] **Step 3.3:** Verify disconnected: BtcVaultDashboard returns null when !isConnected. Add test: when useAccount returns isConnected: false, BtcVaultDashboard renders null (section has no children)
- [ ] **Step 3.4:** Ensure fiat amounts for zero values show `$0.00` or `0.00 USD` per design

**Tests to Write:**
- [ ] Empty position — all metrics show zeros (0, 0 rBTC, 0%), no dashes
- [ ] Disconnected — BtcVaultDashboard returns null (section has no children)
- [ ] Current earnings — tooltip content includes "Subject to NAV updates, pending deposit windows"

**Cleanup:**
- [ ] Remove any placeholder "—" or "-" in display logic

---

### Phase 4: Actions + navigation links

**Acceptance Criteria Covered:** AC-6, AC-7
**Layer:** UI
**Commit message:** `feat(btc-vault): add dashboard action buttons and navigation links`

**Files to Create/Modify:**
- [ ] `src/app/btc-vault/components/BtcVaultActions.tsx` *(new)* — Deposit (primary), Withdraw (secondary), Swap link; uses `useActionEligibility(address)`; visibility per AC-7 table; block-reason tooltips; `onDeposit`, `onWithdraw` callback props (no-op default)
- [ ] `src/app/btc-vault/components/BtcVaultActions.test.tsx` *(new)* — button visibility per eligibility, tooltip when blocked, no-op handlers
- [ ] `src/app/btc-vault/components/BtcVaultDashboard.tsx` *(modify)* — add nav links row ("View history", "View yield history") when `vaultTokensRaw > 0n`; add `BtcVaultActions` below
- [ ] `src/app/btc-vault/components/index.ts` *(new)* — barrel export BtcVaultDashboard, BtcVaultActions

**Implementation Steps:**
- [ ] **Step 4.1:** Create `BtcVaultActions.tsx` with `'use client'`, props: `address: string | undefined`, `onDeposit?: () => void`, `onWithdraw?: () => void`
- [ ] **Step 4.2:** Use `useActionEligibility(address)` — `canDeposit`, `canWithdraw`, `depositBlockReason`, `withdrawBlockReason`
- [ ] **Step 4.3:** Visibility matrix (per AC-7 table): Deposit visible when `canDeposit` OR `depositBlockReason === "You already have an active request"` (show disabled with tooltip). Hide when `depositBlockReason` is "Deposits are currently paused" or non-empty eligibility reason. Withdraw: same logic. Swap link: shown when Deposit or Withdraw is shown. See AC-7 table for full visibility matrix.- [ ] **Step 4.4:** Implement BtcVaultActions with the above logic. Use Tooltip for block reason when button is visible but disabled.
- [ ] **Step 4.5:** Add "View history" and "View yield history" links to BtcVaultDashboard — only when `data.vaultTokensRaw > 0n`. Left-align "View history", right-align "View yield history". Use `href="#"` and `// TODO(DAO-XXXX): link to history when F10 implemented`
- [ ] **Step 4.6:** Add arrow icon to links per design
- [ ] **Step 4.7:** Create barrel export `index.ts`
- [ ] **Step 4.8:** BtcVaultActions needs `address` from parent — BtcVaultDashboard passes `address` from useAccount

**Tests to Write:**
- [ ] BtcVaultActions — Deposit visible when canDeposit
- [ ] BtcVaultActions — Deposit hidden when deposits paused
- [ ] BtcVaultActions — Deposit shown with tooltip when has active request
- [ ] BtcVaultActions — Withdraw visibility similarly
- [ ] BtcVaultActions — Swap link shown when actions row is shown
- [ ] BtcVaultActions — onClick handlers are called (or no-op does not throw)
- [ ] BtcVaultDashboard — nav links shown when vaultTokensRaw > 0
- [ ] BtcVaultDashboard — nav links hidden when vaultTokensRaw === 0

**Cleanup:**
- [ ] JSDoc on BtcVaultActions
- [ ] Use RBTC from constants for "Swap to/from RBTC" link text

---

## 6. Testing Strategy

| Phase | Test Type | Test Focus | Key Files |
|-------|-----------|------------|-----------|
| Phase 1 | Unit (Vitest) | Mapper derivations, edge cases, fiat | `mappers.test.ts` |
| Phase 2 | Unit + Component (RTL) | Layout, loading, title | `BtcVaultDashboard.test.tsx` |
| Phase 3 | Component (RTL) | Empty state, disconnected, tooltips | `BtcVaultDashboard.test.tsx` |
| Phase 4 | Component (RTL) | Action visibility, nav links | `BtcVaultActions.test.tsx`, `BtcVaultDashboard.test.tsx` |

### Testing Approach

- Unit tests co-located with source files (`*.test.ts` / `*.test.tsx`)
- Use React Testing Library for component tests
- Mock `useAccount`, `useUserPosition`, `useActionEligibility` via `vi.mock`
- Mock wagmi and React Query as needed
- Reference: `vitest.config.ts` for multi-project setup

### Coverage Targets

Reference: `.workflow/CONFIG.md` if present. Per documentation-and-testing.mdc: mapper (utility with branching) and components with conditional logic must be tested.

---

## 7. Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| BigInt division precision loss in yield % | Medium | Low | Use integer math: `(currentEarnings * 10000n) / totalDepositedPrincipal` then divide by 100 for display. Test edge cases. |
| useActionEligibility return shape differs from plan | Low | Medium | Verify `toActionEligibility` return type; BtcVaultActions consumes `canDeposit`, `canWithdraw`, `depositBlockReason`, `withdrawBlockReason`. Add type assertion if needed. |
| Mobile-first CSS not applied consistently | Low | Low | Follow responsive-mobile-first.mdc; use `w-full md:w-[214px]` pattern; verify in Storybook or manual test. |
| Action button visibility matrix complexity | Medium | Medium | Implement per AC-7 table; add comprehensive tests for each state (eligible, paused, active request, ineligible). |
| TokenImage/RBTC symbol display | Low | Low | Use `RBTC` from constants; TokenImage supports "rBTC"/"tRBTC" per existing usage. |

---

## 8. Approval

- [ ] Plan reviewed by human
- [ ] Approved for implementation
